# AuditOpportunityAreaSet Workflow

Quality-check a completed L4 Opportunity Area set before it is used for L5 synthesis or stakeholder presentation. This workflow surfaces HMW framing problems, sentences a first reader cannot follow, scope definition failures, insight coverage gaps, and relationship map weaknesses.

## When to Use

After SynthesizeOpportunityAreas is complete, before moving to L5 Design Principles or sharing with stakeholders. Can also be used mid-synthesis to check a partial OA set.

---

## Inputs — required before any audit

You need four things: the set directory, the format file (`OAFormat.md`), the project name, and **the directory holding the L3 insights the set was built from** (the files' `source_insights:` name them). The dispatcher passes that directory, and the L1 findings directory as well (`../ladder-core/ladder-map.md` → Running a level audit). L1 is for targeted checks: quotes the set carries from L1, and claims about participants that the level below does not show. If it was not passed and cannot be found from the set's source fields, do not audit: return a report whose first line names the missing directory. Coverage and counter-evidence cannot be judged from the set alone.

**Run the first read first (Audit 2b).** Before the pre-pass and before you read the level below, open the set only to copy out its reader-facing text, and give that text to a separate reader. A reader who has seen the working files cannot do the first read.

**Run the pre-pass next, on every audit, whatever the size of the level below.** Run it from this skill's folder, the one that holds `workflows/`: the path that starts `../ladder-core/` resolves from there.

```bash
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts <set directory> <L3 insights directory> --also <L1 findings directory>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`. With `--also`, a quote found only in L1 is marked as such rather than not found. The pre-pass lists the insights no file in the set cites, citations that point at nothing, and quoted fragments not found in the source they cite. Its items are candidates, not verdicts: judge each one, and carry the real defects into the report as findings. Paste its Summary section into the report.

**Then read the level below.** Read every L3 insight file in full: observation, knowledge, insight, What would change this and what it opens. The insight coverage and scope audits below are built from this read.

**Read with a file-reading tool, not by printing files in a shell:** shell output is truncated, and a truncated read is a skim. **State what you read.** The report header carries this line, in exactly this form, which the gate checker reads: `**Inputs read:** <N> files, <M> items (L3 insights)`, followed by `— full read` or `— pre-pass candidates and cited items; not read: <what was not read>`.

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

Run all seven, and Audit 2b (First Read) before anything else. Report findings for each. (Audit 7 is optional for non-systems work.)

**Domain awareness:** Confirm the project domain (from the L4 `domain:` frontmatter field, or ask). Check that each OA's `governs:` value is drawn from that domain's "Governs" vocabulary and that the relationship-map role names match the domain's register — per `DomainScope.md`. A brand/design "Governs" label (e.g. "Brand positioning") on an organizational or policy project is a domain-coupling error.

---

### Audit 1: Compression Check

Is the OA set compressing insights into genuine design territories — or is it one OA per insight in disguise?

**Calculate the compression ratio:**
- Count L3 insights contributing to the set
- Count L4 OAs
- Target ratio: 2–3 insights per OA (see OAFormat.md volume calibration)

**If ratio is below 1.5:1** (nearly one OA per insight): You are probably writing at insight level. Check each OA — does it represent a genuinely different design territory than its neighbors? If two OAs share overlapping scope items or draw on similar intervention types, they likely belong together.

**If ratio is above 4:1** (heavy compression): Check whether important design territory is being collapsed. Heavy compression can obscure the fact that two very different organizational capabilities or intervention types are being conflated. Review whether any OA should be split.

---

### Audit 2: HMW Quality

Does every HMW question frame a design territory — not a topic, not a solution?

For each OA, apply the two-axis test:
- *Open enough:* Would this HMW generate at least three genuinely different L5 solutions? List them mentally. If only one solution fits, the HMW is too narrow (it has already become a solution).
- *Specific enough:* Does the HMW exclude at least some interventions that would be plausible without it? If everything fits, the HMW is too broad (it is a topic area, not a design frame).

**Red flags:**
- HMW reads as a topic area: "How might we improve the brand experience?" (no structural constraint)
- HMW reads as a solution: "How might we create a community ambassador program?" (already decided what to build)
- HMW does not say what makes the challenge hard (structural constraint is absent)
- HMW built in the dash form ("How might we [do X] — [frame] — [constraint]?"), or carrying a figure of speech, a theory term or working vocabulary from the synthesis
- Multiple OAs could swap HMW questions without change to scope

**Plain-writing checks** (rules: `OAFormat.md` → The HMW Question Test, The OA title, and Plain Writing in the Body):
- [ ] Each HMW is one plain question that names what makes the challenge hard in literal words
- [ ] Each OA title is a plain statement of what would be true for the people served (not a label, a question or a recommendation), understandable without an explanation by a reader with no project context
- [ ] Why this matters, the scope sections, the guiding image, the relationship map and the system sentence meet Plain Writing in the Body; each L3 claim is stated as the L3 states it, not stronger or broader

**Rewrite prompt for weak HMW questions:** Ask "What makes this hard to design well?" and answer from Why this matters, in plain words, inside the question (one question, nothing after it): "...when today [the structural problem the evidence shows]?" or "...without [losing what the evidence says must be kept]?" Rewrite from the evidence; do not add a clause to the flagged question.

---

### Audit 2b: First Read

Can a reader with no project context understand the document on first read? The accuracy, coverage and scope audits do not test this, and a set can pass all of them and still be unreadable.

**Who reads.** A separate reader: a person, or a fresh agent pinned to `sonnet`. Give the reader only the document's reader-facing text: OA titles, HMW questions, Why this matters, the guiding image, the relationship map, the through-line and the system sentence. Do not give the reader working files, L3 insights or the rest of this audit. You may start the fresh agent yourself. If no separate reader is available, read that text yourself and say in the report that the first read was not clean, because you had already opened the set. Put the reader's list in the report word for word. Fill the brackets from the project and use the rest of this prompt word for word:

> This document reports [one line: what the research was and who it is for]. You are [the intended reader], reading it for the first time. You know [what that reader already knows, such as the category's brands and product terms]. First names are participants and codes in parentheses point to the evidence; ignore both. Read it once, in order. List only the sentences you could not follow on this read: (A) you cannot say in your own words what the sentence claims; (B) you can only work out what it means by decoding a figure of speech or a private term. Do not list a word you would simply look up, or something the next sentence explains. Do not judge whether the research is right. Do not suggest rewrites. For each, quote the sentence or phrase and give A or B. Your entire response IS the list, with nothing omitted. If there are none, respond with "None".

**Then ask where each clause comes from.** With the level below in hand, take each clause of each HMW question and each claim in Why this matters, and name the cited evidence behind it: the L3 insight, and the participant in L1 or L2 the insight rests on. A clause with no insight or participant behind it is cut, or stays only if the text labels it as the synthesist's reading. A structural constraint named in the HMW is a common source of such clauses.

**Using the list.** The list is advice for the writer and the researcher. It is not a pass or fail, and its findings do not count against "Cleared for L5". The writer decides what to rewrite and rewrites from what the evidence says, not by adjusting the words of the flagged sentence. The researcher ruled this for L2 and L3 on 2026-11-06, after a test in which the counts did not rank the texts and a blocking rule would have required 20 to 35 rulings per set, and on 2026-11-07 ruled that L4 and L5 follow the same rules. A clause with no evidence behind it is different: it comes from the clause-source question and is an ordinary finding.

This audit does not replace the researcher's line-by-line read.

---

### Audit 3: Scope Definition Quality

Does every "What's in scope" section name intervention types — not deliverables, not L5 principles?

For each OA, read each scope item in isolation:
- [ ] Is it a type of program, system, framework, or design task — not a specific deliverable?
- [ ] Is it specific enough that a designer could scope an initial project from it?
- [ ] Does it stay within this OA's territory — not bleeding into an adjacent OA?
- [ ] Is "What's not in scope" present and substantive?

**Red flags:**
- Scope items that are specific actions: "Hire an agency," "Train dealers," "Build a loyalty app"
- **Named programs or toolkits presented as scope items:** "Race-win dealer activation toolkit," "standardized test ride protocol," "hero colorway inventory as conversion strategy" — these sound like intervention types but are named deliverables with implicit design decisions already made. Test: could two designers on different teams build very different things and both claim to be addressing this scope item? If yes — it is a genuine scope item. If no — it has already become a deliverable specification.
- Scope items that name technology or vendor choices: "Use Salesforce for CRM," "Run on Instagram"
- Scope items that are L5 design principles rather than L4 intervention types: "Plan for the whole relationship, not only the sale"
- Missing "What's not in scope" section — or one that only says "everything else"
- Two OAs with overlapping scope items (the territory is not cleanly separated)

**For scope bleed between OAs:** Determine which OA owns the contested territory and revise the other OA's "What's not in scope" to exclude it explicitly.

---

### Audit 4: Insight Coverage

Are all L3 insights accounted for?

Build a coverage map:
- List all L3 insights
- For each, note whether it (a) drives an OA as a source insight, (b) appears in "Why this matters" as supporting evidence, or (c) has no OA contribution

**For uncovered insights, determine why:**
- *Belongs inside an existing OA:* Revise the OA's "Why this matters" to include it and add it to source insights if warranted
- *Points to missed OA territory:* Identify whether a genuine OA cluster was overlooked
- *Out of scope for this synthesis:* Note it explicitly in the master document as additional context; flag for the client's attention

**Do not silently drop L3 insights.** Every insight should be explicitly accounted for.

---

### Audit 5: Relationship Map Quality

Does the relationship map name genuine dependencies — or does it just describe each OA's general importance?

Test the map against three criteria:

**Test 1 — The dependency test:** For each OA relationship named, ask: "If [OA A] is absent, does [OA B] actually fail or become incoherent?" If the answer is "not really — B works fine without A," the dependency is not genuine and should not be named.

**Prerequisite vs. theme claim — distinguish before asserting:** Narrative or thematic connection ("insight A is conceptually upstream of insight B," "B requires A's answer to be meaningful") is NOT an operational prerequisite. A genuine prerequisite requires: name the specific deliverable, system, or organizational capability produced by OA-A that OA-B's work requires as an input before it can begin. If you cannot name that deliverable, the prerequisite claim is not operationally grounded.

*(Common false prerequisite pattern: fusing a funnel-plumbing problem and a brand-soul problem because they share vocabulary — "both involve narrative" — then asserting one must precede the other. Two OAs that share vocabulary but address different organizational jobs with different owners, different lead times, and different commercial stakes are not in a prerequisite relationship.)*

**Test 2 — The sequencing test:** Does the map name a logical sequence or priority? Preconditions should come before engines; engines before converters. If the map doesn't give a client a clear sense of where to start, it lacks sequencing force.

**Test 3 — The through-line test:** Is there a single sentence that names what all OAs together accomplish that none accomplishes alone? If the through-line is just a summary of the OAs, it is not a through-line — it is a list. The through-line should name the cumulative strategic outcome.

**Rewrite prompt for weak relationship maps:**
- Replace "OA-01 is important because..." with "Without OA-01, OA-02 and OA-03 risk [specific failure mode] because..."
- Name what breaks, not what matters
- End with: "Together, these [N] areas [accomplish specific strategic outcome] — which no single area produces alone."

---

### Audit 6: Platzgeist Check

Is every OA genuinely actionable given what this organization is and can do?

For each OA, ask:
- Does this OA require organizational capabilities the client currently has or can reasonably build within the engagement timeframe?
- Does this OA cross into commercial decisions (pricing strategy, distribution, ownership structure) that are outside the engagement scope?
- Does this OA require structural changes — product line expansion, regulatory, HR — with lead times longer than the strategy can address?

**If an OA fails the platzgeist check:**
- *Reframe the HMW:* Narrow the territory to what is immediately actionable, and name the broader aspiration as context
- *Separate structural from cultural:* If the OA mixes immediately actionable (cultural) and longer-term structural decisions, split the scope section into "Immediate" and "Longer term"
- *Name the prerequisite:* If the OA requires an organizational prerequisite that doesn't yet exist, name it explicitly in "What's not in scope" and note what needs to change before this territory can be entered

---

### Audit 7: Leverage Point Quality *(optional — recommended for systems-level or organizational strategy work)*

Is this OA targeting a high-leverage point in the system — or is it addressing a parameter when a structural change is available?

Meadows' 12 leverage points (ordered weakest → strongest) give a principled vocabulary for evaluating how deeply an OA intervenes in the system: `[model knowledge — verify — no Meadows note in the author's reference library; the band groupings below are accurate to the published list]`

| Lever strength | Meadows level | What changes |
|---|---|---|
| **Low** | 12–10 | Parameters, buffers, physical structure |
| **Moderate** | 9–7 | Delays, negative feedback loops, positive feedback loops |
| **High** | 6–5 | Information flows, rules of the system |
| **Very high** | 4–3 | Self-organization, goals of the system |
| **Highest** | 2–1 | Paradigms, transcending paradigms |

For each OA, identify the Meadows level it primarily targets. Flag any OA that targets LP 10–12 (parameters, buffers, structure) when a higher-leverage version of the same territory is plausible.

**This is a quality lens, not a rejection criterion.** Some design problems legitimately live at the parameter level — UX improvements, workflow simplifications, communication clarity. The audit flags low-leverage OAs so the team can make a conscious choice rather than defaulting to the most visible intervention.

**The reframing prompt:** If an OA is targeting LP 12 (parameters) — ask "What rule, information flow, or goal produces the condition this OA is trying to address?" The answer is a higher-leverage version of the same territory.

**Example:** An OA targeting "improve dealer onboarding materials" (LP 12 — parameters) may be reframeable as "give dealers visibility into which of their behaviors convert trial riders to buyers" (LP 6 — information flows) or "change the brand's definition of dealer success from unit volume to customer relationship health" (LP 3 — goals). Same territory; different lever.

**Resistance scales with leverage.** High-leverage OAs (LP 1–5) face more organizational resistance because they threaten existing power structures and beliefs. Name this explicitly when flagging high-leverage OAs — the client needs to understand what they're signing up for.

---

**Discharge-sweep rule** — when a finding from this audit is discharged (fixed and closed), sweep for the same defect **shape** — not the same words — before closing. The sweep scope is every artifact derived from the ladder in the project tree: rungs above and below the fix, masters, standalone files, renders (.typ/.pdf), and presentation sources (deck scripts and exported decks). Record the sweep in the Addendum that records the fix. On a first audit nothing has been discharged, so the report field below reads "not applicable". Canonical: `FinalLadderReview.md` → Quality Checks Before Reporting. *(Corrected wording per the 2026-08-21 two-failure replay; adopted 2026-08-22.)*

## Audit Report Format

```
## L4 Opportunity Area Set Audit — [Project Name]

**Inputs read:** <N> files, <M> items (L3 insights) — <full read | pre-pass candidates and cited items; not read: …>

**Pre-pass summary:** <paste the pre-pass Summary section>

**Audited:** [N] OAs from [N] L3 insights
**Compression ratio:** [N]:[1]
**Date:** [YYYY-MM-DD]

### Compression Check
<In range / over / under — with notes>

### HMW Quality
<OAs with strong HMW questions / OAs needing revision — with specific rewrite recommendations; plain-writing check results>

### First Read (2b)
<Who read it, and whether it was a separate reader; each finding with the words quoted and what the writer did with it; clauses with no evidence behind them; "None" if none>

### Scope Definition Quality
[Scope items flagged for being deliverables or L5 / any scope bleed between OAs / any missing "What's not in scope"]

### Insight Coverage
[Insights accounted for / insights not reaching L4 / any missed OA territory flagged]

### Relationship Map Quality
<Assessment: strong / needs revision — with specific rewrite recommendation if needed>

### Platzgeist Check
[OAs that are fully actionable / OAs that need reframing or scoping adjustment]

### Leverage Point Quality *(if applicable)*
[Meadows level per OA; any OAs flagged for targeting low-leverage parameters when a structural reframe is available; resistance notes for high-leverage OAs]

### Recommended Actions
- Sweep run: <on a first audit, "not applicable: no finding discharged yet"; in an Addendum, after the fixes: scope searched · N further instances / none · instrument>
- **Blocking** — [Action 1]: <what the text claims that the level below does not support, or what a reader would act on wrongly>
- **Advisory** — [Action 2]: <wording, emphasis, a tighter phrasing; the claim stands>
...
*(Every action carries one of the two words. See Closing the Audit, below.)*

### Cleared for L5: <Yes / No — with condition if No>
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

Before moving to L5 or sharing with stakeholders, manually run a copy-edit pass (Medium level, research genre; the optional prose-craft companion skill's edit workflow, if installed) on the L4 Opportunity Area documents. Apply to the master OA document and all individual OA-XX files. **Supply the source corpus (participant roster, transcripts, figure sources) with the request** — with sources in context the pass verifies names, shop names, and figures against them; without sources it flags only internal inconsistencies, and a wrong-but-consistent attribution will pass. The pass also catches grammatical issues and style inconsistencies that accumulate during synthesis.

---

## Save the Audit Report

After completing the report, write it to the directory containing the audited opportunity area files:

**Filename:** `L4_OpportunityAreaSet_Audit_[ProjectName].md`
**Location:** Same directory as the audited OA files (e.g., `.../L4_Opportunity_Areas/`)

This keeps the audit co-located with the synthesis it audits and makes it available to the FinalLadderReview, which reads it to confirm per-level gates have cleared.
