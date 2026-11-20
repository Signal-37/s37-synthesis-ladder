#!/usr/bin/env python
"""
diarize_transcript.py — Method D (automated diarization) for the L0 transcription skills.

Pipeline: audio -> mlx-whisper transcription + pyannote speaker diarization ->
merge Whisper segments onto speaker turns (max time-overlap) -> an attributed
transcript DRAFT with graded-confidence speaker labels, a speaker-mapping stub,
and an ambiguity tally.

The draft uses anonymous SPEAKER_00/01/02 placeholders. A human (or the calling
workflow) maps them to real names, then formats the body into a full L0 file per
TranscriptFormat.md. This tool owns the hard mechanical part — accurate,
confidence-graded speaker attribution — nothing interpretive.

Graded confidence (mirrors the skill's three-state model; keyed on speaker
CONTENTION, not overlap fraction — see CONTEST_FRAC below):
  **Name:**    high confidence — one diarizer speaker clearly wins the segment
               (no 2nd speaker's overlap reaches CONTEST_FRAC of the winner's)
  **Name?:**   inferred — a 2nd speaker genuinely contests the segment
  **[Speaker]:** unknown — the segment overlaps no diarizer turn at all

Runs fully on-device (Apple Silicon mps). No audio or text leaves the machine.

Usage:
  diarize_transcript.py <audio> [--model <mlx repo>] [--out <draft.md>] [--language en]
"""
import argparse, difflib, json, os, string, subprocess, sys, tempfile, time
from collections import defaultdict
from pathlib import Path

os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

DEFAULT_MODEL = "mlx-community/whisper-large-v3-turbo"
DIAR_MODEL = "pyannote/speaker-diarization-3.1"

# Graded-confidence threshold. Uncertainty is keyed on SPEAKER CONTENTION, not on
# silence: a segment is 'inferred' (?) only when a SECOND speaker genuinely shares
# it (their overlap is at least CONTEST_FRAC of the winner's). Segments that merely
# span a pause between same-speaker turns stay 'high' — the speaker isn't in doubt.
CONTEST_FRAC = 0.35
# Gate threshold — TURN-based, matching TranscriptFormat.md's Attribution Status
# formula: (count of `[Speaker]` turns + count of `Name?` turns) / total merged
# turns. Fixed 2026-07-01 review (E3): this was previously computed per raw ASR
# segment, which dilutes one ambiguous turn across its many segments and can
# under-report ambiguity past the L1 Attribution Gate.
REVIEW_THRESHOLD = 0.40

# Decode parameters — PINNED at mlx-whisper 0.4.3's current defaults (verified
# against the installed venv; three-chair spec 2026-07-23). Net-zero output
# change today; the pin protects the audited byte-identical baseline from
# silent library-default drift on a future version bump. Changing any VALUE
# here is a transcription-behavior change requiring a QA re-baseline.
# meetily's no_speech 0.55 was DECLINED (loosens silence rejection vs the
# audited 0.6). hallucination_silence_threshold stays unset (None) on DOCTRINE
# grounds — it makes the decoder silently drop content, the delete-approach
# ASR honesty rejects; word_timestamps stays unset (False) — enabling changes
# the segment granularity assign() depends on. condition_on_previous_text=True
# is the loop-hallucination driver; the pre-registered trigger (three-chair
# spec) FIRED 2026-07-24 — the flagger (after its 1-token tier fix) confirmed a
# real deterministic loop on a non-fixture recording (a 37-min interview m4a:
# 1920 of 2024 segments flagged repeat-run; byte-identical across reruns) — so the
# opt-in --no-condition escape is now shipped. The DEFAULT stays True: flipping
# it is a transcription-behavior change requiring a QA re-baseline.
DECODE_PARAMS = {
    "temperature": (0.0, 0.2, 0.4, 0.6, 0.8, 1.0),
    "compression_ratio_threshold": 2.4,
    "logprob_threshold": -1.0,
    "no_speech_threshold": 0.6,
    "condition_on_previous_text": True,
}

# Model-cache integrity floors (KB) — validate-if-present. Caches lazy-download
# on first run, so ABSENT is normal and passes silently (never claim "models
# OK" for a cache that isn't there — the M1 honest-scope rule). A PRESENT-but-
# undersized cache is a partial/corrupt download that would otherwise fail deep
# inside pyannote/mlx with an opaque traceback; fail loud here with the remedy.
# pyannote/speaker-diarization-3.1 is deliberately ABSENT from this table: it
# is an 8 KB config-only dir referencing the two weight caches below — flooring
# it would false-fail (composite-model trap, Engineer chair 2026-07-23).
# Floors sit ~15-30% below observed healthy sizes (5.6 M / 25 M / 1.5 G).
MODEL_FLOORS_KB = (
    ("models--pyannote--segmentation-3.0", 4_000, "pyannote segmentation-3.0"),
    ("models--pyannote--wespeaker-voxceleb-resnet34-LM", 20_000, "pyannote wespeaker embedding"),
    ("models--mlx-community--whisper-large-v3-turbo", 1_000_000, "whisper-large-v3-turbo (default)"),
)


def check_model_floors(hub=None, names=None):
    """Runtime companion to setup.sh step 7 — same floors, at the moment a
    corrupt cache actually bites (setup.sh never downloads models).
    names: optional iterable of substrings — floor only the entries whose
    human name contains one (Method S floors whisper only; it never loads
    pyannote — as-built review, Architect F4)."""
    hub = hub or os.path.join(
        os.environ.get("HF_HOME", os.path.expanduser("~/.cache/huggingface")), "hub")
    floors = MODEL_FLOORS_KB if names is None else tuple(
        row for row in MODEL_FLOORS_KB if any(s in row[2] for s in names))
    for dirname, floor_kb, name in floors:
        d = os.path.join(hub, dirname)
        if not os.path.isdir(d):
            continue  # not yet downloaded — normal on a fresh install
        # count blob bytes only (skip symlinks — HF snapshots symlink into blobs/,
        # and following them would double-count)
        kb = sum(f.lstat().st_size for f in Path(d).rglob("*")
                 if f.is_file() and not f.is_symlink()) // 1024
        if kb < floor_kb:
            sys.exit(f"ERROR: {name} cache looks partial/corrupt: {kb}KB < {floor_kb}KB floor.\n"
                     f'Remedy: rm -rf "{d}"  then re-run (the model re-downloads).')


# ── Hallucination scan (deterministic FLAGGER — detects, never deletes) ───────
# Mechanizes the DETECTION half of README → ASR honesty; disposition (remove /
# mark `*[possible transcription artifact]*` / keep) stays 100% human. Three
# classes, HIGH-PRECISION by design: a false positive spends review attention
# on the same human gate as the ambiguity flags, so real repeated speech
# ("yes. yes. yes." agreement, back-channels, emphatic doubling) must never
# flag (QATester chair, zero-FP specificity bar). Pure function of the ordered
# segments list — no I/O, no clock, no randomness, no set/dict iteration in
# output — so the tool's byte-identical determinism property is preserved.
# Flags are metadata only: the transcript body is NEVER altered (Architect
# adjudication A — a tool-applied marker would corrupt the marker's human-
# reviewed meaning).
REPEAT_MIN_CONSECUTIVE = 3   # README: "repeated across >=3 consecutive segments"
REPEAT_SIM_RATIO = 0.90      # near-identical: loop drift in punctuation/casing
REPEAT_MIN_TOKENS = 2        # >=2-token runs flag at 3; 1-token runs use the tier below
# 1-token tier (2026-07-24): the original >=2-token floor made single-word runs
# structurally INVISIBLE — a real collapse ("Yeah." x1933 on a 37-min interview
# m4a, byte-identical across reruns) scanned as 0 flags. Real agreement runs
# ("yes." x3-5) must still never flag (zero-FP bar), so 1-token runs get their
# own, much higher threshold instead of the 3-run floor: no human utters the
# same single word 20+ consecutive segments; a looping decoder does.
REPEAT_MIN_CONSECUTIVE_1TOK = 20
LOOP_MIN_REPEATS = 3         # "you know you know you know", not natural doubling
LOOP_PHRASE_RANGE = (2, 12)  # meetily's 2-5-word intra-segment looping class,
# widened 2026-09-15: the 2026-08-26 two-speaker run looped an 8-word phrase
# 36x inside one segment and scanned clean, because the cap was the phrase
# LENGTH, not the repeat count. 12 covers a clause; LOOP_MIN_REPEATS (3) still
# keeps a twice-said sentence off the flag list. Calibrated against the 22
# retained L0s the same day (see CHANGELOG).
BOILERPLATE_COVERAGE = 0.80  # the phrase must BE the segment, not appear in it
BOILERPLATE = (
    "thank you for watching", "thanks for watching", "please subscribe",
    "like and subscribe", "see you in the next video", "see you next time",
    "thank you", "thanks for listening", "subtitles by", "captions by",
)

_PUNCT = str.maketrans("", "", string.punctuation)


def _norm(t):
    # lowercase, strip punctuation, collapse whitespace; cap length to bound
    # difflib cost (deterministic either way)
    return " ".join(t.lower().translate(_PUNCT).split())[:200]


def scan_hallucinations(segments):
    """Return a list index-aligned to segments: None, or a short reason string.

    Class A  repeat-run(xN) — same/near-identical text across consecutive
             segments: >=3 for >=2-token text; >=20 for 1-token text (so real
             one-word agreement runs never flag, but a looping decoder does)
    Class B  loop(p=P)      — a 2-5-word phrase repeated >=3x consecutively
             inside one segment (decoder looping hallmark)
    Class C  boilerplate    — segment IS a stock ASR-training phrase (equality
             or >=80% coverage — never a loose substring match)
    """
    n = len(segments)
    flags = [None] * n
    norms = [_norm(s["text"]) for s in segments]

    # Class A — cross-segment repeat runs. Empty/whitespace segments are
    # TRANSPARENT (skipped, neither joining nor breaking a run): whisper can
    # emit an empty segment mid-loop, and treating it as a run-breaker let a
    # 4-long hallucination escape unflagged (as-built review, Engineer F2,
    # executed repro 2026-07-23). Transparent-empty keeps both callers'
    # behavior identical whether or not they pre-filter empties.
    i = 0
    while i < n:
        anchor = norms[i]
        if not anchor:
            i += 1
            continue
        # Tiered threshold: >=2-token anchors flag at REPEAT_MIN_CONSECUTIVE;
        # 1-token anchors at REPEAT_MIN_CONSECUTIVE_1TOK (see constants above —
        # closes the blind spot that let a 1933-segment "Yeah." collapse scan
        # clean, without touching the zero-FP guarantee for short agreement runs).
        min_run = (REPEAT_MIN_CONSECUTIVE
                   if len(anchor.split()) >= REPEAT_MIN_TOKENS
                   else REPEAT_MIN_CONSECUTIVE_1TOK)
        members = [i]
        j = i + 1
        while j < n:
            cand = norms[j]
            if not cand:
                j += 1
                continue
            if cand == anchor or difflib.SequenceMatcher(None, anchor, cand).ratio() >= REPEAT_SIM_RATIO:
                members.append(j)
                j += 1
            else:
                break
        if len(members) >= min_run:
            for k in members:
                flags[k] = f"repeat-run(x{len(members)})"
        i = members[-1] + 1 if len(members) > 1 else i + 1

    # Class B — intra-segment phrase looping (longest phrase reported first)
    for idx, nm in enumerate(norms):
        if flags[idx]:
            continue
        toks = nm.split()
        hit = False
        for p in range(LOOP_PHRASE_RANGE[1], LOOP_PHRASE_RANGE[0] - 1, -1):
            if len(toks) < p * LOOP_MIN_REPEATS:
                continue
            for s0 in range(0, len(toks) - p * LOOP_MIN_REPEATS + 1):
                g = toks[s0:s0 + p]
                if all(toks[s0 + r * p: s0 + (r + 1) * p] == g
                       for r in range(1, LOOP_MIN_REPEATS)):
                    flags[idx] = f"loop(p={p})"
                    hit = True
                    break
            if hit:
                break

    # Class C — stock boilerplate (equality or >=coverage of the whole segment)
    for idx, nm in enumerate(norms):
        if flags[idx] or not nm:
            continue
        for phrase in BOILERPLATE:
            if nm == phrase or (phrase in nm and len(phrase) / len(nm) >= BOILERPLATE_COVERAGE):
                flags[idx] = "boilerplate"
                break

    return flags


# ── Document-level completeness check (2026-07-24) ────────────────────────────
# A SECOND, independent axis on collapse: per-segment flags see local runs; this
# sees the transcript as a whole. Motivating incident: mlx-whisper defaults
# destroyed ~87% of a 37-min interview (silent, deterministic, clean exit) —
# the single text "Yeah." occupied 95.5% of segments. Warnings only, never
# deletions, same human gate as all flags. Deterministic: dict iteration is
# insertion-ordered; max() ties resolve to first-seen. Thresholds verified
# against the incident (share 0.955, n=1933 → fires) and the healthy re-run
# (top share ~3% → silent); the count floor keeps a genuinely quiet
# back-channel participant on a short Method S track from false-firing.
DOC_DOMINANT_SHARE = 0.20   # one text occupying >=20% of segments is not speech
DOC_DOMINANT_MIN = 50       # ...but only at a count no real back-channel reaches
DOC_MIN_WPM = 40            # gross-truncation floor vs audio wall-clock (mixed
                            # single-file audio ONLY — a per-participant Method S
                            # track is silent most of the wall, so wpm-vs-wall
                            # would false-fire; callers pass audio_secs=None there)


def scan_document(segments, audio_secs=None):
    """Whole-transcript collapse warnings (list of strings; empty = healthy).

    - dominant-text share: the most common normalized segment text covers
      >=DOC_DOMINANT_SHARE of non-empty segments AND appears >=DOC_DOMINANT_MIN
      times (catches repetition collapse even if per-segment runs are broken).
    - words-per-minute vs audio duration, when audio_secs is given (catches
      gross truncation/half-decode classes; loop-collapse words can keep raw
      wpm above this floor, which is why the share check exists).
    """
    warnings = []
    norms = [n for n in (_norm(s["text"]) for s in segments) if n]
    if not norms:
        return warnings
    counts = {}
    for n in norms:
        counts[n] = counts.get(n, 0) + 1
    top_text = max(counts, key=counts.get)  # ties → first-seen (insertion order)
    top_n = counts[top_text]
    share = top_n / len(norms)
    if share >= DOC_DOMINANT_SHARE and top_n >= DOC_DOMINANT_MIN:
        warnings.append(
            f'dominant text "{top_text[:40]}" occupies {share:.0%} of {len(norms)} '
            f"segments (x{top_n}) — repetition collapse; transcript is NOT a "
            f"faithful record, re-run (consider --no-condition) before any use")
    if audio_secs and audio_secs > 0:
        words = sum(len(n.split()) for n in norms)
        wpm = words / (audio_secs / 60.0)
        if wpm < DOC_MIN_WPM:
            warnings.append(
                f"{words} words over {audio_secs/60.0:.1f} min audio = {wpm:.0f} wpm "
                f"(< {DOC_MIN_WPM} floor) — transcript far shorter than the audio "
                f"supports; suspect truncation or decode failure")
    return warnings


# ─── Speaker-balance scan (Method D only; three-chair spec 2026-08-23, item C) ─
# The 2026-07-30 mix run invented a THIRD speaker holding 43s on a two-person
# call. The ambiguity tally could not see it — that tally counts turn CONFIDENCE
# and never looks at who the speakers are — so the check was done by hand on
# 2026-08-21 and the defect sat unwatched between the two. This is the missing
# instrument. Method D only: Method S cannot over-split, because track count IS
# speaker count by construction.
#
# THE DENOMINATOR IS FIXED HERE, IN WRITING, because it was ambiguous in the
# record: share is of TOTAL DETECTED TALK TIME, never of wall clock. The "1.1%"
# recorded for the 07-30 artifact is the WALL-CLOCK figure; against talk time the
# same speaker is 1.27% (43s / 3382s). A floor near this value discriminates
# differently under the two readings, so the choice is written down rather than
# left to whoever next reads the number.
#
# LOW_TALK_SHARE IS UNCALIBRATED — n=1. It sits above the one known artifact
# (1.27%) and below any legitimately quiet participant yet observed. Recalibrate
# on the next real occurrence; do not read it as derived.
LOW_TALK_SHARE = 0.02


# ─── Turn-collapse scan (Method D only; three-chair spec 2026-08-23, item A) ──
# Method D's worst failure is merged-turn misattribution INSIDE turns the draft
# marks confident: on 2026-07-24 four real speaker changes were emitted as one
# confident turn, attributing one participant's words to the other. The ambiguity
# tally structurally cannot see this — it grades the confidence of turns that
# WERE emitted and can say nothing about changes that never became turns.
#
# THE SIGNAL, and why it is an exact instrument rather than a texture heuristic:
# probe A0 (2026-08-23, evidence in Inputs-to-Level-0/2026-08-23_a0-probe-evidence)
# measured pyannote's raw output on both known-collapsed recordings and found the
# speaker boundaries are PRESENT — 481 raw changes against 557 real turns on the
# 08-21 interview (86%), 621 against 700 on the 07-24 conversation (89%). The
# collapse happens entirely DOWNSTREAM, in assign()/merge. So the diagnostic does
# not have to infer anything: it compares changes the diarizer actually detected
# against changes the merged transcript actually preserves, and the difference is
# a COUNT of absorbed changes, not a correlate of one. Needs no Method S ground
# truth, so it works on exactly the runs where Method D is the only method.
#
#   preserved = emitted_turns - 1        (transitions the draft represents)
#   absorbed  = raw_changes - preserved  (changes the draft cannot represent)
#
# Measured: 08-21 → 401/481 absorbed (83%); 07-24 → 470/621 (76%). A healthy run
# tends to 0 by construction — if Whisper's segments align with speaker turns,
# every detected change becomes a turn boundary. That makes the negative pole
# principled rather than merely manufactured.
#
# TURN_COLLAPSE_ABSORBED IS CALIBRATED ON n=2, both positives. It sits far below
# both (76%, 83%) and far above the healthy pole (~0). There is still NO healthy
# real Method D run in the corpus — every one on record failed — so the exact cut
# between the last true collapse and the first true non-collapse is unbacked.
# Recalibrate when a clean run finally exists; do not read it as derived.
TURN_COLLAPSE_ABSORBED = 0.25
# Count floor, paired with the ratio above — the same dual-condition shape
# scan_document already uses (DOC_DOMINANT_SHARE + DOC_DOMINANT_MIN). A bare
# ratio false-fires on tiny inputs: one detected change in a one-turn draft is
# 100% absorbed and means nothing. Both real positives sit far above this (481,
# 621); a recording where the diarizer found fewer than this many changes is a
# monologue or a fragment, and the ratio carries no information there.
TURN_COLLAPSE_MIN_CHANGES = 20


def count_speaker_changes(turns):
    """Label transitions in the raw diarizer turn sequence. Same-speaker turn
    splits (a pause inside one person's speech) are deliberately NOT counted —
    only a change of speaker can be absorbed into a wrong attribution."""
    return sum(1 for i in range(1, len(turns)) if turns[i][2] != turns[i - 1][2])


def scan_turn_collapse(raw_speaker_changes, emitted_turns):
    """Speaker changes the diarizer detected but the merged draft cannot show.

    Returns a list of warning strings; empty means nothing absorbed above the
    floor. Pure over two integers — no audio, no model, no I/O (the researcher's Q4
    ruling 2026-08-23: diagnostics stay pure and cadence-guarded).

    Reports the absorption; it does NOT locate or correct the misattributions,
    and it must never feed n_amb_turns or attribution_status (orthogonality).
    """
    if raw_speaker_changes < TURN_COLLAPSE_MIN_CHANGES or emitted_turns <= 0:
        return []
    preserved = max(emitted_turns - 1, 0)
    absorbed = max(raw_speaker_changes - preserved, 0)
    ratio = absorbed / raw_speaker_changes
    if ratio < TURN_COLLAPSE_ABSORBED:
        return []
    return [f"the diarizer detected {raw_speaker_changes} speaker changes; this "
            f"draft preserves {preserved} — {absorbed} ({ratio:.0%}) were absorbed "
            f"INSIDE emitted turns, where the ambiguity tally cannot see them. "
            f"Turns marked confident may contain more than one speaker: treat "
            f"attribution as unverified regardless of the ambiguity percentage."]


def scan_speaker_balance(talk_by_speaker):
    """Speakers holding an implausibly small share of detected talk.

    Returns a list of warning strings; empty means nothing to verify. Pure over
    the already-computed talk dict — no audio, no model, no I/O (the researcher's Q4
    ruling 2026-08-23: diagnostics stay pure and cadence-guarded).

    FLAGS, NEVER VERDICTS. A genuinely quiet participant — a moderator, a brief
    joiner — is a real false positive this function cannot distinguish from a
    diarizer over-split. The wording is "verify", never "wrong", and the caller
    must not let it feed attribution_status (orthogonality).
    """
    total = sum(talk_by_speaker.values())
    if total <= 0:
        return []
    out = []
    for spk in sorted(talk_by_speaker):
        share = talk_by_speaker[spk] / total
        if share < LOW_TALK_SHARE:
            out.append(
                f"{spk} holds {share:.2%} of detected talk time "
                f"({mmss(talk_by_speaker[spk])}) — verify this is a real "
                f"participant and not a diarizer over-split")
    return out


def _env_path():
    # Resolve via PAI_DIR, falling back to ~/.claude when it is unset (2026-09-22: a
    # clean Claude Code install has no PAI_DIR; same fallback as skill-guardrails-check).
    # Only needed when HF_TOKEN isn't already in the environment.
    pai_dir = os.environ.get("PAI_DIR") or os.path.join(os.path.expanduser("~"), ".claude")
    return os.path.join(pai_dir, ".env")


def load_env_key(key, path=None):
    try:
        for line in Path(path or _env_path()).read_text().splitlines():
            line = line.strip()
            if line.startswith("export "):  # 2026-09-30: accept the `export` prefix, as setup.sh does
                line = line[len("export "):].lstrip()
            if line.startswith(key + "="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        return None
    return None


def hhmmss(sec):
    sec = int(sec)
    return f"{sec//3600:02d}:{(sec%3600)//60:02d}:{sec%60:02d}"


def mmss(sec):
    sec = int(sec)
    return f"{sec//60:02d}:{sec%60:02d}"


def to_wav(src, workdir):
    """Convert any audio/video to 16k mono wav for the models."""
    wav = os.path.join(workdir, "audio_16k_mono.wav")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", src, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav],
            check=True, capture_output=True,
        )
    except FileNotFoundError:
        sys.exit("ERROR: ffmpeg not found on PATH — install with: brew install ffmpeg")
    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode(errors="replace").strip() if e.stderr else "(no stderr)"
        sys.exit(f"ERROR: ffmpeg failed converting {src}:\n{stderr}")
    return wav


def transcribe(wav, model, language, no_condition=False):
    import mlx_whisper
    kwargs = {"path_or_hf_repo": model}
    kwargs.update(DECODE_PARAMS)  # pinned at 0.4.3 defaults — see DECODE_PARAMS
    if no_condition:
        # Opt-in escape for decoder loop-collapse (--no-condition; trigger
        # confirmed 2026-07-24). Explicit per-run choice — never the default.
        kwargs["condition_on_previous_text"] = False
    if language:
        kwargs["language"] = language
    res = mlx_whisper.transcribe(wav, **kwargs)
    return res["segments"]  # each: {start, end, text, ...}


def load_waveform(wav):
    """Read the to_wav() 16-bit mono PCM wav into pyannote's in-memory form.

    pyannote's file decoder (torchcodec) hard-links against specific FFmpeg
    majors and breaks when Homebrew's ffmpeg moves past what the wheel
    supports (2026-08-21: ffmpeg 9.0.1 vs torchcodec 0.14.0's FFmpeg 4-8).
    to_wav() already produced exact PCM, so stdlib decoding removes that
    coupling; /32768.0 matches pyannote's own s16->float32 convention, so
    the pipeline input tensor is unchanged.
    """
    import wave
    import numpy as np
    import torch
    with wave.open(wav, "rb") as w:
        if w.getsampwidth() != 2 or w.getnchannels() != 1:
            raise ValueError(f"expected 16-bit mono wav from to_wav(), got "
                             f"width={w.getsampwidth()} channels={w.getnchannels()}")
        rate = w.getframerate()
        pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    tensor = torch.from_numpy(pcm.astype(np.float32) / 32768.0).unsqueeze(0)
    return {"waveform": tensor, "sample_rate": rate}


def diarize(wav, token):
    import torch
    from pyannote.audio import Pipeline
    try:
        pipe = Pipeline.from_pretrained(DIAR_MODEL, token=token)
    except Exception as e:
        sys.exit(f"ERROR: pyannote model load failed ({e.__class__.__name__}: {e})\n"
                 "Check: HF_TOKEN valid? All three model licenses accepted (including "
                 "pyannote/speaker-diarization-community-1)? Network or "
                 "~/.cache/huggingface available? See README Requirements for the license URLs.")
    dev = "mps" if torch.backends.mps.is_available() else "cpu"
    try:
        pipe.to(torch.device(dev))
    except Exception:
        dev = "cpu"
    try:
        out = pipe(load_waveform(wav))
    except Exception as e:
        sys.exit(f"ERROR: diarization inference failed on {dev} ({e.__class__.__name__}: {e})")
    # normalize across pyannote API versions
    ann = out if hasattr(out, "itertracks") else None
    if ann is None:
        for attr in ("speaker_diarization", "prediction", "diarization", "annotation"):
            cand = getattr(out, attr, None)
            if cand is not None and hasattr(cand, "itertracks"):
                ann = cand
                break
    if ann is None:
        raise RuntimeError(f"Unexpected pyannote output type: {type(out)}")
    turns = [(t.start, t.end, spk) for t, _, spk in ann.itertracks(yield_label=True)]
    return turns, dev


def assign(t0, t1, turns):
    """Return (speaker, confidence) for a Whisper segment. confidence in high|low|none."""
    ov = defaultdict(float)
    for st, en, spk in turns:
        o = min(t1, en) - max(t0, st)
        if o > 0:
            ov[spk] += o
    if not ov:
        return None, "none"
    ranked = sorted(ov.items(), key=lambda x: -x[1])
    best_spk, best_ov = ranked[0]
    second_ov = ranked[1][1] if len(ranked) > 1 else 0.0
    # 'low' (inferred, ?) only when a second speaker genuinely contests the segment
    if second_ov >= CONTEST_FRAC * best_ov:
        return best_spk, "low"
    return best_spk, "high"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--model", default=DEFAULT_MODEL, help=f"mlx-whisper repo (default {DEFAULT_MODEL})")
    ap.add_argument("--language", default=None, help="force language code (e.g. en); omit to auto-detect")
    ap.add_argument("--out", default=None, help="write draft markdown here (default: stdout)")
    ap.add_argument("--no-condition", action="store_true",
                    help="disable condition_on_previous_text — opt-in escape for decoder "
                         "loop-collapse (repetition hallucination). Changes transcription "
                         "output vs the pinned baseline; the draft records its use.")
    args = ap.parse_args()

    token = os.environ.get("HF_TOKEN") or load_env_key("HF_TOKEN")
    if not token:
        sys.exit(f"ERROR: HF_TOKEN not set and not found in {_env_path()}")
    if not os.path.exists(args.audio):
        sys.exit(f"ERROR: audio not found: {args.audio}")
    check_model_floors()  # fail loud on a partial/corrupt cache BEFORE model load

    with tempfile.TemporaryDirectory() as workdir:
        t0 = time.time()
        wav = to_wav(args.audio, workdir)
        # 16 kHz mono s16le → 32000 bytes/sec; deterministic duration, no probe.
        wav_secs = os.path.getsize(wav) / 32000.0
        t_tx = time.time()
        segments = transcribe(wav, args.model, args.language, args.no_condition)
        if not segments or not any(s["text"].strip() for s in segments):
            sys.exit("ERROR: no speech transcribed — the audio may be silent, empty, or "
                     "unreadable. Nothing to attribute; not emitting a draft. (For hard "
                     "audio try --model mlx-community/whisper-large-v3-mlx.)")
        # AFTER the empty-guard, by spec: a flagger placed before it would turn a
        # hallucinated-silence exit into a flagged green draft (QA R3).
        h_flags = scan_hallucinations(segments)
        doc_warnings = scan_document(segments, wav_secs)
        t_di = time.time()
        turns, dev = diarize(wav, token)
        t_end = time.time()

    # --- merge ---
    speakers = sorted({s for _, _, s in turns})
    talk = defaultdict(float)
    first_seen = {}
    for st, en, spk in turns:
        talk[spk] += en - st
        first_seen.setdefault(spk, st)
    # Items A and C (three-chair spec 2026-08-23): pure, over data already in hand.
    balance_warnings = scan_speaker_balance(talk)
    raw_speaker_changes = count_speaker_changes(turns)

    labeled = []  # (base_speaker_or_None, confidence, start, text)
    n_high = n_low = n_none = 0
    for s in segments:
        spk, conf = assign(s["start"], s["end"], turns)
        if conf == "none":
            n_none += 1
        elif conf == "low":
            n_low += 1
        else:
            n_high += 1
        labeled.append((spk, conf, s["start"], s["text"].strip()))

    # collapse consecutive same-base-speaker; a turn is inferred if any of its
    # segments were low-confidence, unknown if its base speaker is None.
    turns_md = []  # (label, start, text)
    for spk, conf, st, txt in labeled:
        base = spk if spk is not None else "__UNK__"
        if turns_md and turns_md[-1][0] == base:
            turns_md[-1][2] += " " + txt
            if conf == "low":
                turns_md[-1][3] = True
        else:
            turns_md.append([base, st, txt, conf == "low"])

    def render_label(base, any_low):
        if base == "__UNK__":
            return "[Speaker]"
        return f"{base}?" if any_low else base

    # Gate metric — TURN-based per TranscriptFormat.md's Attribution Status formula.
    # (The n_high/n_low/n_none counters above are per-segment DIAGNOSTICS only.)
    n_turns = max(len(turns_md), 1)
    n_amb_turns = sum(1 for base, _st, _txt, any_low in turns_md
                      if base == "__UNK__" or any_low)
    ambiguity = n_amb_turns / n_turns
    review = ambiguity > REVIEW_THRESHOLD

    # --- emit draft ---
    o = []
    o.append("<!-- Method D draft — pyannote/speaker-diarization-3.1 + mlx-whisper. "
             "Map SPEAKER_xx -> names below, then format the body per TranscriptFormat.md. "
             "This is a DRAFT: verify attributions, do not ship as-is. -->\n")
    o.append(f"**Source:** `{os.path.basename(args.audio)}`  ")
    o.append(f"**Engine:** mlx-whisper `{args.model}` + pyannote `{DIAR_MODEL}` on `{dev}`"
             + (" · `condition_on_previous_text=False` (--no-condition)" if args.no_condition else "")
             + "\n")
    # Timing goes to STDERR, not the draft: it was the draft's only wall-clock
    # content, permanently asterisking the byte-identical determinism cert
    # (as-built review, QA F4 — the 2026-07-12 cert had rounded lucky).
    print(f"Timing: convert {t_tx - t0:.0f}s · transcribe {t_di - t_tx:.0f}s · "
          f"diarize {t_end - t_di:.0f}s", file=sys.stderr)

    o.append("## Speaker Mapping — confirm before use")
    o.append("| Diarizer label | Talk time | Share | First appears | → Name / Role |")
    o.append("|---|---|---|---|---|")
    _talk_total = sum(talk.values())
    for spk in speakers:
        _share = (talk[spk] / _talk_total) if _talk_total > 0 else 0.0
        o.append(f"| **{spk}** | {mmss(talk[spk])} | {_share:.1%} | {mmss(first_seen[spk])} | ____ |")
    if not speakers:
        o.append("| _(none detected)_ | — | — | — | — |")
    o.append("")

    o.append("## Attribution tally")
    o.append(f"- segments: {len(segments)} · merged turns: {len(turns_md)} · "
             f"diarizer speakers: {len(speakers)}")
    o.append(f"- diarizer speaker changes detected: {raw_speaker_changes} · "
             f"preserved as turn boundaries: {max(len(turns_md) - 1, 0)}")
    o.append(f"- segment diagnostics — confident: {n_high} · inferred (`?`): {n_low} · "
             f"unknown (`[Speaker]`): {n_none}")
    o.append(f"- **gate basis (turns):** ambiguous turns (`?` or `[Speaker]`): "
             f"{n_amb_turns} / {len(turns_md)}")
    flag = (f"⚠️  turn ambiguity {ambiguity:.0%} exceeds {REVIEW_THRESHOLD:.0%} — "
            f"REVIEW REQUIRED before L1 extraction") if review else \
           f"turn ambiguity {ambiguity:.0%} — within tolerance"
    o.append(f"- {flag}")
    # Hallucination scan — a SEPARATE axis from the ambiguity gate above; flags
    # never feed n_amb_turns / attribution_status (three-chair spec, orthogonality).
    n_flagged = sum(1 for f in h_flags if f)
    o.append(f"- hallucination scan: {n_flagged} segment(s) flagged")
    if n_flagged:
        o.append(f"- ⚠️  HALLUCINATION SCAN: {n_flagged} segment(s) flagged — "
                 f"confirm/remove before applying labels")
    # Turn collapse — item A. Reports changes the diarizer FOUND against changes
    # this draft can SHOW; independent of the ambiguity tally, which grades only
    # the turns that were emitted and is blind to the ones that never were.
    for w in scan_turn_collapse(raw_speaker_changes, len(turns_md)):
        o.append(f"- ⚠️  TURN COLLAPSE: {w}")
    # Speaker balance — a THIRD independent axis (item C, three-chair spec
    # 2026-08-23). Like the hallucination scan it never feeds n_amb_turns or
    # attribution_status; it answers "is this speaker real?", which the
    # ambiguity tally structurally cannot ask.
    for w in balance_warnings:
        o.append(f"- ⚠️  SPEAKER BALANCE: {w}")
    # Document-level completeness — independent axis from both gates above
    # (per-segment flags see local runs; this sees the whole transcript).
    if doc_warnings:
        for w in doc_warnings:
            o.append(f"- ⚠️  COMPLETENESS: {w}")
    else:
        o.append("- completeness check: within tolerance")
    o.append("")

    if n_flagged:
        o.append("## Hallucination scan — confirm/remove before labeling")
        o.append("_Deterministic repetition/boilerplate candidates (README → ASR honesty). "
                 "Nothing below has been removed from the transcript — disposition each: "
                 "remove confirmed hallucinations, mark `*[possible transcription artifact]*` "
                 "where unsure, and record removals in the Note field._")
        o.append("| Time | Class | Text (verbatim, not removed) |")
        o.append("|---|---|---|")
        i = 0
        while i < len(segments):
            if h_flags[i]:
                j = i
                while j + 1 < len(segments) and h_flags[j + 1] == h_flags[i]:
                    j += 1
                txt = segments[i]["text"].strip().replace("|", "\\|")
                o.append(f'| {mmss(segments[i]["start"])} | {h_flags[i]} | "{txt}" |')
                i = j + 1
            else:
                i += 1
        o.append("")

    o.append("## Attributed transcript (placeholders — rename via mapping above)\n")
    for base, st, txt, any_low in turns_md:
        o.append(f"**{render_label(base, any_low)}:** {txt}\n")

    out_text = "\n".join(o)
    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(out_text)
        print(f"Draft written: {args.out}")
        print(f"Speakers: {len(speakers)} · turns: {len(turns_md)} · "
              f"ambiguity: {ambiguity:.0%}{'  ⚠️ REVIEW' if review else ''}")
    else:
        print(out_text)


if __name__ == "__main__":
    main()
