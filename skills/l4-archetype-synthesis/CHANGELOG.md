# l4-archetype-synthesis — Changelog

*Prior history: this skill's record before 2026-07-11 lives in family-level entries in `skills/CHANGELOG.md` and `../ladder-core/ladder-map.md`. The L0–L5 QualResearcher fidelity pass (2026-07-11) verified its LeCompte eight-emergence-types match exactly and found no author-attributed claims out of order.*

---

## 2026-11-17 — First read, sweep line and gate 8 wording, after a fresh audit run

- **Why (the researcher, 2026-11-17):** a fresh agent ran the L2 audit on the seeded test set under the 2026-11-09 text and listed the places it could not follow as written. The researcher ruled on each the same day. The same sentences sit in all seven audit workflows, so all seven change.
- `workflows/AuditArchetypeSet.md` → first read: the auditor opens the set only to copy out the reader-facing text, before the pre-pass and before reading the level below, and may start the fresh reader itself. With no separate reader, the auditor reads the text and says the first read was not clean. The reader's list goes into the report word for word.
- `workflows/AuditArchetypeSet.md` → the Sweep run line reads "not applicable" on a first audit; the discharge sweep is recorded in the Addendum that records each fix.
- `workflows/AuditArchetypeSet.md` → the stopping-rule section says gate 8 compares the set's files with the current report, picked by the date or version in its name (the checker change of the same day).
- `workflows/AuditArchetypeSet.md` → Step 0: on a first audit, gate 8's warning that the set has no cleared audit report is expected; note it and go on.
- Not tested on a new run.

---

## 2026-11-09 — Severity on every recommended action; stopping rule after the fixes

- **Why (the researcher, 2026-11-09):** the L5 audits on a client project ran in a loop (v1 to v1e over 2026-11-07 and 11-08, then a FinalLadderReview re-run). Each round applied every recommendation, including the auditor's replacement text, and the next fresh auditor blocked the new text. This workflow had no severity vocabulary, so a Recommended Actions list was applied whole. A model test on v1e's input (one live and one fresh Opus 5.5 run, two Fable 5.1 runs) agreed on one of the live run's three blocking items; the other two were advisory to every other reader. The model was not the driver; the missing rule was.
- `workflows/AuditArchetypeSet.md` → Audit Report Format: each recommended action is marked **Blocking** or **Advisory**.
- `workflows/AuditArchetypeSet.md` → new section Closing the Audit — Severity and Stopping Rule: definitions; fix blocking only, carry advisory; record fixes in an addendum (which clears gate 8); no re-audit of the fixed text; one bounded pass at most, and where it blocks, the researcher rules. Canonical statement stays in `l5-framework-synthesis/workflows/FinalLadderReview.md`.
- `tools/synthesis-gates-check/check.ts` gate 8 message now names the addendum path beside re-audit.
- Not tested on a new run. Hold back from docs-only ladder v1.2.2; goes with v1.2.3.

## 2026-11-07 — Plain names and card text, advisory first read

- **Check 3.6 split (the researcher, 2026-11-07, option A):** 3.6a names block clearance, as every flag in this audit does; 3.6b card text is listed under "Flags noted but not blocking". Names are short, cheap to fix and the most reused part of a set; card-text findings run long and would turn clearance into line-by-line rulings. The other levels' audits have no any-flag-blocks rule, so this keeps Archetypes no stricter than them on body text.

- **Why (the researcher, 2026-11-07):** the L2 and L3 skills were changed on 2026-11-06 because titles and descriptions reached a client unreadable (commit 616d502). This skill still asked for names that are "mnemonic devices", "memorable" and "evocative", and offered metaphorical names (The Life Raft, The Trawler) as a mode. The researcher's ruling for L4 and L5: statements follow the L3 plain-statement rules unchanged; names stay short but must be understood on first read by a reader with no project context.
- `SKILL.md` Core Concept 6: two naming modes, behavioral action labels and plain descriptors. The metaphorical mode is removed. No figures of speech, wordplay, coined terms, or theory or working vocabulary in names. The example archetype "The Pioneer" is replaced.
- `DomainScope.md`: naming recommendations per domain rewritten for the two modes; figurative example names replaced (The Sprinter, The Orchestrator, The Navigator).
- `workflows/WriteArchetype.md`, `workflows/SynthesizeArchetypes.md`: the final naming pass is a first-read check, done after the evidence is written; "memorable", "evocative", "mnemonic" criteria removed; card text follows `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body; checklists updated.
- `workflows/AuditArchetypeSet.md`: new First Read, run first, by a separate reader on a pinned prompt, with a question for names and the clause-source question; advisory only, does not count against "Cleared for L5" (the researcher's 2026-11-06 ruling, applied here). Check 3.5 rewritten for two modes; new Check 3.6 for the listed faults in names and card text. Report section added.
- `ArchetypeFormat.md`: filename examples replaced.
- **Kept:** the Explorer, Doer, Spotter and Striver mode names where they refer to the frog Consumer Archetypes model in examples.
- **Not tested on a run.** Examples are engagement-neutral because this skill ships in the portable ladder.
- **Portable ladder:** not carried over. Hold these edits back from docs-only v1.2.2.

## 2026-11-03 — Inputs step: the audit reads the level below

The audit workflow gains an Inputs step: the directory of the level below (and L1 from L3 up), the `synthesis-audit-prepass` script on every audit, then a full read of the level below, with the fallback to the script's candidates plus cited items when it will not fit, and an `**Inputs read:**` line in the report, which gate 8 checks. Full entry and reasons: `skills/CHANGELOG.md`, 2026-11-03.

## 2026-10-26 — Bun fallback at Step 0

`workflows/AuditArchetypeSet.md`: under the Step 0 gate-check command, one line tells the agent to run it with `~/.bun/bin/bun` if `bun` is not found. Found on the 2026-10-26 clean-account run of the S37 Synthesis Ladder v1.1: with Bun off the agent's PATH, the agent running an audit went straight to Step 0 and never read `ladder-core`'s fallback line (it recovered by searching). The researcher's ruling 2026-10-26.

## 2026-08-22 — Alexander cheap lane (the researcher slot rulings 2026-08-22; details in skills/CHANGELOG.md)

ArchetypeFormat: felt_flags master frontmatter field; SynthesizeArchetypes: completion-report felt_flags; AuditArchetypeSet: discharge-sweep pair.


## 2026-07-11 — System-map integration + ladder gap audit fixes

Three same-day changes, in order: **(1)** Added to the abductive-reasoning escalation map during that skill's quad-chair audit — new `## Relationship to abductive-reasoning` section (archetype derivation as an ObservationToHypothesis candidate, with sibling-fallback clause) and a reciprocal Invoked From row; this closed the coverage gap where it was the only L4 sibling without the escalation route. **(2)** Added to `CORE/DesignResearchSystem.md` during the system-map currency pass — ladder-table row (L2-primary input, no precondition gate, archetype vs. proto-archetype honesty), pipeline-diagram branch, connection rows, sources row. **(3)** Ladder gap audit: frontmatter description recut from 306 chars to the canonical band; "validation/validate" wording frozen to the canonical **coherence check** (SKILL.md ×2 + system map ×2) for L3's role; `ArchetypeFormat.md`'s Volume Calibration table gained the L1-style "normative, not derived" caveat; after-synthesis pointer to `IllStructuredProblem/EvaluationCriteria` added; template placeholders converted to angle brackets (family-wide sweep).
