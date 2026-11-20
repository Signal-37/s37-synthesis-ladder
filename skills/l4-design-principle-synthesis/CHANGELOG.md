# l4-design-principle-synthesis — Changelog

> **This file was created 2026-08-01 and backfilled from the git record.** The skill ran 21 commits between 2026-05-09 and 2026-07-12 with no change log; the gap was found in a repo-wide CHANGELOG-vs-git sweep during a provenance review. Every entry is dated to its commit, not to the backfill, and carries its hash. Entries are reconstructed from commit messages, file lists, and — where marked — the diffs themselves; where a commit's *intent* is not recoverable from the record, the entry says what changed rather than inventing why.

---

## 2026-11-17 — First read, sweep line and gate 8 wording, after a fresh audit run

- **Why (the researcher, 2026-11-17):** a fresh agent ran the L2 audit on the seeded test set under the 2026-11-09 text and listed the places it could not follow as written. The researcher ruled on each the same day. The same sentences sit in all seven audit workflows, so all seven change.
- `workflows/AuditPrincipleSet.md` → first read: the auditor opens the set only to copy out the reader-facing text, before the pre-pass and before reading the level below, and may start the fresh reader itself. With no separate reader, the auditor reads the text and says the first read was not clean. The reader's list goes into the report word for word.
- `workflows/AuditPrincipleSet.md` → the Sweep run line reads "not applicable" on a first audit; the discharge sweep is recorded in the Addendum that records each fix.
- `workflows/AuditPrincipleSet.md` → the stopping-rule section says gate 8 compares the set's files with the current report, picked by the date or version in its name (the checker change of the same day).
- `workflows/AuditPrincipleSet.md` → Step 0: on a first audit, gate 8's warning that the set has no cleared audit report is expected; note it and go on.
- Not tested on a new run.

---

## 2026-11-09 — Severity on every recommended action; stopping rule after the fixes

- **Why (the researcher, 2026-11-09):** the L5 audits on a client project ran in a loop (v1 to v1e over 2026-11-07 and 11-08, then a FinalLadderReview re-run). Each round applied every recommendation, including the auditor's replacement text, and the next fresh auditor blocked the new text. This workflow had no severity vocabulary, so a Recommended Actions list was applied whole. A model test on v1e's input (one live and one fresh Opus 5.5 run, two Fable 5.1 runs) agreed on one of the live run's three blocking items; the other two were advisory to every other reader. The model was not the driver; the missing rule was.
- `workflows/AuditPrincipleSet.md` → Audit Report Format: each recommended action is marked **Blocking** or **Advisory**.
- `workflows/AuditPrincipleSet.md` → new section Closing the Audit — Severity and Stopping Rule: definitions; fix blocking only, carry advisory; record fixes in an addendum (which clears gate 8); no re-audit of the fixed text; one bounded pass at most, and where it blocks, the researcher rules. Canonical statement stays in `l5-framework-synthesis/workflows/FinalLadderReview.md`.
- `tools/synthesis-gates-check/check.ts` gate 8 message now names the addendum path beside re-audit.
- Not tested on a new run. Hold back from docs-only ladder v1.2.2; goes with v1.2.3.

## 2026-11-07 — Plain titles and body text, title written last, first-read audit

- **Why (the researcher, 2026-11-05 to 2026-11-07):** the L2 and L3 skills were rewritten on 2026-11-06 (commit `616d502`) after titles and descriptions reached a client unreadable. This skill asked for the same style: draft the title first, pick the sharpest, "memorable" as a required title quality with rhythm, semicolon pairs and sharp contrast, a through-line "memorable enough to quote", and examples built on coined phrases ("Invest where conviction forms", "Welcome as a brand act") and on the old L3 example "ceded that design to chance". **The researcher's ruling, 2026-11-07:** statements follow the L3 plain-statement rules unchanged; names (principle titles) stay short but must be understood on first read by a reader with no project context.
- `PrincipleFormat.md` → The Principle Title Test: the four qualities are now short, active, plain (the first-read test) and governing; "memorable" and the recall test are removed. When short and plain conflict, plain wins (usually 4–10 words, was 4–8). Title written last. Plain-title rules, and before and after examples for each old example title. New section Plain Writing in the Body: enforcement list at point of use, full rules cited from `../l3-insight-synthesis/InsightFormat.md`. Meridian test questions replaced with engagement-neutral ones. Through-line: plain statement, not a quotable line. Evidence: the quote rationale no longer rests on "memorable".
- `workflows/WritePrinciple.md`: title moves from step 1 to step 7; "pick the sharpest" removed; construction patterns rewritten (semicolon twin and as-clause reframe removed, "Design the dealer" replaced); L3 example replaced with the 2026-11-06 L3 plain example.
- `workflows/SynthesizePrinciples.md`: Step 4 is now Write Each Principle and Step 5 Write the Titles Last (were swapped); the cluster record carries a working label, not a draft title; "pick the sharpest" and the memorability checks removed.
- `workflows/AuditPrincipleSet.md`: Audit 2 tests plain in place of memorable and checks the body against Plain Writing in the Body. New Audit 2b (First Read), run first, by a separate reader pinned to `sonnet`, on the L3 Audit 3c prompt word for word, plus the clause-source question. Its list is advice and does not block "Cleared for L5" (the researcher's L3 ruling of 2026-11-06, applied unchanged). Report section added. Through-line test and rewrite prompt no longer use the dash form or a read-aloud test.
- `SKILL.md`: principle description and examples.
- **Not tested on a run.** Neither the title rules nor the body rules have been run on an L3 set under this text.
- **Not fixed by this change:** as at L3, plain wording does not catch a wrong inference.
- **Out of this skill's scope, noted:** `l5-framework-synthesis` (`FrameworkFormat.md`, `workflows/BuildDomain.md`) still uses the old example titles ("Invest where conviction forms" and others) as domain descriptors.
- **Portable ladder:** not carried over. Hold these edits back from docs-only ladder v1.2.2, as with `616d502`.

## 2026-11-03 — Inputs step: the audit reads the level below

The audit workflow gains an Inputs step: the directory of the level below (and L1 from L3 up), the `synthesis-audit-prepass` script on every audit, then a full read of the level below, with the fallback to the script's candidates plus cited items when it will not fit, and an `**Inputs read:**` line in the report, which gate 8 checks. Full entry and reasons: `skills/CHANGELOG.md`, 2026-11-03.

## 2026-10-26 — Bun fallback at Step 0

`workflows/AuditPrincipleSet.md`: under the Step 0 gate-check command, one line tells the agent to run it with `~/.bun/bin/bun` if `bun` is not found. Found on the 2026-10-26 clean-account run of the S37 Synthesis Ladder v1.1: with Bun off the agent's PATH, the agent running an audit went straight to Step 0 and never read `ladder-core`'s fallback line (it recovered by searching). The researcher's ruling 2026-10-26.

## 2026-08-22 — Alexander cheap lane (the researcher slot rulings 2026-08-22; details in skills/CHANGELOG.md)

PrincipleFormat: reserved-verbs one-liner (Principle Title Test) + felt_flags frontmatter; SynthesizePrinciples: completion-report felt_flags; AuditPrincipleSet: discharge-sweep pair.


## 2026-07-12 — CopyEditor provenance seam *[backfilled — `d1f3dc5`]*

Quad-chair CopyEditor audit closed the provenance seam at the skill and all eight callers; here it landed in `AuditPrincipleSet.md`. `tools/.gitkeep` added.

## 2026-07-11 — Ladder gap audit: the widest single pass over this skill *[backfilled — `4e99de8`]*

Every file changed — `SKILL.md`, `PrincipleFormat.md`, `DomainScope.md`, and all three workflows (`SynthesizePrinciples`, `WritePrinciple`, `AuditPrincipleSet`). Part of the ladder gap audit closing the audit program over the live stack.

## 2026-07-11 — Tri-chair fidelity pass *[backfilled — `2689e35`]*

The L0–L5 fidelity chair touched `SKILL.md` and `PrincipleFormat.md`.

## 2026-07-10 — Synthesis gates wired in *[backfilled — `ca7d58d`, `84c4ee0`]*

`synthesis-gates.yaml` wired at `gates_version 2026-07-10.1`, reaching `DomainScope.md`, `PrincipleFormat.md`, and `SynthesizePrinciples.md`; `synthesis-gates-check` installed as **Step 0** of `AuditPrincipleSet` and all seven ladder set-audits.

## 2026-07-09 — L4 composition single-sourced *[backfilled — `b9d34ba`]*

`SKILL.md` updated in the pass that made `../ladder-core/ladder-map.md` §L4 composition the canonical list of the four parallel L4 outputs, rather than each skill enumerating its siblings locally.

## 2026-06-29 — Nelson & Stolterman: "what it prevents" became a responsibility-escape route *[backfilled — `bc41da3`, diff verified]*

The fifth part of the principle structure was **"what it prevents — the specific failure mode this principle guards against."** It now names the specific *responsibility-escape route* the principle closes, using N&S's three: **moving** (deferring to client preference or prescribed method), **hiding** (distributing accountability so no one owns it), and **removing** (claiming data, market forces, or inevitability made the decision). A sharper instrument than "failure mode" — it forces the author to say which way responsibility would have leaked, and design principles are exactly where that leak is normally invisible.

## 2026-06-29 — Domain-set markers *[backfilled — `37af6aa`]*

`DomainScope.md` gained the domain-set marker rolled across the ladder in the same pass.

## 2026-06-21 — Audit-save step *[backfilled — `7e2f148`]*

Audit-save step and post-synthesis audit reminders, across the ladder.

## 2026-06-17 — Architect review fixes; "Two Approaches" moved *[backfilled — `3609b38`, `c583e18`]*

Architect-review pass over the three L4 skills reached `SKILL.md`. A same-day refactor moved the **"Two Approaches"** section *above* the five-part structure — ordering the choice of approach before the format it produces, rather than after.

## 2026-06-06 — CopyEdit reminder *[backfilled — `bee75d9`]*

Added to `AuditPrincipleSet.md`, across all ladder audit workflows.

## 2026-06-04 — DomainScope created *[backfilled — `4ff609a`]*

`DomainScope.md` created (~49 lines) as DomainScope rolled across L2–L5, with the FinalLadderReview capstone and audit-gate reminders; `SKILL.md` updated to match.

## 2026-06-03 — Ten guardrails from the Meridian V5 audit *[backfilled — `041a980`]*

Guardrails derived from a live engagement audit hardened `AuditPrincipleSet.md`.

## 2026-06-01 — "What it rejects" and the Principles × OA cross-application *[backfilled — `f6284c4`, `bccc3d0`, diff verified]*

`PrincipleFormat.md` gained two things. **"What it rejects"** — the specific alternative approach, program type, or organizational move the principle explicitly refuses; not the failure it prevents but the choice the organization might actively make and this principle vetoes. And a **Cross-application: Principles × Opportunity Areas** table mapping which principles govern which OAs as primary governing rule versus secondary constraint — used to validate the L5 pairing logic *before* framework synthesis, which is what keeps L5 from discovering the mismatch late. A second commit the same day standardized source traceability across the L2–L5 format files.

## 2026-05-31 — abductive-reasoning cross-references *[backfilled — `fc08bf0`]*

`SKILL.md` gained the abductive-reasoning cross-references added across L3–L5.

## 2026-05-13 — Anti-hallucination guardrail *[backfilled — `2d465bf`]*

`SynthesizePrinciples.md` was one of the 15 workflows that received an anti-hallucination guardrail in the repo-wide pass — recorded here rather than as cross-cutting noise because it landed in a synthesis workflow, not a doc file.

## 2026-05-09 — Present at repo initialization *[backfilled — `d48cb20`]*

The skill predates the private PAI repo: the initial commit imported `SKILL.md` (~117 lines) and the workflows. **Anything about its origin predates the git record.**

---

### Cross-cutting commits with no skill-specific content

`dd13514` (2026-05-11, descriptions tightened to the canonical USE WHEN format).
