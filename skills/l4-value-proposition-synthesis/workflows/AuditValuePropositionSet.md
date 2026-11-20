# AuditValuePropositionSet Workflow

Quality-check a completed VP set before advancing to L5 or delivering to a client. Issues a "Cleared for L5" or "Not cleared — revise" verdict.

## When to run this audit

Run after `SynthesizeValuePropositions` has produced a complete VP set and before:
- Advancing to l5-framework-synthesis
- Delivering the VP document to a client
- Using the VP set as input to concept design

---

## Step 0 — Deterministic Gate Check (mechanical, before the prose audit)

Run the zero-LLM gate checker against the project's synthesis directory:

```bash
bun ../ladder-core/scripts/synthesis-gates-check/check.ts <project synthesis dir>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`.

The checker reports on every set under the directory you give it. Disposition the results for the set being audited and the level below it; note the others in one line without auditing them. Disposition every HALT and WARN before the prose audit below — fix it, or carry it into the report as a named finding. Do not prose-audit artifacts that fail their mechanical gates. (A gate-7 `final_ladder_review: pending` WARN is expected before the capstone review — no action here.) On a first audit of a set, gate 8 warns that the set has no audit report, or none that has cleared. That is expected and is not a failed gate: this audit is what answers it. Note it in one line and go on; it clears when the report clears the set, or when an Addendum records the blocking fixes.

---

## Step 1: Read the VP Files

Read the master VP document and all individual VP files. Read them fully. If they do not exist at the stated path, do not audit: return a report whose first line names what is missing.

**The level below is required too:** the directory holding the L3 insights the set was built from (the files' `source_insights:` name them). The dispatcher passes it, and the L1 findings directory as well (`../ladder-core/ladder-map.md` → Running a level audit). L1 is for targeted checks: quotes the set carries from L1, and claims about participants that the level below does not show. If it was not passed and cannot be found from the source fields, stop the same way.

**Run the first read first (First Read, below).** Before the pre-pass and before you read the level below, open the set only to copy out its reader-facing text, and give that text to a separate reader. A reader who has seen the working files cannot do the first read.

**Run the pre-pass next, on every audit, whatever the size of the level below.** Run it from this skill's folder, the one that holds `workflows/`: the path that starts `../ladder-core/` resolves from there.

```bash
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts <set directory> <L3 insights directory> --also <L1 findings directory>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`. With `--also`, a quote found only in L1 is marked as such rather than not found. The pre-pass lists the insights no file in the set cites, citations that point at nothing, and quoted fragments not found in the source they cite. Its items are candidates, not verdicts: judge each one, and carry the real defects into the report as findings. Paste its Summary section into the report.

**Then read the level below.** Read every L3 insight file in full: observation, knowledge, insight, What would change this and what it opens. The customer-profile and L3-coverage audits below are built from this read.

**Read with a file-reading tool, not by printing files in a shell:** shell output is truncated, and a truncated read is a skim. **State what you read.** The report header carries this line, in exactly this form, which the gate checker reads: `**Inputs read:** <N> files, <M> items (L3 insights)`, followed by `— full read` or `— pre-pass candidates and cited items; not read: <what was not read>`.

---

## First Read (advisory, run first)

Can a reader with no project context understand the value propositions on first read? The six audits test grounding and form, not readability, and a set can pass all of them and still be unreadable.

**Who reads.** A separate reader: a person, or a fresh agent pinned to `sonnet`. Give the reader only the set's reader-facing text: VP titles, primary jobs, value maps and fit assessments. Do not give the reader working files, L3 insights or the rest of this audit. You may start the fresh agent yourself. If no separate reader is available, read that text yourself and say in the report that the first read was not clean, because you had already opened the set. Put the reader's list in the report word for word. Fill the brackets from the project and use the rest of this prompt word for word:

> This document reports [one line: what the research was and who it is for]. You are [the intended reader], reading it for the first time. You know [what that reader already knows, such as the category's brands and product terms]. First names are participants and codes in parentheses point to the evidence; ignore both. Read it once, in order. List only the sentences you could not follow on this read: (A) you cannot say in your own words what the sentence claims; (B) you can only work out what it means by decoding a figure of speech or a private term. Do not list a word you would simply look up, or something the next sentence explains. Do not judge whether the research is right. Do not suggest rewrites. For each, quote the sentence or phrase and give A or B. Your entire response IS the list, with nothing omitted. If there are none, respond with "None".

**Then ask where each clause comes from.** With the level below in hand, take each clause of each title and primary job and name the cited evidence behind it. A clause with no participant behind it is cut, or stays only if the file labels it as the synthesist's reading. Theory imported from L3 Knowledge sections is a common source of such clauses.

**Using the list.** The list is advice for the writer and the researcher. It is not a pass or fail, and its findings do not count against "Cleared for L5". The writer decides what to rewrite and rewrites from what the evidence shows, not by adjusting the words of the flagged sentence. The researcher ruled this for L2 and L3 on 2026-11-06, after a test in which the counts did not rank the texts and a blocking rule would have required 20 to 35 rulings per set; the same ruling applies here (2026-11-07). A clause with no participant behind it is different: it comes from the clause-source question and is an ordinary finding.

This audit does not replace the researcher's line-by-line read.

---

## The Six Audits

Run all six. Report findings for each.

**Domain awareness:** Confirm the project domain (from the VP `domain:` frontmatter field, or ask). Throughout this audit, "customer" means the beneficiary the offering serves, per that domain — customer, user, employee, or constituent (`DomainScope.md`). In Audit 1, verify the Customer Profile describes the correct beneficiary, and in the High-Value Jobs grounding, verify the "Lucrative" judgment used the domain's value register (economic value only where the domain is commercial; participation/outcomes/served need for organizational and policy/advocacy). A VP that judges value by willingness-to-pay on a policy or internal-org project is applying the wrong value register.

---

## Step 2: Audit 1 — Customer Profile Validity

Check the Customer Profile against seven criteria:

1. **Job statement — verb-noun form:** Is the primary job expressed in verbs and nouns, without adjectives as the main descriptor? Flag if not.

2. **Job statement — multi-industry test:** Could candidates from different industries address this job? If the statement only makes sense as a prompt for the client's industry, flag as product spec.

3. **Job statement — circumstance anchor:** Does the job have a named circumstance? If the same job would arise in any context for any person, flag as too generic.

4. **Multi-circumstance check:** Does the Customer Profile span behaviors across markedly different circumstances — e.g., pre-purchase decision-making and post-purchase belonging, first consideration and multi-year ownership, evaluation and advocacy? If yes, flag as a potential split: these may be distinct jobs performed by the same person at different life-cycle moments, each warranting a separate VP.

   Test: does the primary job require temporal bridging between situations the customer is in at different times? A job that is "evaluate the purchase AND feel recognized over three years of ownership" is two jobs bridged by temporal logic, not one job with a circumstance anchor. A single circumstance produces one job; a life-cycle narrative produces multiple.

   If flagged: determine whether the Customer Profile should be split before building Value Maps. Building a single Value Map for two distinct jobs produces offerings that satisfy neither fully. *(V5 failure: "In-Arc Buyer" Customer Profile fused pre-purchase evaluation — high anxiety, $5K–$15K commitment confirmation — with post-purchase belonging — multi-year recognition across an ownership arc. Different circumstances, different anxieties, different jobs. The result was VP-01 and VP-02 addressing the same customer in fundamentally different situations, requiring a split that should have happened at the Customer Profile stage.)*

5. **Pain severity distribution:** Are extreme pains present? If all pains are Significant or Moderate, either the research did not surface acute pain or the severity was underestimated. Flag for review.

6. **Gain type distribution:** Are Desired or Unexpected gains present? If all gains are Required and Expected, the Customer Profile may be describing minimum requirements rather than differentiation territory. Flag.

7. **Research traceability:** Does each pain and gain cite at least one L3 source insight? If any element has no L3-NN citation, flag as ungrounded.

Report:
```
Customer Profile Audit:
1. Verb-noun form: <Pass / Flag — reason>
2. Multi-industry test: <Pass / Flag — reason>
3. Circumstance anchor: <Pass / Flag — reason>
4. Multi-circumstance check: <Pass / Flag — describe life-cycle bridging if flagged>
5. Pain severity distribution: <Pass / Flag — reason>
6. Gain type distribution: <Pass / Flag — reason>
7. Research traceability: <Pass / Flag — which elements>
```

---

## Step 3: Audit 2 — Value Map Quality

For each VP candidate, check five criteria:

1. **Products & Services — job level:** Does each item describe what the offering does for the customer, not what it is? Apply the three-industry test to every item. Flag any item that names a specific technology, platform, format, channel, or feature.

2. **Pain Relievers — extreme pain coverage:** Does the Value Map address at least two of the top three ranked pains? If extreme pains are unaddressed, flag as a fit problem.

3. **Gain Creators — differentiation:** Do the gain creators target at least one Desired or Unexpected gain? If only Required and Expected gains are created, the VP is not differentiated. Flag.

4. **Honesty in fit assessment:** Does the fit assessment name specific gaps? "Partial Fit" or "Weak Fit" without named gaps is not an honest assessment. Flag if the gaps section is absent or generic.

5. **Pain-reliever tautology check:** For each pain-reliever pairing, does the reliever name a *mechanism* — how the offering closes the gap — rather than restating the pain in solution form?

   Tautological form: Pain = "product encounter doesn't exist by design" → Reliever = "build encounter infrastructure." This restates the pain as its own solution; it says nothing about how the encounter infrastructure works differently from the current absence.

   Non-tautological form names what specific aspect of the offering closes the gap: Pain = "product encounter doesn't exist in non-race markets" → Reliever = "a fleet-lending program that places bikes with dealers in markets where cyclists are buying but not racing, converting passive awareness into a physical interaction at the critical evaluation moment." The mechanism (fleet-lending → physical placement → dealer-mediated evaluation) is the gap-closing logic.

   Flag any reliever that is structurally equivalent to "address the pain" without naming how. *(V5 failure: VP-01 and VP-02 extreme pain relievers restated pains in solution form — pain = "no encounter infrastructure" → reliever = "encounter infrastructure" — without naming the mechanism that would make a new program different from the current absence.)*

Report per VP:
```
VP-[NN] Value Map Audit:
1. Products & Services (job-spec check): <Pass / N items flagged — describe>
2. Extreme pain coverage: <Pass / Flag — which extreme pains are unaddressed>
3. Gain differentiation: <Pass / Flag — no Desired/Unexpected gains created>
4. Fit assessment honesty: <Pass / Flag — gaps section incomplete>
5. Pain-reliever tautology: <Pass / N pairings flagged — describe circular logic>
```

---

## Step 4: Audit 3 — Candidate Differentiation

Check that the VP candidates represent genuinely different structural approaches, not minor variations.

For each pair of VP candidates: do they differ in their primary structural logic (i.e., they approach the job from different angles — one addresses pains first, one addresses gains first, one changes the competitive set entirely)? If two candidates are functionally the same offering described with different words, flag as insufficient differentiation.

Report:
```
Candidate Differentiation Audit:
VP-01 vs. VP-02: <Genuinely different / Flag — why they are too similar>
VP-01 vs. VP-03 (if exists): [...]
VP-02 vs. VP-03 (if exists): [...]
```

---

## Step 5: Audit 4 — L3 Insight Coverage

Check that all L3 insights are accounted for:
- Which L3 insights contributed to the Customer Profile (as job, pain, or gain source)?
- Which L3 insights were not used?

For any L3 insight not used: note why. Possible reasons:
- It addressed a secondary job that was out of scope for this VP synthesis
- It described organizational context (platzgeist) rather than customer behavior
- It was already captured in another insight's pains or gains

**Do not silently drop L3 insights.** Every insight must be accounted for — used, subsumed, or explicitly noted as out of scope.

**Saturation-weighting check:** For any L3 insight rated high-saturation in the L3 document (3+ independently named participants with behavioral evidence across multiple contexts), verify that it either:
- (a) Drives a VP as a spine — it is the primary job, an extreme pain, or the primary desired gain for at least one VP; OR
- (b) Has an explicit documented reason it does not warrant a VP spine — e.g., "describes organizational context (platzgeist) rather than customer behavior," "addresses a job outside this engagement's scope," or "captured more precisely inside another insight's spine"

An insight scattered only as a supporting pain or third-item Value Map entry across other VPs — without explicit accounting — is a coverage failure, not a coverage success. *(V5 failure: the most behaviorally saturated insight in the set — the dealer encounter, with named evidence from Nadia, Bram, Enzo, Karl, Omar, and Ines — had no VP spine. It appeared as a supporting pain in two VPs with other spines. This was the clearest evidence of evidentiary inversion: the most grounded insight was deprioritized; the least grounded was elevated.)*

**Cross-VP padding check:** Flag any L3 insight that is load-bearing (first or second item in the Value Map) in more than one VP. When the same insight is primary in multiple VPs, one of three things is true:

1. The insight is so pervasive it belongs in the **shared Customer Profile** primary job or as a core pain/gain — not as a VP-specific structural item
2. One VP is using it as **structural padding** to reach three Value Map items; the third item is not genuinely derived from a distinct job component
3. There is genuine **VP overlap** — the candidates share so much structural logic they should be consolidated into one VP with a stronger through-line

Distinguish: an insight appearing as a *secondary or contextual* element in multiple VPs is acceptable. An insight serving as a *primary structural element* in two VPs is a sign of padding or overlap. *(V5 failure: L3-01, the racing activation insight, was the spine of VP-01 and appeared as the third item in VP-02. The third-item role in VP-02 was structural padding rather than derived from a distinct job component of the post-purchase belonging job.)*

Report:
```
L3 Insight Coverage:
- [N] insights contributing to Customer Profile
- [N] insights not used — accounted for as follows:
  - L3-NN [Title]: [Reason not surfaced in Customer Profile]
  - ...
```

---

## Step 6: Audit 5 — Volume Check

Apply the volume calibration from ValuePropositionFormat.md:

- Is the number of VP candidates within range — 2–3 candidates per Customer Profile (up to 4 when the L3 set is large, 9–12 insights); fewer than 2 or more than 5 is a flag? (canonical: `ValuePropositionFormat.md` → Canonical VP volume rule)
- Is the primary job claim at the right level of abstraction (neither too generic nor too specific)?
- Is the pain list within range (3–7 items)?
- Is the gain list within range (3–7 items)?

Flag anything outside these ranges with a one-clause explanation.

Report:
```
Volume Check:
- VP candidates: <N — Pass / Flag if < 2 or > 5; 4 is in range only when the L3 set is 9–12 insights>
- Job abstraction level: <Pass / Flag — reason>
- Pain list: <N items — Pass / Flag if > 7 or < 3>
- Gain list: <N items — Pass / Flag if > 7 or < 3>
```

---

## Step 7: Audit 6 — Platzgeist Check

From Chipchase: the organizational context governs which offerings are actually deliverable. Review the VP set for organizational realism:

- Do any Products & Services items require capabilities the organization demonstrably does not have?
- Do any items require a business model change rather than a product/service addition?
- Do any items require stakeholder alignment that is not in the current project's scope?

Items that fail the platzgeist check are not discarded — they are labeled as aspirational ("possible with organizational change") rather than near-term offering candidates. The client must be able to evaluate the VP set against their actual operational reality.

Report:
```
Platzgeist Check:
- <Pass — all VP elements are within organizational reach>
- <Or: N items flagged as aspirational — list items and why>
```

---

## Step 8: Compile Verdict

Issue the verdict:

```
L4 VP Set Audit — [Project Name]
[Date]

VERDICT: <CLEARED FOR L5 / NOT CLEARED — REVISE>

Flags requiring revision before advancing:
[List all audit failures. Each: Audit [N] — [Item] — [What needs to change]]

Flags noted but not blocking:
[List advisory flags that are worth reviewing but don't prevent advancement]

If CLEARED FOR L5:
- Customer Profile: valid and research-grounded
- [N] VP candidates: differentiated and at the right level of abstraction
- All L3 insights accounted for
- Ready for L5 integration (optional) or concept design handoff
```

**The "Cleared for L5" gate means:** the VP set is well-formed, the Customer Profile is grounded in the research, the Value Maps address the most important pains and gains, and the job-spec guardrail has been applied. It does not mean the VPs are correct — they are hypotheses, and hypotheses require validation. The cleared verdict means the VP set is ready for the next step, not that it has been proven.

---

**Discharge-sweep rule** — when a finding from this audit is discharged (fixed and closed), sweep for the same defect **shape** — not the same words — before closing. The sweep scope is every artifact derived from the ladder in the project tree: rungs above and below the fix, masters, standalone files, renders (.typ/.pdf), and presentation sources (deck scripts and exported decks). Record the sweep in the Addendum that records the fix. On a first audit nothing has been discharged, so the report field below reads "not applicable". Canonical: `FinalLadderReview.md` → Quality Checks Before Reporting. *(Corrected wording per the 2026-08-21 two-failure replay; adopted 2026-08-22.)*

## Audit Report Format

```
## L4 VP Set Audit — [Project Name]

**Inputs read:** <N> files, <M> items (L3 insights) — <full read | pre-pass candidates and cited items; not read: …>

**Pre-pass summary:** <paste the pre-pass Summary section>

### First Read
<Who read it, and whether it was a separate reader; each finding with the words quoted and what the writer did with it; clauses with no participant behind them; "None" if none>

**Audited:** [N] VPs from [N] L3 insights
**Date:** [YYYY-MM-DD]

### Customer Profile Validity
<Pass / Flag — per criterion, with specific revision notes>

### Value Map Quality
<Per VP: Products & Services job-spec, extreme pain coverage, gain differentiation, fit assessment honesty, pain-reliever tautology — Pass / Flag per item>

### Candidate Differentiation
<Genuinely different / Flag — pairings assessed with reason>

### L3 Insight Coverage
<Insights contributing to Customer Profile / insights not used — accounted for; saturation-weighting flags; cross-VP padding flags>

### Volume Check
<VP candidates, job abstraction level, pain list, gain list — Pass / Flag per item>

### Platzgeist Check
<Pass — all VP elements within organizational reach / N items flagged as aspirational — list items and why>

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

Before moving to L5 or sharing with stakeholders, manually run a copy-edit pass (Medium level, research genre; the optional prose-craft companion skill's edit workflow, if installed) on the L4 Value Proposition documents. Apply to the master VP document and all individual VP-XX files. **Supply the source corpus (participant roster, transcripts, figure sources) with the request** — with sources in context the pass verifies names, figures, and job-spec language against them; without sources it flags only internal inconsistencies, and a wrong-but-consistent attribution will pass. The pass also catches grammatical issues and style inconsistencies that accumulate during synthesis.

---

## Save the Audit Report

After completing the report, write it to the directory containing the audited value proposition files:

**Filename:** `L4_VP_Set_Audit_[ProjectName].md`
**Location:** Same directory as the audited VP files (e.g., `.../L4_ValuePropositions/`)

This keeps the audit co-located with the synthesis it audits and makes it available to the FinalLadderReview, which reads it to confirm per-level gates have cleared.
