# L0 Conversation Transcript Format Reference

The exact format for L0 conversation transcript files — structured raw material for multi-party recordings that feeds l1-findings-extraction.

**Contents** (a reader mid-task may only see this far — jump to the section named):
- File Naming · YAML Frontmatter · Prose Header · Speaker Key — the file's head matter
- Speaker Label Methods — how multi-party speakers are identified
- **Attribution Status (the L1 gate)** — the gate L1 reads
- Section Headers — the canonical conversation section list
- Speaker Labels · Transcript Body — the turn-by-turn format
- Full File Example — a complete worked file
- Quality Check Before Writing · What L0 Is Not

---

## File Naming

```
L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md
```

The topic slug is a short, hyphenated label that identifies the conversation — not a participant name. Choose something that will be meaningful when reading a file list.

Examples:
- `L0_Expert-Panel-Racing-Heritage_2026-06-04_conversation.md`
- `L0_Alex-Jordan-Brand-Dialogue_2026-06-04_conversation.md`
- `L0_Move37-Roundtable_2026-06-04_conversation.md`

---

## YAML Frontmatter

```yaml
---
participants: [Name1, Name2, Name3]
date: YYYY-MM-DD
conversation_type: Expert panel | Peer interview | Roundtable | Stakeholder dialogue | Expert debrief
topic: [Short description of the conversation subject]
location: <City, State/Country — or "Remote — Zoom" / "Remote — Teams" / etc.>
attribution_status: resolved | unresolved
synthesis_level: L0
---
```

**Notes:**
- `participants:` is a YAML list — all speakers, including any moderator
- `conversation_type:` uses the controlled vocabulary above
- `topic:` is a one-phrase description, not a sentence
- No `interview_type:` field — that belongs to l0-transcribe-interview
- `attribution_status:` is **computed, not chosen** — see the rule under "Attribution Status" below. It is the structural gate l1-findings-extraction reads before extracting; `unresolved` blocks L1.
- **Tool-appended fields (reserved):** `share_link:` / `share_updated:` are appended by the note-sharing tool when a transcript is shared. Never author them by hand, never strip them when editing an already-shared file, and never treat their presence as schema drift — they are external-tool provenance, not transcript content (documented 2026-07-24 after the first shared L0 surfaced them).

---

## Prose Header

Immediately after the YAML block:

```
# Conversation Transcript — [Topic]
**Date:** YYYY-MM-DD
**Participants:** [Name, Role/Affiliation] · [Name, Role/Affiliation] · [Name, Role/Affiliation]
**Context:** [Project name] — [conversation type and purpose]
**Location:** <City, State/Country — or platform and configuration>
**Source:** `[recording_filename.ext]`
**Duration:** [HH:MM:SS]
**Note:** <Any transcription quality issues, speaker label method, corrections — omit this line if none>

---
```

---

## Speaker Key

Immediately after the prose header divider, before the first section:

```
**Speaker Key**
- **Alex** — [Title / Affiliation / Role in this conversation]
- **Jordan** — [Title / Affiliation / Role in this conversation]
- **Sam** — [Title / Affiliation / Role in this conversation]
```

**Rules:**
- List every voice that appears in the transcript
- No Interviewer / Participant distinction — all speakers are peers or domain contributors
- Role description should name what makes this person's voice distinctive (expertise, affiliation, perspective)
- If a loose moderator exists, note that: "Jordan — Moderator / [Affiliation]"
- Use the same name form that appears in the speaker labels throughout
- If speaker identity for a turn is uncertain, document the uncertainty method used: "Speaker labels: Method A (time map); uncertain turns marked [Speaker]"

**Unknown speaker (voice not on participant list):**
If a voice appears in the recording that was not supplied in the participant list, use `**[Unknown Speaker]:**` for those turns. Add to the Speaker Key as:
- **[Unknown Speaker]** — Unidentified voice; [approximate timestamp range]; user review required before L1 extraction

Note in the Note field: `Unidentified speaker at [timestamp range] — must be identified before l1-findings-extraction.` Do not proceed to L1 extraction until the user names the speaker and the Speaker Key is updated.

---

## Speaker Label Methods

Unlike interview transcripts, Q&A asymmetry cannot be used to infer speakers. Five approaches, in order of reliability. Document which method was used in the Note field.

**Naming (settled 2026-08-23, the researcher's ruling):** all five methods are LETTERED — S, D, A, B, C. The manual three were numbered 1/2/3 here and lettered A/B/C in `workflows/TranscribeConversation.md`, so a file's provenance line read differently depending on which document the session followed; Method D also carried a stray `0.` from the days when it was inserted above the original three. Letters everywhere retires both oddities. **L0 files written before this date carry the older strings** (`user time map`, `contextual inference`, `Method A — time map`) — that is expected, not drift; do not rewrite them.

**S. Separate tracks — "Method S" (preferred over ALL other methods when one audio file per participant exists)**
Two sources produce per-participant tracks, distinguished by where the isolation comes from (capture-scoped ruling, the researcher 2026-08-15): **network-separated capture** — Zoom's "record a separate audio file for each participant" (standing setting since 2026-07-23), isolation by construction — and **shared-air capture** — worn mics in one room (Insta360 Mic Pro standing rig), where the other participant's voice bleeds onto every track and the tool's **energy-attributed dedup pass** (default ON since 2026-08-15) resolves it: duplicated cross-track text is attributed to the hotter track, genuine simultaneous speech is kept on both, and near-ties are marked `⚠ DEDUP-AMBIGUOUS` for the ear. Run `../ladder-core/scripts/diarize/tracks-transcript <dir>` — transcribes each track, interleaves by timestamp, no diarizer, no `?`/`[Speaker]` states. `attribution_status: resolved` once the track→name mapping is confirmed **and every `⚠ DEDUP-AMBIGUOUS` turn (if any — count is in the draft's Dedup line) has been listened to and dispositioned**. Crosstalk content-loss cannot occur (overlapped speech survives on its own track; the dedup pass suppresses transcript *copies* only, each one logged verbatim in the draft's `## Dedup log`). **Shared-air sessions owe a one-line bleed disposition in the Note field, every session including clean ones — the Dedup log feeds it, it does not replace it** (the researcher ruling 2026-08-15; the first real shared-air session's line must also report the log's minimum observed margin). Defaults to `condition_on_previous_text=False` since 2026-07-30 (`--condition` restores the pinned baseline; rationale: diarize README → ASR honesty). Note field examples: `Speaker labels: Method S (separate tracks, deterministic); 3 tracks mapped` · shared-air: `Speaker labels: Method S + dedup (4 bleed copies suppressed, 0 ambiguous, min margin -11.8 dB); bleed disposition: nothing threatens attribution`.

**D. Automated diarization — "Method D" (preferred whenever the audio is available and separate tracks are NOT)**
Run the diarization tool: it transcribes (mlx-whisper) and diarizes (pyannote) in one on-device pass, then merges them into a draft with graded-confidence speaker labels already applied.

```bash
../ladder-core/scripts/diarize/diarize-transcript "[audio_file]" --out draft.md
```

The draft uses anonymous `SPEAKER_00/01/02` placeholders plus a mapping stub (talk time + first-appearance to help identify who's who). Your job shrinks from authoring a full time map to **confirming a few `SPEAKER_xx → Name` mappings**. Confidence states are assigned automatically: clean turns → `**Name:**`; segments genuinely shared by two voices → `**Name?:**`; segments overlapping no diarizer turn → `**[Speaker]:**`. The tool reports an ambiguity tally and raises the review flag past the ~40% threshold. Requires `HF_TOKEN` in `~/.claude/.env` (one-time HF license acceptance — see the tool's README).

Note field example: `Speaker labels: Method D (pyannote diarization); 3 speakers mapped; 6% turns inferred, 3% [Speaker]`

Fall back to methods A–C when there's no audio (existing transcript), when diarization mis-splits similar voices, or to resolve the turns Method D flagged.

**A. User-provided time map (best manual method when there's no audio)**
User supplies approximate timestamps for speaker changes. Apply the mapped name to turns that fall cleanly inside a single map interval. **A map records who *leads* a stretch — not every turn**, so do not assume a map interval contains only one speaker:
- A transcript segment that **straddles a map boundary** (its time range crosses a transition) is ambiguous → mark `**[Speaker]:**`; never assign it wholesale to one side.
- Interjections, asides, or back-channel *inside* an interval that the map doesn't account for → `**[Speaker]:**`, not the interval's lead speaker.
- **Map-density check:** if the map averages fewer than ~1 entry per minute of recording, warn the user before labeling that within-interval turns will mostly be marked `[Speaker]` rather than confidently attributed — a coarse map cannot resolve choppy multi-party turn-taking.

Then flag remaining gaps as `**[Speaker]:**`.

```
**Speaker Map provided by user:**
- 00:00–02:30 — Alex leads
- 02:30 — Jordan responds
- 04:15 — Sam joins
...
```

Note field example: `Speaker labels: Method A (time map); 3 turns marked [Speaker]`

**B. Contextual inference**
Map each cue to the matching confidence state (see Speaker Labels above):
- **Named address or direct continuation** of a confident turn → `**Name:**` (confident).
- **Topic ownership / style guess** with no anchor → `**Name?:**` (inferred) — not a bare confident label.
- **No usable cue** → `**[Speaker]:**` (unknown).

Count the outcome. If more than ~40% of turns end up `**[Speaker]:**` **or** `**Name?:**` combined, contextual inference has effectively failed for this recording — fall back to Method C and flag the file for user review before L1 extraction.
Note field example: `Speaker labels: Method B (contextual inference); 40 turns total — 5 [Speaker], 8 inferred (Name?)`

**C. Manual review pass (last resort)**
When confident attribution is not possible, label all turns `**[Speaker]:**` and flag the file for user review before L1 extraction.
Note field: `Speaker labels require user review — do not extract L1 findings until labels are confirmed`

---

## Attribution Status (the L1 gate)

Every L0 conversation file carries a computed `attribution_status:` field in its frontmatter. It is the **structural gate** l1-findings-extraction checks before extracting — a prose warning in the Note field is not enough on its own.

**Computation rule:**

```
unresolved  if  any turn is **[Unknown Speaker]:**  (an unidentified voice), OR
                (count of **[Speaker]:** turns + count of **Name?:** turns) / total turns > 0.40
resolved    otherwise
```

This is the same ~40% ambiguity threshold Method D's tally and the contextual-inference fallback already use — the field just makes it a written, checkable value instead of a sentence a reader might miss. Compute it from the final labeled transcript and set it before writing the file: Method D's tool reports the tally directly; for manual methods, count the turn labels.

An `unresolved` file must not proceed to L1 until its labels are corrected and the field recomputes to `resolved`. **The person corrects them, by ear (added 2026-09-22).** Present each flagged turn (`**Name?:**`, `**[Speaker]:**`, `**[Unknown Speaker]:**`) with its timestamps and let the user listen and decide. A realignment you compute yourself (word timestamps against the diarizer's segments, say) may be offered as a suggestion for those turns, never applied as the correction: `resolved` rests on the user's disposition of each flagged turn, and a confirmed voice-to-name mapping is not that disposition. The same rule already governs Method S's ambiguous and restored turns: every one is ear-dispositioned. Even in a `resolved` file, individual `**[Speaker]:**` / `**[Unknown Speaker]:**` turns are still excluded from extraction one turn at a time.

---

## Section Headers

Same convention as interview transcripts — use `##` headers named by topic, not generically.

```
## Opening — Context and Introductions
## Racing Heritage and Brand Identity
## Dealer Relationship and Community
## Competitive Landscape
## Close
```

**Name the subject under discussion — not the outcome, resolution, or characterization of what was said.** `## Racing Heritage and Brand Identity` is a subject; `## Jordan Concedes the Heritage Argument` is an interpretation, and interpretation belongs to L1, never to an L0 header. The header labels *what the stretch is about*, not *what it means*.

**Density:** aim for roughly one section per genuine topic shift — typically every 8–15 minutes of conversation. A 70-minute recording that yields 3 sections is under-segmented; one that yields 20 is slicing mid-topic. This keeps section count reproducible instead of a matter of run-to-run discretion.

Section headers serve two purposes: navigability in long transcripts, and context for l1-findings-extraction on where in the conversation a moment occurred.

---

## Speaker Labels

Same convention as interview transcripts:

```
**Alex:** What I've seen in the market is that the heritage brands...

**Jordan:** I'd push back on that slightly. The data from 2023...

**Sam:** *[laughs]* We had exactly that conversation internally last month.
```

**Rules:**
- Bold the name, not the text that follows
- One blank line between speaker turns
- Stage directions and ambient notes in italics: `*[crosstalk]*`, `*[long pause]*`, `*[laughs]*`
- **Three attribution-confidence states — keep them distinct; never collapse a weaker one into a stronger one:**
  - `**Alex:**` — **confident.** Anchored by a time-map entry, an explicit named address ("Jordan, what do you think"), or unambiguous direct continuation of a confident turn.
  - `**Alex?:**` — **inferred.** Assigned from a soft cue (topic ownership, style/voice guess) with no anchor. The trailing `?` is load-bearing: it tells the reader — and downstream L1 extraction, which cites speakers by name — that this attribution is a best guess, not a fact. Never silently promote `**Alex?:**` to `**Alex:**`.
  - `**[Speaker]:**` — **unknown.** No basis to attribute at all. Never guess a name to avoid the flag.
- If two speakers talk simultaneously: `*[crosstalk — Alex and Jordan]*`

**Building turns from Whisper's SRT (manual methods A/B/C):** merge segments into turns per the canonical rule in `../ladder-core/scripts/diarize/README.md` → **Shared L0 doctrine → Deterministic segment merge**. In short: concatenate consecutive same-speaker segments verbatim; new turn on a speaker change or a gap > ~2s; never split a continuous run sentence-by-sentence. (Method D's tool applies a simplified attribution-only merge — no >2s pause split; this rule is for the manual paths, and the pause split is applied to Method D drafts during mapping.)

---

## Transcript Body

**Preserve:**
- Filler words (um, uh, like, you know) — they carry signal
- Self-corrections and restarts
- Laughter, pauses, crosstalk — mark with italics
- Inaudible sections: `*[inaudible]*`
- The full conversation — do not filter content that seems tangential

**Do not include:**
- Timestamps in the body
- Line numbers
- Interpretive notes or analytical commentary — those belong in L1. *(One carve-out: delivery annotations, below — capture-layer fidelity, not analysis.)*

**Delivery annotation (adopted provisionally 2026-07-31 — the researcher ruling B1; validate in first fieldwork).** Text drops a property of the utterance the audio carried: how it was said. Sarcasm, deadpan, hesitation, performed confidence can invert a faithfully transcribed sentence (standing instance: a sarcastic "twelve interviews is never enough" reading cold as a live objection, 2026-07-30). A present researcher may record the delivery inline, on its own line immediately after the turn:

```markdown
**Priya:** I've been told that twelve interviews is never enough, Alex.

*[delivery: sarcasm — riffing on the signal-processing essay's method-slide scene; not a live concern. — the researcher, 2026-07-30, transcribed at the L0 gate 2026-07-31]*
```

Rules — this is the entity-correction pattern extended to tone (body edit under a header record; precedent: the 2026-07-30 working-session L0's 22-correction entity block, `PAI/Recorded-Calls-Zooms/processed/2026-07-30/`, and the diarize CHANGELOG same date):
- **Only a researcher who was present**, attributed and dated in the annotation itself. **Same-day means the day of the session:** when the transcript is produced later (the normal case), the reading is captured same-day in the session field-note file and transcribed onto the L0 at its gate — the annotation's date is the date of *noticing*, not of typing
- States the **delivery and the referent needed to see it — never what the turn means for the research** (meaning stays L1)
- **Never inferred from the transcript or re-listened audio after the fact** — the annotation attests what a present researcher perceived (remote attendance counts as present)
- The **prose header** carries one inventory line, omit-if-zero, bold-label form beside the Note field: `**Delivery annotations:** N — <researcher> (YYYY-MM-DD); <researcher> (YYYY-MM-DD)`. Never a YAML field — the YAML block stays closed
- Annotating is an **offer, never a requirement** — the window simply closes when the day does
- L1 consumes these as the source for the **Delivery** signal and observation-class evidence (`l1-findings-extraction/FindingsFormat.md` → Evidence Classes)

**ASR-delivery reality — you can only preserve what the engine delivered.** Full canonical statement: `../ladder-core/scripts/diarize/README.md` → **Shared L0 doctrine → ASR honesty**. In short: preserve fillers that ARE in the transcript but never add them back (absence ≠ fluency — the engine smooths disfluencies); non-verbals appear only when a source delivered them (the raw-audio path cannot invent them); if fillers or non-verbals were dropped, say so in the **Note** field.
- **The two workflows are asymmetric against this format** (conversation-specific, not in the shared doctrine): `TranscribeConversation` (raw audio → Whisper) yields clean speaker turns but little disfluency/non-verbal texture; `FormatConversationTranscript` carries whatever the source (Otter / Rev / manual) captured.

---

## Full File Example

```markdown
---
participants: [Alex Rivera, Jordan Kim, Sam Okafor]
date: 2026-06-04
conversation_type: Expert panel
topic: Racing heritage vs. performance-for-everyone positioning
location: Remote — Zoom
attribution_status: resolved
synthesis_level: L0
---

# Conversation Transcript — Racing Heritage vs. Performance-for-Everyone
**Date:** 2026-06-04
**Participants:** Alex Rivera, Brand Strategist · Jordan Kim, Category Analyst · Sam Okafor, Dealer Principal
**Context:** Move 37 — expert panel on brand positioning tensions
**Location:** Remote — Zoom
**Source:** `expert-panel-2026-06-04.m4a`
**Duration:** 01:12:34
**Note:** Speaker labels: Method A (time map); three turns in the 00:42–00:48 window marked [Speaker] — crosstalk unresolvable.

---

**Speaker Key**
- **Alex** — Brand Strategist, 15 years in cycling category
- **Jordan** — Category Analyst, formerly Summit global marketing
- **Sam** — Dealer Principal, independent shop, Pacific Northwest

---

## Opening — Context and Introductions

**Alex:** Thanks for making time. We're trying to get at something that's been bugging us — the tension between the racing heritage story and where the actual growth is coming from.

**Jordan:** Yeah, it's a real one. I've been sitting with this for a couple of years.

**Sam:** From where I sit in the shop, customers don't think about it the way the brand does.

---

## Racing Heritage and Brand Identity

**Alex:** So Jordan, you were at Summit during the whole "performance for everyone" push. How did they navigate this?

**Jordan:** Honestly they didn't resolve it — they just picked a lane for each sub-brand and let them coexist. Which worked for a while but created its own confusion downstream.

**Sam:** I can speak to that from the dealer side. When a customer walks in and asks "is this a race bike or a weekend bike," I have to do a lot of translation.
```

---

## Quality Check Before Writing

- [ ] YAML frontmatter present — `participants:` list, `conversation_type:`, `topic:`, `date:`, `location:`, `synthesis_level: L0`
- [ ] File named `L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md`
- [ ] Prose header complete — Date, Participants with roles, Context, Location, Source, Duration (Note only if needed)
- [ ] Speaker Key present — every speaker listed with role/affiliation, no Interviewer/Participant labels
- [ ] Speaker label method documented in Note field
- [ ] `attribution_status:` computed (resolved/unresolved) per the rule and set in frontmatter
- [ ] `##` section headers used — named by topic, not generically
- [ ] Speaker labels use actual names in bold (`**Name:**`) — uncertain turns use `**[Speaker]:**`
- [ ] Stage directions and non-verbals in italics (only where a source delivered them — Whisper doesn't emit them)
- [ ] Filler words retained *where the ASR delivered them*; if the engine appears to have smoothed disfluencies, note it in the Note field (absence of fillers ≠ preserved fillers — don't check blindly)
- [ ] No timestamps in body, no interpretive notes
- [ ] Full conversation preserved — nothing filtered

---

## What L0 Is Not

- **Not filtered.** Do not remove content that seems off-topic — tangential exchanges often surface the most valuable findings at L1.
- **Not interpreted.** No analytical notes in the transcript body.
- **Not L1.** Speaker attributions, notable absences, follow-up questions — those belong in the L1 file, not here.
- **Not interview format.** Do not use `participant:` singular, `interview_type:`, or file naming from l0-transcribe-interview — the formats are intentionally distinct for downstream processing.
