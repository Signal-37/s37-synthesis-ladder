# l4-opportunity-area-synthesis — Changelog

> **This file was created 2026-08-01 and backfilled from the git record.** The skill ran 21 commits between 2026-05-09 and 2026-07-12 with no change log; the gap was found in a repo-wide CHANGELOG-vs-git sweep during a provenance review. Every entry is dated to its commit, not to the backfill, and carries its hash. Entries are reconstructed from commit messages, file lists, and — where marked — the diffs themselves; where a commit's *intent* is not recoverable from the record, the entry says what changed rather than inventing why.

---

## 2026-11-17 — First read, sweep line and gate 8 wording, after a fresh audit run

- **Why (the researcher, 2026-11-17):** a fresh agent ran the L2 audit on the seeded test set under the 2026-11-09 text and listed the places it could not follow as written. The researcher ruled on each the same day. The same sentences sit in all seven audit workflows, so all seven change.
- `workflows/AuditOpportunityAreaSet.md` → first read: the auditor opens the set only to copy out the reader-facing text, before the pre-pass and before reading the level below, and may start the fresh reader itself. With no separate reader, the auditor reads the text and says the first read was not clean. The reader's list goes into the report word for word.
- `workflows/AuditOpportunityAreaSet.md` → the Sweep run line reads "not applicable" on a first audit; the discharge sweep is recorded in the Addendum that records each fix.
- `workflows/AuditOpportunityAreaSet.md` → the stopping-rule section says gate 8 compares the set's files with the current report, picked by the date or version in its name (the checker change of the same day).
- `workflows/AuditOpportunityAreaSet.md` → Step 0: on a first audit, gate 8's warning that the set has no cleared audit report is expected; note it and go on.
- Not tested on a new run.

---

## 2026-11-09 — Severity on every recommended action; stopping rule after the fixes

- **Why (the researcher, 2026-11-09):** the L5 audits on a client project ran in a loop (v1 to v1e over 2026-11-07 and 11-08, then a FinalLadderReview re-run). Each round applied every recommendation, including the auditor's replacement text, and the next fresh auditor blocked the new text. This workflow had no severity vocabulary, so a Recommended Actions list was applied whole. A model test on v1e's input (one live and one fresh Opus 5.5 run, two Fable 5.1 runs) agreed on one of the live run's three blocking items; the other two were advisory to every other reader. The model was not the driver; the missing rule was.
- `workflows/AuditOpportunityAreaSet.md` → Audit Report Format: each recommended action is marked **Blocking** or **Advisory**.
- `workflows/AuditOpportunityAreaSet.md` → new section Closing the Audit — Severity and Stopping Rule: definitions; fix blocking only, carry advisory; record fixes in an addendum (which clears gate 8); no re-audit of the fixed text; one bounded pass at most, and where it blocks, the researcher rules. Canonical statement stays in `l5-framework-synthesis/workflows/FinalLadderReview.md`.
- `tools/synthesis-gates-check/check.ts` gate 8 message now names the addendum path beside re-audit.
- Not tested on a new run. Hold back from docs-only ladder v1.2.2; goes with v1.2.3.

## 2026-11-07 — Plain HMW questions and body text, HMW written after Why this matters, OA title last, first-read audit

- **Why (the researcher, 2026-11-05 to 2026-11-07):** L3 titles and descriptions reached a client unreadable and needed a complete rewrite, and the L2 and L3 skills were changed on 2026-11-06 (commit `616d502`). This skill asked for the same style one level up: a guiding image "felt before it is argued — more evocative than precise", the em-dash HMW form ("the em-clause is where the research grounding lives"), the HMW drafted first and "pick the sharpest", L1 evidence that "should feel slightly uncomfortable to omit", and examples built on figurative L3 claims ("ceded that design to chance", "untapped brand asset"). The researcher ruled on 2026-11-07 that L4 and L5 statements follow the L3 rules unchanged, and that names stay short but must be understood on first read.
- `OAFormat.md` → The HMW Question Test: the em-clause structure is removed; a third test (first read); the HMW is written after Why this matters; plain-question rules; before and after examples; the OA title rule (a plain one-sentence statement of what would be true for the people served, not a label; written last). New section Plain Writing in the Body, pointing to `../l3-insight-synthesis/InsightFormat.md` with the rules restated at point of use, plus one rule for this level: state each L3 claim as the L3 states it, not stronger or broader. Template HMW line and Success horizon example lose the dash form.
- **The HMW is one question (the researcher, 2026-11-07, after the re-run).** The first draft allowed the constraint "in a second sentence"; three of five HMWs in the re-run then carried a context sentence that repeated Why this matters. The second-sentence allowance is removed.
- **OA titles are statements, not labels (the researcher, 2026-11-07, after the test).** The first draft of this change let the OA title be a short label. In a test on a client project the new text produced titles such as "The first visit" and "Local price". The researcher ruled that OA titles are statements. The title states what would be true for the people served once the opportunity is addressed, which keeps it apart from the L3 insight (what is true now), the HMW (a question) and a recommendation.
- `workflows/WriteOpportunityArea.md`: writing order is Why this matters, HMW, scope, not in scope, OA title, source insights. HMW Formulation rewritten without the em-clause; engagement-specific HMW structures replaced with neutral patterns. "Pick the sharpest" and the "uncomfortable to omit" line replaced with literal tests. Level table uses the plain L3 example from `l3-insight-synthesis/workflows/AuditInsightSet.md`.
- `workflows/SynthesizeOpportunityAreas.md`: the guiding image is a plain statement, with plain examples. Step 5 keeps working HMW candidates as a clustering aid only; Step 6 writes Why this matters first, the HMW from it, and the OA title last. Quality checks point to the plain-writing rules.
- `workflows/AuditOpportunityAreaSet.md`: new Audit 2b (First Read), run first, by a separate reader on `sonnet`, on the pinned prompt from L3's Audit 3c, with the clause-source question; its list is advice and does not count against "Cleared for L5" (the researcher's 2026-11-06 ruling, extended to L4 on 2026-11-07). Audit 2: the em-clause red flag becomes "does not say what makes it hard" plus a dash-form red flag; plain-writing checks added. Report section added.
- `SKILL.md`: examples replaced with engagement-neutral plain forms; structure line and examples follow the new writing order.
- **Not tested on a run.** The researcher's 2026-11-06 test covered L3 titles only; neither the HMW rules nor the body rules here have been run.
- **Not fixed by this change:** plain wording does not catch a wrong inference, and labeling a clause as the synthesist's reading lets it through (same open item as L3).
- Examples are engagement-neutral because this skill ships in the portable ladder.
- **Portable ladder:** not carried over. The build reads the working tree, so docs-only v1.2.2 must be built with these edits held back, as with `616d502`.

## 2026-11-03 — Inputs step: the audit reads the level below

The audit workflow gains an Inputs step: the directory of the level below (and L1 from L3 up), the `synthesis-audit-prepass` script on every audit, then a full read of the level below, with the fallback to the script's candidates plus cited items when it will not fit, and an `**Inputs read:**` line in the report, which gate 8 checks. Full entry and reasons: `skills/CHANGELOG.md`, 2026-11-03.

## 2026-10-26 — Bun fallback at Step 0

`workflows/AuditOpportunityAreaSet.md`: under the Step 0 gate-check command, one line tells the agent to run it with `~/.bun/bin/bun` if `bun` is not found. Found on the 2026-10-26 clean-account run of the S37 Synthesis Ladder v1.1: with Bun off the agent's PATH, the agent running an audit went straight to Step 0 and never read `ladder-core`'s fallback line (it recovered by searching). The researcher's ruling 2026-10-26.

## 2026-08-22 — Alexander cheap lane (the researcher slot rulings 2026-08-22; details in skills/CHANGELOG.md)

OAFormat: reserved-verbs one-liner (HMW Question Test) + felt_flags frontmatter; SynthesizeOpportunityAreas: completion-report felt_flags (falsifier wiring STAGED); AuditOpportunityAreaSet: discharge-sweep pair.


## 2026-07-12 — CopyEditor provenance seam *[backfilled — `d1f3dc5`]*

Quad-chair CopyEditor audit closed the provenance seam at the skill and all eight callers; here it landed in `AuditOpportunityAreaSet.md`. `tools/.gitkeep` added (SkillSystem requires the directory even when empty).

## 2026-07-11 — Ladder gap audit: the widest single pass over this skill *[backfilled — `4e99de8`]*

Every file in the skill changed — `SKILL.md`, `OAFormat.md`, `DomainScope.md`, and all three workflows (`SynthesizeOpportunityAreas`, `WriteOpportunityArea`, `AuditOpportunityAreaSet`). Part of the ladder gap audit that closed the audit program over the live stack, run alongside the IllStructuredProblem tri-chair.

## 2026-07-11 — Tri-chair fidelity pass *[backfilled — `2689e35`]*

The L0–L5 ladder fidelity chair (same day, same audit round as DesignResearchPlanning, DesignSynthesis, FieldResearch, DesignDiagrams) touched `SKILL.md` and the set-audit workflow.

## 2026-07-10 — Synthesis gates wired in *[backfilled — `ca7d58d`, `84c4ee0`]*

`synthesis-gates.yaml` wired into the ladder at `gates_version 2026-07-10.1` — reaching `DomainScope.md`, `OAFormat.md`, and both the synthesize and write workflows. A second commit the same day installed `synthesis-gates-check` as **Step 0** of `AuditOpportunityAreaSet` and of all seven ladder set-audits.

## 2026-07-09 — L4 composition single-sourced: three parallel outputs became four *[backfilled — `b9d34ba`, diff verified]*

`SKILL.md` had described this as "one of three parallel L4 outputs." It now reads **four**, adding `l4-archetype-synthesis` (*who* it designs for) alongside DesignPrinciple (*how* the organization acts) and ValueProposition (*what* it could offer) — and, more importantly, stops enumerating them locally: the line now points at `../ladder-core/ladder-map.md` §L4 composition as the canonical list, with the conditions attaching to each. Single-sourcing the composition is what keeps the four L4 skills from drifting apart as the set changes.

## 2026-06-29 — Nelson & Stolterman: the guiding image (*parti*) becomes Step 3 *[backfilled — `4c70a3e`, diff verified]*

The synthesize workflow gained a new **Step 3, "Pause for the Guiding Image,"** ahead of clustering, renumbering everything below it (old Steps 3–9 became 4–10). Before any territory is drawn, the synthesist pauses on one question: *has a guiding image emerged from reading all the insights simultaneously?* The step is careful about what the *parti* is not — not a solution concept, not an OA title, not a strategy statement — and how to surface it: read the full insight inventory *not to analyze but to sense*, then write it in one or two sentences. It then does real work downstream: in the clustering step each candidate cluster is tested against it (a cluster that doesn't connect may belong inside another OA's scope, or the image itself may need revising), it is documented in the master OA document's introduction as the orienting premise, and it gives L5 framework synthesis a starting point for the integration move. If no image emerges, the instruction is explicit — **don't force it**; proceed and articulate it retrospectively as a through-line check.

## 2026-06-29 — OA structure grew from five parts to seven *[backfilled — `e74e94d`, diff verified]*

`OAFormat.md` gained ~72 lines and `SKILL.md` was updated to match:

- **Success horizon** — 2–3 directional signals that would say this territory is proving itself. Explicitly *not* KPIs or metric targets: observable behavioral or experiential shifts, deliberately impressionistic so they open possibilities rather than close them.
- **Assumptions** — unvalidated organizational or structural conditions the OA depends on; platzgeist gaps that fieldwork did not surface.

Source insights moved from position 5 to position 7.

## 2026-06-29 — Domain-set markers *[backfilled — `37af6aa`]*

`DomainScope.md` gained the domain-set marker added across the ladder in the same pass that gave l4-archetype-synthesis its DomainScope.

## 2026-06-21 — Audit-save step *[backfilled — `7e2f148`]*

Audit-save step and post-synthesis audit reminders added to the synthesize and set-audit workflows, across the ladder.

## 2026-06-17 — Architect review fixes *[backfilled — `3609b38`]*

Architect-review pass over the three L4 skills (OA + Principles + VP); here it reached `SKILL.md`, `OAFormat.md`, and `WriteOpportunityArea.md`.

## 2026-06-16 — Set-audit expanded to seven audits *[backfilled — `028237f`]*

`AuditOpportunityAreaSet.md` expanded as part of taking the L3/L4 audit workflows to seven audits.

## 2026-06-12 — SystemsThinking integration *[backfilled — `9e1674f`]*

One of three targeted additions integrating SystemsThinking into the L0–L5 ladder; landed in the set-audit workflow.

## 2026-06-06 — CopyEdit reminder *[backfilled — `bee75d9`]*

CopyEdit reminder added to the set-audit workflow, across all ladder audit workflows.

## 2026-06-04 — DomainScope created; FinalLadderReview capstone *[backfilled — `4ff609a`]*

`DomainScope.md` created (~49 lines) as part of rolling DomainScope across L2–L5, together with the FinalLadderReview capstone and audit-gate reminders. Every file in the skill was touched.

## 2026-06-03 — Ten guardrails from the Meridian V5 audit *[backfilled — `041a980`]*

Guardrails derived from a real engagement audit (Meridian V5) hardened `AuditOpportunityAreaSet.md` — fieldwork feeding back into the instrument.

## 2026-06-01 — Source traceability standardized *[backfilled — `bccc3d0`]*

`OAFormat.md` brought into the common source-traceability form used across the L2–L5 format files.

## 2026-05-31 — abductive-reasoning cross-references *[backfilled — `fc08bf0`]*

`SKILL.md` gained cross-references to abductive-reasoning, added across L3–L5 — the ladder's transitions named as abductive moves rather than left implicit.

## 2026-05-09 — Present at repo initialization *[backfilled — `d48cb20`]*

The skill existed before the private PAI repo did: the initial commit imported `SKILL.md` (~104 lines), `OAFormat.md` (~286 lines), and all three workflows. **Anything about the skill's origin predates the git record** — the repo starts mid-life, and this file cannot recover what came before it.

---

### Cross-cutting commits with no skill-specific content

Repo-wide passes that touched this skill incidentally, recorded here rather than as entries: `dd13514` (2026-05-11, descriptions tightened to the canonical USE WHEN format) and `2d465bf` (2026-05-13, anti-hallucination guardrails across 15 skill workflows).
