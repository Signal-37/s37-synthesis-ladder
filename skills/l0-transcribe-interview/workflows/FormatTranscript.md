# FormatTranscript Workflow

Format an existing transcript (plain text, Word export, Otter.ai export, Rev.com output, or any other source) into the L0 markdown format for l1-findings-extraction.

Use this when:
- Transcription was done by a service (Otter.ai, Rev.com, Descript, etc.)
- A human transcribed the interview manually
- The recording was transcribed previously and needs to be brought into L0 format
- Whisper was already run and you have raw text output

## Before You Start

Read `TranscriptFormat.md` in the skill root. It defines the exact L0 file structure.

## Step 1: Read the Existing Transcript

Ask the user to provide the transcript — either:
- A file path: `Read` the file
- Pasted text: accept it directly in the conversation

Also confirm participant metadata needed for the YAML frontmatter:
- Participant name (or anonymized ID)
- Interview date
- Participant type (Customer / Near-purchaser / Dealer / Industry insider / etc.)
- Location (City, State/Country)
- Interviewers
- Role description
- Recording filename (if available; use `[not recorded]` if not)
- Duration (if known; use `[unknown]` if not)
- Transcription source (Otter.ai / Rev.com / manual / Whisper / etc.)

**Metadata gate:** names, roles (participant type), the date and the interview type come from the user or a document they point to. Do not infer them from the recording, the transcript or file dates. If one is missing, ask before writing the L0 file. A value you propose (such as a date taken from a file) is stated as a proposal with its source, and used only once the user confirms it.

**Confirm Speaker Roster:** Once metadata is collected, lock in all speakers and the label format before touching the transcript.

| Role | Name for transcript |
|------|-------------------|
| Participant | [confirmed name] |
| Interviewer | [confirmed name(s)] |
| Additional speakers | [any others on the call] |

Ask: "Are there any additional speakers — co-moderators, observers who spoke, a translator?" Confirm whether to use first name, full name, or anonymized IDs (e.g., `P01`). If the source uses generic labels like "Speaker 1 / Speaker 2," this roster is how you'll resolve them in Step 3.

## Step 2: Assess the Source Format

Different transcript sources require different cleaning approaches:

| Source | Common issues |
|--------|--------------|
| Otter.ai | Speaker labels present but often wrong; timestamps in MM:SS; filler words inconsistently removed |
| Rev.com | High accuracy; speaker labels as "Speaker 1/2"; timestamps in HH:MM:SS |
| Descript | Clean text; speaker labels if set up; may have removed filler words |
| Manual | Variable format; may have annotations; may be partial |
| Raw Whisper `.txt` | No speaker labels, no timestamps — use `.srt` output if available |
| Raw Whisper `.srt` | Timestamped but no speaker labels; may have hallucinated text at silences |

Note the source in the transcription notes field.

## Step 3: Clean and Structure the Transcript

Apply these transformations:

**Timestamps:**
- Use source timestamps only during speaker attribution — to verify who was speaking when. Do not include them in the L0 file body.
- If the source has no timestamps, use content position and Q&A structure to assign speaker labels.

**Speaker labels:**
- Use actual names in bold: `**Alex:**`, `**Julian:**` — not generic ALL CAPS labels
- If source has `Speaker 1 / Speaker 2` labels, infer which is which from Q&A structure and confirm with the user if ambiguous
- Note the source and reliability of speaker labels in the Note field

**Content:**
- Retain filler words (um, uh, like, you know) — if the source removed them, note this
- Mark inaudible sections: `[inaudible]`
- Preserve self-corrections and restarts — they carry signal
- Do not paraphrase, summarize, or filter any content

**Formatting:**
- Group into natural speaker turns — not sentence by sentence
- One blank line between speaker turns

## Step 4: Write the L0 File

Compose the full L0 markdown file following `TranscriptFormat.md` exactly:

1. **YAML frontmatter** — exactly 5 fields: `participant`, `date`, `interview_type`, `location`, `synthesis_level: L0`. Do not add `transcription_model` or any other fields — extra YAML fields break downstream Dataview queries and the Synthesist agent.
2. **Prose header** — `# Interview Transcript — [Name]`, then Date / Participants / Context / Location / Source / Duration / Note. Put source name, cleaning decisions, filler word status, and speaker label reliability in the **Note field** — not a separate section.
3. **Speaker Key** — every speaker with role/affiliation.
4. **`##` section headers by topic** — named by content throughout the transcript, not generic labels. Do not collapse into a single `## Transcript` section.
5. **Speaker turns** as `**Name:**` with actual names; uncertain turns as `**[Speaker]:**`.

**File naming:**
```
L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md
```

Ask the user for the output directory, then write the file.


### Delivery-annotation offer (optional — the window closes today)

If a researcher who was present is available today, offer the annotation pass: any turn whose delivery inverts its text (sarcasm, deadpan, hesitation)? Record per TranscriptFormat -> Delivery annotation and add the prose-header inventory line. Entirely optional — skip freely if no researcher is available or nothing needs marking. If the researcher keeps a session field-note file (FN_*, optional practice), its Delivery Notes may already hold same-day readings to transcribe here.

## Step 5: Quality Check

- [ ] YAML frontmatter present — exactly 5 fields, `synthesis_level: L0`
- [ ] File named `L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md`
- [ ] Prose header complete — Date, Participants, Context, Location, Source (Note only if needed)
- [ ] Speaker Key present — every speaker listed with name and role
- [ ] `##` section headers used throughout — named by topic
- [ ] Speaker labels use actual names in bold (`**Name:**`) — no unlabeled segments
- [ ] Stage directions and non-verbals in italics
- [ ] Filler words retained or their removal documented in Note field
- [ ] Content not filtered or summarized — full transcript preserved

## Step 6: Report Completion

```
L0 transcript written: [output_directory]/L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md
Source: [transcription source]
Duration: <HH:MM:SS — or "unknown" if not available>
Speaker labels: [method used]
Filler words: <retained / removed by source — noted in Note field>
Ready for l1-findings-extraction.
```
