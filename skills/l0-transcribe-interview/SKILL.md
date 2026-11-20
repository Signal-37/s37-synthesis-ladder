---
name: l0-transcribe-interview
description: Whisper transcription → L0 transcript files per participant. USE WHEN transcribing a recording, formatting into L0, or batch-processing recordings.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
compatibility: Requires macOS on Apple Silicon, uv (which installs the tool's Python 3.12) and FFmpeg for the diarize transcription tool, and, for Method D diarization, a Hugging Face token whose account has accepted the pyannote model licences.
---

# l0-transcribe-interview

Transcribes interview recordings and formats them into L0 transcript files — the raw input layer of the synthesis ladder. One recording produces one L0 file per participant.

**Where this sits in the synthesis funnel:**

```
Recording (audio/video) → [this skill] → [L0 Transcript] → [l1-findings-extraction] → [L1 Findings] → ...
```

**Upstream intake (two lanes, this skill shared by both):** peer/ops calls arriving in `~/Recordings/Recorded-Calls-Zooms/inbox/` (media store, outside the vault since 2026-09-02) are classified and dispatched here by `ProcessRecordedCalls` (a separate skill) (which also files to `processed/`); project research corpora are staged in the project tree (e.g. `Research/Qual/Customer_Interviews/`) and invoke this skill directly. This skill owns transcription only.

L0 is not a synthesis level — it is structured raw material. The L0 file gives l1-findings-extraction a clean, readable transcript with participant metadata, speaker labels, and timestamped segments. It is not interpreted; nothing has been filtered or inferred yet.

See `TranscriptFormat.md` for the exact L0 file format.

**Difference from l0-transcribe-conversation:**

| | l0-transcribe-interview | l0-transcribe-conversation |
|---|---|---|
| Structure | One interviewer + one participant | Multiple peers, no clear moderator asymmetry |
| File per recording | One file per participant | One file per conversation |
| Speaker inference | Q&A pattern (questions → interviewer, responses → participant) | Cannot infer — requires user speaker map or manual review |
| File naming | `L0_[Name]_[Date]_transcript.md` | `L0_[Topic-Slug]_[Date]_conversation.md` |
| YAML `participant:` | Single name | `participants:` list |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Transcribe** | Transcribe a single recording, one interview file, one participant | `workflows/Transcribe.md` |
| **BatchTranscribe** | Transcribe multiple recordings, a folder of interviews, batch processing | `workflows/BatchTranscribe.md` |
| **FormatTranscript** | Format existing transcript into L0, already have text, convert to L0 format | `workflows/FormatTranscript.md` |

## Examples

**Example 1: Single recording**
```
User: "Transcribe this interview recording: ~/Research/Meridian/recordings/riku-t.m4a"
→ Invokes Transcribe workflow
→ Runs Whisper on the file
→ Formats SRT output into L0 markdown with speaker labels
→ Writes L0_Riku_T.md to the output directory
```

**Example 2: Batch processing**
```
User: "Transcribe all recordings in ~/Research/Meridian/recordings/"
→ Invokes BatchTranscribe workflow
→ Runs Whisper on each file sequentially
→ Produces one L0 file per recording
→ Reports completion summary
```

**Example 3: Existing transcript**
```
User: "I already have a transcript — format it into L0 for L1 extraction"
→ Invokes FormatTranscript workflow
→ Gathers participant metadata
→ Structures the text into the L0 format with speaker labels
→ Writes the L0 file
```

## Tooling

- **mlx-whisper** (`~/.local/bin/mlx_whisper`) — **transcription engine of record.** **Never openai-whisper `--device mps` (NaN logits).** Models, flags, and fallback verdict: `../ladder-core/scripts/diarize/README.md` → **Shared L0 doctrine → mlx-whisper — engine of record** (canonical — shared with l0-transcribe-conversation).
- **Diarization tool** (`../ladder-core/scripts/diarize/diarize-transcript`) — **Method D**: mlx-whisper + pyannote separate the two voices and attribute turns, fully on-device. Cleaner than Q&A inference when the interviewer makes statements or the participant asks questions. Requires `HF_TOKEN` in `$PAI_DIR/.env` (i.e. `~/.claude/.env`). See `workflows/Transcribe.md` Step 5.
- **ffmpeg** (`/opt/homebrew/bin/ffmpeg`) — audio preprocessing if needed
- **Output format used:** `srt` — timestamped segments that Claude reformats into L0 markdown

**Note:** Workflow commands call `mlx_whisper` and `ffmpeg` via PATH. Ensure both are on `$PATH`.

## Companion artifacts (optional — never required)

The **session field-note file** (`FN_*` — runbook: `l1-findings-extraction/FieldNoteHowTo.md`; rules: `l1-findings-extraction/FieldNoteFormat.md`) is the observation channel's capture artifact. Timing note: the capture moment (spoken debrief, silence-first) is at SESSION END, before this skill even runs — by transcription time the researcher's readings may already be waiting in the FN file's Delivery Notes. It holds researcher observations, the photo log, and same-day delivery readings, written by a present researcher when they choose to keep one — a session without one is normal. **Delivery annotations** on the transcript itself follow `TranscriptFormat.md` → Delivery annotation (offer, not requirement). A researcher's spoken **debrief** transcript is working material for the FN file — `DEBRIEF_*`, never `L0_*`, never extracted as participant data.
