# l2-theme-synthesis — Changelog

*Prior history: this skill's record before 2026-07-11 lives in family-level entries in `skills/CHANGELOG.md` and `../ladder-core/ladder-map.md` (vocabulary freeze 2026-07-10, synthesis-gates build 2026-07-10 — `theme_evidence_floor`, ladder provenance 2026-07-11, L0–L5 QualResearcher fidelity pass 2026-07-11).*

---

## 2026-11-17 — First read, sweep line and gate 8 wording, after a fresh audit run

- **Why (the researcher, 2026-11-17):** a fresh agent ran the L2 audit on the seeded test set under the 2026-11-09 text and listed the places it could not follow as written. The researcher ruled on each the same day. The same sentences sit in all seven audit workflows, so all seven change.
- `workflows/AuditThemeSet.md` → first read: the auditor opens the set only to copy out the reader-facing text, before the pre-pass and before reading the level below, and may start the fresh reader itself. With no separate reader, the auditor reads the text and says the first read was not clean. The reader's list goes into the report word for word.
- `workflows/AuditThemeSet.md` → the Sweep run line reads "not applicable" on a first audit; the discharge sweep is recorded in the Addendum that records each fix.
- `workflows/AuditThemeSet.md` → the stopping-rule section says gate 8 compares the set's files with the current report, picked by the date or version in its name (the checker change of the same day).
- Audit 3, clause source: a title clause or qualifier that claims more than the behavioral pattern supports is Blocking; a title that is only awkward or imprecise is Advisory (the researcher, 2026-11-17).
- Audit 2: a pass on the gates checker's evidence-floor gate does not settle the enacted-evidence count; the checker reads `participants:` as written.
- `workflows/AuditThemeSet.md` → Step 0: on a first audit, gate 8's warning that the set has no cleared audit report is expected; note it and go on.
- Audit 2: the 3+ and 5+ source counts are counted by enacted evidence, not by the `participants:` field. This follows the 2026-11-03 count rule; the two sentences had not said so.
- Not tested on a new run.

---

## 2026-11-09 — Severity on every recommended action; stopping rule after the fixes

- **Why (the researcher, 2026-11-09):** the L5 audits on a client project ran in a loop (v1 to v1e over 2026-11-07 and 11-08, then a FinalLadderReview re-run). Each round applied every recommendation, including the auditor's replacement text, and the next fresh auditor blocked the new text. This workflow had no severity vocabulary, so a Recommended Actions list was applied whole. A model test on v1e's input (one live and one fresh Opus 5.5 run, two Fable 5.1 runs) agreed on one of the live run's three blocking items; the other two were advisory to every other reader. The model was not the driver; the missing rule was.
- `workflows/AuditThemeSet.md` → Audit Report Format: each recommended action is marked **Blocking** or **Advisory**.
- `workflows/AuditThemeSet.md` → new section Closing the Audit — Severity and Stopping Rule: definitions; fix blocking only, carry advisory; record fixes in an addendum (which clears gate 8); no re-audit of the fixed text; one bounded pass at most, and where it blocks, the researcher rules. Canonical statement stays in `l5-framework-synthesis/workflows/FinalLadderReview.md`.
- `tools/synthesis-gates-check/check.ts` gate 8 message now names the addendum path beside re-audit.
- Not tested on a new run. Hold back from docs-only ladder v1.2.2; goes with v1.2.3.

## 2026-11-07 — The title comes from the behavioral pattern; clause-source check

- **Why (the researcher, 2026-11-07):** reviewing a client project's L2 v4 titles against each theme's behavioral pattern, four of the first eight carried a clause found only in the abductive connection (reworded here): "most switch only after a friend recommends it" (the pattern has one participant), "more than they feel they can explain" (a posited joint reading), "late delivery is the most common complaint" (not in the pattern), "or who delivered it" (one participant's question). Three had carried over unchanged from v3.6 and passed every audit. Cause: the 2026-11-06 text told the writer the title states "what the pattern and the abductive connection reached", and the L2 audit had no clause-source check, which L3 has.
- `ThemeFormat.md`: the title states what the behavioral pattern shows; new rule, each clause and qualifier traces to the pattern, the connection stays in the connection.
- `workflows/WriteTheme.md` step 6: same.
- `workflows/AuditThemeSet.md` Audit 3: new clause-source check, quoting the pattern sentence per clause. A failure is a finding, not advice; the First Read (3b) stays advisory.
- Not tested on a new run. Hold back from docs-only ladder v1.2.2.

## 2026-11-06 — Plain-word titles, title written last, first-read audit

- **Why (the researcher, 2026-11-06):** the same fault corrected at L3 (`l3-insight-synthesis/CHANGELOG.md`, 2026-11-06) is present in L2 titles, and a voice pass did not remove it. L2 stays strict: plain words do not widen a claim, and scope to participants and required counts stay.
- `ThemeFormat.md` → The Behavioral Name Test: first-read criterion, plain words, title written last, L2 stays strict; figurative and em-dash examples replaced; "uncomfortable" lines removed.
- `workflows/WriteTheme.md`, `workflows/SynthesizeThemes.md`: working name first, final title last; "sharpest" removed.
- `workflows/AuditThemeSet.md`: new Audit 3b (First Read), run first, by a separate reader, on a pinned prompt; its list is advice, not a pass or fail. Audit 7 renamed from Sharpness to Quality. Report section added.
- **Not tested at L2.** The L3 test ran first (`l3-insight-synthesis/CHANGELOG.md`, 2026-11-06), and it did not show the first-read audit working as a pass or fail. The researcher ruled the same day that the audit does not block clearance, and that descriptions follow the same writing rules; `ThemeFormat.md` gains Plain words in the body, with L2's strict scope unchanged. Kai applied both rulings at L2 as well as L3, in line with the approved plan to make the same changes at both levels. The L2 rewrite is this text's first live use.
- **Portable ladder:** not carried over. The build reads the working tree, so docs-only v1.2.2 must be built with these edits held back.

## 2026-11-03 — Count rule: participants counts enacted evidence only

From an independent tester's v1.1.2 three-level climb: a theme's `participants: 5` included a non-switcher's anticipated case, and an honest annotation did not stop the field being read as five. The rule:
- `participants:` counts only enacted evidence: behavior, or a belief held as the participant's own.
- Stated, hypothetical, anticipated, prescriptive and observed-in-others evidence goes under **Listed, not counted**.
- The Evidence section has three lists (Counted / Listed, not counted / Counter-cases and bounds).

The rule is applied in four places:
- `ThemeFormat.md`: the participants field and the Evidence template.
- `AuditThemeSet` Audit 2: the field must match the Counted list; annotating a miscount does not fix it.
- `SynthesizeThemes` checklist.
- `synthesis-gates.yaml`, under `theme_evidence_floor`.

One engagement's L2 set already followed this practice by the researcher's rulings; this makes it the format.

## 2026-11-03 — Audits 8 and 9 adopted after a seeded test

Audit 8 (counter-evidence) and Audit 9 (source and segment integrity, a reading not a tally) are added to `AuditThemeSet`. They are adopted after a blind seeded test: mean recall 6.92 against 4.83 over 6 runs each, which passes the pre-registered rule narrowly. The stance block is not adopted: it did not add planted catches and made the audit stricter; the test could not credit independent catches. Known gaps (conditional rewritten as behavior; severity running hot) are left for v1.2.1. Full entry: `skills/CHANGELOG.md`, 2026-11-03.

## 2026-11-03 — Inputs step: the audit reads the level below

The audit workflow gains an Inputs step: the directory of the level below (and L1 from L3 up), the `synthesis-audit-prepass` script on every audit, then a full read of the level below, with the fallback to the script's candidates plus cited items when it will not fit, and an `**Inputs read:**` line in the report, which gate 8 checks. Full entry and reasons: `skills/CHANGELOG.md`, 2026-11-03.

## 2026-10-26 — Bun fallback at Step 0

`workflows/AuditThemeSet.md`: under the Step 0 gate-check command, one line tells the agent to run it with `~/.bun/bin/bun` if `bun` is not found. Found on the 2026-10-26 clean-account run of the S37 Synthesis Ladder v1.1: with Bun off the agent's PATH, the agent running an audit went straight to Step 0 and never read `ladder-core`'s fallback line (it recovered by searching). The researcher's ruling 2026-10-26.

## 2026-09-27 (final) — Survey rule finished after the final check

The single-survey hold is keyed on the researcher-declared `survey_id`, and a `surveys:` theme field lets the checker enforce it: a survey-only theme from fewer than 2 surveys halts, and a missing `participants:` counts as 0. Only supporting rows whose claim kind matches the theme's claim count toward the floor. Respondents are mapped through the corpus `(respondent: …)` value. Separately exported channels of one survey count as one unit in the strength band. Held hypotheses live in the outliers list, not in theme files.

## 2026-09-27 (later) — Survey independence rule revised after a four-reviewer audit

Counting uses supporting rows (from L1 Row accounting), deduplicated by survey and ID. The single-batch hold is replaced by a single-survey hold (released only by another source type or another survey); survey-only themes across surveys carry `[SURVEY-ONLY]`; the 5+ strength band counts independent units (participants, sessions, surveys), never survey rows; per-finding denominators and claim kinds carry into theme Evidence. `participants:` redefined as interview and conversation participants only; the master themes template gains Source base and Limits lines; survey sources do not enter volume calibration. AuditThemeSet Audit 2 updated.

## 2026-09-27 — Survey independence rule; `survey_rows:` field

Added with the L1 Survey Variant and the new `survey-corpus-prep` skill. `SynthesizeThemes.md` Step 5 → Survey independence rule: survey findings count by distinct cited respondents, recorded in a new `survey_rows:` theme field (not `participants:`); the floor of 3 applies to the two together; a theme drawn from one survey batch is held `[HYPOTHESIS — single-batch]`; row counts are never written as shares. Point of use: Step 2 inventory line, Quality Checks line, `ThemeFormat.md` (field + Evidence Threshold paragraph), `AuditThemeSet.md` Audit 2. Canonical: `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`; `synthesis-gates-check` gate 4 now counts participants + survey_rows (test added).

## 2026-08-22 — L2 trace-check mirror installed PROVISIONAL (the researcher ratification 2026-08-22)

- `workflows/SynthesizeThemes.md` Step 6: trace check scoped to Implication + L4-flag text only (where the theme file leaves the participants' register; downstream rungs import these sections as evidence) + one quality-check line. Same two-part attribution rule as L3's Trace Field. **PROVISIONAL: this instrument's ledger row is unevidenced until its first live use** (Synthesist chair condition C1; ledger: Alexander project `alexander-instrument-ledger.md`).

## 2026-08-22 — Alexander cheap lane (the researcher slot rulings 2026-08-22; details in skills/CHANGELOG.md)

ThemeFormat: reserved-claim-verbs one-liner (Behavioral Name Test) + felt_flags master frontmatter field; SynthesizeThemes: Step 4 felt-check line + completion-report felt_flags; AuditThemeSet: discharge-sweep prose + Sweep-run report field.


## 2026-07-31 — ClusterObservations → ClusterFindings (drift-repair, researcher-ruled)

Renamed with the family's term-of-art shift ("observation" now names the researcher-sourced finding kind — see `skills/CHANGELOG.md` 2026-07-31 and `l1-findings-extraction` same date): this workflow clusters ALL findings, so the old name turned from dated to wrong. File renamed, routing table + Example 1 updated, internal "Observation Cluster Map" template header → "Finding Cluster Map", `synthesis-gates.yaml` theme_evidence_floor restatement pointer updated, abductive-reasoning's escalation table updated. No behavior change; validator clean.

## 2026-07-11 — Ladder gap audit (Architect + Engineer chairs): naming contract healed, quote guard added

**Architect:** the theme-file prefix contract was split — `ThemeFormat.md` and the system map canonize `L2-XX`, but `SKILL.md` ("Writes individual T2-NN files") and `WriteTheme.md` ("standalone T2-NN file") still carried the stale `T2-NN`, as did `../ladder-core/ladder-map.md`'s file-chain diagram. All three corrected to `L2-`. **Engineer:** WriteTheme Step 4 (evidence writing) gained the anti-fabrication rule L1 already carried — quote only verbatim from the cited L1 finding; a finding tagged `[paraphrased — no direct quote]` yields a behavioral description here, never a reconstructed quote. `ThemeFormat.md`'s Volume Calibration table gained the L1-style "normative, not derived" caveat. Template placeholders converted to angle brackets (family-wide sweep).
