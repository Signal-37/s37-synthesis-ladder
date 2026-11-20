# l3-insight-synthesis — Changelog

*Prior history: this skill's record before 2026-07-11 lives in family-level entries in `skills/CHANGELOG.md` and `../ladder-core/ladder-map.md` (vocabulary freeze 2026-07-10, synthesis-gates build 2026-07-10 — `insight_knowledge_provenance`, ladder provenance 2026-07-11).*

---

## 2026-11-17 — First read, sweep line and gate 8 wording, after a fresh audit run

- **Why (the researcher, 2026-11-17):** a fresh agent ran the L2 audit on the seeded test set under the 2026-11-09 text and listed the places it could not follow as written. The researcher ruled on each the same day. The same sentences sit in all seven audit workflows, so all seven change.
- `workflows/AuditInsightSet.md` → first read: the auditor opens the set only to copy out the reader-facing text, before the pre-pass and before reading the level below, and may start the fresh reader itself. With no separate reader, the auditor reads the text and says the first read was not clean. The reader's list goes into the report word for word.
- `workflows/AuditInsightSet.md` → the Sweep run line reads "not applicable" on a first audit; the discharge sweep is recorded in the Addendum that records each fix.
- `workflows/AuditInsightSet.md` → the stopping-rule section says gate 8 compares the set's files with the current report, picked by the date or version in its name (the checker change of the same day).
- `workflows/AuditInsightSet.md` → Step 0: on a first audit, gate 8's warning that the set has no cleared audit report is expected; note it and go on.
- `InsightFormat.md` → Plain Writing in the Body: the "Packed" example is replaced with an invented apparel example (the researcher, 2026-11-17). The old one was a client title moved into a bike-frame setting, where it did not make sense.
- Not tested on a new run.

---

## 2026-11-09 — Severity on every recommended action; stopping rule after the fixes

- **Why (the researcher, 2026-11-09):** the L5 audits on a client project ran in a loop (v1 to v1e over 2026-11-07 and 11-08, then a FinalLadderReview re-run). Each round applied every recommendation, including the auditor's replacement text, and the next fresh auditor blocked the new text. This workflow had no severity vocabulary, so a Recommended Actions list was applied whole. A model test on v1e's input (one live and one fresh Opus 5.5 run, two Fable 5.1 runs) agreed on one of the live run's three blocking items; the other two were advisory to every other reader. The model was not the driver; the missing rule was.
- `workflows/AuditInsightSet.md` → Audit Report Format: each recommended action is marked **Blocking** or **Advisory**.
- `workflows/AuditInsightSet.md` → new section Closing the Audit — Severity and Stopping Rule: definitions; fix blocking only, carry advisory; record fixes in an addendum (which clears gate 8); no re-audit of the fixed text; one bounded pass at most, and where it blocks, the researcher rules. Canonical statement stays in `l5-framework-synthesis/workflows/FinalLadderReview.md`.
- `tools/synthesis-gates-check/check.ts` gate 8 message now names the addendum path beside re-audit.
- Not tested on a new run. Hold back from docs-only ladder v1.2.2; goes with v1.2.3.

## 2026-11-06 — Plain-statement titles, title written last, first-read audit

- **Why (the researcher, 2026-11-05 and 2026-11-06):** titles and descriptions reached a client unreadable and needed a complete rewrite, and an earlier engagement's titles grew more figurative across versions. Its audit passed them because each was "uncomfortable to say plainly". The skill asked for this style (write the title first, pick the sharpest, sharpen what reads as obvious, the discomfort test, the two-part dash form, figurative model titles) and no check tested readability. The plain rewrite worked by starting from what people do or say, not by editing the old sentences.
- `InsightFormat.md` → The Insight Title Test: plain-statement rules, two tests (pushback and first read), title written last, engagement-neutral before and after examples, no length cap. The dash structure and the "uncomfortable" line are removed. The Synthesis Statement Test covers tension headings.
- `workflows/WriteInsight.md`, `workflows/SynthesizeInsights.md`: title moves to the last step; steps renumbered; "sharpest", "sharpen it" and the discomfort lines removed; examples replaced.
- `workflows/AuditInsightSet.md`: new Audit 3c (First Read), run first, by a separate reader, on a pinned prompt; its list is advice, not a pass or fail; adds the clause-source question. Audit 3: pushback test replaces the discomfort test; breadth is not overreach. Audit 2c reads the Insight section, not the title. Audit 6: Test 4. Report section added.
- `SKILL.md`: examples.
- **Test, 2026-11-06, one run each. The researcher's judgment: the titles would not need a complete rewrite.** A fresh agent wrote titles for 11 confirmed clusters under this text and under the prior text. Prior text: every title used the dash form, with "newcomer", "slot", "anchor", "stake". This text: no dash form, and those terms gone.
- **First-read audit, same day: not shown to work as a pass or fail.** First prompt: 67 stops on the old unreadable text, 44 on the plain text, 78 on the new output, including ordinary terms. Second prompt (installed; intended reader and context, unfollowable sentences only): 29, 20, 35. The lists hold real findings, but the counts do not rank the texts, and many items are weak. **The researcher's ruling, same day: the audit does not block clearance.** Its list goes to the writer and the researcher. The blocking rule first installed is removed.
- **Descriptions (the researcher's ruling, same day):** the test's descriptions were weaker than its titles, with limits packed into sentences, working shorthand and a repeated "our reading" label. `InsightFormat.md` → new section Plain Writing in the Body applies the title rules to the text under the title. Audit 3 and both quality checklists point to it. Not yet tested on a new run.
- **Not fixed by this change:** the new-text run still carried the guarantee reasoning the researcher ruled out, labeled as "our reading". Plain wording does not catch a wrong inference, and labeling a clause lets it through.
- Examples are engagement-neutral because this skill ships in the portable ladder. The boundary rule (what is true, not what a brand could do) began as Kai's drafting choice; the researcher ruled the same day that it stays.
- **Portable ladder:** not carried over. The build reads the working tree, so docs-only v1.2.2 must be built with these edits held back.

## 2026-11-03 — Inputs step: the audit reads the level below

The audit workflow gains an Inputs step: the directory of the level below (and L1 from L3 up), the `synthesis-audit-prepass` script on every audit, then a full read of the level below, with the fallback to the script's candidates plus cited items when it will not fit, and an `**Inputs read:**` line in the report, which gate 8 checks. Full entry and reasons: `skills/CHANGELOG.md`, 2026-11-03.

## 2026-11-03 (later) — Falsifier field reshaped as "What would change this"

- **Why (the researcher, 2026-11-03):** the frog analogue process the ladder is modelled on never used a falsifier line, and the field was pushing qualitative synthesis toward a pseudo-quantitative method. At L3, a single contradicting observation is no reason to discard an insight. On a live engagement the lines had become threshold tests ("a third or more", "three or more participants", "at least as often"), and the scoring had become quantitative machinery (blind majority of three, fixture accuracy). The field's defect-prevention claim had not replicated in the 2026-08-22 three-arm test. The old trigger fired only on vacuous lines and could not detect over-tight ones.
- `InsightFormat.md`: "The Falsifier Field" replaced by **The What Would Change This Field**: counter-cases in the data (negative case analysis), rival reading, what would make us revise it, with no counts, percentages or thresholds. Engagement-neutral example and the drift tell added. Both templates updated.
- `workflows/AuditInsightSet.md` → Audit 3b: an auditor judgment per insight (specific / counter-cases / rival / register), verdict fine or flag. The pinned scorer prompt, the majority of three and the fixture gate are retired, with a history note pointing at the archived runs. Report template updated.
- `workflows/SynthesizeInsights.md`: Step 4b, the 4c→4b handoff and the checklist line. `SKILL.md`: the inline note.
- `../ladder-core/config/synthesis-gates.yaml` → `falsifier_field`: rewritten for the reshape.
- Removal rule: the researcher's retrospective judgment on whether the section changed any insight, replacing the vacuous-rate trigger.
- **L5:** The researcher ruled the same day that the reshape applies at L5 too; see `l5-framework-synthesis/CHANGELOG.md`, 2026-11-03. `abductive-reasoning` keeps its "Positive falsification trigger"; L3 restates it as a pattern. The portable SynthesisLadder (S37) is not updated here; the change goes into its next version.
- Superseded the same day: the earlier 2026-11-03 entry below (boundary rulings, WEAK verdict, pinned prompt).

## 2026-11-03 — Falsifier boundary rulings, WEAK verdict, pinned scorer prompt

- `InsightFormat.md` → The Falsifier Field: two boundary rulings. (1) A comparison counts as a threshold when it names both sides and says which way the result must fall for the claim to fail; parity counts, and no margin is required at L3. (2) Score each clause of a multi-clause line separately: alternatives are real if any clause is real; joint clauses are real only if all are. Adds a third verdict, **weak**, which counts as present for the trigger and takes a reason from a closed list (a–d).
- `workflows/AuditInsightSet.md` → Audit 3b: verdicts real / weak / vacuous / absent. The scorer prompt is pinned word for word. Scoring is the majority of three blind Sonnet runs, with split lines reported. The fixture gate now points at the v2 fixture (`Alexander-Method-Prototypes/2026-11-03_audit3b-falsifier-fixture-v2.md`), and the report template is updated to match.
- Why: on 2026-11-02 two audits of one live L3 set scored the same falsifier field 9/0/1 and 5/0/5. A recalibration (recorded in the author's measurement ledger) traced the split to two rules the re-audit's prompt added ("fails any part", "one vacuous clause makes the line vacuous"), plus scorer noise at exactly these two boundaries. The rulings are the researcher's, 2026-11-03, on the qual-researcher's recommendation.
- Not changed: the L5 mirror (`l5-framework-synthesis/workflows/AuditFramework.md`, falsifier mirror) uses "vacuous" informally and reads with its own question 1. It needs no edit unless L5 adopts blind scoring. The portable SynthesisLadder copy (S37) is not updated here.

## 2026-10-26 — Bun fallback at Step 0

`workflows/AuditInsightSet.md`: under the Step 0 gate-check command, one line tells the agent to run it with `~/.bun/bin/bun` if `bun` is not found. Found on the 2026-10-26 clean-account run of the S37 Synthesis Ladder v1.1: with Bun off the agent's PATH, the agent running an audit went straight to Step 0 and never read `ladder-core`'s fallback line (it recovered by searching). The researcher's ruling 2026-10-26.

## 2026-09-27 — Survey-sourced patterns carry their label

Knowledge provenance (b) accepts survey-sourced patterns only with their label (survey rows, independence verified/assumed, `[SURVEY-ONLY]` where the theme carries it) and the L1 Limits line (AuditInsightSet, SynthesizeInsights; canonical `gates.insight_knowledge_provenance`). Added with the survey extension of the ladder.

## 2026-08-22 — Clause-5 trace check ADOPTED-AMENDED (the researcher ratification 2026-08-22, same day)

- `workflows/SynthesizeInsights.md`: Step 4c "Trace check (felt test at the trace)" — claim set against cited participant language at formation; attribution checked in two parts (speaker AND subject; reported speech never resolved to the speaker by default); register scoping (governs Observation/Insight; Knowledge-layer terms labeled and relocated, not discarded); 4c→4b handoff; verbatim-fragment Trace entries. Two quality-check lines; Near-miss discards section in the master template.
- `InsightFormat.md`: `## Trace` field (individual files only, never client-facing) + The Trace Field section with the worked MR/DK attribution example, armed watch items, scope note, and authorizing-ruling block.
- Evidence chain: three-arm formation test (T2 0-for-4-vs-4) → chairs ADOPT AMENDED → regression (un-amended defect 3-for-3 incl. one claim-body instance; amended 0 wrong renderings ×2, one attested in-draft interception) → two unanimous SATISFIES rulings → the researcher ratified. Records: Alexander project `2026-08-22_clause5-regression-preregistration.md` (as-built + P1 erratum). **Authoring cost: not timed — measure on first live use.**

## 2026-08-22 — Alexander cheap lane (the researcher slot rulings 2026-08-22; details in skills/CHANGELOG.md)

InsightFormat: The Falsifier Field definition + Falsifier in both templates + reserved-verbs one-liner; SynthesizeInsights: Step 4b falsifier wiring + checklist line + felt_flags; AuditInsightSet: Audit 3b Falsifier Presence (blind, fixture-gated) + report section + discharge-sweep pair; SKILL.md inline-falsifier note updated to the recorded field.


## 2026-07-11 — Ladder gap audit (Architect + Engineer chairs): bespoke labels re-expressed in the frozen vocabulary

**Engineer:** two prescribed epistemic labels lived outside the frozen vocabulary and outside scanner enforcement (the paren-family blind spot): `SynthesizeInsights.md` Step 4's `(synthesist judgment — not a direct citation)` and `AuditInsightSet.md`'s `(synthesist knowledge, flagged)`. Researcher-ruled resolution: re-express with the registered required-clause base — both now read `(inferred from synthesist reasoning)` — rather than minting a new base. The three-category provenance discipline itself (gate 5) was verified genuinely present at both generation and audit; only the label strings were off-vocabulary. `InsightFormat.md`'s Volume Calibration table gained the L1-style "normative, not derived" caveat. Template placeholders converted to angle brackets (family-wide sweep).

*Context from the same-day L0–L5 QualResearcher fidelity pass (recorded in `skills/CHANGELOG.md`): L3's yellow/blue/green card taxonomy was ruled a disclosed PAI overlay on Kolko's scheme (his: yellow = insight, blue = pattern, green = idea), with the mapping now stated at every attribution point.*
