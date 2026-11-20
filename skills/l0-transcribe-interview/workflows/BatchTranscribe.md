# BatchTranscribe Workflow

Transcribe a folder of interview recordings and produce one L0 transcript file per recording.

## Before You Start

Read `TranscriptFormat.md` in the skill root. It defines the exact L0 file format.

**Cross-call state discipline (why the temp dir is a pointer file):** each Bash tool call runs in a *fresh process*, so a `TRANSCRIBE_TMP=$(mktemp -d)` set in one step is **unset** in the next. The batch temp dir is created ONCE at Step 3 and its path written to a fixed **pointer file** (`~/.claude/state/transcribe/tmpdir-path`, local + gitignored); every per-file step that needs it re-reads the pointer — `TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"`. Still a fresh `mktemp -d` per batch (never a fixed path), so a stale SRT from a previous session can't be transcribed as the wrong file. Do not carry the path forward in your head across tool calls — read the pointer.

## Step 1: Confirm Inputs

Ask the user for anything not already provided:

- **Recordings directory** — full path to the folder containing audio/video files
- **Output directory** — where to write L0 files (default: a `L0/` subdirectory inside the recordings directory)
- **Participant manifest** — a list mapping each recording filename to participant metadata (name, date, type, location, interviewers). If none exists, the workflow will prompt for each file.

List the recordings to confirm the file set:

```bash
ls -lh "[recordings_directory]" | grep -E '\.(m4a|mp3|mp4|wav|mov|aiff|ogg|flac)$'
```

Confirm with the user before proceeding.

## Step 2: Check or Create Participant Manifest

If the user has a manifest (CSV, text list, or prior notes), read it. The minimum needed per recording:

| Field | Required |
|-------|---------|
| Recording filename | Yes |
| Participant name (or ID) | Yes |
| Interview date | Yes |
| Participant type | Yes |
| Location | Yes |
| Interviewers | Yes |
| Speaker roster (all speakers + label format) | Yes |
| Role description | Preferred |

If no manifest exists, work through the file list and ask the user to supply metadata for each recording before transcription begins. Do not transcribe without participant metadata — the L0 header requires it.

**Metadata gate:** names, roles (participant type), the date and the interview type come from the user or a document they point to. Do not infer them from the recording, the transcript or file dates. If one is missing, ask before writing the L0 file. A value you propose (such as a date taken from a file) is stated as a proposal with its source, and used only once the user confirms it. In the manifest as anywhere: no metadata field is filled by inference.

**Confirm transcription model before starting:** Discovering audio quality issues mid-batch requires restarting affected files. Confirm now.

| Model | When to use |
|-------|-------------|
| `mlx-community/whisper-large-v3-turbo` (default) | Clear audio; fast and accurate |
| `mlx-community/whisper-large-v3-mlx` | Heavy accents, significant crosstalk, background noise, poor recording quality |

If quality varies across recordings, flag which files need `mlx-community/whisper-large-v3-mlx` before transcription begins.

## Step 3: Create Output Directory and Establish the Batch Temp Dir

Create the output dir and the single batch temp dir now (once), persisting its path to the pointer file so every per-file step in Step 4 can re-read it:

```bash
mkdir -p "[output_directory]"
mkdir -p ~/.claude/state/transcribe
TRANSCRIBE_TMP=$(mktemp -d); echo "$TRANSCRIBE_TMP" > ~/.claude/state/transcribe/tmpdir-path
echo "batch temp dir → $TRANSCRIBE_TMP"
```

## Step 4: Transcribe Each File Sequentially

For each recording file, run the Transcribe workflow steps (Steps 2–7 from `Transcribe.md`). **Method D (per-file diarization) is available** — call `../ladder-core/scripts/diarize/diarize-transcript` in place of the manual transcribe + Q&A-label path (see Transcribe.md Steps 3 & 5). If Method D fails on a file (tool error, HF auth/license issue, diarizer mis-split), fall back to the manual path for that file and record the method change in the progress report. For the manual path:

```bash
# mlx-whisper (Apple-native). Do NOT use openai-whisper --device mps — it NaNs.
# Re-read the batch temp dir from the pointer ($TRANSCRIBE_TMP from Step 3 is gone — separate process).
TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"
mlx_whisper "[recordings_directory]/[filename]" \
  --model mlx-community/whisper-large-v3-turbo \
  --output-dir "$TRANSCRIBE_TMP" \
  --output-format srt \
  --language en
```

Then read that file's SRT — re-reading the pointer again, since this is another separate call:

```bash
TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"
ls "$TRANSCRIBE_TMP"                       # confirm the new SRT's stem matches this file
cat "$TRANSCRIBE_TMP/[filename].srt"
```

**The batch temp dir was created once at Step 3 and reused across all files via the pointer — never a fixed path (a stale SRT from a previous session would produce a transcript of the wrong recording). After each Whisper run, verify the output filename matches the input stem before parsing.**

Then format the SRT into L0 markdown and write to the output directory. **For Method D files, compute `attribution_status`** (the tool's turn-based tally gives the *ratio* limb; also set `unresolved` if any mapped turn is `[Unknown Speaker]` — a voice not on the roster, which the tool cannot detect — see `TranscriptFormat.md` → Attribution Status) and set it in the frontmatter; flag `unresolved` files in the progress and completion reports.

**Important:** Process files one at a time. Parallel Whisper runs on the same machine will compete for GPU/CPU and degrade accuracy. Report progress after each file:

```
[1/N] Completed: L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md
[2/N] Completed: L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md
...
```

## Step 5: Handle Failures

If Whisper fails on a file:
- Log the failure with the filename and error
- Continue with the next file
- Report all failures at the end

Common failure causes:
- Unsupported file format → convert with ffmpeg first: `ffmpeg -i input.mov -ar 16000 output.wav`
- File too short (under 1 second) → note and skip
- Model not downloaded → mlx-whisper fetches models on first use; ensure network access


### Delivery-annotation offer (optional — the window closes today)

If a researcher who was present is available today, offer the annotation pass: any turn whose delivery inverts its text (sarcasm, deadpan, hesitation)? Record per TranscriptFormat -> Delivery annotation and add the prose-header inventory line. Entirely optional — skip freely if no researcher is available or nothing needs marking. If the researcher keeps a session field-note file (FN_*, optional practice), its Delivery Notes may already hold same-day readings to transcribe here.

## Step 6: Completion Report

After all files are processed:

```
BatchTranscribe complete.

[N] L0 files written to [output_directory]:
  ✓ L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md — [duration] — Labels: [inferred / verified]
  ✓ L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md — [duration] — Labels: [inferred / verified]
  ✗ [filename] — FAILED: [reason]

[N] succeeded / [N] failed

[If any files used inferred labels:] ⚠️  Speaker labels inferred (not manually verified) in:
  - L0_[Name]_[Date]_transcript.md — review before l1-findings-extraction

[If any Method D file computed unresolved:] ⚠️  Files requiring speaker label review before L1 extraction (attribution_status: unresolved):
  - L0_[Name]_[Date]_transcript.md

All verified files are ready for l1-findings-extraction.
```

Clean up temp files — re-read the pointer, guard against an empty value, then remove the pointer itself:

```bash
TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path 2>/dev/null)"
[ -n "$TRANSCRIBE_TMP" ] && rm -rf "$TRANSCRIBE_TMP"
rm -f ~/.claude/state/transcribe/tmpdir-path ~/.claude/state/transcribe/draft-path
```
