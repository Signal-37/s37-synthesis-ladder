# BatchTranscribeConversations Workflow

Transcribe a folder of conversation recordings and produce one L0 conversation transcript file per recording.

## Before You Start

Read `TranscriptFormat.md` in the skill root. It defines the exact L0 conversation file format.

**Cross-call state discipline (why the temp dir is a pointer file):** each Bash tool call runs in a *fresh process*, so a `TRANSCRIBE_TMP=$(mktemp -d)` set in one step is **unset** in the next. The batch temp dir is created ONCE at Step 3 and its path written to a fixed **pointer file** (`~/.claude/state/transcribe/tmpdir-path`, local + gitignored); every per-file step re-reads it — `TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"`. Method D's per-file draft path is persisted the same way (`draft-path`). Still a fresh `mktemp -d` (never a fixed path), so a stale transcript can't be used for the wrong file. Do not carry the path forward in your head across tool calls — read the pointer.

## Step 1: Confirm Inputs

Ask the user for anything not already provided:

- **Recordings directory** — full path to the folder containing audio/video files
- **Output directory** — where to write L0 files (default: a `L0/` subdirectory inside the recordings directory)
- **Conversation manifest** — a list mapping each recording filename to conversation metadata. If none exists, the workflow will prompt for each file.

List the recordings to confirm the file set:

```bash
ls -lh "[recordings_directory]" | grep -E '\.(m4a|mp3|mp4|wav|mov|aiff|ogg|flac)$'
```

Confirm with the user before proceeding.

## Step 2: Check or Create Conversation Manifest

If the user has a manifest (CSV, text list, or prior notes), read it. The minimum needed per recording:

| Field | Required |
|-------|---------|
| Recording filename | Yes |
| Topic slug (for file naming) | Yes |
| Conversation date | Yes |
| Conversation type | Yes |
| Location or platform | Yes |
| All participants — name and role | Yes |
| Speaker roster (label format for each) | Yes |
| Speaker attribution method (D / A / B / C) | Yes |
| Time map (if Method A) | If Method A |

If no manifest exists, work through the file list and ask the user to supply metadata for each recording before transcription begins. Do not transcribe without participant metadata — the L0 header requires it.

**Metadata gate:** names, roles, the date and the conversation type come from the user or a document they point to. Do not infer them from the recording, the transcript or file dates. If one is missing, ask before writing the L0 file. A value you propose (such as a date taken from a file) is stated as a proposal with its source, and used only once the user confirms it. In the manifest as anywhere: no metadata field is filled by inference.

**Note on speaker attribution:** For batches, **Method D (automated diarization) is the preferred default** — the diarize tool attributes speakers per file with no upfront time maps; you confirm the `SPEAKER_xx → name` mapping per file afterward. Failing that, collect time maps (Method A) for all recordings upfront, or commit to Method C (full manual review) for the entire batch. Method B (contextual inference) is hard to apply consistently across a batch without reviewing each transcript individually.

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

For each recording file, run the TranscribeConversation workflow steps (Steps 3–9 from `TranscribeConversation.md`):

```bash
# Method D (preferred): the diarize tool transcribes + diarizes per file.
# Persist this file's draft path so the per-file label step (Step 5) can re-read it.
mkdir -p ~/.claude/state/transcribe
DRAFT="$(mktemp -d)/draft.md"; echo "$DRAFT" > ~/.claude/state/transcribe/draft-path
../ladder-core/scripts/diarize/diarize-transcript "[recordings_directory]/[filename]" \
  --model mlx-community/whisper-large-v3-turbo --language en --out "$DRAFT"

# Method A/B/C: transcribe with mlx-whisper (do NOT use openai-whisper --device mps — it NaNs).
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

**If Method D fails on a file** (tool error, HF auth/license issue, diarizer mis-splitting similar voices), fall back to the manual path (Method A/B/C) for that file and record the method change in the progress report — do not skip the file, and do not ship a partial draft.

Then apply speaker labels, organize by topic, **compute `attribution_status`** (see `TranscriptFormat.md` → Attribution Status), and write the L0 file to the output directory.

**Important:** Process files one at a time. Parallel Whisper runs on the same machine will compete for GPU/CPU and degrade accuracy. Report progress after each file:

```
[1/N] Completed: L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md — [Method A/B/C]
[2/N] Completed: L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md — [Method A/B/C]
...
```

If any file used Method C (pending speaker labels), flag it in the progress report:
```
[3/N] Completed: L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md — ⚠️ Method C: speaker labels pending review
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
BatchTranscribeConversations complete.

[N] L0 files written to [output_directory]:
  ✓ L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md — [duration] — Labels: [method]
  ✓ L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md — [duration] — Labels: [method]
  ✗ [filename] — FAILED: [reason]

[N] succeeded / [N] failed

⚠️  Files requiring speaker label review before L1 extraction (attribution_status: unresolved):
  - L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md

All confirmed files are ready for l1-findings-extraction.
```

Clean up temp files — re-read the pointer, guard against an empty value, then remove the pointer itself:

```bash
TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path 2>/dev/null)"
[ -n "$TRANSCRIBE_TMP" ] && rm -rf "$TRANSCRIBE_TMP"
rm -f ~/.claude/state/transcribe/tmpdir-path ~/.claude/state/transcribe/draft-path
```
