# ExtractFindings Workflow

Extract L1 Findings from one or more interview transcripts and write a findings file per participant. This is the V1 methodology — exhaustive extraction covering behavioral findings and individual preferences alongside domain or design implications.

## Before You Start

Read `FindingsFormat.md` in the skill root. It contains:
- The exact file header format
- The exact finding structure (Statement / Evidence / Context / Signal type / Abductive flag)
- Signal type definitions
- What counts as a finding under the V1 scope
- Volume calibration by transcript length
- Abductive flag quality check

## Step 1: Locate the Transcripts and Confirm Domain

Confirm with the user:
- Where the transcript files are (full path)
- Whether a session field-note file exists (`FN_*` per `FieldNoteFormat.md`) — **optional companion input, never required**; a session without one is normal, not a defect. If present, list it with the transcript and confirm its `session:` field names this transcript. Also note any delivery-annotations inventory line in the L0 header
- **Exclude `DEBRIEF_*` files.** A researcher's spoken-debrief transcript is working material for the FN file, never a session transcript — it is never extracted as participant data, no matter where it sits
- Where to write the findings files (output directory)
- Whether this is a single transcript or a batch
- **Project domain:** brand/design | product/UX | organizational | policy/advocacy | other

List the files to confirm you have the right ones before reading anything.

The domain sets the implication framing for the entire extraction. Read `DomainScope.md` to confirm the decision-maker and implication questions for the stated domain before proceeding. Do not extract into an unconfirmed domain — canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.domain_scope_confirmation`.

**Data gate:** If no transcript files are provided or located at the stated path, stop here and ask. Do not proceed using general knowledge as a substitute for research data.

**Conversation transcripts (`_conversation.md` files):** If the input is a conversation-format L0 file from l0-transcribe-conversation, use the **Conversation Variant** in `FindingsFormat.md` (one findings file for the whole conversation; `source_type: conversation`; a `**Speaker:**` field on every finding) — and apply the Attribution Gate below before reading.

**Survey corpus files (`source_type: survey-corpus` in their frontmatter):** use the **Survey Variant** in `FindingsFormat.md` (one findings file per batch, from `l0-survey-corpus-prep`’s `_consolidation_log.md`; verbatim quotes cited by row ID; required Limits line). Skip Step 1b (no speakers) and replace Step 6’s volume check with the variant’s Row accounting. A raw export (.xlsx) is not an input: run `l0-survey-corpus-prep` first.

**Step 1b — Attribution Gate (conversation inputs AND Method D interview inputs):** Apply to every `_conversation.md` file, and to any interview `_transcript.md` file that carries `attribution_status:` in its frontmatter or contains `**Name?:**`/`**[Speaker]:**` markers in its body (a Method D diarized interview — extended 2026-07-01). Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.attribution_gate`.
1. Read the L0 file's YAML frontmatter.
2. If `attribution_status:` is present with **any value other than `resolved`** (`unresolved`, or anything else, such as `draft-needs-speaker-mapping`) → **STOP. Do not extract.** Report: "L0 file [filename] has unresolved speaker attribution (attribution_status: [value]). Resolve speaker labels in the L0 file before requesting L1 extraction." *(Fail closed on unknown values: 2026-09-30, found in the first outside install.)*
3. **If the field is absent, first check WHY.** If the file carries `attribution_method: qa-inference` (with its required `attribution_attested_by:`), the omission is **deliberate, not legacy** — see `l0-transcribe-interview/TranscriptFormat.md` → Attribution Provenance. Do NOT treat the absence as a clean bill: **copy both fields forward into the findings file and say in the extraction report that this transcript's speaker attribution was inferred from Q&A structure by the named attestor.** Then continue to the marker computation below, which still applies. This is provenance, not a gate — it never blocks extraction, and a marker-free file is not thereby verified: it means nobody marked anything, which on this path is exactly the case the provenance field exists to make visible.
4. If the field is **absent with no `attribution_method:`** (legacy L0 file) → compute it yourself: count `**[Speaker]:**` + `**[Unknown Speaker]:**` + `**Name?:**` turns against total turns; treat as `unresolved` (and stop) if > 40% or any `**[Unknown Speaker]:**`.
5. On a `resolved` file, still exclude individual `**[Speaker]:**` / `**[Unknown Speaker]:**` turns from extraction one turn at a time — build the excluded-turn list now and skip it in Pass 2. Every finding must attribute to a named speaker; a finding's `**Speaker:**` must never be `[Speaker]`/`[Unknown Speaker]`.

**Batch mode (multiple transcripts):** If processing more than one transcript, before beginning:
1. List all transcript files and confirm the set with the user. Pair FN files to transcripts by the shared `<name>_<date>` / `<topic-slug>_<date>` key; list unpaired transcripts and unpaired FN files explicitly. FN files are optional — sessions without one are normal; report FN coverage per file in the completion summary
2. Process one transcript at a time — complete all steps before starting the next
3. Report progress after each file: `[N/Total] L1_[Name]_[Date]_findings.md — [N] findings`
4. Write a combined completion summary at Step 8

## Step 2: Read Each Transcript — Two Passes

**Pass 1 — Shape pass (read without annotating):**
Get the overall arc of the conversation. Who is this person? What is their relationship with the brand, product, or domain? What was the emotional register of the conversation? What surprised you? If a field-note file exists, read it in this pass — its Observations and Photo Log are finding material of equal standing with the transcript (its Hunches and Off-Record sections are never evidence). Where the field note and the transcript disagree, do not resolve it: write the finding from the transcript, cite the FN entry in Context as a conflicting attestation, tag the finding `Contradiction`, and surface every such conflict in the Step 8 completion report for the researcher to adjudicate.

**Pass 2 — Extraction pass:**
Flag candidate moments using the signal types. Look for:

| Signal | What to look for |
|--------|-----------------|
| **Strong language** | Superlatives, emotional words, hedges — anything that signals intensity |
| **Specificity** | Named brands, exact prices, specific people, precise counts — the detail is the finding |
| **Surprise** | Behavior or belief that contradicts assumptions about this participant type |
| **Contradiction** | Says one thing, does another — or two things that don't add up |
| **Repetition** | Topic that surfaced more than once without prompting |
| **Resignation** | "That's just how it is" — adapted behavior masking an unmet need |
| **Delivery** | Only via the L0's delivery annotations or the field-note file — NEVER your own reading of the text (a faithful transcript of a joke reads as a claim) |

## Step 3: Draft Findings — V1 Scope

For each flagged moment, write a finding. Under the V1 method, extract BOTH:

**Behavioral / preference findings (capture all of these):**
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

**Domain implication findings (capture these too):**

Use the implication questions for the confirmed project domain from `DomainScope.md`. For brand/design: what purchase or adoption barrier does this reveal? What brand or product perception problem does this expose? What behavior points to an opportunity? What would the brand or product have to change to serve this person better?

Do not filter to only the high-inference moments. If it tells you something real and specific about this person, write the finding.

## Step 4: Write Each Finding

**Anti-fabrication rule:** Never construct a composite or approximate quote, and never invent specificity to reach the volume target. Evidence takes one of four peer classes with markers and source requirements (`FindingsFormat.md` → Evidence Classes): verbatim quote · `[paraphrased — no direct quote]` · `[observation — <researcher>, <source>]` (must cite an FN entry or L0 delivery annotation — never your inference, never anyone's memory) · `[photo — <file>, <photographer>, <consent tier>; <caption>]`.

**Source gate (halt, at drafting):** an observation-class, photo-class, or Delivery-signal finding candidate with no citable capture artifact (a specific FN entry or L0 delivery annotation) is **not written**. Stop on that candidate, report "candidate dropped — observation/Delivery with no capture artifact," and move on. Do not soften it into a paraphrase to keep it, and do not let the volume floor pressure it into existence. An observation marked `post-exchange` or `late-entry` carries that marker into the finding's Context and may not be the sole source for a finding that turns on what a single researcher independently noticed.

Use the format from `FindingsFormat.md`:

```
## Finding [N]: [Descriptive Title in Plain English]

**Speaker:** <conversation inputs only — Full Name from the L0 Speaker Key, trailing `?` if inferred; omit for interviews>

**Statement:** <Interpreted statement — grounded, specific, true for this participant>

**Evidence:** <one of the four evidence classes with its marker (FindingsFormat → Evidence Classes): verbatim quote · [paraphrased — no direct quote] · [observation — researcher, source] · [photo — file, photographer, consent tier; caption]>

**Context:** [Where in the session; what prompted it; volunteered or extracted]

**Signal type:** [Strong language / Specificity / Surprise / Contradiction / Repetition / Resignation / Delivery]

**Abductive flag:** [The question this finding forces. Not a recommendation. A question the project's key decision-maker can't ignore after reading this.]
```

**Abductive flag test:** If you could write the flag without having read the transcript, it's too generic. Make it specific to what this person said and did.

## Step 5: Write the File Header

Every file opens with a YAML frontmatter block, then a plain-text narrative header. Write both. **For conversation inputs, use the Conversation Variant frontmatter + title from `FindingsFormat.md`** (`participants:`/`speakers:`/`session_id:`/`attribution_status:`/`source_type: conversation`) instead of the interview block below.

```
---
participant: [Full Name]
role: <Brief role — participant type, key context, main product or experience>
date: [YYYY-MM-DD]
interview_type: [Customer / Near-purchaser / Dealer / Industry insider / Written Q&A / etc.]
location: [City, State/Country]
interviewers: [Name(s)]
synthesis_level: L1
extraction_date: [YYYY-MM-DD]
domain: [brand/design | product/UX | organizational | policy/advocacy | other]
field_notes: <yes | no — whether an FN file informed this extraction; visibility for L2, not a compliance mark>
---

# L1 Findings — [Participant Name]
**Interview date:** [date]
**Participant type:** [Customer / Near-purchaser / Dealer / Industry insider / Expert / etc.]
**Interview context:** [1-2 sentence description of who this person is, what they own or do, what makes them relevant to the research]
**Participant segment:** <Label: gender, location, archetype, 2-3 defining characteristics>
**Source:** `[L0_FirstName_LastName_YYYY-MM-DD_transcript.md]`
**Findings count:** [N]

---

**Notable absences:** [What you expected to hear that didn't come up. Name it and say why the silence matters.]

**Follow-up questions flagged:** [Questions this interview raised for the next session.]

---
```

## Step 6: Volume Check

**Survey Variant files:** skip this step; complete the Row accounting appendix instead (`FindingsFormat.md` → Survey Variant). Canonical: `../ladder-core/config/synthesis-gates.yaml` → `gates.volume_floor_l1`.

Before writing the file, check your count against the calibration:

| Transcript length | Target |
|-------------------|--------|
| 30–45 min | 15–20 |
| 45–60 min | 20–28 |
| 60–90 min | 25–35 |

If you're under the floor, go back and look for behavioral specifics you skipped. Choice logic, decision process, trust sources, workarounds, things rejected — these are findings.

If you're over the ceiling, check whether findings have slipped to L0 — raw quotes labeled as findings rather than interpreted claims. Consolidate adjacent findings that share the same interpretive claim. (See FindingsFormat.md over-ceiling check.)

**The scope is the standard, not the count.** Ask whether you've covered all V1 scope categories: what they own and why, what they rejected, how they decide, who they trust, what they've worked around, analogies they drew spontaneously, community participation, tools, lifestyle factors. A transcript under the count that covers every scope category passes. One at count drawn entirely from stated preferences — no workarounds, no rejection logic, no trust sources — fails. The count approximates scope coverage; it doesn't replace it. (See FindingsFormat.md volume calibration note.)

## Step 7: Write the Output File

Write to the specified output directory. File naming depends on `source_type`:

```
interview:    L1_[FirstName]_[LastName]_[YYYY-MM-DD]_findings.md
survey:       L1_Survey_[Batch-Slug]_[YYYY-MM-DD]_findings.md
conversation: L1_[Topic-Slug]_[YYYY-MM-DD]_conversation-findings.md
```

Examples: `L1_Dana_Cole_2026-04-28_findings.md` · `L1_Racing-Heritage-Panel_2026-06-04_conversation-findings.md` (one file for the whole conversation, not one per speaker).

## Step 8: Confirm Completion

When finished (single or batch), report:

```
[N] findings files written to [output directory]:
- L1_[FirstName]_[LastName]_[YYYY-MM-DD]_findings.md — [N] findings
- L1_[FirstName]_[LastName]_[YYYY-MM-DD]_findings.md — [N] findings
...
Total: [N] findings across [N] participants
```

Note any participants where a transcript was missing or unreadable.

---

## Quality Checks Before Writing

**For each finding:**
- [ ] Statement is interpreted, not a quote
- [ ] Evidence contains a direct quote or specific behavioral description
- [ ] Abductive flag raises a question, not a recommendation
- [ ] Abductive flag is specific to this participant, not generic

**For the file:**
- [ ] Delivery-signal and observation-class findings each cite their capture artifact (an FN entry or an L0 delivery annotation) — none rest on transcript inference or extractor memory; no finding cites the FN file's Hunches or Off-Record sections
- [ ] FN file (if present): pairs to this transcript by name key, its `session:` field matches, and `field_notes: yes` is set in the findings frontmatter (set `field_notes: no` otherwise — absence is normal); FN-vs-transcript conflicts are tagged `Contradiction` and listed in the completion report
- [ ] Conversation inputs: `attribution_status` gate passed; every finding has a `**Speaker:**` naming a real speaker (never `[Speaker]`/`[Unknown Speaker]`); `source_type: conversation` + `session_id` set
- [ ] Method D interview inputs: attribution gate passed (Step 1b); no finding extracted from a `**Name?:**`/`**[Speaker]:**` turn without the ambiguity noted
- [ ] Notable absences are named specifically (not "nothing stood out")
- [ ] Finding count matches the calibration for transcript length
- [ ] Both behavioral/preference findings and domain implication findings are present (per DomainScope.md)
- [ ] Header has all required fields
