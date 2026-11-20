# l5-framework-synthesis — Changelog

> **This file was created 2026-08-01 and backfilled from the git record.** The skill ran 23 commits between 2026-05-09 and 2026-07-12 with no change log; the gap was found in a repo-wide CHANGELOG-vs-git sweep during a provenance review. Every entry is dated to its commit, not to the backfill, and carries its hash. Entries are reconstructed from commit messages, file lists, and — where marked — the diffs themselves; where a commit's *intent* is not recoverable from the record, the entry says what changed rather than inventing why.

---

## 2026-11-17 — First read, sweep line and gate 8 wording, after a fresh audit run

- **Why (the researcher, 2026-11-17):** a fresh agent ran the L2 audit on the seeded test set under the 2026-11-09 text and listed the places it could not follow as written. The researcher ruled on each the same day. The same sentences sit in all seven audit workflows, so all seven change.
- `workflows/AuditFramework.md` → first read: the auditor opens the set only to copy out the reader-facing text, before the pre-pass and before reading the level below, and may start the fresh reader itself. With no separate reader, the auditor reads the text and says the first read was not clean. The reader's list goes into the report word for word.
- `workflows/AuditFramework.md` → the Sweep run line reads "not applicable" on a first audit; the discharge sweep is recorded in the Addendum that records each fix.
- `workflows/AuditFramework.md` → the stopping-rule section says gate 8 compares the set's files with the current report, picked by the date or version in its name (the checker change of the same day).
- `workflows/AuditFramework.md` → Step 0: on a first audit, gate 8's warning that the set has no cleared audit report is expected; note it and go on.
- Not tested on a new run.

---

## 2026-11-10 — What the framework is for; names beside codes on the visual; client-comments pointer

- **Why (the researcher, 2026-11-10, a client project's L5 v1.4):** four reviewers compared two framework options as ways into L4, and all four flagged a diagram that showed OA and principle codes with no names. Claude then built a separate two-page "on-ramp" beside the framework and proposed wording it differently. The researcher: "The central idea is the framework serves as an on-ramp to the ideas. Not two different things. We have a framework as a way of holding together the entirety of the synthesis ladder."
- `SKILL.md` → new paragraph What the framework is for: the framework holds the ladder together and is itself the way in; no separate on-ramp document; a short form is the same framework in fewer words, same wording.
- `FrameworkFormat.md` → The Systems Logic Diagram and The Visual Document: every OA and principle on a diagram carries its short name with the code beside it, never the code alone. The Mermaid node template changes to match.
- `workflows/AuditFramework.md` → Audit 6: the node-content check names the short names, and a new check fails any diagram that shows a code alone.
- `SKILL.md` → one-line rule and pointer to `../../ladder-core/ladder-map.md` → Client Comments Stay Out of the Research — CANONICAL (see the global changelog, same date).
- Classified drift-repair under UpdateSkill: no workflow, trigger or description changed.
- Not added, held until a client readout of 2026-11-17 shows whether they work: the where-to-look-in-L4 tables, lanes inside a domain, and a diagnosis paragraph opening the premise.
- Not tested on a new run. Hold back from docs-only ladder v1.2.2; goes with v1.2.3.

---

## 2026-11-09 — Severity on every recommended action; stopping rule after the fixes

- **Why (the researcher, 2026-11-09):** the L5 audits on a client project ran in a loop (v1 to v1e over 2026-11-07 and 11-08, then a FinalLadderReview re-run). Each round applied every recommendation, including the auditor's replacement text, and the next fresh auditor blocked the new text. This workflow had no severity vocabulary, so a Recommended Actions list was applied whole. A model test on v1e's input (one live and one fresh Opus 5.5 run, two Fable 5.1 runs) agreed on one of the live run's three blocking items; the other two were advisory to every other reader. The model was not the driver; the missing rule was.
- `workflows/AuditFramework.md` → Audit Report Format: each recommended action is marked **Blocking** or **Advisory**.
- `workflows/AuditFramework.md` → new section Closing the Audit — Severity and Stopping Rule: definitions; fix blocking only, carry advisory; record fixes in an addendum (which clears gate 8); no re-audit of the fixed text; one bounded pass at most, and where it blocks, the researcher rules. Canonical statement stays in `l5-framework-synthesis/workflows/FinalLadderReview.md`.
- `tools/synthesis-gates-check/check.ts` gate 8 message now names the addendum path beside re-audit.
- Not tested on a new run. Hold back from docs-only ladder v1.2.2; goes with v1.2.3.

## 2026-11-07 — Plain statements and plain names, name written last, advisory first read (follows L2/L3)

- **Why (the researcher, 2026-11-05 to 2026-11-07):** L2 and L3 titles and descriptions reached a client unreadable, and the L2/L3 skills were revised on 2026-11-06 (`616d502`). This skill asked for the same style at L5: domain names and descriptors "evocative" and "memorable", a recall test ("can a client remember all domain names after one reading?"), slogan descriptors ("Name what you stand for. Show where it lives."), names chosen before the content, and a closing line "repeatable and memorable — the one line a client will quote afterward".
- **The researcher's rulings, 2026-11-07:** statements follow the L3 plain-statement rules unchanged. Names (the framework name and domain names) stay short, often one or two words, but must be understood on first read by a reader with no project context; no figures of speech, coined terms or clever contrasts. The first-read audit is advisory, as at L2/L3.
- `FrameworkFormat.md` → new section Plain Writing (statements and names), pointing to `l3-insight-synthesis/InsightFormat.md` → The Insight Title Test and Plain Writing in the Body. Domain Naming Discipline rewritten: plain names, name written after the content, a figurative/coined row, engagement-neutral before/after descriptors, and a first-read naming test in place of the recall test. The descriptor template, the framework answer (ends with a plain statement of the commitment, not a line to be quoted), the strategic premise ("make the brief more specific" for "sharpen the brief") and the diagram node ("Descriptor" for "Tagline") follow.
- `workflows/SynthesizeFramework.md`: Step 4 becomes Identify the Domains (working labels); naming moves to the end of Step 6, after the strategic task, What this domain governs, Why [role] and What would change this (former item 4b is now item 4). Step 9: plain question form, no quotable closing line. Decision-filter questions written as plain questions. Checklists updated.
- `workflows/BuildDomain.md`: writing order reversed (content first, name and descriptor last); naming candidates tested by first read, not recall; descriptor patterns replaced by before/after rewrites; figurative and coined names added to Avoid.
- `workflows/AuditFramework.md`: Audit 2 rewritten (plain, literal, first-read; recall test removed; plain-writing check on every statement). New Audit 2b (First Read), run first, by a separate reader pinned to `sonnet` on the same pinned prompt as L3 Audit 3c, plus the clause-source question; its list is advice and does not count against "Synthesis complete". Report section added. Audit 5 decision filter: plain questions.
- `SKILL.md`, `DomainScope.md`: pointers to the plain-writing rule for domain names, descriptors and framework names.
- **Not yet tested on a run.** The L2/L3 title rules were tested once (2026-11-06); nothing here has been run on L5 input.
- **Not changed:** `FinalLadderReview.md` (no old-style wording found). `../ladder-core/config/synthesis-gates.yaml` still cites "SynthesizeFramework Step 4b" for the What would change this wiring; that item is now Step 6 item 4.
- **Portable ladder:** hold this change back from docs-only v1.2.2, as with `616d502`.

## 2026-11-03 — Final review: the briefed Seat 1 carries the full methodology brief

`workflows/FinalLadderReview.md` → Seat briefs: the tier-2 Seat 1 brief (evidence integrity) is enriched with the full qualitative-methodology brief the author's own Seat 1 reviewer uses, made portable. It covers:
- depth over count;
- keeping did, stated and concluded apart up the chain;
- the ladder losing information at every step, with quotes and paraphrases sampled against the L1 wording;
- carried-forward weakness named in its level's terms;
- extra suspicion of agreeable results;
- recruitment effects;
- the RICH / THIN / FLAWED verdict.

The researcher's middle-ground ruling (2026-11-03) on the agent question: the method ships as workflow text, and no agents ship.

**Light check:** one Sonnet Seat 1 run with each brief on an older complete ladder, compared blind against that ladder's earlier final review. The difference was small and mixed, from one run each. The brief is kept because it states the method in full at no cost.

## 2026-11-03 — Inputs step: the audit reads the level below

The audit workflow gains an Inputs step: the directory of the level below (and L1 from L3 up), the `synthesis-audit-prepass` script on every audit, then a full read of the level below, with the fallback to the script's candidates plus cited items when it will not fit, and an `**Inputs read:**` line in the report, which gate 8 checks. Full entry and reasons: `skills/CHANGELOG.md`, 2026-11-03.

## 2026-11-03 — Falsifier line reshaped as "What would change this" (follows L3)

- The researcher, 2026-11-03: the L3 reshape applies at L5 too. Each domain's one-line **Falsifier** (an observation with direction and threshold) becomes a **What would change this** section with three parts: counter-cases (insights, OAs or evidence that sit awkwardly with the strategic task), a rival reading (the strongest competing way to draw the domain), and what later research, a pilot or operating experience would have to show for the domain to be re-drawn, with no counts, percentages or thresholds.
- `FrameworkFormat.md` (both domain blocks), `workflows/SynthesizeFramework.md` Step 4b, `workflows/AuditFramework.md` (the mirror is now a judgment per domain, with no present/absent/vacuous tally) and `SKILL.md` (the ReasoningChain's competing logics now supply the rival).
- This also fixes the dangling pointers to `InsightFormat.md` → The Falsifier Field, which the L3 change had removed earlier the same day.
- Why: see `l3-insight-synthesis/CHANGELOG.md`, 2026-11-03 (later).

## 2026-11-01 — Final review: the reviewer check works whichever grep the shell has

`workflows/FinalLadderReview.md`, Step 1: the registered-reviewer check searches each agents folder on its own, only if it exists, and with a trailing slash. The 2026-10-27 check passed both folders to one `grep`, and two shells gave wrong answers. The `grep -r` that ships with macOS does not follow a symlinked folder named without a trailing slash, so where `~/.claude/agents` is a symlink every reviewer was reported not registered (reported by an independent tester against v1.1.2). And the `grep` that Claude Code's shell provides (ugrep) exits with an error, not a match, when either folder is missing, so on any install with only one of the two folders every reviewer was reported not registered there too (found while testing that fix). Tested on nine setups under macOS `grep` in zsh and bash and under Claude Code's `grep`: the five from 2026-10-27, a symlinked user folder, a symlinked project folder, both folders present, and a project folder that git ignores. All 27 runs gave the right answer; the old check was wrong on the symlinked setups under macOS `grep` and on every setup but "both folders present" under Claude Code's. Shipped as S37 Synthesis Ladder v1.1.3.

## 2026-10-27 — Final review finds registered reviewers by name

`workflows/FinalLadderReview.md`, Step 1: the infrastructure check looks for each reviewer by the `name:` in its subagent file's frontmatter (the name Step 3 dispatches on), in `~/.claude/agents` and the project's `.claude/agents`, and prints registered or not registered for each. It used to `ls` five TitleCase filenames, so a reviewer registered under the dispatch name in a lowercase file was reported missing, and the run fell to tier 2 without saying why; and one absent persona printed "missing" for all five. A run now needs only its two seats. Step 1 also says tier 2 (briefed reviewers) is the default on a new install, since the portable package ships no personas, and drops a pointer to `UserAgentContexts.md`, which is not in the package. The check was tested under zsh and bash with registered, misnamed, quoted, project-folder and empty setups. Reported by an outside user of the v1.1 release; the researcher's ruling 2026-10-27 (tier 2 is the outside-user path; no personas ship). Shipped as S37 Synthesis Ladder v1.1.1.

## 2026-10-26 — Bun fallback at Step 0

`workflows/AuditFramework.md` and `workflows/FinalLadderReview.md`: under the Step 0 gate-check command, one line tells the agent to run it with `~/.bun/bin/bun` if `bun` is not found. Found on the 2026-10-26 clean-account run of the S37 Synthesis Ladder v1.1: with Bun off the agent's PATH, the agent running an audit went straight to Step 0 and never read `ladder-core`'s fallback line (it recovered by searching). The researcher's ruling 2026-10-26.

## 2026-08-22 — Alexander cheap lane (the researcher slot rulings 2026-08-22; details in skills/CHANGELOG.md)

FrameworkFormat: Falsifier line in both domain blocks + felt_flags frontmatter; SynthesizeFramework: Step 4b falsifier wiring + felt_flags; AuditFramework: Audit 7 falsifier mirror + discharge-sweep pair; FinalLadderReview: discharge-sweep CANONICAL + checklist + template field, reserved-verbs standing check; SKILL.md inline-falsifier note updated.


## 2026-07-12 — CopyEditor provenance seam *[backfilled — `d1f3dc5`]*

Quad-chair CopyEditor audit closed the provenance seam at the skill and all eight callers; here in `AuditFramework.md`. `tools/.gitkeep` added.

## 2026-07-11 — Ladder gap audit *[backfilled — `4e99de8`]*

`SKILL.md`, `FrameworkFormat.md`, `AuditFramework.md`, and `SynthesizeFramework.md` changed in the pass that closed the audit program over the live stack.

## 2026-07-11 — Tri-chair fidelity pass *[backfilled — `2689e35`]*

The L0–L5 fidelity chair touched `SKILL.md` and `FrameworkFormat.md`.

## 2026-07-10 — Synthesis gates wired in, including the capstone *[backfilled — `ca7d58d`, `84c4ee0`]*

`synthesis-gates.yaml` wired at `gates_version 2026-07-10.1`, reaching `DomainScope.md`, `FrameworkFormat.md`, `BuildDomain.md`, `SynthesizeFramework.md`, and `FinalLadderReview.md`. A second commit installed `synthesis-gates-check` as **Step 0** of `AuditFramework` *and* of `FinalLadderReview` — the capstone that reviews the whole ladder now runs the gate check before it reviews anything.

## 2026-07-09 — L4 composition single-sourced *[backfilled — `b9d34ba`]*

`SKILL.md` updated in the pass that made `../ladder-core/ladder-map.md` §L4 composition canonical — load-bearing here, since L5 integrates whatever the L4 rung produced.

## 2026-06-29 — Nelson & Stolterman: the framework as *ultimate particular*, and a seventh audit *[backfilled — `bc41da3`, `4c70a3e`, diffs verified]*

Two commits the same day, and together they are the deepest theoretical change in this skill's history.

**`SKILL.md` gained the N&S source entry** — the framework as *ultimate particular*: **a designed thing, not a discovered truth.** The L4→L5 move is named as a *descent* from universals to a specific designed architecture, the inverse of scientific inquiry. It carries the four designed-whole criteria as the quality test for a completed framework: *adequate* (as complex as needed, not comprehensive), *essential* (all necessary domains present, nothing extraneous), *emergent* (new strategic logic arising from the composition that was not in any individual OA or Principle), and *vital* (gives organizational energy rather than constraining it). The entry names "adequate" as the hardest call — the right architecture for real constraints, not the most thorough one possible.

**`AuditFramework.md` went from six audits to seven,** adding **Audit 7: Adequacy Check** — *is this framework adequate, or is it trying to be comprehensive?* Its argument: a framework that incorporates every OA and every nuance becomes unwieldy and unactionable. Three test questions. This is the criterion turned into an actual gate rather than left as a principle in the sources section, which is the difference between citing a book and using it.

## 2026-06-29 — Domain-set markers *[backfilled — `37af6aa`]*

`DomainScope.md` gained the domain-set marker rolled across the ladder.

## 2026-06-21 — Audit-save step *[backfilled — `7e2f148`]*

Audit-save step and post-synthesis audit reminders across `AuditFramework`, `SynthesizeFramework`, and `FinalLadderReview`.

## 2026-06-17 — Architect review P1/P2/P3 fixes *[backfilled — `75e77c8`]*

Architect-review pass specific to this skill, reaching `SKILL.md`, `BuildDomain.md`, `SynthesizeFramework.md`, and `FinalLadderReview.md` — the broadest of the June reviews here.

## 2026-06-12 — Boundary with DesignSynthesis/FrameworkSynthesis stated *[backfilled — `065b179`, `82d30fa`]*

Two commits the same day added a complementary note to `SKILL.md` and a matching reminder in `SynthesizeFramework.md`, distinguishing this skill from the similarly-named `DesignSynthesis/FrameworkSynthesis`. Two workflows with nearly the same name in one ecosystem is a standing confusion risk; this is where it was addressed.

## 2026-06-06 — CopyEdit reminder *[backfilled — `bee75d9`]*

Added to `AuditFramework.md`, across all ladder audit workflows.

## 2026-06-04 — DomainScope created; FinalLadderReview capstone *[backfilled — `4ff609a`]*

Every file in the skill was touched. `DomainScope.md` created as DomainScope rolled across L2–L5, and the **FinalLadderReview capstone** — the whole-ladder review workflow that lives in this skill — arrived in the same pass, along with audit-gate reminders.

## 2026-06-02 — VP coherence check *[backfilled — `efe3858`]*

A coherence check against L4 Value Propositions added to L5 — wired in the same commit that fixed the voice-server 1Password loop and added the invoke-domain-agent tool, three days after the VP skill itself was created.

## 2026-06-01 — Coverage discipline and source traceability *[backfilled — `f6284c4`, `bccc3d0`]*

Synthesis-skill coverage discipline and format completeness strengthened; `FrameworkFormat.md` brought into the common source-traceability form used across the L2–L5 format files.

## 2026-05-31 — abductive-reasoning cross-references *[backfilled — `fc08bf0`]*

`SKILL.md` gained the abductive-reasoning cross-references added across L3–L5.

## 2026-05-22 — Double-path bug fixed *[backfilled — `c839bd0`]*

A double-path bug corrected here and in Telos.

## 2026-05-09 — Present at repo initialization *[backfilled — `d48cb20`]*

The skill predates the private PAI repo. **Anything about its origin predates the git record.**

---

### Cross-cutting commits with no skill-specific content

`dd13514` (2026-05-11, descriptions tightened to the canonical USE WHEN format) and `2d465bf` (2026-05-13, anti-hallucination guardrails across 15 skill workflows).
