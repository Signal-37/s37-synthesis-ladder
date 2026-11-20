# FormatConversationTranscript Workflow

Format an existing conversation transcript (Otter.ai export, Rev.com output, plain text, Word export, or any other source) into the L0 conversation markdown format for l1-findings-extraction.

Use this when:
- Transcription was done by a service (Otter.ai, Rev.com, Descript, etc.)
- A human transcribed the conversation manually
- The recording was transcribed previously and needs to be brought into L0 format
- Whisper was already run and you have raw text output

## Before You Start

Read `TranscriptFormat.md` in the skill root. It defines the exact L0 conversation file structure.

## Step 1: Read the Existing Transcript

Ask the user to provide the transcript — either:
- A file path: `Read` the file
- Pasted text: accept it directly in the conversation

Also confirm conversation metadata needed for the YAML frontmatter:
- Topic slug (for file naming)
- Conversation date
- Conversation type (Expert panel / Peer interview / Roundtable / Stakeholder dialogue / Expert debrief)
- Topic (one-phrase description)
- Location or platform
- All participants — name and role/affiliation for each
- Recording filename (if available; use `[not recorded]` or `[recording unavailable]` if not)
- Duration (if known; use `[unknown]` if not)
- Transcription source (Otter.ai / Rev.com / manual / Whisper / etc.)

**Metadata gate:** names, roles, the date and the conversation type come from the user or a document they point to. Do not infer them from the recording, the transcript or file dates. If one is missing, ask before writing the L0 file. A value you propose (such as a date taken from a file) is stated as a proposal with its source, and used only once the user confirms it.

**Confirm Speaker Roster:** Once metadata is collected, lock in all speakers and the label format before touching the transcript.

| Name for transcript | Role / Affiliation |
|--------------------|--------------------|
| [Name 1] | [Role] |
| [Name 2] | [Role] |
| [Name 3] | [Role] |

Ask: "Are there any additional voices — a moderator, an observer who spoke, or anyone not already listed?" Confirm whether to use first name, full name, or an ID (e.g., `Expert-A`). If the source uses generic labels like "Speaker 1 / Speaker 2," this roster is how you'll resolve them in Step 3.

## Step 2: Assess the Source Format

Different transcript sources require different cleaning approaches:

| Source | Common issues |
|--------|--------------|
| Otter.ai | Speaker labels present but often wrong in multi-party conversations; timestamps in MM:SS; filler words inconsistently removed |
| Rev.com | High accuracy; speaker labels as "Speaker 1/2/3"; timestamps in HH:MM:SS |
| Descript | Clean text; speaker labels if set up; may have removed filler words |
| Manual | Variable format; may have annotations or partial coverage |
| Raw Whisper `.txt` | No speaker labels, no timestamps — use `.srt` output if available |
| Raw Whisper `.srt` | Timestamped but no speaker labels; may have hallucinated text at silences |
| Zoom auto-transcript | Speaker labels sometimes present; often misattributed; formatted by speaker block |
| Teams auto-transcript | Similar to Zoom; better with enrolled voice profiles |

Note the source in the Note field. Note whether filler words appear to have been removed.

## Step 3: Clean and Structure the Transcript

**Speaker labels:**
- Use actual names in bold: `**Alex:**`, `**Jordan:**` — not generic "Speaker 1" or ALL CAPS labels
- Apply the three confidence states (see `TranscriptFormat.md` → Speaker Labels): `**Name:**` when the source or the user confirms the attribution; `**Name?:**` when you resolve `Speaker 1/2/3` by content or style guess without confirmation; `**[Speaker]:**` when there is no basis. A source's own speaker labels are often wrong in multi-party audio (see the table above) — treat an unverified source label as **inferred** (`**Name?:**`), not confident.
- If source has `Speaker 1 / Speaker 2 / Speaker 3`, resolve using: content attribution, the user's knowledge of whose voice is whose, or approximate time cues the user can supply
- Where attribution cannot be confirmed, use `**[Speaker]:**` — document this in the Note field
- In multi-party conversations, crosstalk is common: mark as `*[crosstalk — Alex and Jordan]*`
- **Unknown voice (not in Step 1 roster):** Use `**[Unknown Speaker]:**`, add to the Speaker Key as "Unidentified voice; user review required," note in the Note field with approximate position. Flag in the Step 7 report. Do not allow L1 extraction until the user identifies the voice.

**Timestamps:**
- Do not include timestamps in the L0 body
- Use timestamps only internally during the speaker attribution step, then drop them

**Content:**
- Retain filler words (um, uh, like, you know) — if the source removed them, note this in the Note field
- Mark inaudible sections: `*[inaudible]*`
- Preserve self-corrections and restarts
- Do not paraphrase, summarize, or filter any content

**Formatting:**
- Group into natural speaker turns — not sentence by sentence. Merge consecutive same-speaker segments/lines; start a new turn on a speaker change or a clear pause (canonical rule: `../ladder-core/scripts/diarize/README.md` → **Shared L0 doctrine → Deterministic segment merge**).
- One blank line between speaker turns

## Step 4: Organize Into Topic Sections

Review the cleaned transcript and organize into `##` sections by topic. Section names should reflect the actual content — not generic labels like "Part 1." **Name the subject under discussion, not the outcome or characterization** — interpretation belongs to L1, not an L0 header. Aim for roughly one section per genuine topic shift (about every 8–15 minutes) so section count is reproducible.

```
## Opening — Context and Framing
## [Topic 1]
## [Topic 2]
## Close
```

## Step 5: Write the L0 File

Compose the full L0 markdown file following `TranscriptFormat.md`:

**Compute `attribution_status` first** (see `TranscriptFormat.md` → Attribution Status): count `**[Speaker]:**` + `**Name?:**` against total turns; `unresolved` if > 40% or any `**[Unknown Speaker]:**`, else `resolved`.

1. YAML frontmatter (`participants:` list, `date:`, `conversation_type:`, `topic:`, `location:`, `attribution_status:`, `synthesis_level: L0`)
2. Prose header (Conversation Transcript — Topic, then Date / Participants with roles / Context / Location / Source / Duration / Note)
3. Speaker Key — every speaker with role/affiliation; document the attribution method and any unresolved turns
4. `##` section headers by topic
5. Speaker turns as `**Name:**` with actual names; uncertain turns as `**[Speaker]:**`

**File naming:**
```
L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md
```

Ask the user for the output directory, then write the file.


### Delivery-annotation offer (optional — the window closes today)

If a researcher who was present is available today, offer the annotation pass: any turn whose delivery inverts its text (sarcasm, deadpan, hesitation)? Record per TranscriptFormat -> Delivery annotation and add the prose-header inventory line. Entirely optional — skip freely if no researcher is available or nothing needs marking. If the researcher keeps a session field-note file (FN_*, optional practice), its Delivery Notes may already hold same-day readings to transcribe here.

## Step 6: Quality Check

- [ ] YAML frontmatter present — `participants:` list, `conversation_type:`, `topic:`, `date:`, `location:`, `synthesis_level: L0`
- [ ] File named `L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md` — not a participant name
- [ ] Prose header complete — Date, Participants with roles, Context, Location, Source, Duration (Note only if needed)
- [ ] Speaker Key present — every speaker listed with role/affiliation; attribution method documented
- [ ] `##` section headers used throughout — named by topic
- [ ] Speaker labels use the three confidence states — `**Name:**` (confirmed) / `**Name?:**` (inferred / unverified source label) / `**[Speaker]:**` (unknown)
- [ ] Attribution tally recorded (total / unknown / inferred); if unknown + inferred > ~40%, file flagged for user review
- [ ] Stage directions and non-verbals in italics
- [ ] Filler word status documented (retained or removed by source — noted if removed)
- [ ] Content not filtered or summarized — full transcript preserved
- [ ] If unresolved or inferred turns exceed the ~40% threshold (or any remain under Method C): Note field warns "Speaker labels require user review before L1 extraction"

## Step 7: Report Completion

```
L0 conversation transcript written: [output_directory]/L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md
Source: [transcription source]
Participants: [N] speakers
Duration: <HH:MM:SS — or "unknown" if not available>
Speaker labels: [method used — resolved from source / user-confirmed / [N] turns pending review]
Attribution: [X] confident, [Y] inferred (Name?), [Z] unknown ([Speaker]) of [T] total
Filler words: <retained / removed by source — noted in Note field>
[If Y+Z > ~40% of T, or any [Unknown Speaker]:] ⚠️  Speaker labels not fully confirmed — review before l1-findings-extraction.
Ready for l1-findings-extraction.
```
