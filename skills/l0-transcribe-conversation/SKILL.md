---
name: l0-transcribe-conversation
description: Whisper → L0 conversation transcripts. USE WHEN transcribing peers, panels, roundtables, or any recording without clear interviewer/participant asymmetry.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
compatibility: Requires macOS on Apple Silicon, uv (which installs the tool's Python 3.12) and FFmpeg for the diarize transcription tool, and, for Method D diarization, a Hugging Face token whose account has accepted the pyannote model licences.
---

# l0-transcribe-conversation

Transcribes recordings of expert conversations and formats them into L0 transcript files — the raw input layer of the synthesis ladder. One recording produces one L0 file covering all participants.

**Where this sits in the synthesis funnel:**

```
Recording (audio/video) → [this skill] → [L0 Transcript] → [l1-findings-extraction] → [L1 Findings] → ...
```

**Upstream intake (two lanes, this skill shared by both):** peer/ops calls arriving in `~/Recordings/Recorded-Calls-Zooms/inbox/` (media store, outside the vault since 2026-09-02) are classified and dispatched here by `ProcessRecordedCalls` (a separate skill) (which also files to `processed/`); project research corpora are staged in the project tree (e.g. `Research/Qual/Customer_Interviews/`) and invoke this skill directly. This skill owns transcription only.

**Difference from l0-transcribe-interview:**

`l0-transcribe-interview` handles asymmetric recordings — one interviewer, one participant, speaker turns inferred from Q&A structure. `l0-transcribe-conversation` handles symmetric recordings — peers, panels, roundtables, expert dialogues — where no speaker consistently asks questions and all voices carry research weight.

| | l0-transcribe-interview | l0-transcribe-conversation |
|---|---|---|
| Structure | One participant + interviewer(s) | Multiple peers, no clear moderator asymmetry |
| File per recording | One file per participant | One file per conversation |
| Speaker inference | Q&A pattern (questions → interviewer, responses → participant) | Cannot infer — requires user speaker map or manual review |
| File naming | `L0_[Name]_[Date]_transcript.md` | `L0_[Topic-Slug]_[Date]_conversation.md` |
| YAML `participant:` | Single name | `participants:` list |

**Two downstream consumers of a resolved L0 (2026-09-02):** `MeetingBrief` (a separate skill) writes the post-meeting brief (the common case for peer, partner and client calls); `l1-findings-extraction` extracts research findings (only when a call earns research treatment). Both are invoked on request; neither is automatic.

**L1 downstream note:** l1-findings-extraction attributes findings to specific speakers by name via a structured `**Speaker:**` field, and it **gates on the `attribution_status:` field** this skill computes — an `unresolved` file is refused until its labels are corrected. Each L1 finding cites the speaker whose statement generated it; the Speaker Key is the attribution map. See `TranscriptFormat.md` → Attribution Status and `l1-findings-extraction/FindingsFormat.md` → Conversation Variant.

See `TranscriptFormat.md` for the exact L0 conversation file format.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **TranscribeConversation** | Transcribe a single conversation recording | `workflows/TranscribeConversation.md` |
| **BatchTranscribeConversations** | Transcribe multiple conversation recordings | `workflows/BatchTranscribeConversations.md` |
| **FormatConversationTranscript** | Format an existing conversation transcript into L0 | `workflows/FormatConversationTranscript.md` |

## Examples

**Example 1: Expert panel recording**
```
User: "Transcribe this expert panel: ~/Research/Move37/recordings/expert-panel-2026-06-04.m4a"
→ Invokes TranscribeConversation workflow
→ Confirms participants and speaker map from user
→ Runs Whisper on the file
→ Applies speaker labels using user-provided map
→ Writes L0_Expert-Panel_2026-06-04_conversation.md
```

**Example 2: Peer interview (two experts, equal status)**
```
User: "Transcribe this conversation between Alex and Jordan — no clear interviewer"
→ Invokes TranscribeConversation workflow
→ User provides approximate speaker map (who speaks first, topic ownership)
→ Uncertain turns flagged as [Speaker] for user review
→ Writes L0_Alex-Jordan-Dialogue_2026-06-04_conversation.md
```

**Example 3: Existing transcript from Otter.ai / Rev.com**
```
User: "I have a roundtable transcript from Otter — format it into L0"
→ Invokes FormatConversationTranscript workflow
→ Gathers participant metadata and speaker roster
→ Structures into L0 conversation format
→ Writes L0 file ready for l1-findings-extraction
```

## Tooling

- **mlx-whisper** (`~/.local/bin/mlx_whisper`) — **transcription engine of record.** **Never openai-whisper `--device mps` (NaN logits).** Models, flags, and fallback verdict: `../ladder-core/scripts/diarize/README.md` → **Shared L0 doctrine → mlx-whisper — engine of record** (canonical — shared with l0-transcribe-interview).
- **Diarization tool** (`../ladder-core/scripts/diarize/diarize-transcript`) — **Method D**: mlx-whisper + pyannote speaker diarization → an attributed transcript draft with graded-confidence labels, fully on-device. Requires `HF_TOKEN` in `$PAI_DIR/.env` (i.e. `~/.claude/.env`). See `TranscriptFormat.md` → Speaker Label Methods and the tool's `README.md`.
- **ffmpeg** (`/opt/homebrew/bin/ffmpeg`) — audio preprocessing (the diarize tool normalizes to 16 kHz mono internally).
- **Output format:** `srt` for the manual methods — timestamped segments reformatted into L0 markdown; Method D emits a markdown draft directly.

**Note:** Workflow commands call `mlx_whisper` and `ffmpeg` via PATH; the diarize tool is invoked by its full path. Ensure `mlx_whisper` and `ffmpeg` are on `$PATH`.

## Conversation Types

| Type | Description |
|------|-------------|
| **Expert panel** | 3+ domain experts discussing a topic; may have a loose moderator |
| **Peer interview** | Two experts, roughly equal status, one may lead questions |
| **Roundtable** | Small group, open discussion, all voices carry equal weight |
| **Stakeholder dialogue** | Internal or cross-org discussion between peers or colleagues |
| **Expert debrief** | Post-event or post-project debrief between practitioners |

## Companion artifacts (optional — never required)

The **session field-note file** (`FN_*` — runbook: `l1-findings-extraction/FieldNoteHowTo.md`; rules: `l1-findings-extraction/FieldNoteFormat.md`) is the observation channel's capture artifact. Timing note: the capture moment (spoken debrief, silence-first) is at SESSION END, before this skill even runs — by transcription time the researcher's readings may already be waiting in the FN file's Delivery Notes. It holds researcher observations, the photo log, and same-day delivery readings, written by a present researcher when they choose to keep one — a session without one is normal. **Delivery annotations** on the transcript itself follow `TranscriptFormat.md` → Delivery annotation (offer, not requirement). A researcher's spoken **debrief** transcript is working material for the FN file — `DEBRIEF_*`, never `L0_*`, never extracted as participant data.
