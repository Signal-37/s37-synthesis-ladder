# AuditFramework Workflow

Quality-check a completed L5 Framework before stakeholder presentation or delivery. This workflow surfaces the most common L5 failure — a framework that is actually an L4 summary — as well as pairing logic failures, weak systems arguments, and unusable decision filters.

## When to Use

After SynthesizeFramework is complete, before delivery. Can also be used mid-synthesis to check a partial framework.

---

## Inputs — required before any audit

You need four things: the set directory, the format file (`FrameworkFormat.md`), the project name, and **the directory holding the L4 sets the set was built from** (the framework's `source:` line names the opportunity-area and principle documents; give the directory or directories that hold them). The dispatcher passes that directory (`../ladder-core/ladder-map.md` → Running a level audit). If it was not passed and cannot be found from the set's source fields, do not audit: return a report whose first line names the missing directory. Coverage and counter-evidence cannot be judged from the set alone.

**Run the first read first (Audit 2b).** Before the pre-pass and before you read the level below, open the set only to copy out its reader-facing text, and give that text to a separate reader. A reader who has seen the working files cannot do the first read.

**Run the pre-pass next, on every audit, whatever the size of the level below.** Run it from this skill's folder, the one that holds `workflows/`: the path that starts `../ladder-core/` resolves from there.

```bash
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts <set directory> <L4 sets directory> --also <L4 value-proposition directory> --also <L4 archetype directory> --also <L3 insights directory>
```

Add an `--also` for each L4 family the framework draws on that exists (a framework quotes value-proposition statements and archetype names, and sometimes L3 insights); a quote found only there is marked as such. If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`. The pre-pass lists the opportunity areas and principles no file in the set cites, citations that point at nothing, and quoted fragments not found in the source they cite. Its items are candidates, not verdicts: judge each one, and carry the real defects into the report as findings. Paste its Summary section into the report.

**Then read the level below.** Read every opportunity area and every principle in full. The integration, pairing and adequacy audits below are built from this read: a domain that only reproduces its OA cannot be judged without the OA in hand.

**Read with a file-reading tool, not by printing files in a shell:** shell output is truncated, and a truncated read is a skim. **State what you read.** The report header carries this line, in exactly this form, which the gate checker reads: `**Inputs read:** <N> files, <M> items (L4 sets)`, followed by `— full read` or `— pre-pass candidates and cited items; not read: <what was not read>`.

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

Run all seven, plus Audit 2b (First Read), which runs first. Report findings for each.

**Domain awareness:** Confirm the project domain (from the L5 `domain:` frontmatter field, or ask). In Audit 4, check that the systems-logic role names use that domain's register — per `DomainScope.md` — and match the register the OAs used in the L4 relationship map. A brand/growth role label ("Growth engine," "advocates become seeders") on an organizational or policy framework is a domain-coupling error even if the dependency argument is sound. Also confirm `domain:` is present in the framework and visual frontmatter (propagation from L4).

---

### Audit 1: Integration Check

Is this a framework — or an organized L4 summary?

This is the most important audit at L5. The failure mode is common: a document that lists OAs and Principles organized into groups, with domain names placed above them like section headers. This is not a framework — it is an L4 summary with new formatting.

**The integration test — four questions:**

1. *Does each domain have a name that is neither the OA title nor the Principle title?* If "Community-Led Growth Architecture" (OA title) or "Invest Where Conviction Forms" (Principle title) appear as domain names, the domain has not been named — it has been relabeled.

2. *Does "The strategic task" make an argument — or list programs?* A strategic task that says "This domain includes community mapping, rider seeding, World Tour activation, and women's team amplification" is restating the OA's scope. A strategic task that argues why this domain is necessary and what structural problem it addresses is doing L5 synthesis.

3. *Does the systems logic name dependencies that weren't visible in the L4 outputs?* An OA set has a relationship map, but the OA relationship map describes how OAs relate to each other. The L5 systems logic names how domains relate — which includes but is not limited to the OA relationship map. The sequencing argument should name new architectural knowledge.

4. *Does "What this domain governs" include evidence that wasn't in the L4 files?* A domain content section that only reproduces the OA's scope items has not enriched the OA — it has repeated it. The L5 domain section should name specific participants, quotes, historical precedents, forward references, and iteration 2+ findings not present in the L4 OA.

**If the framework fails the integration test:** Flag each failure specifically and recommend the revision that would transform the summary into synthesis.

---

### Audit 2: Domain Naming Quality

Does every name and descriptor pass the naming test in `FrameworkFormat.md` → Plain Writing (statements and names) and Domain Naming Discipline?

For each domain name, and for the framework name:
- [ ] Short — 1–2 words for a domain, not a phrase
- [ ] Plain — a reader with no project context can say what it covers on first read, without explanation
- [ ] Literal — no figure of speech, coined term or clever contrast
- [ ] Not the OA title
- [ ] Not the Principle title
- [ ] Distinct from other domain names

Do not test whether a name is easy to recall. A recall test rewards cleverness (the researcher, 2026-11-07).

For each domain descriptor:
- [ ] One line — not a paragraph
- [ ] A plain statement of what the domain is for — not a slogan, a command or a pair of imperatives
- [ ] Consistent with but not identical to the Principle title
- [ ] Functions as a standalone sentence

**Red flags:**
- Domain name is a compound noun phrase (more than 3 words)
- Domain name could apply to any organization in any industry
- Two domain names are interchangeable without reading the full domain
- Descriptor restates the OA title or the Principle title as a slogan
- Name or descriptor needs the domain section to be understood

**Plain writing in the statements.** Check the strategic premise, the framework paragraph, each strategic task, What this domain governs, What would change this, the systems logic, the three uses, The Refusal, and the framework question and answer against `FrameworkFormat.md` → Plain Writing (statements and names), which applies the L3 rules (`../l3-insight-synthesis/InsightFormat.md` → The Insight Title Test and Plain Writing in the Body) unchanged. Flag a sentence written to be quoted, a figure of speech, working shorthand, a limit packed into the sentence it limits, and a closing line that sounds like a tagline rather than stating what the organization commits to. Recommend a rewrite from what the section says, not an edit of the flagged words.

---

### Audit 2b: First Read

Can a reader with no project context understand the framework on first read? The integration, pairing and systems audits do not test this, and a framework can pass all of them and still be unreadable.

**Who reads.** A separate reader: a person, or a fresh agent pinned to `sonnet`. Give the reader only the framework's reader-facing text: the framework name, the strategic premise, each domain's name, descriptor and strategic task, the systems logic, the three uses, The Refusal, and the framework question and answer. Do not give the reader working files, L4 sets or the rest of this audit. You may start the fresh agent yourself. If no separate reader is available, read that text yourself and say in the report that the first read was not clean, because you had already opened the set. Put the reader's list in the report word for word. Fill the brackets from the project and use the rest of this prompt word for word:

> This document reports [one line: what the research was and who it is for]. You are [the intended reader], reading it for the first time. You know [what that reader already knows, such as the category's brands and product terms]. First names are participants and codes in parentheses point to the evidence; ignore both. Read it once, in order. List only the sentences you could not follow on this read: (A) you cannot say in your own words what the sentence claims; (B) you can only work out what it means by decoding a figure of speech or a private term. Do not list a word you would simply look up, or something the next sentence explains. Do not judge whether the research is right. Do not suggest rewrites. For each, quote the sentence or phrase and give A or B. Your entire response IS the list, with nothing omitted. If there are none, respond with "None".

**Then ask where each clause comes from.** With the level below in hand, take each clause of each domain descriptor and strategic task, and of the framework answer, and name the cited OA, Principle or insight behind it. A clause with nothing behind it is cut, or stays only if the text labels it as the synthesist's reading.

**Using the list.** The list is advice for the writer and the researcher. It is not a pass or fail, and its findings do not count against "Synthesis complete". The writer decides what to rewrite and rewrites from what the section says, not by adjusting the words of the flagged sentence. The researcher ruled this for L2 and L3 on 2026-11-06, after a test in which the counts did not rank the texts, and extended it to L5 on 2026-11-07. A clause with nothing behind it is different: it comes from the clause-source question and is an ordinary finding.

This audit does not replace the researcher's line-by-line read.

---

### Audit 3: Pairing Logic Quality

Does each OA have a genuinely governing Principle — not just a nearby one?

For each pairing:
1. Read the Principle's test question (from "How to apply it")
2. Apply it mentally to three scope items in the OA
3. Does the test question yield a directional answer for each?

If yes → the pairing is genuine.
If "it depends" for most items → the Principle is not governing this OA; it is adjacent to it.

**Also check:**
- Are there OAs with no governing Principle? (Unlikely if L4 was well-executed, but flag if present)
- Are there Principles that don't govern any OA primarily? (May be secondary constraints across several — valid if named explicitly)
- Are there domains with two governing Principles where one would suffice? (Check whether the two Principles are genuinely governing different decision moments, or whether they are covering the same moment with slight variation)

---

### Audit 4: Systems Logic Quality

Does the systems logic name genuine architecture — or repeat the OA relationship map?

**Test 1 — The dependency argument:** For each named dependency ("Identity is the precondition"), ask: "Is the argument specific?" A specific argument names exactly what fails or becomes incoherent when the domain is absent. "Without Identity, no other domain has direction" is specific enough if followed by: "the dealer experience, the growth investment, and the community design all require a shared brand principle to build from — without it, each domain optimizes independently toward an incoherent whole."

**Test 2 — The feedback loop test:** Is there a named feedback mechanism? A framework without a feedback loop describes a one-way flow — a sequence, not a system. The feedback loop is what makes the framework a system with a flywheel. Check that it is named explicitly: what downstream output feeds back into which upstream input, and why?

**Test 3 — The parallel operation test:** If two domains run in parallel (mutually enabling), is the bidirectional relationship named and explained? "Growth and Access are mutually enabling" requires the explanation: "Growth needs Access to know which communities to seed; Access needs Growth's community investment to create the conditions for welcome."

**Test 4 — The sequence test:** Does the numbered sequence explain WHY each domain occupies its position — not just name the order? A sequence that says "1. Identity 2. Growth 3. Experience 4. Access" without argument is an ordering, not a systems logic.

---

### Audit 5: Three Uses Quality

Are the three uses written specifically enough to be operational?

**Strategy brief:** Does it name the priority order for actually doing the work? Does it name which domains run in parallel versus sequentially? Is it specific to this project, or could it apply to any framework?

**Decision filter:** Are the diagnostic questions in quotation marks, and written as plain questions a decision-maker would ask without the framework in hand? Does each question have a clear directional answer when the framework is being honored? Could a decision-maker ask this question in a real meeting about a real program? If any question is answered "it depends" without further clarification, it is too abstract.

**Measurement frame:** Is each metric named as the alternative to a default the organization currently uses? Is the alternative specific enough to measure? "Advocacy rate" is measurable; "community impact" is not. "Dealer narrative consistency" measured via mystery shop is measurable; "dealer quality" is not.

---

### Audit 6: Visual Document Quality

Does the Mermaid diagram accurately represent the systems logic?

Check that:
- [ ] All domains are represented as nodes
- [ ] Node content matches: domain name, principle phrase, what it does, each OA and principle by short name with its code beside it, role label
- [ ] No OA or principle appears on any diagram (Mermaid, ASCII or other rendering) as a code alone
- [ ] Directional arrows match the systems logic sequence
- [ ] Bidirectional arrow is present for parallel/mutually-enabling domains
- [ ] Feedback loop arrow is present (typically dashed) with a label
- [ ] Color coding is distinct per domain
- [ ] The "How to read the diagram" section matches the systems logic from the framework document
- [ ] Three version options are noted in the visual notes file (minimal / reference-complete / narrative-annotated)

**The visual test:** If a client saw only the diagram (without reading the framework document), would they understand the systems logic — the sequence, the feedback loop, the parallel operation? If the diagram requires the surrounding text to be interpretable, add labels.

---

### Audit 7: Adequacy Check

Is this framework adequate — or is it trying to be comprehensive?

The most important framework attribute is not comprehensiveness but adequacy: as architecturally complex as it needs to be, no more. A framework that tries to incorporate every OA and every nuance becomes unwieldy and unactionable. The test is whether each domain is *essential* — whether removing it would cause something emergent to collapse.

**The adequacy test — three questions:**

1. *Could any domain be removed without losing something that matters?* Read each domain in turn and ask: if this domain did not exist in the framework, what would break? If the honest answer is "the other domains would largely still cohere" or "this is covered indirectly elsewhere," the domain is additive, not essential. Additive domains weaken the architecture by diluting the system logic.

2. *Does each domain contribute an emergent quality that isn't present in its OA and Principle in isolation?* A domain should produce something architecturally new — a systems role, a named dependency, or a strategic task that argues necessity. If the domain section only restates the OA's scope and the Principle's test question, the pairing hasn't produced emergence; it has produced an organized restatement.

3. *Is the framework's complexity appropriate to the organization's actual capacity to act?* A framework with five or six domains may be architecturally coherent but organizationally inactionable — no client runs five initiatives in parallel at the same depth. Adequacy is always relative to the platzgeist: what is achievable given what the organization can actually sustain. A framework that is adequate in theory but not in practice has misjudged the adequate.

**What would change this mirror (reads with question 1):** each domain's **What would change this** section is read against this audit's removal counterfactual. A domain that cannot name its counter-cases or a real rival cannot answer "what would break," and that is evidence on both questions at once. Judge each domain as at L3 Audit 3b, with no score: *specific* (would this text fit any domain?), *counter-cases* (are the awkward insights and OAs the real ones?), *rival* (a real competing architecture, or a straw man?), *register* (any count, percentage or threshold in the revise part?). Verdict per domain: fine, or flag with the failing check and a rewrite. Record in the engagement ledger (`alexander-instrument-ledger.md`) only that the check ran and how many domains were flagged; the removal rule is the researcher's retrospective judgment (`l3-insight-synthesis/InsightFormat.md`).

**If the framework fails the adequacy test:**
- For additive domains: determine whether the OA's insights belong inside an existing domain's "What this domain governs" section rather than as a standalone domain — and revise accordingly
- For domains that lack emergence: return to the pairing — either the Principle doesn't genuinely govern the OA, or the domain synthesis is incomplete
- For frameworks that exceed organizational capacity: make phasing explicit in the strategic premise — name which domains are Iteration 1 vs. Iteration 2, and argue the sequencing; this converts an overwhelming framework into a roadmap

---

**Discharge-sweep rule** — when a finding from this audit is discharged (fixed and closed), sweep for the same defect **shape** — not the same words — before closing. The sweep scope is every artifact derived from the ladder in the project tree: rungs above and below the fix, masters, standalone files, renders (.typ/.pdf), and presentation sources (deck scripts and exported decks). Record the sweep in the Addendum that records the fix. On a first audit nothing has been discharged, so the report field below reads "not applicable". Canonical: `FinalLadderReview.md` → Quality Checks Before Reporting. *(Corrected wording per the 2026-08-21 two-failure replay; adopted 2026-08-22.)*

## Audit Report Format

```
## L5 Framework Audit — [Project Name]

**Inputs read:** <N> files, <M> items (L4 sets) — <full read | pre-pass candidates and cited items; not read: …>

**Pre-pass summary:** <paste the pre-pass Summary section>

**Audited:** [N] domains from [N] OAs and [N] Principles
**Date:** [YYYY-MM-DD]

### Integration Check
<Framework / L4 summary — with specific flags if summary; recommendation for revision>

### Domain Naming Quality
<Domains with plain names and descriptors / those needing revision — with specific rewrite recommendations; the framework name; plain-writing flags in the statements>

### First Read (2b)
<Who read it, and whether it was a separate reader; each finding with the words quoted and what the writer did with it; clauses with nothing behind them; "None" if none>

### Pairing Logic Quality
<Pairings that are genuine / pairings that are adjacent-but-not-governing — with recommendations>

### Systems Logic Quality
<Tests passed: dependency / feedback / parallel / sequence — with specific revision recommendations for any that fail>

### Three Uses Quality
<Strategy brief / Decision filter / Measurement frame — specific flags and rewrite recommendations>

### Visual Document Quality
<Accurate / inaccurate — specific flags>

### Adequacy Check
<Adequate / over-built — flag any additive domains, emergence failures, or capacity mismatches; note phasing recommendation if warranted>

### Recommended Actions
- Sweep run: <on a first audit, "not applicable: no finding discharged yet"; in an Addendum, after the fixes: scope searched · N further instances / none · instrument>
- **Blocking** — [Action 1]: <what the text claims that the level below does not support, or what a reader would act on wrongly>
- **Advisory** — [Action 2]: <wording, emphasis, a tighter phrasing; the claim stands>
...
*(Every action carries one of the two words. See Closing the Audit, below.)*

### Synthesis complete: <Yes / No — with condition if No>
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

## Reminder: CopyEdit Before Delivery

Before stakeholder presentation or delivery, manually run a copy-edit pass (Medium level, research genre; the optional prose-craft companion skill's edit workflow, if installed) on the L5 Framework documents. Apply to the master framework document and the visual document. **Supply the source corpus (participant roster, transcripts, provenance records) with the request** — with sources in context the pass verifies names, figures, and provenance claims against them; without sources it flags only internal inconsistencies, and a wrong-but-consistent attribution will pass. The pass also catches version number inconsistencies, grammatical issues, and style inconsistencies that accumulate across the full synthesis ladder and concentrate in the framework document.

---

## Save the Audit Report

After completing the report, write it to the directory containing the audited framework files:

**Filename:** `L5_Framework_Audit_[version].md`  *(e.g., `L5_Framework_Audit_v1.md`; use the version tag of the specific framework document audited)*
**Location:** Same directory as the audited framework files (e.g., `.../L5_Framework/`)

This keeps the audit co-located with the synthesis it audits and makes it available to the FinalLadderReview, which reads it to confirm per-level gates have cleared before running the cross-level pass.
