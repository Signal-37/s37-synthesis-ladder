# L0 Transcript Format Reference

The exact format for L0 transcript files — the structured raw material that feeds l1-findings-extraction.

**Contents** (a reader mid-task may only see this far — jump to the section named):
- File Naming · YAML Frontmatter (Lean) · Prose Header · Speaker Key — the file's head matter
- Section Headers — the canonical interview section list
- Speaker Labels — how each turn is labelled
- **Attribution Status (Method D files — the L1 gate)** — the gate L1 reads
- Attribution Provenance (Q&A-inference files — NOT a gate)
- Transcript Body — the turn-by-turn format
- Full File Example — a complete worked file
- Quality Check Before Writing · What L0 Is Not

---

## File Naming

```
L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md
```

Examples: `L0_Julian_Marsh_2026-03-02_transcript.md`, `L0_Dana_Cole_2026-03-15_transcript.md`

For anonymized participants, use a participant ID: `L0_P04_2026-03-15_transcript.md`

---

## YAML Frontmatter (Lean)

Every file opens with a minimal YAML block. These five fields are the only ones in YAML — they exist for machine-readability (Obsidian Dataview queries, Synthesist agent level detection, scripting). Everything else goes in the prose header.

```
---
participant: [Full Name or Participant ID]
date: [YYYY-MM-DD]
interview_type: [Customer / Near-purchaser / Dealer / Industry insider / Expert / etc.]
location: [City, State/Country]
synthesis_level: L0
attribution_status: resolved | unresolved   # Method D files, and Method S files with dedup-ambiguous turns — see below
attribution_method: qa-inference            # Q&A-INFERENCE FILES ONLY — provenance, not a gate; see below
attribution_attested_by: [Full Name]        # required whenever attribution_method is present
---
```

**Note:** `attribution_status:` is a **sixth field carried by Method D (diarized) files, and by Method S files whose draft reports any `⚠ DEDUP-AMBIGUOUS` turn** (shared-air recordings, dedup pass default ON since 2026-08-15 — such a file stays `unresolved` until every flagged turn has been listened to and dispositioned; a Method S file with a 0/0/0 Dedup line and confirmed mapping omits the field as before). Manual Q&A-inference files with a confirmed two-person roster omit it. Like the conversation format, it is computed, not chosen, and it is the structural gate l1-findings-extraction reads before extracting; `unresolved` blocks L1.

**Tool-appended fields (reserved):** `share_link:` / `share_updated:` are appended by the note-sharing tool when a transcript is shared. Never author them by hand, never strip them when editing an already-shared file, and never treat their presence as schema drift — external-tool provenance, not transcript content (documented 2026-07-24).

---

## Prose Header

Immediately after the YAML block, a human-readable header:

```
# Interview Transcript — [Participant Name]
**Date:** [YYYY-MM-DD]
**Participants:** [Interviewer name(s)], [Participant name]
**Context:** [Project name] — [participant type / role description]
**Location:** <City, State/Country — and any relevant situational context, e.g. "during Sea Otter">
**Source:** `[recording_filename.ext]`
**Note:** <Any transcription quality issues, speaker label corrections, or other flags — omit this line if none>

---
```

---

## Speaker Key

Immediately after the prose header divider, before the first section, include a Speaker Key that identifies each person's role:

```
**Speaker Key**
- **Alex** — Interviewer
- **Devon** — Co-interviewer
- **Julian** — Participant (subject matter expert / industry insider)
```

Rules:
- List every voice that appears in the transcript
- Use the same name form that will appear in the speaker labels throughout
- Role should match the `interview_type` in the YAML — e.g., Customer, Near-purchaser, Dealer, Industry insider, Expert
- Add a parenthetical if the participant's specific role adds context (e.g., "former Summit global marketing manager")

**Unknown speaker (voice not on participant list):**
If a voice appears in the recording that was not supplied in the participant metadata, use `**[Unknown Speaker]:**` for those turns. Add to the Speaker Key as:
- **[Unknown Speaker]** — Unidentified voice; [approximate time]; user review required before L1 extraction

Note in the Note field: `Unidentified speaker at [approximate time] — must be identified before l1-findings-extraction.` Do not proceed to L1 extraction until the user names the speaker and the Speaker Key is updated.

---

## Section Headers

Organize the transcript into topic sections using `##` headers. Section names should reflect the actual content of that segment — not generic labels like "Part 1."

```
## Background & Career Arc
## First Awareness of Meridian
## Brand Perception — Then to Now
## Pro Tour Sponsorship Value
## Community Events & Activation
## Close
```

Add a pre-call section if the interviewers spoke before the participant joined:

```
## Pre-Call — [Interviewer Names] Debrief
```

Section headers serve two purposes: they make long transcripts navigable, and they give l1-findings-extraction context for where in the interview a moment occurred.

---

## Speaker Labels

Use the actual name of each speaker, bolded, with a colon:

```
**Alex:** Tell me about how you got into road cycling.

**Julian:** My older cousin raced on the track, and I started going to the velodrome with him when I was about twelve...
```

Rules:
- Bold the name, not the text that follows
- One blank line between speaker turns
- For stage directions or ambient notes, use italics: `*Julian joining shortly.*`
- If a speaker identity is uncertain, use `**[Speaker]:**` and flag it in the Note field
- **Method D output** may also carry `**Name?:**` — an *inferred* attribution (the raw draft carries `**SPEAKER_xx?:**`, which becomes `**Name?:**` after mapping; a contested turn from the diarizer). Keep the `?`; it flags a best guess, not a certainty. Never silently promote `**Name?:**` to `**Name:**`. Review these before L1 extraction.

**Building turns from Whisper's SRT (manual path):** merge segments into turns per the canonical rule in `../ladder-core/scripts/diarize/README.md` → **Shared L0 doctrine → Deterministic segment merge**. In short: concatenate consecutive same-speaker segments verbatim; new turn on a speaker change or a gap > ~2s; never split a continuous run sentence-by-sentence. (Method D's tool applies a simplified attribution-only merge — no >2s pause split; this rule is for the manual path, and the pause split is applied to Method D drafts during mapping.)

---

## Attribution Status (Method D files — the L1 gate)

Every **Method D (diarized)** interview file carries a computed `attribution_status:` field in its frontmatter — the same structural gate the conversation format uses. Diarization can emit `**Name?:**` and `**[Speaker]:**` markers in an interview exactly as in a panel, and interview findings are attributed to a single named person at L1, so an unchecked misattribution is *more* consequential here, not less.

**Computation rule (identical to the conversation format):**

```
unresolved  if  any turn is **[Unknown Speaker]:**  (an unidentified voice), OR
                (count of **[Speaker]:** turns + count of **Name?:** turns) / total turns > 0.40
resolved    otherwise
```

Compute it from the final labeled transcript — Method D's tool reports a turn-based tally directly — and set it before writing the file. An `unresolved` file must not proceed to L1 until its labels are corrected and the field recomputes to `resolved`. **The person corrects them, by ear (added 2026-09-22).** Present each flagged turn (`**Name?:**`, `**[Speaker]:**`, `**[Unknown Speaker]:**`) with its timestamps and let the user listen and decide. A realignment you compute yourself (word timestamps against the diarizer's segments, say) may be offered as a suggestion for those turns, never applied as the correction: `resolved` rests on the user's disposition of each flagged turn, and a confirmed voice-to-name mapping is not that disposition. The same rule already governs Method S's ambiguous and restored turns: every one is ear-dispositioned. Even in a `resolved` file, individual `**[Speaker]:**` / `**[Unknown Speaker]:**` turns are excluded from extraction one turn at a time.

Manual Q&A-inference files (two known speakers, no diarizer) **still omit `attribution_status`** — and carry `attribution_method` instead. See the next section.

---

## Attribution Provenance (Q&A-inference files — NOT a gate)

**The problem this closes, stated plainly.** A Q&A-inference file omits `attribution_status`, and L1's fallback then computes the ratio from ambiguity markers. A file whose author was *confident and wrong* carries no markers at all, so the ratio is 0%, and **absence reads downstream as "resolved."** Nothing in the file says its speaker labels rest on one person's reading of question-and-answer structure rather than on a deterministic signal.

**What is NOT done here, and why (ruled 2026-08-23).** The obvious fix — compute `attribution_status` for these files too — was **declined**. It would return `resolved` on precisely the marker-free file it was meant to catch, and `l1-findings-extraction` gates on that field, so it would place a computed-looking green light on the one path with no computation behind it. A fabricated gate is worse than an honest omission.

**What IS done: provenance, which claims only what it can support.**

```yaml
attribution_method: qa-inference
attribution_attested_by: Jane Researcher
```

**Rules:**
- **Both fields or neither.** `attribution_method` without `attribution_attested_by` is invalid — an unattributed attestation is the thing this field exists to prevent.
- The attestor is **a person, never a tool or a model.** They are saying: *I read the Q&A structure and assigned these labels.* That is a claim only a human can make, which is exactly why it is recorded rather than computed.
- **It is not a gate and must never be read as one.** It does not block L1, does not imply `resolved`, and does not substitute for `[Speaker]` markers — uncertainty still gets marked turn by turn per Speaker Labels above.
- `attribution_status` stays **absent** on these files. The two fields are not alternatives to each other: one is a computed gate, the other is a signed statement of method.

**What it buys.** A later reader — at L1, at L2, or during an audit years on — can see that this file's attribution is inferred rather than derived, and knows **who to ask**. That is the whole claim. It is small, and it is true.

---

## Transcript Body

**What to preserve:**
- Filler words (um, uh, like, you know) — they carry signal for L1 extraction
- Self-corrections and restarts
- Laughter, long pauses, crosstalk — mark with italics: `*[laughs]*`, `*[long pause]*`, `*[crosstalk]*`
- Inaudible sections: `*[inaudible]*`
- The full conversation — do not filter content that seems off-topic at the time

**What not to include:**
- Timestamps — not used in this format
- Line numbers
- Interpretive notes or analytical commentary — those belong in L1. *(One carve-out: delivery annotations, below — capture-layer fidelity, not analysis.)*

**Delivery annotation (adopted provisionally 2026-07-31 — the researcher ruling B1; validate in first fieldwork).** Text drops a property of the utterance the audio carried: how it was said. Sarcasm, deadpan, hesitation, performed confidence can invert a faithfully transcribed sentence. A present researcher may record the delivery inline, on its own line immediately after the turn:

```markdown
**Julian:** Oh sure, the process works great. We all love the process.

*[delivery: deadpan — participant mocking the process, not reporting it. — Dana, 2026-08-12]*
```

Rules — this is the entity-correction pattern extended to tone (body edit under a header record; precedent: the 2026-07-30 working-session L0's 22-correction entity block, `PAI/Recorded-Calls-Zooms/processed/2026-07-30/`, and the diarize CHANGELOG same date):
- **Only a researcher who was present**, attributed and dated in the annotation itself. **Same-day means the day of the session:** when the transcript is produced later (the normal case), the reading is captured same-day in the session field-note file and transcribed onto the L0 at its gate — the annotation's date is the date of *noticing*, not of typing
- States the **delivery and the referent needed to see it — never what the turn means for the research** (meaning stays L1)
- **Never inferred from the transcript or re-listened audio after the fact** — the annotation attests what a present researcher perceived (remote attendance counts as present)
- The **prose header** carries one inventory line, omit-if-zero, bold-label form beside the other header fields: `**Delivery annotations:** N — <researcher> (YYYY-MM-DD); <researcher> (YYYY-MM-DD)`. Never a YAML field — the five-field YAML block stays closed
- Annotating is an **offer, never a requirement** — the window simply closes when the day does
- L1 consumes these as the source for the **Delivery** signal and observation-class evidence (`l1-findings-extraction/FindingsFormat.md` → Evidence Classes)

**ASR-delivery reality — you can only preserve what the engine delivered.** Full canonical statement: `../ladder-core/scripts/diarize/README.md` → **Shared L0 doctrine → ASR honesty**. In short: preserve fillers that ARE in the transcript but never add them back (absence ≠ fluency — the engine smooths disfluencies); non-verbals appear only when a source delivered them (the raw-audio path cannot invent them); if fillers or non-verbals were dropped, say so in the **Note** field.

---

## Full File Example

```markdown
---
participant: Julian Marsh
date: 2026-03-02
interview_type: Industry insider
location: Chicago
synthesis_level: L0
---

# Interview Transcript — Julian Marsh
**Date:** 2026-03-02
**Participants:** Alex (interviewer), Devon (co-interviewer), Julian Marsh
**Context:** Meridian Brand Strategy — subject matter expert / industry interview
**Location:** Julian in Chicago (between trade meetings)
**Source:** `Julian_Marsh_2026-03-02.txt`
**Note:** Source transcript has occasional speaker label errors; corrected by context throughout.

---

**Speaker Key**
- **Alex** — Interviewer
- **Devon** — Co-interviewer
- **Julian** — Participant (subject matter expert / industry insider)

---

## Pre-Call — Alex & Devon Debrief

*Julian joining shortly.*

**Devon:** That last call ran long, but I think it was worth it...

**Alex:** It was. I have two things I want to check with Julian...

---

## Julian Joins

**Alex:** There he is.

**Julian:** Hello. Can you both hear me?

---

## Background & Career Arc

**Alex:** Julian, how did you first get into cycling?

**Julian:** My older cousin raced on the track, and I started going to the velodrome with him when I was about twelve...
```

---

## Quality Check Before Writing

- [ ] YAML frontmatter present — 5 fields (6 with `attribution_status:` for Method D files), `synthesis_level: L0`
- [ ] File named `L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md`
- [ ] Prose header complete — Date, Participants, Context, Location, Source (Note only if needed)
- [ ] Speaker Key present — every speaker listed with name and role
- [ ] `##` section headers used — named by topic, not generically
- [ ] Speaker labels use actual names in bold (`**Name:**`); Method D files may carry `**Name?:**` / `**[Speaker]:**` — every such turn reviewed, none silently promoted
- [ ] Method D: `attribution_status:` computed per the rule and set in frontmatter; `unresolved` files flagged — do not hand to L1
- [ ] Stage directions and non-verbals in italics (only where a source delivered them — Whisper doesn't emit them)
- [ ] Filler words retained *where the ASR delivered them*; if the engine appears to have smoothed disfluencies, note it in the Note field (absence of fillers ≠ preserved fillers — don't check blindly)
- [ ] No timestamps, no interpretive notes, no L1 fields (Notable absences, Follow-up questions)
- [ ] Full transcript preserved — nothing filtered

---

## What L0 Is Not

- **Not filtered.** Do not remove content that seems off-topic — what seems irrelevant at L0 often becomes a finding at L1.
- **Not interpreted.** No analytical notes in the transcript body.
- **Not L1.** Notable absences, follow-up questions, findings count, participant segment labels — those belong in the L1 file, not here.
