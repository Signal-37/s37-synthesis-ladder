#!/usr/bin/env python
"""tracks_transcript.py — Method S (separate tracks) for the L0 transcription skills.

Deterministic source attribution: when a recording exists as one audio file PER
PARTICIPANT (Zoom's "record a separate audio file for each participant"),
speaker attribution is free and perfect — transcribe each track, interleave the
segments by timestamp, and skip the diarizer entirely. No pyannote, no
confidence grades, no contested turns: every word's speaker is known from which
file it came from. Crosstalk content-loss (overlapped speech dropped from a
mixed stream) cannot occur — overlapped speech survives intact on its own track.

Method D (diarize_transcript.py) remains the fallback for mixed-track-only
recordings. Shares this tool's venv, pinned DECODE_PARAMS, hallucination
flagger, and draft conventions — one doctrine, two attribution methods.

Origin: meetily comparison finding 2 (2026-07-23 research note + three-chair
spec); built same day on the researcher's ruling that separate-track is the standing
recording practice (supersedes the narrower "track, don't build" for this path;
the inbox-routing automation remains parked).

Usage:
  tracks_transcript.py <track1> <track2> [...] [--model <mlx repo>] [--out draft.md] [--language en]
  tracks_transcript.py <dir>              (uses every audio file in the dir as a track;
                                           Zoom combined-mix names are auto-excluded)
"""
import argparse, os, re, sys, tempfile, time
from pathlib import Path

# Shared plumbing — same dir, same venv. diarize_transcript keeps its heavy
# imports (mlx_whisper/torch/pyannote) function-local, so this import is cheap.
from diarize_transcript import (
    DECODE_PARAMS,  # noqa: F401  (used via transcribe; named here for greppability)
    check_model_floors,
    mmss,
    scan_document,
    scan_hallucinations,
    to_wav,
    transcribe,
)
# Energy-attributed dedup for shared-air recordings (commissioned 2026-08-15;
# spec: Inputs-to-Level-0/2026-08-15_energy-dedup-tool-spec.md v2). Sibling
# module by design — never in diarize_transcript, so Method D stays untouched.
from dedup import AMBIG_MARK, DEDUP_BAND_DB, RESTORE_MARK, compute_envelope, dedup_pass
# Arrival-lag hints for the ambiguous band (commissioned 2026-09-10; a hint, never a
# decision — suppression is untouched). Sibling module, same discipline as dedup.
import lag as lagmod

AUDIO_EXTS = {".m4a", ".mp3", ".wav", ".aiff", ".aif", ".mp4", ".aac", ".flac", ".ogg"}
# Zoom writes the combined mix alongside the per-participant files; in dir mode
# these are excluded (they'd double every utterance). Matched on the STEM,
# case-insensitively, as a prefix.
COMBINED_MIX_PREFIXES = ("audio_only", "playback", "combined")

# Zoom per-participant stems commonly look like "audioScottKing12345" or
# "audio Scott King". Derivation is deterministic and conservative: strip a
# leading "audio" prefix and trailing digits/separators, tidy whitespace. The
# ORIGINAL filename always appears in the mapping table — the human confirms.
_LEAD = re.compile(r"^audio[\s_-]*", re.IGNORECASE)
_TAIL = re.compile(r"[\s_-]*\d+$")


def derive_label(path):
    stem = Path(path).stem
    label = _TAIL.sub("", _LEAD.sub("", stem)).strip(" _-")
    return label or stem  # never empty — fall back to the raw stem


def disambiguate_labels(labels):
    """Return a globally-unique label list, deterministically.

    Every occurrence of a duplicated stem gets a suffix (Scott-1/Scott-2 —
    symmetric, no bare straggler), and generated suffixes are checked against
    BOTH already-used names and raw stems, so a pre-existing 'A-1' filename
    can never collide with a generated one. Extracted + fixed at the as-built
    review (Engineer F1, executed repro: ['A-1','A','A'] previously produced
    two tracks both labeled 'A-1' — silent misattribution on the one method
    that advertises perfect attribution)."""
    if len(set(labels)) == len(labels):
        return list(labels)
    original = list(labels)
    used, counts, out = set(), {}, []
    for lb in original:
        if original.count(lb) == 1 and lb not in used:
            out.append(lb)
            used.add(lb)
            continue
        counts[lb] = counts.get(lb, 0) + 1
        cand = f"{lb}-{counts[lb]}"
        while cand in used or cand in original:
            counts[lb] += 1
            cand = f"{lb}-{counts[lb]}"
        out.append(cand)
        used.add(cand)
    assert len(set(out)) == len(out), f"non-unique labels after disambiguation: {out}"
    return out


# Mix-detection heuristic threshold: a combined mix contains (nearly) all
# speech, so its speech time overlaps almost the entirety of any real
# participant track's speech. Genuine crosstalk between two participants
# never approaches this fraction of a whole track.
MIX_OVERLAP_FRAC = 0.90


def mix_suspects(per_track_spans):
    """per_track_spans: list of (label, [(start, end), ...]) speech spans.
    Returns labels suspected of being an unexcluded combined mix: a track
    whose speech overlaps >= MIX_OVERLAP_FRAC of AT LEAST TWO other tracks'
    total speech time — a real mix contains everyone, so it overlaps every
    participant (deterministic; as-built review, Architect F1b).

    Why >=2 and not >=1: whisper segment bounds include leading/trailing
    silence (no VAD), so on a 2-track recording the pairwise overlap test
    false-positived on a GENUINE fixture (caught by this increment's own E2E
    re-baseline before ship). The heuristic therefore only speaks for
    >=3-track recordings; 2-track mixes remain covered by the name exclusion
    + the human mapping check, and that blind spot is documented in the
    README rather than guessed at noisily."""
    def total(spans):
        return sum(e - s for s, e in spans)

    def overlap(a, b):
        o = 0.0
        for s1, e1 in a:
            for s2, e2 in b:
                o += max(0.0, min(e1, e2) - max(s1, s2))
        return o

    suspects = []
    for i, (label, spans) in enumerate(per_track_spans):
        covered = 0
        for k, (_other, ospans) in enumerate(per_track_spans):
            if i == k or not ospans:
                continue
            if overlap(spans, ospans) >= MIX_OVERLAP_FRAC * total(ospans) > 0:
                covered += 1
        if covered >= 2:
            suspects.append(label)
    return suspects


# ─── Capture-type detection (the researcher's ruling 2026-08-23; automatic since same day) ──
# Bleed is a SHARED-AIR phenomenon. Network-separated capture (Zoom's per-participant
# streams) has no shared air, so a cross-track text match cannot be bleed and the
# dedup pass must not run. This decides which one we are looking at.
#
# READS PROVENANCE MARKERS, NEVER THE AUDIO. Acoustic detection was built and
# rejected the same day: span-level cross-correlation separates 6 of 7 known bleed
# spans but puts the 7th at 0.034 — inside the network-separated range — so gating
# on it would suppress the warning on REAL bleed. Filenames do not degrade with room
# noise. Evidence: Inputs-to-Level-0/2026-08-21_p01-run-evidence/
# 2026-08-23_dedup-ambiguous-disposition.md
#
# Zoom's signature, consistent across all three recordings on disk (2026-07-24,
# 2026-07-30, 2026-08-21): a `recording.conf` beside or above the tracks, and every
# per-participant stem ending in the SAME long digit run as the combined mix
# (`audioJScottKing1` + `9876543210`, `audioparticipant2` + `9876543210`, ...).
# Insta360's: every stem carrying the `-tx<N>_orig` wearer marker.
ZOOM_SUFFIX_MIN_DIGITS = 9
INSTA_TX = re.compile(r"-tx\d+_orig", re.I)


def detect_capture(inputs, tracks):
    """(capture, evidence) — capture is 'network-separated', 'shared-air', or None.

    None means UNDETERMINED, and the caller must not quietly assume: an
    undetermined folder that also produced ambiguous flags is asked about in the
    draft rather than silently resolved one way (the researcher, 2026-08-23: "you could
    also ask").
    """
    names = [os.path.basename(t) for t in tracks]
    if not names:
        return None, "no tracks"
    # Zoom marker 1: recording.conf beside the tracks or one level up.
    roots = []
    if len(inputs) == 1 and os.path.isdir(inputs[0]):
        roots = [inputs[0], os.path.dirname(os.path.abspath(inputs[0]))]
    else:
        roots = [os.path.dirname(os.path.abspath(names and tracks[0] or ""))]
        roots.append(os.path.dirname(roots[0]))
    for r in roots:
        if r and os.path.isfile(os.path.join(r, "recording.conf")):
            return "network-separated", f"Zoom `recording.conf` at {os.path.basename(r) or r}"
    # Zoom marker 2: every stem ends in the same meeting id. NOTE the participant
    # INDEX sits immediately before it (`audioJScottKing1` + `9876543210`,
    # `audioparticipant2` + `9876543210`), so the trailing digit runs DIFFER by that
    # leading digit and cannot be compared whole — compare their longest common
    # SUFFIX instead. Found by the battery: the whole-run comparison never matched,
    # and the real folders were passing on marker 1 alone.
    tails = []
    for n in names:
        m = re.search(r"(\d+)$", os.path.splitext(n)[0])
        tails.append(m.group(1) if m else None)
    if tails and all(tails):
        common = tails[0]
        for t in tails[1:]:
            i = 0
            while i < len(common) and i < len(t) and common[len(common) - 1 - i] == t[len(t) - 1 - i]:
                i += 1
            common = common[len(common) - i:]
        if len(common) >= ZOOM_SUFFIX_MIN_DIGITS:
            return "network-separated", f"all stems share the Zoom meeting-id suffix {common}"
    # Insta360 / shared-air marker.
    if all(INSTA_TX.search(n) for n in names):
        return "shared-air", "all stems carry the Insta360 `-tx<N>_orig` wearer marker"
    return None, "no Zoom or Insta360 provenance marker found"


def collect_tracks(inputs):
    """Resolve CLI inputs to an ordered track list. Returns (tracks, excluded).
    Pure over the filesystem listing — sorted for determinism."""
    if len(inputs) == 1 and os.path.isdir(inputs[0]):
        files = sorted(
            str(p) for p in Path(inputs[0]).iterdir()
            if p.suffix.lower() in AUDIO_EXTS and not p.name.startswith(".")
        )
        excluded = [f for f in files
                    if Path(f).stem.lower().startswith(COMBINED_MIX_PREFIXES)]
        tracks = [f for f in files if f not in excluded]
        return tracks, excluded
    return sorted(inputs), []


def interleave(per_track_segments):
    """Merge per-track segment lists into one ordered turn list.

    per_track_segments: list of (label, segments) where segments are Whisper
    dicts {start, end, text, ...}. Returns turns: [label, start, text].
    Deterministic: total sort key (start, end, label), then consecutive
    same-label collapse (verbatim join, single space) — the same
    attribution-only merge Method D applies (no >2s pause split; that remains
    a downstream mapping-time step, per the canonical merge doctrine).
    """
    flat = []
    for label, segs in per_track_segments:
        for s in segs:
            txt = s["text"].strip()
            if txt:
                flat.append((s["start"], s["end"], label, txt))
    flat.sort(key=lambda r: (r[0], r[1], r[2]))
    turns = []
    for start, _end, label, txt in flat:
        if turns and turns[-1][0] == label:
            turns[-1][2] += " " + txt
        else:
            turns.append([label, start, txt])
    return turns


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inputs", nargs="+",
                    help="two+ per-participant audio files, or one directory of them")
    ap.add_argument("--model", default="mlx-community/whisper-large-v3-turbo",
                    help="mlx-whisper repo (default mlx-community/whisper-large-v3-turbo)")
    ap.add_argument("--language", default=None,
                    help="force language code (e.g. en); omit to auto-detect")
    ap.add_argument("--out", default=None, help="write draft markdown here (default: stdout)")
    # condition_on_previous_text=False is the METHOD S DEFAULT since 2026-07-30
    # (the researcher ruling, QA re-baseline: Inputs-to-Level-0/2026-07-30_no-condition-
    # qa-rebaseline.md — regression class sized at net ≈ 0 both fixtures, while
    # conditioning-ON carries a stochastic destructive-loop tail on half-silent
    # per-track audio plus 2-3x flag burden and ~2x compute). Method D keeps the
    # pinned default: continuous mix audio starves the silence mechanism (2/2
    # counter-evidence runs). The mandatory entity cross-check pass stays as the
    # compensating control for nocond's entity-class misses (non-monotone).
    cond = ap.add_mutually_exclusive_group()
    cond.add_argument("--condition", action="store_true",
                      help="restore condition_on_previous_text=True (the pre-2026-07-30 "
                           "pinned baseline). Re-exposes the stochastic decoder loop-collapse "
                           "tail on per-track silence; the draft records its use.")
    cond.add_argument("--no-condition", action="store_true",
                      help="(default since 2026-07-30) kept for compatibility; a no-op.")
    # Energy-attributed dedup: DEFAULT ON (spec v2 — safe because the pass takes
    # no harmful action on clean input and every suppression is re-run-recoverable;
    # a shared-air session that forgets a flag would otherwise ship a duplicated
    # draft, the forgotten-toggle failure mode).
    dd = ap.add_mutually_exclusive_group()
    dd.add_argument("--dedup", action="store_true",
                    help="(default) resolve cross-track bleed by energy attribution")
    dd.add_argument("--no-dedup", action="store_true",
                    help="disable the dedup pass (draft may carry duplicated bleed turns)")
    # Capture type (the researcher's ruling 2026-08-23). Bleed is a SHARED-AIR phenomenon:
    # one room, several mics, everyone's voice on every track. NETWORK-SEPARATED
    # capture (Zoom's per-participant streams) has no shared air, so a cross-track
    # text match CANNOT be bleed by construction — it is two people echoing each
    # other's words, which is simply what conversation is. On that input the dedup
    # pass can neither suppress nor warrant a warning, so it does not run.
    #
    # DECLARED, NOT DETECTED, and that is on evidence rather than convenience.
    # Acoustic auto-detection was built and REJECTED the same day: whole-file
    # cross-correlation does not separate the classes (shared-air known positive
    # 0.038 vs network-separated 0.012-0.019), and span-level correlation, which
    # separates 6 of 7 known bleed spans cleanly, puts the 7th at 0.034 — INSIDE
    # the network-separated range. Gating on it would suppress the warning on real
    # bleed, which is the dangerous direction. Evidence:
    # Inputs-to-Level-0/2026-08-21_p01-run-evidence/2026-08-23_dedup-ambiguous-disposition.md
    #
    # DEFAULT IS shared-air — the fail-safe direction. Forgetting the flag keeps
    # the safety net on and costs a few false flags; the reverse would silently
    # disable bleed handling on a rig that needs it (the forgotten-toggle failure
    # mode this tool already names for --no-dedup).
    ap.add_argument("--no-lag", action="store_true",
                    help="skip the arrival-lag hint on ambiguous copies (default: computed "
                         "whenever the dedup pass resolves a 2-track shared-air session)")
    ap.add_argument("--capture", choices=("shared-air", "network-separated"),
                    default=None,
                    help="shared-air (default: worn mics in one room — bleed possible, dedup runs) "
                         "| network-separated (Zoom per-participant streams — bleed impossible, dedup does not run)")
    args = ap.parse_args()
    args.no_condition = not args.condition
    args.capture_declared = args.capture is not None

    tracks, excluded = collect_tracks(args.inputs)
    # --- capture type: detect from provenance markers; an explicit --capture wins.
    detected, cap_evidence = detect_capture(args.inputs, tracks)
    if args.capture_declared:
        args.capture_source = f"declared `--capture {args.capture}`"
        if detected and detected != args.capture:
            args.capture_source += f" (overrides detection: {cap_evidence})"
    elif detected:
        args.capture = detected
        args.capture_source = f"detected — {cap_evidence}"
    else:
        # UNDETERMINED. Assume shared-air (keeps the safety net on), but never
        # let that assumption pass silently if it actually changed the output —
        # the draft asks. The researcher, 2026-08-23: "you could also ask."
        args.capture = "shared-air"
        args.capture_source = f"UNDETERMINED — {cap_evidence}; assumed shared-air"
    args.capture_undetermined = not args.capture_declared and not detected
    args.dedup_on = not args.no_dedup and args.capture == "shared-air"
    args.dedup_off_reason = ("--no-dedup" if args.no_dedup else
                             ("capture network-separated" if args.capture != "shared-air" else ""))
    for f in tracks:
        if not os.path.exists(f):
            sys.exit(f"ERROR: track not found: {f}")
    if len(tracks) < 2:
        sys.exit("ERROR: Method S needs >=2 per-participant track files "
                 f"(found {len(tracks)}"
                 f"{'; excluded combined-mix: ' + ', '.join(Path(e).name for e in excluded) if excluded else ''}). "
                 "For a single mixed file use diarize-transcript (Method D).")
    # Whisper floor only — Method S never loads pyannote (Architect F4).
    check_model_floors(names=("whisper",))

    labels = disambiguate_labels([derive_label(f) for f in tracks])

    per_track = []           # (label, segments)
    envelopes = {}           # label -> 50 ms RMS envelope (dedup's only audio view)
    pcm = {}                 # label -> int16 16 kHz samples, for the arrival-lag hint only
    lag_on = args.dedup_on and not args.no_lag and len(tracks) == 2
    lag_off_reason = "--no-lag" if args.no_lag else ("n>2 tracks" if len(tracks) != 2 else "")
    flag_rows = []           # (start, label, reason, text) for the scan table
    doc_warnings = []        # (label, warning) — document-level completeness
    n_flagged = 0
    t0 = time.time()
    with tempfile.TemporaryDirectory() as workdir:
        for f, label in zip(tracks, labels):
            wav = to_wav(f, os.path.join(workdir))
            segs = transcribe(wav, args.model, args.language, args.no_condition)
            segs = [s for s in segs if s["text"].strip()]
            flags = scan_hallucinations(segs)
            for s, fl in zip(segs, flags):
                # Flags ride ON the segments (Class C exclusion must not depend
                # on re-matching by timestamp — Architect F4).
                s["_hflag"] = bool(fl)
                if fl:
                    n_flagged += 1
                    flag_rows.append((s["start"], label, fl, s["text"].strip()))
            # Per-track completeness — dominant-share axis only: audio_secs is
            # deliberately None because a per-participant track is silent for
            # most of the wall clock, so wpm-vs-wall would false-fire on every
            # quiet participant (see DOC_MIN_WPM comment in diarize_transcript).
            for w in scan_document(segs, None):
                doc_warnings.append((label, w))
            per_track.append((label, segs))
            # Energy is sampled HERE, while this track's wav exists — it is
            # deleted two lines down, and the dedup pass touches no audio.
            if args.dedup_on:
                envelopes[label] = compute_envelope(wav)
                # Arrival-lag hint needs BOTH tracks' audio after the pass; keep the
                # 16 kHz s16 samples in memory (≈110 MB/hour/track). Only the 2-track
                # calibrated case; any read failure disables the hint, never the run.
                if lag_on and len(tracks) == 2:
                    try:
                        pcm[label] = lagmod.load_pcm16k(wav)
                    except Exception as e:  # noqa: BLE001 — hint is optional by design
                        lag_on, lag_off_reason = False, f"audio not readable for lag ({e})"
            # fresh wav per track: to_wav writes a fixed name inside workdir —
            # remove so the next track can't read a stale conversion
            os.remove(wav)
    t_end = time.time()

    if all(not segs for _label, segs in per_track):
        sys.exit("ERROR: no speech transcribed on ANY track — the files may be "
                 "silent, empty, or unreadable. Nothing to attribute; not emitting a draft.")

    flag_rows.sort(key=lambda r: (r[0], r[1]))
    suspects = mix_suspects([
        (label, [(s["start"], s["end"]) for s in segs]) for label, segs in per_track
    ])

    # --- energy-attributed dedup (spec v2). Suppression only runs on the
    # calibrated case: exactly 2 tracks AND no mix suspect. n>2 auto-downgrades
    # to detect-and-flag (pairwise suppression semantics are uncalibrated and
    # can conflict); a mix suspect declines suppression for the session
    # (suppressing against a smuggled combined mix corrupts attribution at
    # scale). Both ruled by the researcher 2026-08-15.
    dedup_log, dedup_counts, dedup_note = [], {"resolved": 0, "ambiguous": 0, "class_d": 0, "restored": 0}, ""
    detail, lag_hints, lag_calib, resolve = [], {}, None, False
    if args.dedup_on:
        resolve = len(tracks) == 2 and not suspects
        if len(tracks) > 2:
            dedup_note = "n>2 tracks: detect-and-flag only (calibration is n=2); nothing suppressed"
        elif suspects:
            dedup_note = "mix suspect fired: suppression declined this session; pairs flagged only"
        detail = []
        per_track, dedup_log, dedup_counts = dedup_pass(
            per_track, envelopes, resolve=resolve, detail=detail)
        if lag_on and not resolve:
            lag_on, lag_off_reason = False, "dedup did not resolve (n>2 or mix suspect)"
        if lag_on and detail:
            lag_hints, lag_calib = lagmod.lag_hints(pcm, labels, detail)
            if lag_calib is None:
                lag_on, lag_off_reason = False, "too few confident copies to calibrate the clock offset"
            else:
                # Rebuild the ambiguity marker so the ear sees both instruments at once.
                for label, segs in per_track:
                    for s_ in segs:
                        if s_["text"].startswith((AMBIG_MARK, RESTORE_MARK)):
                            h = lag_hints.get((label, s_["start"]))
                            if h:
                                s_["text"] = s_["text"].replace(" dB) ", f" dB · lag {lagmod.hint_str(h)}) ", 1)
        pcm.clear()

    # Talk time / first-appears / tallies from SURVIVING segments — the mapping
    # table is the one human-judgment step and must not be fed bleed-inflated
    # numbers (Engineer F3; test 05: a 2 m read otherwise lands in the other
    # wearer's talk time). With dedup off, surviving == transcribed.
    talk = {label: sum(s["end"] - s["start"] for s in segs) for label, segs in per_track}
    first_seen = {label: segs[0]["start"] for label, segs in per_track if segs}

    turns = interleave(per_track)

    # --- emit draft (Method D conventions; deterministic attribution) ---
    o = []
    o.append("<!-- Method S draft — separate-track deterministic attribution + mlx-whisper. "
             "Confirm the track->name mapping below, then format the body per "
             "TranscriptFormat.md. Attribution is deterministic (one file per speaker); "
             "the mapping table is the only judgment. -->\n")
    src = args.inputs[0] if len(args.inputs) == 1 else f"{len(tracks)} track files"
    o.append(f"**Source:** `{os.path.basename(src.rstrip('/'))}` — {len(tracks)} separate track(s)"
             + (f" (excluded combined mix: {', '.join(Path(e).name for e in excluded)})" if excluded else "") + "  ")
    # Provenance is explicit in BOTH states — the default changed 2026-07-30,
    # so a bare Engine line must never leave the conditioning state ambiguous.
    o.append(f"**Engine:** mlx-whisper `{args.model}` — Method S, no diarizer"
             + (" · `condition_on_previous_text=False` (Method S default since 2026-07-30)"
                if args.no_condition else
                " · `condition_on_previous_text=True` (--condition: pinned pre-2026-07-30 baseline)")
             + "  ")
    # Dedup provenance — explicit in BOTH states, same discipline as the
    # conditioning line: a default must never leave its state ambiguous.
    if args.dedup_on:
        o.append(f"**Dedup:** on — resolved {dedup_counts['resolved']} / "
                 f"ambiguous {dedup_counts['ambiguous']} / Class D {dedup_counts['class_d']}"
                 f" · margin floor {DEDUP_BAND_DB:.1f} dB"
                 f" · capture: {args.capture_source}"
                 + (f" · {dedup_note}" if dedup_note else "") + "\n")
        # Symmetric-suppression guard (2026-09-13). Emitted whenever the pass
        # actually removed or restored a copy — a silent deletion is the one
        # thing the dedup log could not show. Zero suppressions = nothing to
        # guard, and the line stays out so the Zoom no-op contract (test 7)
        # holds byte-for-byte.
        if not (dedup_counts["resolved"] or dedup_counts["restored"]):
            pass
        elif dedup_counts["restored"]:
            n_r = dedup_counts["restored"]
            o.append(f"> ⚠️ **Dedup guard: {n_r} symmetric suppression(s)** — two copies lost to "
                     f"each other and the words they share survive in no kept copy (differently-"
                     f"bounded copies across a speaker handoff; P03 2026-09-01 defect, twice at P04). "
                     f"The warmer copy was RESTORED in full and marked "
                     f"`{RESTORE_MARK}` in the transcript; see the `restored (symmetric)` rows in the "
                     f"Dedup log. Attribution of each restored turn is by ear — energy could not "
                     f"decide it.\n")
        else:
            o.append(f"**Dedup guard:** clean — every one of the {dedup_counts['resolved']} "
                     f"suppressed copies has a surviving duplicate on the other track\n")
        # Ask, rather than assume, exactly when the assumption changed the output.
        if args.capture_undetermined and dedup_counts["ambiguous"]:
            o.append(f"> ⚠️ **CAPTURE TYPE UNDETERMINED — confirm before dispositioning.** "
                     f"{cap_evidence}, so shared-air was assumed and the pass ran. If this was "
                     f"NETWORK-SEPARATED capture (one stream per participant, e.g. Zoom), then "
                     f"bleed is impossible here and all {dedup_counts['ambiguous']} ambiguous "
                     f"flag(s) above are conversational echo, not bleed — re-run with "
                     f"`--capture network-separated`.\n")
        if detail:
            if lag_calib is not None:
                amb_h = [lag_hints[(c["label"], c["start"])] for c in detail if c["action"] == "ambiguous"]
                weak = sum(1 for h in amb_h if h["quality"] == "weak"); na = sum(1 for h in amb_h if h["quality"] == "n/a")
                o.append(f"**Lag hint:** on — clock offset {lag_calib['offset_ms']:+.1f} ms "
                         f"(drift {lag_calib['drift_ms_per_h']:+.1f} ms/h) · arrival Δ {lag_calib['delta_ms']:.1f} ms "
                         f"· calibration agreement {lag_calib['agreement']*100:.1f}% on {lag_calib['n']} confident copies "
                         f"· hints on {len(amb_h)} ambiguous cop{'y' if len(amb_h)==1 else 'ies'} "
                         f"({weak} weak, {na} n/a) — a second instrument for the ear, not a decision; "
                         f"suppression unchanged (lag.py, 2026-09-10)\n")
            else:
                o.append(f"**Lag hint:** not computed — {lag_off_reason}\n")
    elif args.dedup_off_reason == "--no-dedup":
        # An EXPLICIT disable is never masked by the capture declaration: the
        # actionable fact for a reader is what the operator actually did.
        o.append("**Dedup:** off (--no-dedup) — draft may carry duplicated bleed turns"
                 + (f" (capture is `network-separated` — {args.capture_source} — where bleed cannot occur)"
                    if args.capture != "shared-air" else "") + "\n")
    else:
        o.append(f"**Dedup:** not run — capture `network-separated` "
                 f"({args.capture_source}). Zoom-style per-participant streams have no "
                 f"shared air, so a cross-track text match cannot be bleed: no "
                 f"suppressions, no ambiguous flags, and cross-track phrase repeats "
                 f"are conversational echo left on both tracks where they belong.\n")
    # Timing to STDERR — keeps the draft free of wall-clock content (QA F4).
    print(f"Timing: transcribe {t_end - t0:.0f}s total across {len(tracks)} track(s)",
          file=sys.stderr)

    o.append("## Speaker Mapping — confirm before use")
    o.append("| Track file | Derived label | Talk time | First appears | → Name / Role |")
    o.append("|---|---|---|---|---|")
    for f, label in zip(tracks, labels):
        tt = mmss(talk.get(label, 0.0))
        fs = mmss(first_seen[label]) if label in first_seen else "—"
        o.append(f"| `{Path(f).name}` | **{label}** | {tt} | {fs} | ____ |")
    o.append("")

    o.append("## Attribution tally")
    n_segs = sum(len(segs) for _l, segs in per_track)
    o.append(f"- segments: {n_segs} · merged turns: {len(turns)} · tracks: {len(tracks)}")
    # The 0%-ambiguity claim is CONDITIONED on the dedup band (Architect F5):
    # the moment an ambiguous pair exists, asserting none can exist is false
    # for the L0 consumer.
    if dedup_counts["restored"]:
        o.append(f"- **{dedup_counts['restored']} symmetric-suppression restore(s)** ⚠ marked "
                 f"`{RESTORE_MARK}` — each is ear-dispositioned (which speaker) before "
                 "`attribution_status: resolved`; see the Dedup log's `restored (symmetric)` rows.")
    if dedup_counts["ambiguous"]:
        o.append(f"- **attribution: deterministic (separate tracks)** with "
                 f"**{dedup_counts['ambiguous']} dedup-ambiguous segment(s)** ⚠ flagged "
                 f"for the ear (margin inside ±{DEDUP_BAND_DB:.0f} dB — see the Dedup log); "
                 "all other attribution is by track, no `?` or `[Speaker]` states. "
                 "`attribution_status: resolved` once the mapping above is confirmed, "
                 "the flagged segments are listened to, and no combined mix slipped in.")
    else:
        o.append("- **attribution: deterministic (separate tracks)** — 0% ambiguity "
                 "**provided each track carries exactly one participant**; no `?` or "
                 "`[Speaker]` states exist on this path. `attribution_status: resolved` "
                 "once the mapping above is confirmed and no combined mix slipped in.")
    if suspects:
        o.append(f"- ⚠️  POSSIBLE COMBINED MIX among tracks: {', '.join(sorted(suspects))} — "
                 f"this track's speech overlaps ≥{MIX_OVERLAP_FRAC:.0%} of at least two "
                 f"other tracks'; a mix transcribed as a participant silently corrupts "
                 f"attribution. Verify before mapping (the name-based exclusion only "
                 f"catches {', '.join(COMBINED_MIX_PREFIXES)}* stems).")
    o.append(f"- hallucination scan: {n_flagged} segment(s) flagged")
    if n_flagged:
        o.append(f"- ⚠️  HALLUCINATION SCAN: {n_flagged} segment(s) flagged — "
                 f"confirm/remove before applying labels")
    # Document-level completeness, per track (dominant-share axis only — see
    # the audio_secs=None note at the scan_document call site).
    if doc_warnings:
        for label, w in doc_warnings:
            o.append(f"- ⚠️  COMPLETENESS [{label}]: {w}")
    else:
        o.append("- completeness check: within tolerance")
    o.append("")

    if n_flagged:
        o.append("## Hallucination scan — confirm/remove before labeling")
        o.append("_Deterministic repetition/boilerplate candidates (README → ASR honesty), "
                 "scanned PER TRACK. Nothing below has been removed — disposition each: "
                 "remove confirmed hallucinations, mark `*[possible transcription artifact]*` "
                 "where unsure, record removals in the Note field._")
        o.append("| Time | Track | Class | Text (verbatim, not removed) |")
        o.append("|---|---|---|---|")
        for start, label, reason, text in flag_rows:
            o.append(f'| {mmss(start)} | {label} | {reason} | "{text.replace("|", chr(92) + "|")}" |')
        o.append("")

    # Dedup log — emitted ONLY when there is something to report; a zero-cross-
    # match run (Zoom) adds no section (the no-op contract). Nothing is ever
    # silently deleted: every suppression and every ambiguous pair is a row,
    # text verbatim. The log FEEDS the per-session bleed disposition — it does
    # not replace the one-line human attestation (the researcher ruling Q5a, 2026-08-15).
    if dedup_log:
        o.append("## Dedup log — every suppression and ambiguous pair; feeds the "
                 "bleed disposition, does not replace it")
        lag_col = bool(lag_hints)
        o.append("| Time | Action | Kept | Lost/Flagged | Margin | Text (verbatim) |" + (" Lag hint |" if lag_col else ""))
        o.append("|---|---|---|---|---|---|" + ("---|" if lag_col else ""))
        for t_, action, kept, lost, m, text in dedup_log:
            row = (f'| {mmss(t_)} | {action} | {kept} | {lost} | {m:+.1f} dB | '
                   f'"{text.replace("|", chr(92) + "|")}" |')
            if lag_col:
                own = kept if (action == "ambiguous" or action.startswith("restored")) else lost   # the copy's own track
                row += f" {lagmod.hint_str(lag_hints.get((own, t_)))} |"
            o.append(row)
        o.append("")

    o.append("## Attributed transcript (labels from track files — confirm mapping above)\n")
    for label, _start, txt in turns:
        o.append(f"**{label}:** {txt}\n")

    out_text = "\n".join(o)
    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(out_text)
        print(f"Draft written: {args.out}")
        print(f"Tracks: {len(tracks)} · turns: {len(turns)} · attribution: deterministic"
              + (f"  ⚠️ {n_flagged} hallucination flag(s)" if n_flagged else ""))
    else:
        print(out_text)


if __name__ == "__main__":
    main()
