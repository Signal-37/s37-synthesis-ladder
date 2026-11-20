# l4-value-proposition-synthesis — Changelog

> **This file was created 2026-08-01 and backfilled from the git record.** The skill ran 17 commits between 2026-06-02 and 2026-07-12 with no change log; the gap was found in a repo-wide CHANGELOG-vs-git sweep during a provenance review. Every entry is dated to its commit, not to the backfill, and carries its hash. Entries are reconstructed from commit messages, file lists, and — where marked — the diffs themselves. Unlike its three sibling L4 skills, this one has a full origin record: see `RATIONALE.md`, written the day it was created.

---

## 2026-11-17 — First read, sweep line and gate 8 wording, after a fresh audit run

- **Why (the researcher, 2026-11-17):** a fresh agent ran the L2 audit on the seeded test set under the 2026-11-09 text and listed the places it could not follow as written. The researcher ruled on each the same day. The same sentences sit in all seven audit workflows, so all seven change.
- `workflows/AuditValuePropositionSet.md` → first read: the auditor opens the set only to copy out the reader-facing text, before the pre-pass and before reading the level below, and may start the fresh reader itself. With no separate reader, the auditor reads the text and says the first read was not clean. The reader's list goes into the report word for word.
- `workflows/AuditValuePropositionSet.md` → the Sweep run line reads "not applicable" on a first audit; the discharge sweep is recorded in the Addendum that records each fix.
- `workflows/AuditValuePropositionSet.md` → the stopping-rule section says gate 8 compares the set's files with the current report, picked by the date or version in its name (the checker change of the same day).
- `workflows/AuditValuePropositionSet.md` → Step 0: on a first audit, gate 8's warning that the set has no cleared audit report is expected; note it and go on.
- Not tested on a new run.

---

## 2026-11-09 — Severity on every recommended action; stopping rule after the fixes

- **Why (the researcher, 2026-11-09):** the L5 audits on a client project ran in a loop (v1 to v1e over 2026-11-07 and 11-08, then a FinalLadderReview re-run). Each round applied every recommendation, including the auditor's replacement text, and the next fresh auditor blocked the new text. This workflow had no severity vocabulary, so a Recommended Actions list was applied whole. A model test on v1e's input (one live and one fresh Opus 5.5 run, two Fable 5.1 runs) agreed on one of the live run's three blocking items; the other two were advisory to every other reader. The model was not the driver; the missing rule was.
- `workflows/AuditValuePropositionSet.md` → Audit Report Format: each recommended action is marked **Blocking** or **Advisory**.
- `workflows/AuditValuePropositionSet.md` → new section Closing the Audit — Severity and Stopping Rule: definitions; fix blocking only, carry advisory; record fixes in an addendum (which clears gate 8); no re-audit of the fixed text; one bounded pass at most, and where it blocks, the researcher rules. Canonical statement stays in `l5-framework-synthesis/workflows/FinalLadderReview.md`.
- `tools/synthesis-gates-check/check.ts` gate 8 message now names the addendum path beside re-audit.
- Not tested on a new run. Hold back from docs-only ladder v1.2.2; goes with v1.2.3.

## 2026-11-07 — Plain titles and text, advisory first read

- **Why (the researcher, 2026-11-07):** the L2 and L3 skills were changed on 2026-11-06 because titles and descriptions reached a client unreadable (commit 616d502); the researcher ruled the same rules apply at L4 and L5. This skill had no figurative or "sharpest" wording, so the change is light.
- `ValuePropositionFormat.md`, `workflows/WriteValueProposition.md`: the VP title is written last, in literal words a reader with no project context understands on first read; all text follows `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body.
- `workflows/SynthesizeValuePropositions.md`: two checklist lines for the above.
- `workflows/AuditValuePropositionSet.md`: new First Read, run first, by a separate reader on a pinned prompt, with the clause-source question; advisory only, does not count against "Cleared for L5" (the researcher's 2026-11-06 ruling, applied here). Report section added.
- **Not tested on a run.** Hold these edits back from docs-only ladder v1.2.2.

## 2026-11-03 — Inputs step: the audit reads the level below

The audit workflow gains an Inputs step: the directory of the level below (and L1 from L3 up), the `synthesis-audit-prepass` script on every audit, then a full read of the level below, with the fallback to the script's candidates plus cited items when it will not fit, and an `**Inputs read:**` line in the report, which gate 8 checks. Full entry and reasons: `skills/CHANGELOG.md`, 2026-11-03.

## 2026-10-26 — Bun fallback at Step 0

`workflows/AuditValuePropositionSet.md`: under the Step 0 gate-check command, one line tells the agent to run it with `~/.bun/bin/bun` if `bun` is not found. Found on the 2026-10-26 clean-account run of the S37 Synthesis Ladder v1.1: with Bun off the agent's PATH, the agent running an audit went straight to Step 0 and never read `ladder-core`'s fallback line (it recovered by searching). The researcher's ruling 2026-10-26.

## 2026-09-22 — The skill no longer names its output a "Value Proposition Canvas"; Strategyzer credited

**Type:** Rework for distribution (the researcher, 2026-09-22: "I do not call the skill value proposition canvas, nor do I use that visual"; ruled: name and visual, not the component vocabulary). No change to the method, gates or counts.

**Why.** Strategyzer's usage terms put the Value Proposition Canvas under reserved copyright, unlike the Creative Commons licence on the Business Model Canvas: use for one's own work with credit to Strategyzer.com and Strategyzer AG is allowed; "adaptations" and "inclusion of the canvas in software applications or sold as a tool" need express permission. The skill ships in packages under CC BY-SA 4.0, a grant that cannot extend to Strategyzer's material, and it named its output the canvas and described the canvas's layout. "Value Proposition Canvas" was filed as a US trademark by Strategyzer AG in 2014 (serial 86222907); whether it is registered and live was not confirmed. Not legal advice.

**What changed.** `VPCFormat.md` renamed `ValuePropositionFormat.md` (pointers updated in this skill, `../ladder-core/config/synthesis-gates.yaml` and the three build-distro manifests). "Value Proposition Canvas (VPC)" and "VPC Customer Profile" removed as names for the output (now "Customer Profile" and "Value Map"); the canvas-layout language removed (right side / left side / "fit in the center" / "the canvas format"). The structure is credited to Osterwalder et al.'s *Value Proposition Design*, and Strategyzer AG is credited in Sources as the maker of the canvas, with the statement that this skill does not reproduce the canvas or use its name for its output. Kept, as credited method terms: Customer Profile, Value Map, jobs, pains, gains, pain relievers, gain creators, fit.

---

## 2026-08-22 — Alexander cheap lane (the researcher slot rulings 2026-08-22; details in skills/CHANGELOG.md)

VPCFormat: reserved-verbs one-liner (Job Statement Test) + felt_flags frontmatter; SynthesizeValuePropositions: completion-report felt_flags (falsifier wiring STAGED); AuditValuePropositionSet: discharge-sweep pair.


## 2026-08-21 — Backfilled 2026-06-16 entry corrected: this file never reached seven audits

The backfilled entry below claimed the same-week pass took "the L3/L4 audit workflows to seven audits" including this one; `git show 028237f` shows `## The Six Audits` already present at the cited commit — the backfill copied the commit message's overclaim. Corrected in place, correction noted inline. Found during the Alexander plan Phase 0.1 full count derivation (taxonomy: numbered audits count, sub-letters don't).

## 2026-07-12 — CopyEditor provenance seam *[backfilled — `d1f3dc5`]*

Quad-chair CopyEditor audit closed the provenance seam at the skill and all eight callers; here in `AuditValuePropositionSet.md`. `tools/.gitkeep` added.

## 2026-07-11 — Ladder gap audit *[backfilled — `4e99de8`]*

`SKILL.md`, `VPCFormat.md`, `DomainScope.md`, and all three workflows changed in the pass that closed the audit program over the live stack.

## 2026-07-11 — Tri-chair fidelity pass: the High-Value Jobs screen is ours, not Christensen's *[backfilled — `2689e35`, diff verified]*

**The most consequential correction in this skill's history, and an attribution one.** The four-part screen for ranking jobs by importance — *Important + Tangible + Unsatisfied + Lucrative* — had been attributed in `SKILL.md` to Christensen and in `VPCFormat.md` to VPD / Osterwalder. The fidelity chair found the named four-part screen appears in **neither** corpus: not in the *Competing Against Luck* notes, not in the *Value Proposition Design* notes. It is **a PAI composite drawn from the JTBD literature**, and all three files were relabelled to say so, with a `[model knowledge — verify]` tag on the attribution.

What survived verification is stated precisely alongside it: the VPC canvas format is genuinely Osterwalder's (Customer Profile right, Value Map left, Fit centre), as are the four gain types (Required / Expected / Desired / Unexpected). `RATIONALE.md` was updated in the same commit.

This is the pattern worth remembering — a synthesized-from-several-sources construct silently acquiring a single famous author's name. The correction did not weaken the screen; it stopped it borrowing authority it hadn't earned.

## 2026-07-10 — Synthesis gates and guardrails *[backfilled — `ca7d58d`, `84c4ee0`, `00853b8`]*

`synthesis-gates.yaml` wired at `gates_version 2026-07-10.1` (reaching `DomainScope.md`, `VPCFormat.md`, `SynthesizeValuePropositions.md`); `synthesis-gates-check` installed as **Step 0** of `AuditValuePropositionSet` and all seven ladder set-audits; and the guardrails cycle-1 close-out pass (backlog to zero, HALT promotion, v2 heuristic, waivers) touched `SynthesizeValuePropositions.md`.

## 2026-07-09 — L4 composition single-sourced *[backfilled — `b9d34ba`]*

`SKILL.md` and `RATIONALE.md` updated in the pass that made `../ladder-core/ladder-map.md` §L4 composition the canonical list of the four parallel L4 outputs.

## 2026-06-29 — Domain-set markers *[backfilled — `37af6aa`]*

`DomainScope.md` gained the domain-set marker rolled across the ladder.

## 2026-06-21 — CustomerSegmentation reference doc *[backfilled — `371cdb4`, `7e2f148`]*

`CustomerSegmentation.md` added as a reference document for the skill. Separately, the ladder-wide audit-save step and post-synthesis audit reminders landed in both the synthesize and set-audit workflows.

## 2026-06-17 — Architect review fixes *[backfilled — `3609b38`]*

Architect-review pass over the three L4 skills; here it reached `SKILL.md`.

## 2026-06-16 — Audit Report Format; set-audit expanded to seven *[backfilled — `167ea03`, `028237f`]*

`AuditValuePropositionSet.md` gained an **Audit Report Format** section in the same-week pass that took the *other* L3/L4 audit workflows to seven audits — this file's set stayed at six (verified against `028237f`: "The Six Audits" already; the original entry copied the commit message's overclaim. Corrected 2026-08-21, Phase 0.1).

## 2026-06-06 — CopyEdit reminder *[backfilled — `bee75d9`]*

Added to `AuditValuePropositionSet.md`, across all ladder audit workflows.

## 2026-06-04 — DomainScope created *[backfilled — `4ff609a`]*

`DomainScope.md` created as DomainScope rolled across L2–L5, with the FinalLadderReview capstone and audit-gate reminders. Every file in the skill was touched — two days after the skill was created.

## 2026-06-03 — Ten guardrails from the Meridian V5 audit *[backfilled — `041a980`]*

Guardrails from a live engagement audit hardened `AuditValuePropositionSet.md`, one day after the skill existed.

## 2026-06-02 — Skill created *[backfilled — `926c54a`]*

Created with `SKILL.md`, `VPCFormat.md`, `RATIONALE.md`, and all three workflows (`SynthesizeValuePropositions`, `WriteValueProposition`, `AuditValuePropositionSet`).

**Origin is on the record** — `RATIONALE.md` documents it as a conversation between the researcher and Kai on 2026-06-02, following ingestion of Christensen's *Competing Against Luck*, the three JTBD texts (Christensen, Kalbach, Wunker), and Osterwalder's *Value Proposition Design*. The question that produced the skill, in the researcher's words: *"what is the relationship between JTBD and Value Propositions? My instinct is there is another L4 skill to create that goes along with Opportunity Areas."* The instinct was right, and it is the reason the L4 rung has four parallel outputs rather than three. The same commit audited and deepened agent book references.

**This is the only one of the four L4/L5 skills whose origin is recoverable from the repo** — the other three predate it. Keeping a rationale doc at creation is what made that possible.
