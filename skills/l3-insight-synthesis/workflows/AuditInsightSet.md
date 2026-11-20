# AuditInsightSet Workflow

Quality-check a completed L3 insight set before it is used for L4 synthesis or stakeholder presentation. This workflow surfaces knowledge layer weaknesses, coverage gaps, compression failures, and synthesis statement problems.

## When to Use

After SynthesizeInsights is complete, before moving to L4 Opportunity Areas or sharing with stakeholders. Can also be used mid-synthesis to check a partial insight set.

---

## Inputs — required before any audit

You need four things: the set directory, the format file (`InsightFormat.md`), the project name, and **the directory holding the L2 themes the set was built from** (the insights' `source_themes:` name them). The dispatcher passes that directory, and the L1 findings directory as well (`../ladder-core/ladder-map.md` → Running a level audit). L1 is for targeted checks: quotes the set carries from L1, and claims about participants that the level below does not show. If it was not passed and cannot be found from the set's source fields, do not audit: return a report whose first line names the missing directory. Coverage and counter-evidence cannot be judged from the set alone.

**Run the first read first (Audit 3c).** Before the pre-pass and before you read the level below, open the set only to copy out its reader-facing text, and give that text to a separate reader. A reader who has seen the working files cannot do the first read.

**Run the pre-pass next, on every audit, whatever the size of the level below.** Run it from this skill's folder, the one that holds `workflows/`: the path that starts `../ladder-core/` resolves from there.

```bash
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts <set directory> <L2 themes directory> --also <L1 findings directory>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`. With `--also`, a quote found only in L1 is marked as such rather than not found. The pre-pass lists the themes no file in the set cites, citations that point at nothing, and quoted fragments not found in the source they cite. Its items are candidates, not verdicts: judge each one, and carry the real defects into the report as findings. Paste its Summary section into the report.

**Then read the level below.** Read every L2 theme file in full: pattern, abductive connection, evidence lists (counted, listed, counter-cases and bounds) and implication. A set of about 25 themes fits in one context. Use L1 for targeted checks, not a full read: the fragments the Trace fields paste from L1, any quote the pre-pass could not place in L2, and any participant claim an insight makes that its L2 themes do not show. Tracing the whole ladder down to L1 belongs to the capstone review (`FinalLadderReview`). The theme coverage, observation, What would change this and confirmation-risk audits below are built from this read.

**Read with a file-reading tool, not by printing files in a shell:** shell output is truncated, and a truncated read is a skim. **State what you read.** The report header carries this line, in exactly this form, which the gate checker reads: `**Inputs read:** <N> files, <M> items (L2 themes)`, followed by `— full read` or `— pre-pass candidates and cited items; not read: <what was not read>`.

---

## Step 0 — Deterministic Gate Check (mechanical, before the prose audit)

Run the zero-LLM gate checker against the project's synthesis directory:

```bash
bun ../ladder-core/scripts/synthesis-gates-check/check.ts <project synthesis dir>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`.

The checker reports on every set under the directory you give it. Disposition the results for the set being audited and the level below it; note the others in one line without auditing them. Disposition every HALT and WARN before the prose audit below — fix it, or carry it into the report as a named finding. Do not prose-audit artifacts that fail their mechanical gates. (A gate-7 `final_ladder_review: pending` WARN is expected before the capstone review — no action here.) On a first audit of a set, gate 8 warns that the set has no audit report, or none that has cleared. That is expected and is not a failed gate: this audit is what answers it. Note it in one line and go on; it clears when the report clears the set, or when an Addendum records the blocking fixes.

---

## The Seven Audits

Run all seven. Report findings for each.

**Domain awareness:** Confirm the project domain (from the L3 `domain:` frontmatter field, or ask). In Audit 2, verify each Knowledge layer drew from the body of theory appropriate to that domain — per `DomainScope.md`. A brand-strategy frame imported into an organizational or policy insight is a domain-coupling error: the insight may read well but lands with the wrong decision-maker. Flag any Knowledge layer whose theory base belongs to a different domain than the project's (unless its provenance is explicitly justified as a deliberate cross-domain borrow).

---

### Audit 1: Compression Check

Is the insight set actually compressing — or is it one insight per theme in disguise?

**Calculate the compression ratio:**
- Count L2 themes contributing to the set
- Count L3 insights
- Target ratio: 1.5–2 themes per insight (see InsightFormat.md volume calibration)

**If ratio is below 1.2:1** (nearly one insight per theme): You are probably writing at theme level. Check each insight — does it have a genuine knowledge layer, or is it restating the L2 pattern in a new register? If the latter, either merge insights or strengthen the knowledge layer.

**If ratio is above 3:1** (heavy compression): Check whether important behavioral territory is being collapsed. High compression can obscure important distinctions. Review whether any merged insight should be split.

---

### Audit 2: Knowledge Layer Quality

Does every insight have a genuine knowledge layer — something not in the research data?

For each insight, read only the Knowledge section in isolation. Ask:
- Does it name a principle or pattern from outside the research?
- Is it specific enough to be contestable?
- Would it be true in a different research context where the behavioral data was absent?
- Does it make the insight feel inevitable once read?

**Red flags:**
- Knowledge section restates the observation in different words
- Knowledge section names a principle so generic it applies everywhere ("trust matters in relationships")
- Knowledge section reads as commentary on the data, not interpretation from outside it
- Knowledge section could have been written without the research context

**Rewrite prompt for weak knowledge sections:** Ask "What does [relevant field] say about situations where [the structural mechanism identified in the observation] exists?" The answer is the blue card.

**Provenance sub-check — required for every Knowledge component:**

For each insight, identify the provenance of every claim in the Knowledge section. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.insight_knowledge_provenance`. Three categories:

- **(a) Cross-domain theory imported by the synthesist** — a named framework, principle, or model from outside the research, clearly labeled as synthesist knowledge. Correct form: "Carlzon's 'moments of truth' framework holds that frontline workers are the brand's primary experience designers..." `(inferred from synthesist reasoning)`
- **(b) Participant-observed pattern** — independently described by 3+ participants; can be stated as behavioral finding. Survey-sourced patterns count as (b) only with their label: "survey rows, independence [verified/assumed]", `[SURVEY-ONLY]` when the L2 theme carries it, and the L1 Limits line travelling with the insight. Correct form: "Three participants independently described the dealer as the moment where their decision solidified..."
- **(c) Participant-described analog or hypothesis** — one or two participants named an external model, competitor comparison, or causal analogy. Must be labeled explicitly as participant-described, not verified mechanism. Correct form: "One participant described the Alpina/Grand-Tour-champion relationship as an analogy for what race-win activation could look like..." NOT: "The Alpina flywheel demonstrates that..."

**Flag:** Any competitor model, industry transformation arc, or quantitative estimate that appears in K without explicit provenance is a Knowledge contamination risk. The V5 failure pattern: participant-described analogies (Alpina flywheel, Ardent transformation arc) stated as verified causal mechanisms; a single dealer's "90% conversion" estimate stated as a cross-participant benchmark. Provenance labeling determines how strongly the Knowledge component can support the insight claim — and how defensibly it survives client scrutiny.

---

### Audit 2b: Observation Layer Quality

Does the Observation component cite behavioral evidence that is sufficient, cross-participant, and categorically coherent?

For each insight, read only the Observation section in isolation. Apply three checks:

**Participant count:** Is the behavioral evidence cited from 3+ independently named participants? If fewer than 3, the Observation cannot support a cross-participant behavioral claim. Flag as: "Observation rests on [N] named participants — below the 3-source evidence floor; present as hypothesis rather than finding." *(Vocabulary note, 2026-07-31: "Observation" in this audit names the L3 yellow card, Kolko's sense — not L1's observation evidence class. When tracing evidence down the chain, a source theme resting on single-observer observation-class findings carries L2's `[HYPOTHESIS — single-observer corroboration]` hold, which this audit inherits.)*

**Categorical coherence:** Does the Observation bundle multiple phenomena under one causal frame? Test: would a designer address all elements of the Observation through the same type of intervention? If different elements require fundamentally different intervention types (e.g., organizational culture change vs. product engineering decisions), they are categorically distinct — bundling them under a shared label is an analytical move that requires explicit justification, not silent aggregation. *(V5 failure: price barriers, cultural signaling, geographic access, and terrain clearance bundled as "structural defaults" — terrain clearance is a product engineering constraint; the others are organizational behaviors. Different root causes, different owners, different lead times.)*

**Universality calibration:** Does the Observation use strength-of-claim language — "consistently," "systematically," "always," "most participants," quantitative percentages? Verify the evidence count supports the assertion. Two data points cannot carry "systematic." A single participant's estimate cannot carry "across the participant set." If the language is stronger than the evidence, either reduce the claim or add evidence.

**Red flags:**
- Observation cites fewer than 3 named participants but states a cross-participant behavioral claim
- Observation bundles phenomena with different root causes or different required interventions under one causal frame
- Observation contains universality language not supported by named evidence count
- Observation contains a quantitative claim traceable to one participant's estimate

---

### Audit 2c: Iceberg Depth Check

Does every insight reach the structure or mental model layer — or is it still living at the pattern layer (a theme in disguise)?

The Iceberg model (Meadows / Senge) maps the synthesis ladder's own depth problem:

| Iceberg layer | Synthesis equivalent | Diagnosis |
|---|---|---|
| **Events** | L1 Findings | Not synthesis |
| **Patterns** | L2 Themes | Not yet insight |
| **Structures** | The mechanism generating the pattern | Genuine L3 insight |
| **Mental Models** | The belief or paradigm creating the structure | Deepest L3 insight |

For each insight, identify which Iceberg layer it inhabits:

- **Pattern layer** ("Users do X" / "The organization tends to Y") — this is still a theme in a new register. The synthesis has not yet asked *why* the pattern exists or what generates it. Requires knowledge injection to reach structure.
- **Structure layer** ("X happens because the system is built to produce Y through Z mechanism") — genuine insight. Names the generating mechanism, not just the surface behavior.
- **Mental model layer** ("The underlying belief that makes this structure durable is...") — the deepest form of insight. Names the assumption or paradigm that makes the structure feel invisible or natural to participants.

**Red flags:**
- The Insight section names the behavior without naming the mechanism: "Dealers are the primary experience touchpoint" (pattern) vs. "The brand has not designed the dealer experience, so each dealer sets its own way of doing things" (structure). This check reads the Insight section. The title does not have to carry the mechanism.
- Knowledge section imports a framework but applies it to describe the pattern, not explain the generating mechanism
- Insight reads as a "this is true and important" statement without answering "and the reason it stays true is..."

**Note on depth:** Not every insight needs to reach the mental model layer. Structure-level insights are correct L3 outputs. The check is only that the insight has descended *past* the pattern layer — that it names a generating mechanism, not just a recurring behavior.

**Relationship to Knowledge Layer (Audit 2):** These checks are complementary. Audit 2 asks whether cross-domain knowledge was imported. Audit 2c asks whether that knowledge was applied at the right level of depth — an insight can have a genuine knowledge layer and still live at the pattern level if the knowledge was used to re-describe the pattern rather than explain what generates it.

---

### Audit 2d: Frame Origins Check

What interpretive frames were brought to the data before synthesis began — and are those frames genuinely required by the data, or inherited from convention?

This is the **inherited frame problem**: a synthesist reads behavioral patterns through a lens carried in from prior experience (industry convention, the client's own model, domain expertise, prior engagements) and produces insights that dress up a pre-existing assumption in new language rather than discovering what the data actually shows. An insight can pass the Knowledge Layer audit (a framework was imported), the Iceberg check (it reaches the structure layer), and the Confirmation Risk audit (it feels surprising) — and still be shaped by an inherited frame that determined which behavioral signals were prioritized before interpretation began.

This check is borrowed from FirstPrinciples reasoning — specifically the **Challenge** step: for every interpretive category, ask "is this a hard constraint (the data genuinely requires this frame) or a soft constraint (we chose this frame because it's conventional in this domain)?"

**Step 1: Surface the frames**

Before reading the insights, name the interpretive frames the team brought into the synthesis. These are the categories, vocabularies, and mental models that shaped how the research was read. Common sources:

- Prior engagements in this domain ("we always find that X")
- The client's own language and model of their problem
- Industry convention ("this is a brand positioning problem")
- The brief or research question framing ("we went in looking for X")
- The synthesist's own domain expertise and pattern library

Write them out explicitly: "We brought the following frames into this synthesis: [list]."

**Step 2: Classify each frame**

For each frame identified, classify it:

| Classification | Definition | Test |
|---|---|---|
| **Data-derived** | The data requires this interpretive category — the participants' own behavior, language, or stated model points to it independently | "Would a researcher from a different domain, given the same raw transcripts, arrive at this category?" |
| **Convention-derived** | The category is inherited from how this domain is conventionally discussed — it was available before the research began | "Was this category in the brief, the client's vocabulary, or the synthesist's prior knowledge before the fieldwork?" |

A convention-derived frame is not automatically wrong. Many inherited categories are correct — the data confirms them. The problem is when a convention-derived frame is **uncontested** — when it shaped which data got prioritized without that choice ever being examined.

**Step 3: Test insights against convention-derived frames**

For each insight whose organizing concept belongs primarily to a convention-derived frame, ask:

- Does the behavioral evidence in the Observation section independently support this category — or did the frame determine what evidence was selected?
- If you stripped the inherited frame label and read only the participant evidence, what category would emerge?
- Is the insight saying something the research showed, or something the frame predicted and the research didn't disprove?

**Red flags:**
- The insight's title or organizing concept uses vocabulary from the client's own brief or prior model
- The Observation section contains evidence that was selected because it fits the frame — evidence that contradicts the frame is absent
- The insight could have been written before the research was conducted, using the frame alone
- All insights use the same frame vocabulary, suggesting the frame determined the read rather than the data generating independent structure

**What to do with flagged insights:**

- **Reframe from the evidence:** Strip the inherited frame label. Read only the participant evidence. What category does the evidence itself suggest? Rewrite the insight using that category.
- **Retain with explicit provenance:** If the convention-derived frame is correct — the data confirms it — retain the insight but note: "Frame: inherited from [source]; confirmed by the data" in the insight's Context section.
- **Promote to team discussion:** In synthesis with a team, convention-derived frames are worth surfacing explicitly before insights are finalized. The team may have different frames; their intersection is where genuine synthesis lives.

**Note:** This check is epistemological, not adversarial. The goal is not to eliminate inherited knowledge — prior experience is part of what makes synthesis productive. The goal is to make the frames visible so they can be contested. An insight derived from a convention-derived frame that has been explicitly named and confirmed by the data is stronger than one that silently assumed the frame was neutral.

**Relationship to other audits:** Audit 7 (Confirmation Risk) asks whether the *conclusion* is already known. Audit 2d asks whether the *interpretive category* was inherited. These are different failures: Confirmation Risk catches insights that say what was expected; the Frame Origins Check catches insights shaped by frames that were never examined.

---

### Audit 3: Declarative Form

Is every insight stated as a declarative truth — not a question, label, or recommendation?

For each insight, check the title and the Insight section:
- [ ] Title is a plain statement: "Buyers judge the brand by how the dealer treats them, and the brand does not design or check that experience." ✓
- [ ] Title meets the plain-statement rules in `InsightFormat.md` → The Insight Title Test
- [ ] The Insight section and other text under the title meet `InsightFormat.md` → Plain Writing in the Body
- [ ] Not a question: "Is the dealer the brand's primary experience designer?" ✗
- [ ] Not a label: "Dealer Experience" ✗
- [ ] Not a recommendation: "The brand should invest in dealer experience design" ✗ (L4 territory)

**The pushback test:** Could a reasonable strategist push back on the claim? If it is inarguable, it may be a summary. A claim passes this test by being contestable, never by being striking; do not reward a phrase for sounding like a finding.

**Breadth is not overreach.** L3 is broader than L1 and L2 by nature. Do not flag a title or Insight section because it says "runners" where the themes say "these runners", or because it leaves out a count. Check it against the trace to participants. Flag it if the trace does not support it.

---

### Audit 3c: First Read

Can a reader with no project context understand the document on first read? The accuracy and traceability audits do not test this, and a set can pass all of them and still be unreadable.

**Who reads.** A separate reader: a person, or a fresh agent pinned to `sonnet`. Give the reader only the document's reader-facing text: titles, Insight sections, the tensions and the through-line. Do not give the reader working files, L2 themes or the rest of this audit. You may start the fresh agent yourself. If no separate reader is available, read that text yourself and say in the report that the first read was not clean, because you had already opened the set. Put the reader's list in the report word for word. Fill the brackets from the project and use the rest of this prompt word for word:

> This document reports [one line: what the research was and who it is for]. You are [the intended reader], reading it for the first time. You know [what that reader already knows, such as the category's brands and product terms]. First names are participants and codes in parentheses point to the evidence; ignore both. Read it once, in order. List only the sentences you could not follow on this read: (A) you cannot say in your own words what the sentence claims; (B) you can only work out what it means by decoding a figure of speech or a private term. Do not list a word you would simply look up, or something the next sentence explains. Do not judge whether the research is right. Do not suggest rewrites. For each, quote the sentence or phrase and give A or B. Your entire response IS the list, with nothing omitted. If there are none, respond with "None".

**Then ask where each clause comes from.** With the level below in hand, take each clause of each title and name the cited evidence behind it. A clause with no participant behind it is cut, or stays only if the Insight section labels it as the synthesist's reading. Theory imported in Knowledge is a common source of such clauses.

**Using the list.** The list is advice for the writer and the researcher. It is not a pass or fail, and its findings do not count against "Cleared for L4". The writer decides what to rewrite and rewrites from what the insight says, not by adjusting the words of the flagged sentence. The researcher ruled this on 2026-11-06, after a test in which the counts did not rank the texts and a blocking rule would have required 20 to 35 rulings per set. A clause with no participant behind it is different: it comes from the clause-source question and is an ordinary finding.

This audit does not replace the researcher's line-by-line read.

---

### Audit 3b: What Would Change This

Does every insight carry a **What would change this** section (`InsightFormat.md` → The What Would Change This Field), and does it do its job? The judgment is the auditor's, never the author's. It is a reading, not a score: there is no count, no majority vote and no fixture.

For each insight, check:

- **Specific.** Would this text fit any insight? A section that would survive the claim being reversed unchanged is decoration. Flag it.
- **Counter-cases.** Does part 1 match the counter-cases recorded in the cited L2 themes, and the counter-cases the insight's own Trace names? Flag any that bears on the claim and is left out.
- **Rival.** Is the rival a real competitor with its evidence stated, or a straw man set up to lose? Is the place where the rival fits better conceded?
- **Register.** Does part 3 carry a count, a percentage, "at least as often as", or a margin? If so, flag it and restate the pattern in words. A threshold set from a qualitative sample is false precision.

Verdict per insight: **fine**, or **flag** with the check it fails and a suggested rewrite. Absent sections are flagged as absent.

Record in the engagement ledger (`alexander-instrument-ledger.md`) only that the audit ran and how many insights were flagged. The removal rule is the researcher's judgment at the retrospective, not a rate (see `InsightFormat.md`).

*History: until 2026-11-03 this audit scored a Falsifier line real / weak / vacuous by majority of three blind Sonnet runs against a pinned prompt and a fixture. The researcher reshaped the field on 2026-11-03 because it was pushing qualitative synthesis toward quantitative testing. The scorer prompt, fixtures and runs are archived in the Alexander project (`2026-11-02_audit3b-recalibration/`, `2026-11-03_audit3b-falsifier-fixture-v2.md`, `2026-11-03_audit3b-v2-run/`).*

---

### Audit 4: Theme Coverage

Are all L2 themes accounted for?

Build a coverage map:
- List all L2 themes
- For each theme, note which L3 insight it contributes to
- Flag any theme with no contributing insight

**For uncovered themes, determine why:**
- *Too context-specific for L3 generalization:* Note it explicitly in the master document as additional context; flag for L4 consideration
- *Should merge into an existing insight:* Revise the insight to include it
- *Points to a missed insight:* Identify whether a genuine insight is missing

**Do not silently drop L2 themes.** Every theme that was written should be explicitly accounted for — either contributing to an insight or noted as not reaching L3 level.

---

### Audit 5: "What This Opens" Quality

Does every "What this opens" section name strategic territory without prescribing action?

For each insight, check that "What this opens" uses organizing frames rather than action verbs:
- Names a type of program, strategy, or design task — not a specific deliverable
- Could accommodate multiple different L4 solutions — it is not already an L4 opportunity area
- Is proportionate to the insight — the territory opened should be as large or small as the insight warrants

**Check for L4 bleed:** If "What this opens" reads like an L4 opportunity area already specified, the insight has done too much work. L3 opens territory; L4 defines the specific opportunity within that territory.

---

### Audit 6: Synthesis Statement Quality

Does the synthesis statement make a structural argument — or does it summarize the insights?

**Test 1 — The no-list test:** Can the synthesis statement be written without listing the insights? A synthesis statement that requires "L3-01 shows X, L3-02 shows Y, L3-03 shows Z..." is a summary, not a synthesis.

**Test 2 — The tension test:** Does the synthesis statement name the underlying structural tensions? Tensions are not the same as insights. The tension is the gap between what the organization has and what the strategy requires — revealed by two or more insights pointing at the same gap from different angles.

**Test 3 — The through-line test:** Is there a single sentence or two that names the central strategic condition all insights collectively diagnose? The through-line is the answer to: "Given everything these insights reveal, what is the one thing you most need to understand about this organization's strategic situation?"

**Test 4 — The plain heading test:** Is each tension's heading a plain statement that meets the title rules in `InsightFormat.md`? "Brands make claims buyers can't check" passes. "Claim against check" does not.

**Rewrite prompt for weak synthesis statements:**
- Replace "These insights reveal that..." with "The [organization] has [X] but has not built [Y]"
- Name the structural condition, not the list of findings
- End with the through-line claim that resolves the document

---

### Audit 7: Confirmation Risk

Does any insight merely confirm what the client or organization already suspected before the research was conducted?

For each insight, ask: **Would a knowledgeable observer in this client's industry have expected this finding before the research began?**

If yes: Does the research offer something beyond confirmation?
- **New behavioral mechanism** — the research shows *how* or *why* the pattern works, not just *that* it exists?
- **Specific participant evidence that changes actionability** — named people, specific moments, precise conditions that the organization couldn't have known without the research?
- **A reframe that contradicts the expected interpretation** — the data shows the mechanism is different from what was assumed, or the pattern operates differently than the prior model predicted?

**If the insight merely confirms prior hypothesis at the expected level of generality:** It has not earned L3 status. Options:
- **Make it specific:** name what the research showed that *wasn't* expected about this topic — the behavioral specificity, the unexpected mechanism, the named moment that reframes the prior model
- **Demote it:** note it as "confirms prior hypothesis — no behavioral reframe" and flag for the client as a confirmation rather than a discovery
- **Merge it:** if the confirmation belongs inside another insight as supporting evidence, absorb it rather than presenting it as a standalone synthesis output

**The highest confirmation risk pattern:** An insight that names a structural problem the client already has a solution for in mind. The research is then used to justify the solution rather than interrogate the assumption. *(V5 example: L3-01 "racing activation circuit incomplete" is what any marketing organization already suspects. The behavioral evidence — race viewers who cannot name the bike brand, no rise in dealer visits after a major win — is real and specific. But the explanation of why imports a competitor causal model as mechanism rather than testing the mechanism through participant behavior. The insight confirms the suspected conclusion and then dresses it in borrowed mechanism.)*

**Note:** Confirmation risk does not invalidate an insight. An insight that confirms a prior expectation *with specific, named behavioral evidence and a clear behavioral mechanism* is a good insight. Confirmation risk is only a problem when confirmation substitutes for analysis — the research provides new vocabulary for a known conclusion without adding behavioral mechanism or unexpected specificity.

---

**Discharge-sweep rule** — when a finding from this audit is discharged (fixed and closed), sweep for the same defect **shape** — not the same words — before closing. The sweep scope is every artifact derived from the ladder in the project tree: rungs above and below the fix, masters, standalone files, renders (.typ/.pdf), and presentation sources (deck scripts and exported decks). Record the sweep in the Addendum that records the fix. On a first audit nothing has been discharged, so the report field below reads "not applicable". Canonical: `FinalLadderReview.md` → Quality Checks Before Reporting. *(Corrected wording per the 2026-08-21 two-failure replay; adopted 2026-08-22.)*

## Audit Report Format

```
## L3 Insight Set Audit — [Project Name]

**Inputs read:** <N> files, <M> items (L2 themes) — <full read | pre-pass candidates and cited items; not read: …>

**Pre-pass summary:** <paste the pre-pass Summary section>

**Audited:** [N] insights from [N] L2 themes
**Compression ratio:** [N]:[1]
**Date:** [YYYY-MM-DD]

### Compression Check
<In range / over / under — with notes>

### Knowledge Layer Quality
<Insights with strong knowledge layers / insights needing revision — with specific recommendations>

**Observation Layer (2b):** <Participant count, categorical coherence, universality calibration — flags per insight>

**Iceberg Depth (2c):** <Pattern / Structure / Mental Model — per insight; flag any still at pattern layer>

**Frame Origins (2d):** [Frames surfaced; data-derived vs. convention-derived classification; insights flagged for reframe or provenance note]

### Declarative Form
<Any insights in wrong form — with rewrite recommendations>

### First Read (3c)
<Who read it, and whether it was a separate reader; each finding with the words quoted and what the writer did with it; clauses with no participant behind them; "None" if none>

### What Would Change This (3b)
<Per insight: fine, or flag with the failing check (specific / counter-cases / rival / register) and a suggested rewrite; absent sections named>

### Theme Coverage
[Themes accounted for / themes not reaching L3 / any missed insights flagged]

### "What This Opens" Quality
[Any L4 bleed / any sections needing reframing]

### Synthesis Statement
<Assessment: strong / needs revision — with specific rewrite recommendation if needed>

### Confirmation Risk
<Insights that confirm prior hypothesis without behavioral reframe — make specific / demote / merge recommendation per flagged insight>

### Recommended Actions
- Sweep run: <on a first audit, "not applicable: no finding discharged yet"; in an Addendum, after the fixes: scope searched · N further instances / none · instrument>
- **Blocking** — [Action 1]: <what the text claims that the level below does not support, or what a reader would act on wrongly>
- **Advisory** — [Action 2]: <wording, emphasis, a tighter phrasing; the claim stands>
...
*(Every action carries one of the two words. See Closing the Audit, below.)*

### Cleared for L4: <Yes / No — with condition if No>
```

## Closing the Audit — Severity and Stopping Rule

Every recommended action carries a severity. The auditor proposes it; the researcher rules on it.

- **Blocking:** the text claims something the level below does not support, or a reader would act on it wrongly. Fix in this version.
- **Advisory:** wording, emphasis, a tighter phrasing; the claim stands. Record as carried to the next version. Do not apply now: every edit is new text no reviewer has read, and applying advisories is what makes the next audit find new items.

After the blocking fixes:
- Record the fixes in an **Addendum** to this audit report: date, the edits made, who read them, and the discharge sweep run for each fix. The addendum is what clears the synthesis-gates staleness check (gate 8 compares the set's files with the modification time of the current report, which it picks by the date or version in the report's name). A new audit is not required.
- Do not re-run this audit on the fixed text. If the researcher wants an independent read of the fixes, run one bounded pass that reads only those edits. Where that pass blocks, the next step is the researcher's ruling on each item, not another pass.

Canonical statement and the record of the project it came from: `l5-framework-synthesis/workflows/FinalLadderReview.md` → Closing the Review — Stopping Rule.

*Why (2026-11-09):* on a client project's L5, five confirmation audits in two days (v1 to v1e) each blocked text the previous one had recommended, and the ladder review was re-run. A test on v1e's input (the live Opus 5.5 run, a fresh Opus 5.5 run, two Fable 5.1 runs, same brief, blind) agreed on one of the live run's three blocking items; the other two were advisory to every other reader. A fresh auditor's blocking count is one draw from a distribution, not a verdict. Record: `Alexander-Method-Prototypes/2026-11-09_audit-severity-model-test/`.

---

## Reminder: CopyEdit Before Advancing

Before moving to L4 or sharing with stakeholders, manually run a copy-edit pass (Medium level, research genre; the optional prose-craft companion skill's edit workflow, if installed) on the L3 output documents. Apply to the master insights document and all individual L3-XX insight files. **Supply the source corpus (participant roster, transcripts, provenance records) with the request** — with sources in context the pass verifies names, figures, and provenance claims against them; without sources it flags only internal inconsistencies, and a wrong-but-consistent attribution will pass. The pass also catches grammatical issues and style inconsistencies that accumulate during synthesis.

---

## Save the Audit Report

After completing the report, write it to the directory containing the audited insight files:

**Filename:** `L3_InsightSet_Audit_[ProjectName].md`
**Location:** Same directory as the audited insight files (e.g., `.../L3_Insights/`)

This keeps the audit co-located with the synthesis it audits and makes it available to the FinalLadderReview, which reads it to confirm per-level gates have cleared.
