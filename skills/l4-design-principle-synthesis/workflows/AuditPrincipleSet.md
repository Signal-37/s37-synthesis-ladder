# AuditPrincipleSet Workflow

Quality-check a completed L4 Design Principle set before it is used for L5 synthesis or stakeholder presentation. This workflow surfaces title weaknesses, decorative principles (not operationally usable), thin evidence re-grounding, vague failure modes, and system narrative gaps.

## When to Use

After SynthesizePrinciples is complete, before moving to L5 Framework or sharing with stakeholders. Can also be used mid-synthesis to check a partial principle set.

---

## Inputs — required before any audit

You need four things: the set directory, the format file (`PrincipleFormat.md`), the project name, and **the directory holding the L3 insights the set was built from** (the files' `source_insights:` name them). The dispatcher passes that directory, and the L1 findings directory as well (`../ladder-core/ladder-map.md` → Running a level audit). L1 is for targeted checks: quotes the set carries from L1, and claims about participants that the level below does not show. If it was not passed and cannot be found from the set's source fields, do not audit: return a report whose first line names the missing directory. Coverage and counter-evidence cannot be judged from the set alone.

**Run the first read first (Audit 2b).** Before the pre-pass and before you read the level below, open the set only to copy out its reader-facing text, and give that text to a separate reader. A reader who has seen the working files cannot do the first read.

**Run the pre-pass next, on every audit, whatever the size of the level below.** Run it from this skill's folder, the one that holds `workflows/`: the path that starts `../ladder-core/` resolves from there.

```bash
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts <set directory> <L3 insights directory> --also <L1 findings directory>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`. With `--also`, a quote found only in L1 is marked as such rather than not found. The pre-pass lists the insights no file in the set cites, citations that point at nothing, and quoted fragments not found in the source they cite. Its items are candidates, not verdicts: judge each one, and carry the real defects into the report as findings. Paste its Summary section into the report.

**Then read the level below.** Read every L3 insight file in full: observation, knowledge, insight, What would change this and what it opens. The evidence re-grounding and what-it-rejects audits below are built from this read.

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

## The Audits

Run all of them, including 2b and 4b. Report findings for each.

**Domain awareness:** Confirm the project domain (from the L4 `domain:` frontmatter field, or ask). In Audit 3, check that each principle's "How to apply it" names decision types belonging to that domain — per `DomainScope.md`. A test question aimed at "campaign briefs" or "dealer programs" on an organizational or policy project means the principle is filtering the wrong class of decisions, even if the title is sound.

---

### Audit 1: Compression Check

Is the principle set compressing insights into genuine governing rules — or is it one principle per insight in disguise?

**Calculate the compression ratio:**
- Count L3 insights contributing to the set
- Count L4 principles
- Target ratio: 1.5–2 insights per principle (see PrincipleFormat.md volume calibration)

**If ratio is below 1.2:1** (nearly one principle per insight): You are probably writing at insight level. Check each principle — does it have a genuine governing rule, or is it restating the L3 insight in imperative form? A principle that merely says "do what the insight reveals you should do" is an insight paraphrase, not a principle. Either merge principles or strengthen the governing logic.

**If ratio is above 3:1** (heavy compression): Check whether genuinely different decision domains are being conflated. A principle that governs investment decisions, experience design, AND community partnerships simultaneously may be too abstract to be operationally useful. Review whether any principle should be split.

---

### Audit 2: Principle Title Quality

Does every title pass all four tests: short, active, plain, governing? (`PrincipleFormat.md` → The Principle Title Test.)

For each principle title:
- [ ] Short (usually 4–10 words; longer only where a cold reader needs the words)
- [ ] Active (begins with an imperative verb)
- [ ] Plain (meets the plain-title rules: literal words, no figure of speech, coined phrase, theory term or working vocabulary; one demand; no dash form)
- [ ] Governing (a decision-maker can apply this to a real choice without further explanation)
- [ ] The principle's body meets `PrincipleFormat.md` → Plain Writing in the Body

**Red flags:**
- Title is a noun phrase rather than a verb-led statement: "Community investment" instead of "Spend where buyers decide which brand to trust"
- Title names what is true rather than what to do: "The dealer is the primary experience surface" instead of "Design what buyers experience at the dealer"
- Title is a coined phrase that only the body explains: "Invest where conviction forms", "Welcome as a brand act"
- Title could apply to any organization in any industry (too generic): "Put people first," "Invest in quality"
- Multiple principles have titles that sound the same: if two titles are interchangeable without reading the full principle, they may be the same principle or the titles are insufficiently differentiated

A title passes by being clear, never by being striking; do not reward a phrase for sounding like a slogan.

**Rewrite prompt for weak titles:** Ask "What must the organization always *do*, the irreducible behavioral commitment, that this cluster of insights demands?" Rewrite from "The principle" in literal words, not by adjusting the words of the flagged title. The verb that answers the question is the title's first word.

---

### Audit 2b: First Read

Can a reader with no project context understand the document on first read? The accuracy and traceability audits do not test this, and a set can pass all of them and still be unreadable.

**Who reads.** A separate reader: a person, or a fresh agent pinned to `sonnet`. Give the reader only the document's reader-facing text: the titles, The principle, How to apply it (with its test questions), What it prevents, What it rejects, How they work together and the through-line. Do not give the reader working files, L3 insights or the rest of this audit. You may start the fresh agent yourself. If no separate reader is available, read that text yourself and say in the report that the first read was not clean, because you had already opened the set. Put the reader's list in the report word for word. Fill the brackets from the project and use the rest of this prompt word for word:

> This document reports [one line: what the research was and who it is for]. You are [the intended reader], reading it for the first time. You know [what that reader already knows, such as the category's brands and product terms]. First names are participants and codes in parentheses point to the evidence; ignore both. Read it once, in order. List only the sentences you could not follow on this read: (A) you cannot say in your own words what the sentence claims; (B) you can only work out what it means by decoding a figure of speech or a private term. Do not list a word you would simply look up, or something the next sentence explains. Do not judge whether the research is right. Do not suggest rewrites. For each, quote the sentence or phrase and give A or B. Your entire response IS the list, with nothing omitted. If there are none, respond with "None".

**Then ask where each clause comes from.** With the level below in hand, take each clause of each title and of each "The principle" section and name the cited L3 insight, and through it the participants, behind it. A clause with no insight behind it is cut, or stays only if "What it means" labels it as the synthesist's reading. Theory imported in the L3 Knowledge sections is a common source of such clauses.

**Using the list.** The list is advice for the writer and the researcher. It is not a pass or fail, and its findings do not count against "Cleared for L5". The writer decides what to rewrite and rewrites from what the principle says, not by adjusting the words of the flagged sentence. The researcher ruled this for L3 on 2026-11-06, after a test in which the counts did not rank the texts and a blocking rule would have required 20 to 35 rulings per set; it applies here unchanged (2026-11-07). A clause with no insight behind it is different: it comes from the clause-source question and is an ordinary finding.

This audit does not replace the researcher's line-by-line read.

---

### Audit 3: Decision Filter Quality

Does every "How to apply it" section contain a specific test question that a decision-maker can use in a real meeting?

For each principle, read the "How to apply it" section and ask:
- Is there at least one test question in quotation marks?
- Does the test question have a clear directional answer (yes/no or comparable binary)?
- Could a decision-maker ask this question in a real meeting about a real program?
- Does the test question distinguish between honoring the principle and violating it?

**Red flags:**
- No test question present — only a restatement of the principle
- Test question is too abstract: "Does this align with our values?" (no directional answer)
- Test question is answered "it depends" without further clarification (the principle is too abstract)
- "How to apply it" only names decision domains without naming the decision mechanism

**Rewrite prompt for weak decision filters:** Ask "If I were reviewing a specific budget proposal [or campaign brief, or community partnership, or dealer program], what single question would tell me immediately whether this proposal honors the principle?" That question, in quotation marks, is what belongs here.

---

### Audit 4: Failure Mode Specificity

Does every "What it prevents" section name a specific, recognizable failure pattern — not a generic risk?

For each principle, apply the newspaper test: could this failure mode appear as a specific critique in a strategy review or competitive analysis? If yes, it is specific enough.

**Red flags:**
- Failure mode is generic: "Suboptimal decisions," "Missing opportunities," "Poor brand performance"
- Failure mode restates the principle in negative form: a principle that says "Invest in community" prevents "not investing in community" — that is not a failure mode, it is a tautology
- Failure mode is so specific it only applies to one program rather than a class of decisions
- "What it prevents" is absent

**Rewrite prompt for vague failure modes:** Ask "What specific pattern of bad decision-making does this principle guard against? Name it precisely enough that a decision-maker could check whether it is currently happening." The precise, named pattern is the failure mode.

---

### Audit 4b: "What It Rejects" Quality

Does every principle name the specific alternative strategy it vetoes — distinct from the failure mode it prevents?

For each principle:
- [ ] "What it rejects" section is present
- [ ] Names a specific type of program, strategy, or organizational move — not a vague direction
- [ ] Is distinct from "What it prevents": names the strategy that would produce the failure mode, not the failure mode itself
- [ ] Specific enough that a planning-session participant would recognize it as something that has been proposed or considered

**Red flags:**
- Section is absent entirely
- Restates "What it prevents" in strategy language ("prevents poor investment → rejects poor investment strategies")
- Generic enough to apply to any organization: "don't chase trends," "avoid quick fixes"
- Names a vague direction rather than a specific type of program the organization might actually propose

**Rewrite prompt for missing or weak entries:** Ask "What specific program, campaign type, or organizational move would this organization plausibly propose that this principle explicitly says no to?" That specific, recognizable move is what goes here.

---

### Audit 5: Evidence Re-Grounding

Does every "Why it comes from the research" section name participants and use direct quotes?

For each principle:
- [ ] At least one participant named by name
- [ ] At least one direct quote (in quotation marks) where evidence supports it
- [ ] Evidence connects to the principle's demand — it should feel inevitable given the evidence
- [ ] Evidence is tight (2–4 sentences) — not padded with background context

**Red flags:**
- Evidence section cites only L3 insight IDs without going back to L1 evidence
- Evidence section paraphrases findings without naming the participant
- No direct quotes despite research data containing them
- Evidence section reads as background context rather than human evidence that demands a behavioral response

**The re-grounding test:** Read only the "Why it comes from the research" section to someone unfamiliar with the research. Do they feel that this evidence demands the behavioral commitment the principle names? If the evidence feels like supporting context rather than a demand, the re-grounding is too thin.

---

### Audit 6: System Narrative Quality

Does the system narrative name genuine dependencies between principles — or does it just assert that each principle is important?

Test the narrative against three criteria:

**Test 1 — The foundation test:** Is there a named foundation principle — one without which the others risk incoherence? A system where every principle is equally foundational has no architecture. The foundation principle should be identifiable: if it is absent, the other principles lack a shared reference point.

**Foundation ≠ Prerequisite — required distinction:** A foundation principle governs the *character* of how all other principles are applied — it establishes the register, voice, or constraint that shapes all decisions. A prerequisite principle must be *resolved before* other principles can be actioned day-to-day. These are categorically different claims.

- **Foundation:** "Every decision governed by P-03, P-04, and P-05 must also ask the P-01 question — is this consistent with the engineering narrative?" P-01 operates as a cross-cutting quality filter applied to all decisions, not a gating step that blocks them.
- **Prerequisite:** "P-03 and P-04 work cannot begin until P-01 is resolved — the narrator must be identified before encounters can be manufactured." This is false if P-03 and P-04 govern decisions that are operationally independent of whether the engineering narrator has been identified.

**Apply the operational independence test:** Can the decisions each principle governs — day-to-day program choices, budget calls, community investments — be made without the "foundation" principle being resolved first? If yes, the foundation principle is a cross-cutting governing condition (every decision is subject to it) rather than a prerequisite (it doesn't block the other decisions from being made). Name it as a governing condition, not a precondition.

**If the principle set includes a "How they work together" section:** Apply the dependency test explicitly to that section. Does it name any principle as a precondition for others? If yes — test whether the other principles' daily decisions genuinely cannot be made without the precondition being resolved. Narrative plausibility ("A's insight is thematically upstream of B's") is not an operational dependency. *(The V5 failure pattern: "P-01 is the foundation... the precondition for coherence of all other principles" reinstated the OA-01 waterfall claim that had been removed earlier in the same audit pass. The cross-application table in the same document correctly showed P-01 as a cross-cutting governing condition — the "How they work together" prose section introduced the prerequisite framing without testing whether it held operationally.)*

**Test 2 — The dependency test:** For each named relationship between principles ("P-01 and P-03 are the acquisition system"), ask: "If [Principle A] is absent, does [Principle B] actually fail or become incoherent?" If the answer is "not really," the dependency is not genuine.

**Test 3 — The through-line test:** Is the through-line one plain statement of commitment, not a list? Could a reader with no project context say, after one read, what the organization is committing to? If it reads as a prose version of the principle list, or reaches for a quotable line, flag it.

**Rewrite prompt for weak system narratives:**
- Replace "P-01 is important because..." with "Without P-01, [specific failure mode for the system as a whole]"
- Replace the through-line list with: "An organization that honors all [N] principles [does what, in plain words]. As a result, [cumulative strategic outcome]."

---

**Discharge-sweep rule** — when a finding from this audit is discharged (fixed and closed), sweep for the same defect **shape** — not the same words — before closing. The sweep scope is every artifact derived from the ladder in the project tree: rungs above and below the fix, masters, standalone files, renders (.typ/.pdf), and presentation sources (deck scripts and exported decks). Record the sweep in the Addendum that records the fix. On a first audit nothing has been discharged, so the report field below reads "not applicable". Canonical: `FinalLadderReview.md` → Quality Checks Before Reporting. *(Corrected wording per the 2026-08-21 two-failure replay; adopted 2026-08-22.)*

## Audit Report Format

```
## L4 Principle Set Audit — [Project Name]

**Inputs read:** <N> files, <M> items (L3 insights) — <full read | pre-pass candidates and cited items; not read: …>

**Pre-pass summary:** <paste the pre-pass Summary section>

**Audited:** [N] principles from [N] L3 insights
**Compression ratio:** [N]:[1]
**Date:** [YYYY-MM-DD]

### Compression Check
<In range / over / under — with notes>

### Principle Title Quality
<Titles that pass all four tests / titles needing revision — with specific rewrite recommendations; body text that fails Plain Writing in the Body>

### First Read (2b)
<Who read it, and whether it was a separate reader; each finding with the words quoted and what the writer did with it; clauses with no insight behind them; "None" if none>

### Decision Filter Quality
<Principles with strong test questions / principles needing revision — with rewrite recommendations>

### Failure Mode Specificity
<Principles with precise failure modes / principles with vague or tautological failure modes — with rewrite recommendations>

### "What It Rejects" Quality
<Sections present and specific / sections absent or restating failure modes — with rewrite recommendations>

### Evidence Re-Grounding
<Principles with strong participant evidence / principles that cite only insight IDs or lack quotes — with specific recommendations>

### System Narrative Quality
<Assessment: strong / needs revision — with specific rewrite recommendation if needed>

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

Before moving to L5 or sharing with stakeholders, manually run a copy-edit pass (Medium level, research genre; the optional prose-craft companion skill's edit workflow, if installed) on the L4 Principle documents. Apply to the master principles document and all individual P-XX principle files. **Supply the source corpus (participant roster, transcripts, evidence records) with the request** — with sources in context the pass verifies names, figures, and evidence grounding against them; without sources it flags only internal inconsistencies, and a wrong-but-consistent attribution will pass. The pass also catches grammatical issues and style inconsistencies that accumulate during synthesis.

---

## Save the Audit Report

After completing the report, write it to the directory containing the audited principle files:

**Filename:** `L4_PrincipleSet_Audit_[ProjectName].md`
**Location:** Same directory as the audited principle files (e.g., `.../L4_Design_Principles/`)

This keeps the audit co-located with the synthesis it audits and makes it available to the FinalLadderReview, which reads it to confirm per-level gates have cleared.
