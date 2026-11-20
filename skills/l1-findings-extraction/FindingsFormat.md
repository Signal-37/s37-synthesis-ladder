# L1 Findings Format Reference

The exact output format for L1 Findings files, including the file header, the finding structure, signal type definitions, volume calibration, and an annotated example.

**Contents** (a reader mid-task may only see this far — jump to the section named):
- File Naming · File Header — head matter, with Conversation Variant / Survey Variant forms
- Row accounting — reconciling findings against the source
- **The Attribution Gate (conversation + Method D interview inputs)** — the gate before extraction
- Finding Structure — the per-finding template
- Evidence Classes (the two-source doctrine) · Signal Types — what backs a finding
- What Counts as a Finding (V1 Scope)
- Volume Calibration — how many findings to expect
- Abductive Flag Quality Check
- Annotated Example — a complete worked finding

---

## File Naming

```
L1_[FirstName]_[LastName]_[YYYY-MM-DD]_findings.md
```

Examples: `L1_Julian_Marsh_2026-04-28_findings.md`, `L1_Dana_Cole_2026-03-15_findings.md`

For anonymized participants, use a participant ID: `L1_P04_2026-03-15_findings.md`

---

## File Header

Every file opens with a YAML frontmatter block (machine-readable index), followed by a plain-text narrative header (human-readable context). Both are required.

```
---
participant: [Full Name or Participant ID]
role: <Brief role — participant type, key context, main product or experience>
date: [YYYY-MM-DD]
interview_type: [Customer / Near-purchaser / Dealer / Industry insider / Written Q&A / etc.]
location: [City, State/Country]
interviewers: [Name(s)]
synthesis_level: L1
extraction_date: [YYYY-MM-DD]
domain: [brand/design | product/UX | organizational | policy/advocacy | other]   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation
source_type: interview          # optional; absent = interview. Multi-speaker inputs use source_type: conversation (see Conversation Variant)
field_notes: <yes | no — whether an FN file informed this extraction; visibility for L2, not a compliance mark>
---

# L1 Findings — [Participant Name]
**Interview date:** [YYYY-MM or YYYY-MM-DD]
**Participant type:** [Customer / Near-purchaser / Dealer / Industry insider / Former employee / Expert / etc.]
**Interview context:** <Domain, role, key products or experiences relevant to the research, key credentials — enough to place this person without reading the transcript>
**Participant segment:** [Gender, location, archetype label, 2-3 defining characteristics]
**Source:** `[L0_FirstName_LastName_YYYY-MM-DD_transcript.md]`
**Findings count:** [N]

---

**Notable absences:** <Topics you expected to come up that didn't — silence is data. Name what's missing and why it matters.>

**Follow-up questions flagged:** [Questions this interview raised that a follow-up session should probe.]

---
```

---

## Conversation Variant

When the input is an L0 **conversation** file (multiple speakers, from `l0-transcribe-conversation`), L1 produces **one findings file for the whole conversation** — not one per speaker — using this variant. The interview format above is unchanged; the two are discriminated by the `source_type:` field.

**File naming:**
```
L1_[Topic-Slug]_[YYYY-MM-DD]_conversation-findings.md
```
(Slug matches the L0 file's topic slug for traceability.)

**YAML frontmatter (conversation):**
```
---
participants: [Alex Rivera, Jordan Kim, Sam Okafor]
speakers:
  - name: Alex Rivera
    role: Brand Strategist, 15 years in cycling category
  - name: Jordan Kim
    role: Category Analyst, formerly Summit global marketing
  - name: Sam Okafor
    role: Dealer Principal, independent shop, Pacific Northwest
date: YYYY-MM-DD
conversation_type: Expert panel | Peer interview | Roundtable | Stakeholder dialogue | Expert debrief
topic: [Short description]
location: <City, State — or platform>
interviewers: []                # empty, or moderator name if a loose moderator exists
synthesis_level: L1
extraction_date: YYYY-MM-DD
domain: [brand/design | product/UX | organizational | policy/advocacy | other]
source_type: conversation       # REQUIRED discriminator for this variant
session_id: [l0-topic-slug]-[YYYY-MM-DD]   # natural key = L0 topic slug + date; propagates to L2
attribution_status: resolved    # copied forward from the L0 file (must be resolved to extract)
attribution_method: qa-inference        # ONLY if the L0 carried it — copied forward verbatim, never inferred here
attribution_attested_by: [Full Name]    # required whenever attribution_method is present
field_notes: <yes | no — whether an FN file informed this extraction; visibility for L2, not a compliance mark>
---
```

**Title line:** `# L1 Findings — [Topic] (Panel: Name, Name, Name)`

- `speakers:` mirrors the L0 Speaker Key verbatim (name + role), so L1/L2 can render per-speaker role without reopening the L0 file.
- `conversation_type:` uses L0's controlled vocabulary — not the interview `interview_type:` vocabulary.
- `session_id:` tags every finding in this file as coming from one session; L2 uses it to enforce cross-session independence (a theme cannot be named from a single session alone).
- Every finding carries a `**Speaker:**` field (see Finding Structure).

**Interview files are mostly unaffected:** they keep singular `participant:`/`role:`/`interview_type:`, one file per participant, and need no `speakers:`/`session_id:`. `source_type:` defaults to `interview` when absent, so existing files need no migration. **Exception (2026-07-01): Method D (diarized) interview L0 files carry `attribution_status:`** and are subject to the same Attribution Gate below — diarization can emit `Name?`/`[Speaker]` markers in an interview exactly as in a panel.

---

## Survey Variant

When the input is a batch of survey corpus files from `l0-survey-corpus-prep` (frontmatter `source_type: survey-corpus`), L1 produces **one findings file per batch** (or per corpus file, if the files were not grouped) using this variant. Raw exports are not an input: send them to `l0-survey-corpus-prep` first.

**What a survey finding is.** Each row is one anonymous response to one question, with no session and no follow-up. A survey finding is a pattern read across rows in the batch: an interpreted statement about what respondents report, ask for, or judge, grounded in their exact words. The Statement stays interpretive, as in the interview format; the unit it describes is respondents in this batch, not one person. A finding resting on one row is written in the singular ("One respondent …").

**File naming:**
```
L1_Survey_[Batch-Slug]_[YYYY-MM-DD]_findings.md
```
(Batch slug from `_consolidation_log.md`, e.g. `B03_holds`; date = extraction date.)

**YAML frontmatter (survey):**
```
---
source_type: survey               # REQUIRED discriminator for this variant
batch: B03_holds
corpus_files: [holds.md, search.md]
source_file: export.xlsx          # copied from the corpus files (file name only)
source_sha256: <copied>           # identifies the export file
survey_id: <copied>               # identifies the survey (SegmentSurvey --survey-id); L2 keys the single-survey hold and ID counting on it
question_text: "<verbatim question, copied>"
coding_provenance: platform-applied | researcher-imposed   # copied; never upgraded here
tagging_method: human | classifier | keyword | unknown     # how the category tag was applied (ValidateExtract)
sampling: census | mixed | saturation                      # mixed = at least one corpus file is a logged fixed sample
respondent_id: present | partial | absent                  # copied
independence: verified | assumed  # verified only when respondent_id: present
rows_in_scope: N                  # rows in the batch's corpus files
rows_read: N                      # rows actually read for this extraction
synthesis_level: L1
extraction_date: YYYY-MM-DD
domain: [brand/design | product/UX | organizational | policy/advocacy | other]
---
```

**Narrative header** (replaces the interview header lines):
```
# L1 Findings — Survey, [Batch name]
**Question:** "[verbatim]"   **Channel:** [if known]   **Dates:** [range]
**Corpus:** [file — rows read of rows in file — census / sampled n of N / saturation], one per corpus file; coding [platform-applied / researcher-imposed], tagging [method]
**Findings count:** [N]
**Limits:** Self-selected open-text responses: processable and citable, not representative. [If respondent_id is not present →] Each row is treated as a different respondent — an assumption, not verified. [If any file is not census →] Read [n] of [N] rows; findings describe the rows read, and a pattern missing here says nothing about the unread rows.
```
The **Limits** line is required and is copied forward into every L2 file that cites this one, and from there into L3.

**Finding structure (survey):** as in Finding Structure, with these changes:
- **No `**Speaker:**` field.**
- **Claim kind:** a new line after the Statement: `**Claim kind:** reported incident | stated wish | evaluation` (more than one allowed). Survey rows contain no observed behavior; they report what happened, ask for something, or judge something. A finding whose supporting rows are all stated wishes is written as what respondents ask for, never as what they need, and its Abductive flag asks what the request stands in for.
- **Evidence: verbatim quotes only**, each followed by its row ID and file: `"exact words" [r412 · holds.md]`. Quote as many rows as the Statement needs; the full support is in Row accounting. Paraphrase, observation and photo classes do not apply: there is no session, no researcher present, and no field-note file.
- **Rows:** a new line after Evidence: `**Rows:** [q] quoted · [s] supporting · [c] contrary · of [n] read in [corpus file(s) the finding draws on]`. Counts, never percentages, never extrapolated from a sample to the population. Every row the Statement relies on is supporting; every quoted row is one of them. **Contrary** rows describe the same situation or mechanism and report the opposite (the notice arrived in time; search found a misspelled title); disagreement between respondents goes there, not into Signal type. A general positive row that does not address the finding's mechanism is not contrary: it goes under Rows not carried as positive-general.
- **Context:** the question the row answered, the corpus file (its category), and anything the rows themselves establish about the respondent's situation. When the corpus carries a score, give each quoted row's score (or the range across supporting rows) and the scale's direction as recorded at intake; sentiment is never inferred from the score alone. Say when a quoted row is truncated in the source; never complete it.
- **Signal type:** adapted for rows.
  - **Repetition** does not apply; recurrence across rows is carried by the Rows line.
  - **Contradiction** applies only within one row. A text/score mismatch counts only when the score item and the open-text question address the same object (a rating of the pickup experience next to a pickup complaint). An overall NPS or satisfaction score next to a feature complaint is two answers to two questions: give the score in Context, with no signal.
  - **Resignation** needs wording in the row that shows an adapted behavior or an abandoned expectation.
  - **Delivery** does not apply (it needs a present researcher).
  - Strong language, Specificity and Surprise apply as written.

**Row accounting (required appendix).** The file ends with:
```
## Row accounting
**Finding 1:** supporting [S-001, S-003, S-008(wish), …] · contrary [S-010] or none · ambiguous [S-067 → F1 | F8] or none
**Finding 2:** …
### Single rows carried
- [S-023] a child searching adult results — the only row about who does the searching
### Rows not carried
- [S-017, S-025] positive-general, no specific content
- [S-022] too thin to interpret
```
In a finding with more than one Claim kind, mark each supporting row whose kind differs from the finding's main claim, e.g. `S-008(wish)` or `S-020(evaluation)`, so L2 can count by claim kind without reopening the corpus.

Every row read appears exactly once: in a finding's supporting, contrary or ambiguous list, under Single rows carried, or under Rows not carried with a short reason (positive-general, restates the question, off-topic, too thin to interpret, truncated). This is the coverage check.
- **Ambiguous** rows could support more than one finding, or support a finding only on one reading; name the candidates. L2 does not count them.
- **Single rows carried** are specific rows that form no pattern: the row ID and one clause on why it matters. They are not findings; L2's outlier audit reads them. Write a one-row finding only when its Statement says more than the row does (for example, by linking it to another finding).

The coverage check replaces the volume floor for survey files, and L2 counts from it. The IDs are lists, never percentages. Check it mechanically after writing: `bun ../l0-survey-corpus-prep/scripts/AuditRound.ts --accounting <L1 file> --corpus <corpus dir>` (or `--ledger <ledger>` for a saturation-sampled category) confirms every accounted ID was read, every row read is placed, and no row is counted twice. Whether a row really supports its finding stays a judgment.

**Read before cite.** Every row ID in a findings file must come from a row read during this extraction.
- A claim about a whole corpus file requires that every row of it was read. For a file read in parts, each part is a separate read, and a claim cites the part that contains its rows.
- A finding carried from an earlier turn is extended only while its quoted rows are still in view; otherwise re-read them.
- **Notable absences** under sampling are reported only for the rows read, and say so.

**Saturation-sampled categories.** `l0-survey-corpus-prep/workflows/SaturationSampling.md` keeps its rounds in a separate rounds file (`### F<n> —` headings with machine-checked Citation lines, audited by `AuditRound.ts`). When the category is closed, the L1 file for it is written in this format, one finding per round finding, with Row accounting drawn from every round. Only the L1 file goes to L2 and the gates checker; the rounds file stays as the audit trail.

**Gates.** The attribution gate does not apply (there are no speakers). The volume floor does not apply (no transcript duration); Row accounting replaces it (`../ladder-core/config/synthesis-gates.yaml` → `gates.volume_floor_l1`, survey condition).

**L2 carries the difference forward.** Survey findings count toward themes by distinct supporting respondents, a theme corroborated only within one survey is held as a hypothesis, and survey rows never lift a theme into the strength bands (`l2-theme-synthesis/workflows/SynthesizeThemes.md` Step 5 → Survey independence rule).

---

## The Attribution Gate (conversation inputs + Method D interview inputs)

Before extracting from a conversation L0 file — **or any interview L0 file that carries `attribution_status:` or contains `**Name?:**`/`**[Speaker]:**` markers** (i.e., Method D diarized interviews; extended 2026-07-01) — L1 **must** check the L0 `attribution_status:` field (canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.attribution_gate`):

- `attribution_status:` present with **any value other than `resolved`** (`unresolved`, or anything else, such as `draft-needs-speaker-mapping`) → **STOP.** Do not extract. Report: "L0 file [name] has unresolved speaker attribution — resolve speaker labels before L1 extraction." *(Fail closed on unknown values: 2026-09-30, found in the first outside install.)*
- field **absent** (legacy L0 file) → compute it: count `**[Speaker]:**` + `**[Unknown Speaker]:**` + `**Name?:**` turns against total; treat as `unresolved` (and stop) if > 40% or any `[Unknown Speaker]`.
- `resolved` → proceed, but still **exclude individual `**[Speaker]:**` / `**[Unknown Speaker]:**` turns** from extraction one turn at a time. `resolved` means the file cleared the aggregate threshold, not that every turn is certain.
- **The gate covers the session, not just the file (2026-07-31):** an `unresolved` L0 blocks extraction from its FN field-note companion as well — the observation channel does not route around the gate, and an FN observation may not re-attribute a turn the gate excluded (FieldNoteFormat → Rules).

A finding's `**Speaker:**` field must therefore never resolve to `[Speaker]`/`[Unknown Speaker]` — if it would, that turn should not have produced a finding.

---

## Finding Structure

```
## Finding [N]: [Descriptive Title]

**Speaker:** *(conversation variant only)* [Full Name exactly as in the L0 Speaker Key; add a trailing `?` if the source turn was an inferred `**Name?:**` label. Never `[Speaker]`/`[Unknown Speaker]` — the gate excludes those turns. For an observation-class finding about the room rather than a single speaker, the permitted value is `— session-level observation (no single speaker)`. Omit this field for single-participant interview files.]

**Statement:** <An interpreted statement about this person's behavior, belief, preference, or experience. Not a quote — a grounded interpretation. Should be true for this participant and specific enough that it couldn't apply to everyone.>

**Evidence:** <One of the four evidence classes (see Evidence Classes below): verbatim quote · paraphrase-of-speech · researcher observation · photograph. Verbatim where words exist. The raw material that grounds the Statement.>

**Context:** [Where in the session this came from. What question prompted it. Whether it was volunteered or extracted. Whether it was the first or fifth time they mentioned this topic. A Delivery-signal finding cites its capture artifact here as plain text: `delivery annotation: <researcher>, YYYY-MM-DD` or `FN entry N` — e.g., a verbatim-quoted sarcastic line carries the quote in Evidence, Delivery in Signal type, and "delivery annotation: the researcher, 2026-07-30, sarcasm — riffing on the essay's method-slide scene" here. An observation marked `post-exchange` or `late-entry` in the FN file carries that marker here too.]

**Signal type:** <One or more of: Strong language / Specificity / Surprise / Contradiction / Repetition / Resignation / Delivery (source-gated — see Signal Types)>

**Abductive flag:** <Given what this person said or did — what does it force the project's key decision-maker to answer? What question does this finding raise that wasn't on the agenda before? What would have to be true for this behavior to make sense? This is not a recommendation — it's the question the finding makes unavoidable. See DomainScope.md for how the decision-maker is defined per project type.>
```

**Anti-fabrication rule:** Never construct a composite or approximate quote, and never invent specificity to meet a volume target. Evidence takes one of four peer classes (below) — the quote is not the "real" class with the rest as fallbacks; each class has its own marker and its own source requirement, and an entry that cannot meet its source requirement is not evidence.

---

## Evidence Classes (the two-source doctrine)

A finding has **two peer sources: an exact quotation from the participant, or an observation of the research team.** This is original doctrine, not an extension — the 2015 King/Freach whiteboard's own L1 label was *Observation*, and the practice it formalized created findings "a quote or an observation from the researcher's own notes" (researcher-attested 2026-07-31; provenance in `../ladder-core/ladder-map.md`). Recorded here so no future tidy-up pass narrows this format to quotes-only. Four evidence classes carry the two sources:

| Class | Marker | Source requirement |
|---|---|---|
| **Verbatim quote** | none — quoted text | The L0 transcript |
| **Paraphrase of speech** | `[paraphrased — no direct quote]` | Participant speech whose verbatim wasn't captured; describe the session moment |
| **Researcher observation** | `[observation — <researcher>, <source>]` | The session field-note file (`FieldNoteFormat.md` → entry N) or an L0 delivery annotation. **Never extractor inference from the transcript, never researcher memory at extraction time** — an observation without a capture artifact is not evidence |
| **Photograph** | `[photo — <file>, <photographer>, <consent tier>; <caption>]` | The session photo log in the field-note file; the consent tier travels with every citation — and L2 propagates it (`ThemeFormat` → `consent_tiers:`) |

Scope language elsewhere in this skill ("behavioral findings") describes what a finding is *about*; "observation" names one of the four ways it is *grounded*. *(Observation channel restored 2026-07-31 — adopted provisionally AND optional: a session with no field-note file simply produces quote- and paraphrase-class findings, which is normal. Validate in first fieldwork.)*

---

## Signal Types

| Signal | What it looks like | Why it matters |
|--------|--------------------|----------------|
| **Strong language** | Superlatives, emotional words, emphasis ("always," "never," "hate," "love," "crazy," "magic") | Signals what the participant actually cares about |
| **Specificity** | Unexpectedly detailed answer — named brands, precise numbers, named people, exact prices | The detail is where the actual experience lives |
| **Surprise** | Behavior or belief that contradicts the brief or your prior assumptions | Abduction starts with anomaly |
| **Contradiction** | Saying one thing, doing another — or two contradictory statements in the same interview | Exposes the gap between stated preference and actual behavior |
| **Repetition** | Topic or phrase that comes up more than once without prompting | What keeps surfacing is load-bearing |
| **Resignation** | "That's just how it is" / "I've learned to live with it" | Adapted behavior masking a real need that's been abandoned |
| **Delivery** | Tone modifies or inverts the words — sarcasm, deadpan, hesitation, performed confidence | The transcript alone reads wrong. **Source-gated:** requires an L0 delivery annotation or a field-note entry by a present researcher — never inferred from text (a faithful transcript of a joke reads as a claim) |

---

## What Counts as a Finding (V1 Scope)

The V1 method is exhaustive. Extract both:

**Behavioral findings and individual preferences** (fine-grained):
- What they own, use, or rely on and why — the logic behind their choices
- What they rejected and why — the alternatives that lost
- How they research and make decisions — the process, not just the outcome
- Who they trust as information sources — channels, people, communities
- What they've worked around or adapted to — unofficial solutions to official gaps
- Analogies and comparisons they draw spontaneously — brands, systems, people
- What they participate in — communities, events, groups, practices
- Tools and technology in their life that shape their relationship with the domain
- Lifestyle and demographic details that shape their choices
- Opinions about extensions, adjacencies, or things the brand or product doesn't do yet

**Domain implications** (higher inference):

The implication questions depend on project type. See `DomainScope.md` for the full set per domain. For brand/design projects: what brand perception problem does this reveal? What purchase or adoption barrier does this expose? What opportunity does this behavior point to? What would the brand or product have to change to serve this person better?

Both categories go in every file. Don't filter to only the high-inference moments.

---

## Volume Calibration

| Transcript length | Target findings |
|-------------------|----------------|
| 30–45 min | 15–20 |
| 45–60 min | 20–28 |
| 60–90 min | 25–35 |

**Survey Variant files** have no duration and no target count; the Row accounting appendix (every row read accounted for) replaces this table.

**Note:** These targets are normative, not derived. No qualitative research standard specifies finding counts per interview hour. The numbers are thresholds that trigger the checks below — but the checks themselves are the principle, not the counts.

**Under the floor — scope check:** If you're under range for the transcript length, the real question is not whether you have enough findings but whether you covered the V1 scope categories: what they own and why, what they rejected, how they decide, who they trust, what they've worked around, the analogies they drew, their community participation, the tools that shape their relationship to the domain, opinions on things the brand doesn't do. A 45-minute interview that produced 14 findings covering every scope category would pass. One that produced 20 findings drawn entirely from stated preferences — none from workarounds, rejection logic, or trust sources — would fail. The scope is the standard; the count approximates it.

**Over the ceiling — level check:** If you're over range, check whether findings have slipped below L1 into L0. A finding is an interpreted statement grounded in evidence — not a raw quote, not an atomic utterance. If findings are reading as labeled quotes rather than interpreted claims, you've lost the L1/L0 distinction. Consolidate adjacent findings that share the same interpretive claim.

---

## Abductive Flag Quality Check

A good abductive flag:
- Raises a question the project's key decision-maker wasn't already asking
- Is specific to what this participant said — not generic
- Forces a choice or decision, not just an observation
- Would be uncomfortable to ignore

A weak abductive flag:
- Restates the finding in different words
- Makes a generic recommendation ("they should do X")
- Could be written without reading the transcript
- Doesn't force anything

---

## Annotated Example

*An invented example in a cycling setting — the format and method apply regardless of domain.*

```
## Finding 7: Chose the less common model because the best seller is "at every café stop"

**Statement:** Riku chose his bike partly because the best-selling alternative is everywhere
he rides, and he values being on something different. Rarity is a purchase driver as direct
as performance.

**Evidence:** "I test rode the one everybody has first, and it was fine. Then one weekend I
counted four of them leaning on the wall at the café stop, and I knew I wanted the other one."

**Context:** Describing the bikes he considered before buying. He named the best seller as
the main alternative; his rejection of it was aesthetic/social, not performance-based.

**Signal type:** Strong language / Specificity

**Abductive flag:** Riku is buying scarcity — his bike is valuable to him partly because it
is not the best seller. If other participants say the same, low market share is at once a
commercial problem and a reason to buy for one kind of buyer. Does the brand know it wins
some customers by not being the market leader? And does that hold as its own share grows?
```
