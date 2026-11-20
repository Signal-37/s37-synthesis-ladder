# diarize — Method D automated speaker diarization + Method S separate tracks

Speaker-attributed transcript drafts for the L0 transcription skills
(`l0-transcribe-conversation`, `l0-transcribe-interview`). Runs **fully on-device**
on Apple Silicon (`mps`) — no audio or text leaves the machine. Two attribution
methods, one venv and doctrine:

- **Method S** (`tracks-transcript`) — one audio file PER PARTICIPANT (Zoom's
  "record a separate audio file for each participant," the researcher's standing setting
  since 2026-07-23): transcribe each track, interleave by timestamp, **skip the
  diarizer entirely**. Attribution is deterministic and perfect; crosstalk
  content-loss cannot occur (overlapped speech survives on its own track).
  **Preferred over Method D whenever separate tracks exist.**
- **Method D** (`diarize-transcript`) — the mixed-track fallback: pyannote
  diarization with graded-confidence labels, detailed below.

## What it does

```
audio ──► mlx-whisper (transcribe) ─┐
      └─► pyannote (diarize) ────────┴─► merge (max time-overlap) ──► attributed draft
```

Output is a markdown **draft** with:
- anonymous `SPEAKER_00/01/02` placeholders + a **speaker-mapping stub** (talk time + first-appearance to help you identify who's who),
- an **attribution tally** with a review flag,
- the transcript body with **graded-confidence labels** (keyed on speaker *contention*, not overlap fraction):
  - `**SPEAKER_00:**` — high confidence (one speaker clearly wins — no 2nd speaker's overlap reaches 35% of the winner's)
  - `**SPEAKER_00?:**` — inferred (a 2nd speaker genuinely contests the segment)
  - `**[Speaker]:**` — unknown (no diarizer turn overlaps this segment; consecutive unknown segments merge into ONE `[Speaker]` turn, which may represent more than one unattributed voice)

The tool owns the mechanical attribution only. The calling workflow maps
`SPEAKER_xx → names`, then formats the body into a full L0 file per
`TranscriptFormat.md` (YAML, prose header, Speaker Key, topic sections).

## Usage

```bash
../ladder-core/scripts/diarize/diarize-transcript <audio> [--model <mlx repo>] [--out draft.md] [--language en]
```

- **Default model:** `mlx-community/whisper-large-v3-turbo` (fast + accurate, multilingual). For quick passes use `mlx-community/whisper-small.en-mlx`; for hard audio, `mlx-community/whisper-large-v3-mlx`.
- `--language en` forces English (skip for auto-detect).
- Omit `--out` to print to stdout.
- **Expected noise:** every Method D run prints a long `torchcodec is not installed correctly…` warning with a traceback (about 40 lines). It is harmless: since 2026-08-21 the tool feeds pyannote an in-memory waveform and never uses torchcodec's decoder. The run has worked if it ends with `Draft written:`.

## Requirements

- **`HF_TOKEN`** in `~/.claude/.env` (`$PAI_DIR/.env` when `PAI_DIR` is set; `HF_TOKEN` exported in the environment also works) — the pyannote models are gated. The token's
  Hugging Face account must have accepted the licenses (one-time click) at:
  - https://huggingface.co/pyannote/speaker-diarization-3.1
  - https://huggingface.co/pyannote/segmentation-3.0
  - https://huggingface.co/pyannote/speaker-diarization-community-1 — pyannote.audio 4.x (the lock pins 4.0.7) loads the pipeline's segmentation, embedding and PLDA from this repo, so without it Method D fails with `GatedRepoError 403`. Licence acceptance belongs to the Hugging Face account, not the machine, so a token whose account accepted it earlier hides the requirement.
- `ffmpeg` on PATH (used to normalize input to 16 kHz mono).
- The self-contained `venv/` (pyannote.audio + mlx-whisper). On a fresh machine, bootstrap it in one command:
  ```bash
  ../ladder-core/scripts/diarize/setup.sh        # add --force to rebuild from scratch
  ```
  `setup.sh` creates the py3.12 venv (uv's own managed Python, never one found on PATH), installs the deps, verifies torch/`mps` + mlx-whisper, and checks for `HF_TOKEN`. It's idempotent — safe to re-run.

## Method S usage (separate tracks)

```bash
../ladder-core/scripts/diarize/tracks-transcript <dir-or-track-files> [--model <mlx repo>] [--out draft.md] [--language en]
```

- Dir mode uses every audio file as a track and **auto-excludes Zoom's combined
  mix** (`audio_only*`, `playback*`, `combined*` stems — the exclusions are named
  in the draft header). Needs ≥2 tracks; a single mixed file routes to Method D.
  **Two seams on the exclusion (as-built review):** a participant whose FILE
  happens to start with one of those stems (`Combined-Jones.m4a`) is silently
  excluded — check the draft header's exclusion list against the roster; and a
  mix Zoom named unconventionally is NOT name-caught — the draft's overlap
  heuristic (`⚠️ POSSIBLE COMBINED MIX`, ≥90% speech overlap with at least TWO
  other tracks) is the backstop **for ≥3-track recordings only**: whisper
  segment bounds include leading silence, so a pairwise test false-positives
  on genuine 2-track pairs (caught by this increment's own E2E). A 2-track
  unnamed mix remains the human mapping check's job. The "0% ambiguity" claim
  holds only when each track carries exactly one participant.
- Labels derive deterministically from filenames (leading `audio` prefix and
  trailing digits stripped); the mapping table shows the original filename and
  the human confirms, same as Method D's stub. "First appears" derives from
  whisper segment starts, which can include leading silence — cosmetic only.
- The draft mirrors Method D's format, with two differences: **attribution is
  0% ambiguous by construction** (no `?`/`[Speaker]` states; `attribution_status:
  resolved` once the mapping is confirmed), and the hallucination scan runs
  **per track** (table gains a Track column). Same disposition duty at Step 5.
- No pyannote → no HF_TOKEN needed on this path; the model floors are shared
  with Method D. **DECODE_PARAMS are shared EXCEPT conditioning: Method S
  defaults to `condition_on_previous_text=False`** (2026-07-30 ruling; rationale
  + trigger scope: Shared L0 doctrine → ASR honesty). `--condition` restores
  the pinned pre-2026-07-30 baseline; `--no-condition` remains valid as a
  compatibility no-op; the two flags conflict loudly. The draft's Engine line
  records the conditioning state in BOTH cases — never ambiguous after a
  default change. Sibling test: `test_tracks.py` (ConditioningDefault locks
  all four behaviors).
- **Arrival-lag hint (2026-09-10, `lag.py`):** on a resolved 2-track shared-air
  session the draft adds a `**Lag hint:**` header line, a `Lag hint` column at the
  end of the Dedup log, and `· lag →Label (peak)` inside every ambiguity marker —
  which mic heard the event first, calibrated on the session's own confident
  copies. A second instrument for the ear, never a decision (P04: 86% agreement
  with the ear on the ambiguous band, energy 84%; `weak` below 0.15 peak).
  `--no-lag` disables it. Details and validation: CHANGELOG 2026-09-10.
- **Symmetric-suppression guard (2026-09-13, in `dedup_pass`):** the words of
  every suppressed copy must survive in some kept copy. For any two suppressed
  copies on opposite tracks that share a run of ≥3 content tokens and overlap
  or sit within 1 s of each other — formal pairs (P03 25:49: two differently-
  bounded copies across a handoff, each cold over its OWN span, each losing
  to the other) and near-adjacent copies too short-overlapped to pair (P04
  08:09/08:11: each lost to a different kept neighbour that carried only its
  head or only its tail) — the shared run is looked up in every kept partner
  of either copy, on the matcher's own terms (shared runs, never literal
  text); if two or more of those tokens appear in no kept copy, the warmer
  copy is restored in full, prefixed `⚠ DEDUP-RESTORED (…)`, logged as
  `restored (symmetric)`, and counted in the header's `**Dedup guard:**` line
  (emitted whenever anything was suppressed: `clean`, or a ⚠️ callout with the
  count). A restored turn is ear-dispositioned for speaker like an ambiguous
  one; lag.py calibrates on neither copy of such a pair. Two simpler rules were
  built and rejected on the P04 replay the same day (the spec's "winner
  survives" invariant and pair-only coverage: each caught 08:27 and missed
  08:09). Tests: `test_tracks.py` 8b (the P03 fixture, now pinning the guard),
  8c–8i, 14/14b. Details: CHANGELOG 2026-09-13.
- Residual (named, accepted): a participant on speakerphone can bleed other
  voices into their own track; if observed, the text-similarity dedup meetily
  PR #661 describes is the future lever — not built.
- **Delivering recordings:** hand the session the folder path — Zoom writes
  local recordings to `~/Documents/Zoom/<meeting>/Audio Record/` (one file per
  participant + the combined mix, with the per-participant setting on). Any folder
  works: give the path to the agent that runs the transcription skill.

## Notes

- `venv/` and model caches are gitignored — only the scripts are tracked.
- Diarization models cache under `~/.cache/huggingface` after first run.
- Typical cost on Apple Silicon: ~0.04× realtime each for transcribe and
  diarize — a ~1-hour recording processes in a few minutes.

---

# Shared L0 doctrine (canonical)

The single source of truth for the transcription rules shared by
`l0-transcribe-interview` and `l0-transcribe-conversation` (consolidated here
2026-07-02 — previously duplicated across both skills' SKILL.md, workflows,
and TranscriptFormat.md, which now carry one-line summaries + links to these
sections). **Edit here, not in the skills** — an inline copy that grows past a
summary is drift.

## mlx-whisper — engine of record

- `~/.local/bin/mlx_whisper` — Apple-native (MLX), fast and reliable on Apple
  Silicon.
- **Two installs exist:** the manual paths call the pipx `~/.local/bin/mlx_whisper`
  (version-unmanaged); Method D uses this tool's own `venv` pinned in `setup.sh`.
  Both are 0.4.3 as of 2026-07-12 — if transcripts differ by method, check
  version parity first.
- **Models:** default `mlx-community/whisper-large-v3-turbo`;
  `mlx-community/whisper-large-v3-mlx` for difficult audio (heavy accents,
  crosstalk, noise, poor microphone); `mlx-community/whisper-small.en-mlx` for
  quick passes on clean English audio. Models download on first use — ensure
  network access.
- **Flags:** hyphenated (`--output-dir`, `--output-format`); `--model` takes an
  HF repo id; there is **no `--device` flag** (`--fp16` exists and defaults to
  true — don't pass it).
- **Never use openai-whisper `--device mps`** — verified 2026-07-01: it produces
  NaN logits and fails on this machine. openai-whisper on CPU works but is
  ~50–100× slower, so it is not a real fallback. mlx-whisper replaces it.
- **Temp-dir hygiene:** always write whisper output to a fresh `mktemp -d` —
  never a fixed path. A stale SRT from a previous session will produce a
  transcript of the wrong recording. Verify the output filename stem matches
  the input file's stem before reading it.

## Deterministic segment merge

Whisper emits many short SRT segments; merge them into speaker turns
deterministically so two runs don't diverge:

- Concatenate consecutive segments from the **same speaker** into one turn,
  verbatim, separated by a single space.
- **Start a new turn** when the speaker changes, or when the gap between one
  segment's end and the next's start exceeds **~2 seconds** (a real pause —
  render it `*[pause]*` inside a continuing same-speaker turn if it's worth
  keeping).
- Never split one speaker's continuous run sentence-by-sentence, and never
  merge across a speaker change.

**Method D scope note (corrected 2026-07-12 audit):** this tool applies a
*simplified, attribution-only* merge internally — consecutive same-speaker
segments are joined regardless of the time gap; it does **not** split on >2s
pauses or emit `*[pause]*`. The rule as written governs the manual paths;
applying the pause split to a Method D draft is a downstream formatting step
(do it while mapping `SPEAKER_xx → names`, where it's worth keeping).

## ASR honesty

**Hallucination-at-silence scan — run before speaker labels are applied.**
Whisper injects spurious text during silent or low-signal stretches — most
often a phrase repeated across several consecutive segments, or generic
boilerplate ("thank you for watching," "please subscribe," a looping
sentence). Catch these before labels go on top of them:

**Method D mechanizes the DETECTION half of this scan (2026-07-23):** the tool
runs a deterministic flagger (`scan_hallucinations` — repeat-runs across ≥3
consecutive segments, 2–12-word intra-segment loops (cap widened from 5 on 2026-09-15, see CHANGELOG), stock boilerplate) and
emits its candidates in the draft: a `hallucination scan: N segment(s) flagged`
tally line, plus a `## Hallucination scan` table (time · class · verbatim text)
when N>0. **The tool flags, never deletes** — every disposition below (remove /
mark / record in Note) remains the human's, and the flags never feed the
attribution gate (`attribution_status` is a separate axis). High-precision by
design: real repeated speech ("yes. yes. yes." agreement, back-channels,
emphatic doubling) must not flag — a noisy flagger would train you to skim the
same review step the ambiguity flags share. The manual paths (A/B/C) still run
this scan entirely by hand. Sibling test: `test_diarize.py`.
**Conditioning defaults are now SPLIT BY METHOD (the researcher ruling 2026-07-30, QA
re-baseline: `Inputs-to-Level-0/2026-07-30_no-condition-qa-rebaseline.md`):**
**Method S defaults to `condition_on_previous_text=False`** — per-participant
tracks are ~half dead air, exactly where conditioning feeds hallucinated text
back into the decoder; the re-baseline sized the conditioning-off regression
class at net ≈ 0 (two fixtures, adjudicated vs Zoom + isolated audio) while
conditioning-ON carries a *stochastic* destructive-loop tail (the 07-24
destroyed windows did not reproduce on re-run: temperature-fallback samples),
2–3× the flag-disposition burden, and ~2× the compute. `--condition` restores
the pinned baseline; the draft's Engine line records the state either way.
**Method D keeps the pinned default (conditioning ON)** — continuous mix audio
starves the silence mechanism (2/2 counter-evidence runs). The 2026-07-23
pre-registered trigger still governs **Method D and `--condition` runs**: a
*confirmed* Class-A repeat-run flag authorizes a conditioning-off re-run — say
so and cite the tool CHANGELOG. Known limit of the trigger, measured 2026-07-30:
it fires on the flag class, not the harm — loops can be ADDITIVE (garbage beside
intact speech, 07-30) or DESTRUCTIVE (speech replaced, 07-24); a destruction
test is a queued increment candidate. The **entity cross-check pass stays
mandatory** on all Method S output — conditioning-off entity misses (e.g.
the client brand→two near-miss ASR spellings) are the sized residual it compensates for.

- Look for the same or near-identical line repeated across ≥3 consecutive
  segments, and for stock boilerplate unrelated to the session.
- **Overlapped speech may be transcribed as a single dominant stream** — in
  crosstalk, the ASR can drop the quieter voice's words entirely while the
  diarizer still detects both speakers. A Method D `?`-turn in an overlap
  region can therefore mean *words missing*, not just *label uncertain*; the
  REVIEW flag marks where. Escalate to `whisper-large-v3-mlx` for heavy
  crosstalk.
- Remove confirmed hallucinations; where unsure, keep the text and mark
  `*[possible transcription artifact]*` rather than deleting real content.
- Record removals in the Note field:
  `Removed N hallucinated segments at [timestamp range(s)]`.

**ASR-delivery reality — you can only preserve what the engine delivered.**
mlx-whisper (like most ASR) *smooths disfluencies during decoding*, so
"um / uh / like" are frequently dropped before you ever see them, and Whisper
does **not** emit laughter, pause, or crosstalk markers at all:

- **Preserve fillers that ARE in the transcript** — but absence of fillers
  means the engine smoothed them, not that the speaker was fluent. Never add
  fillers back.
- **Non-verbals (laughter, pauses, crosstalk) appear only when you have a
  source for them** — an annotation from the user, or (in the Format*
  workflows) a source transcript that already marked them. The raw-audio path
  cannot invent them.
- If the engine or source dropped fillers or non-verbals, say so in the
  **Note** field — don't imply a fidelity the transcript doesn't have.
