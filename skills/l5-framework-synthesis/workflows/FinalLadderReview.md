# FinalLadderReview Workflow

A manually-triggered, end-to-end adversarial audit of the L2–L5 synthesis ladder. Two independent reviewers — **QualResearcher** (always) plus a domain-keyed design specialist — read the full output set in parallel and surface the **cross-level chain-of-custody failures that no per-level audit can see**. Run once, after `AuditFramework` clears, before final delivery.

This formalizes the post-hoc QualResearcher + DesignStrategist audit that produced the Meridian V5 guardrails — as a standing capstone rather than an ad-hoc pass.

## When to Run

- After `SynthesizeFramework` is complete AND `AuditFramework` has issued "Synthesis complete" — i.e., every per-level gate (L2→L5) has already cleared.
- Before final delivery, or before handing the framework to downstream work that will not revisit the synthesis (brand strategy, concepting, quant instrument design).
- Once per project, or per major iteration of the full ladder.

**This is not a substitute for the per-level audits.** It is the cross-level layer on top of them. If any level has not been audited, run its per-level audit first — this review assumes each level already passed its own gate.

## What This Review Owns — and What It Does NOT

This review exists to catch failures that span levels. The per-level audits each see one level; by construction they cannot detect a pathology distributed across the chain. The headline V5 failure — *evidentiary inversion* — was exactly this: a participant-described analogy promoted to a verified mechanism at L3, inflating the L4 output that imported it, while the most behaviorally-saturated insight earned no forward weight. Three levels conspired; no single-level audit could see it.

**Scope discipline (blocking):** Every finding this review produces must be cross-level. If a finding can be established by looking at one level in isolation, it belongs to that level's per-level audit — route it there, do not report it here. This keeps the review additive, not duplicative.

**The five cross-level checks:**

1. **Evidentiary proportionality (inversion detection).** Is forward weight — VP spine, governing principle, L5 domain role — proportional to upstream behavioral saturation? Flag any insight that leads at L4/L5 while resting on thin L2/L3 evidence, and any deeply-saturated insight that earned no forward weight.

2. **Provenance integrity up the chain.** Trace each load-bearing claim's provenance from L3 forward. Did a "participant-described analogy or hypothesis" (1–2 participants) at L3 silently become a "verified mechanism" by L4/L5? Did a single participant's estimate become a cross-participant benchmark? *(V5: Alpina flywheel, Ardent arc, the one-dealer "90% conversion" figure.)*

3. **Traceability / drift.** Does every L5 domain trace back through L4 → L3 → L2 to specific L1 evidence? Spot-check the lead domain to L1 by participant name. Flag anything appearing at L4/L5 with no upstream basis (invention) and anything strongly evidenced at L2 that has vanished by L5 (silent loss).

4. **Claim resurfacing.** A prerequisite or sequencing claim removed at one level that reappears at another. *(V5: "OA-01 must precede the others," removed at the OA audit, reappeared as "P-01 is the precondition for all principles.")* Operational dependency asserted on the strength of thematic plausibility.

5. **System-level confirmation risk.** Step back from the parts: does the framework as a whole simply confirm the prior hypothesis dressed in synthesis vocabulary, with borrowed mechanism doing the persuading rather than participant behavior?

## Step 0: Deterministic Gate Check (mechanical, before seating reviewers)

Run the zero-LLM gate checker against the project's synthesis directory:

```bash
bun ../ladder-core/scripts/synthesis-gates-check/check.ts <project synthesis dir>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`.

Run WITHOUT `--release`: at this point `final_ladder_review:` is legitimately `pending` — this workflow writes that field at its own final step, and `--release` would HALT on the very field this review exists to fill. A gate-7 "pending" WARN is expected and needs no action.

Every other HALT or WARN must be dispositioned before Step 1 — fixed, or carried into the report as a named finding. Reviewers audit meaning; the checker audits structure. Do not spend reviewer attention on artifacts that fail their mechanical gates.

## Step 1: Confirm Scope and Select Reviewers

Locate on disk / confirm with the user:
- The L2–L5 output files (themes, insights, OA + Principles + VP, framework + visual) — the audit subject.
- The L1 findings files — ground truth for traceability spot-checks (Check 3).
- That every per-level audit has cleared. If unknown, ask; if any level is unaudited, recommend running its per-level audit first.

List all files before reading. **Data gate:** if any ladder level is missing, stop and report which — a cross-level review cannot run on a partial ladder.

**Infrastructure prerequisite check:** Before proceeding to Step 3, check which reviewer subagents are registered. Claude Code dispatches a subagent by the `name:` in its file's frontmatter, never by the filename, so the check reads that field, in the user's agents folder and the project's. It searches each folder on its own and only if it exists, with a trailing slash, because some versions of `grep` report an error, not a match, when either folder is missing, and the `grep` that ships with macOS does not search a symlinked folder named without the slash:

```bash
for n in qual-researcher design-strategist org-strategist policy-analyst brand-strategist; do
  found=no
  for d in ~/.claude/agents/ .claude/agents/; do
    if [ -d "$d" ] && grep -rqsE --include='*.md' "^name: *[\"']?${n}[\"']? *$" "$d"; then found=yes; fi
  done
  if [ "$found" = yes ]; then echo "registered: $n"; else echo "not registered: $n"; fi
done
```

A run needs only its two seats (table below): `qual-researcher` plus the domain's Seat 2. The others not being registered does not matter.

**Pick the reviewer tier, in this order, and record it** *(tiers added 2026-09-30, after the first outside install found the review silently reduced to one reviewer where the personas are not installed)*. **Tier 2 is the default on a new install:** this package ships no reviewer personas, so tier 1 applies only where the user has registered reviewers of their own, each in a subagent file whose `name:` is the dispatch name in Step 3 (the filename does not matter).

1. **Registered reviewers** — both seats for this domain show `registered` above. Step 3 as written.
2. **Briefed reviewers** — either seat is not registered, but you can spawn subagents. Spawn two fresh general-purpose agents in parallel, each given the seat brief in Step 3 → *Seat briefs* in place of a persona. The two-seat structure and the independence rule stand. Report them as briefed reviewers (`Seat 1 (briefed)`, `Seat 2 (briefed: design)`), never under a persona's name.
3. **Single reviewer** — no subagents at all. Apply all five cross-level checks yourself as a **single-reviewer manual pass**, same scope discipline (cross-level only — no per-level duplication). Mark the report `**Reviewers:** Single reviewer (no subagents available)` and write "single reviewer" beside the system verdict. A labeled partial is better than a shallow verdict dressed as a full two-reviewer audit.

**Read the `domain:` field** from the L5 framework frontmatter and select the reviewers:

| Domain | Seat 1 (always) | Seat 2 |
|--------|-----------------|--------|
| brand/design | QualResearcher | DesignStrategist *(BrandStrategist optional, for kernel coherence)* |
| product/UX | QualResearcher | DesignStrategist |
| organizational | QualResearcher | OrgStrategist |
| policy/advocacy | QualResearcher | PolicyAnalyst |
| other | QualResearcher | **HELD** — confirm with user |

**Seat 2 by domain:** Each strategy domain has a purpose-built second reviewer — DesignStrategist (design/product), OrgStrategist (organizational), PolicyAnalyst (policy/advocacy). Only **other** has no default: confirm the right specialist with the user, or run Seat 1 (QualResearcher) alone and record *"Seat 2 unfilled — no purpose-built persona for this domain; review covers research/evidence integrity only."* Never substitute a generic reviewer for a missing specialist — a single-reviewer run marked explicitly partial is better than a shallow verdict dressed as a specialist's. (Tier 2's briefed reviewers are not that substitution: they carry the seat's brief and are reported as briefed, never under a persona's name.)

## Step 2: Build the Spine Map — Verified, Not Inferred

Before spawning reviewers, build the chain-of-custody skeleton they will interrogate — the artifact that makes inversion and drift visible. **The spine map is a scaffold the reviewers test, not ground truth they inherit — so build it from the files, not from frontmatter alone, and label each entry's confidence.** A wrong lead in the spine map anchors both reviewers toward the wrong conclusion and wastes the pass refuting the orchestrator instead of auditing the ladder. *(First-run lesson: a theme flagged as a dropped "orphan" because it was absent from every `source_themes` field turned out to be a documented merge — visible only by opening the file. Both reviewers spent effort refuting that bad lead.)*

For each L5 domain, trace the spine down to participant counts:

```
[L5 Domain name] — role: [precondition / engine / …]
  ← OA-NN [title]  +  P-NN [title]  (+ VP-NN [title] if present)
      ← L3-NN [insight] — saturation: [N participants] — provenance: [observed / analogy / imported]
          ← T2-NN [theme] — [N independent participants]
          ← T2-NN [theme] — [N independent participants]
```

**Verification discipline — do this before listing anything as dropped, orphan, or lost:**

1. **Read, don't infer.** Frontmatter `source_themes` / `source_insights` give the *declared* chain; they do not reveal merges, archives, renumbers, or absorbed-but-uncited signal. Open the file before asserting its status.
2. **Reconcile every count.** If a level's file count ≠ the count cited downstream (e.g., 15 theme files but "14 themes"), resolve the gap first. Open the extra file and look for a merge marker (`status: merged`, `merged_into:`), an archive location, or a renumber note. Only if none explains it is it a genuine orphan.
3. **No blank saturation.** A theme or insight with a missing participant count is a verification gap, not a zero — get the real count from the file's evidence list. A blank passed forward as data is itself a small chain-of-custody failure.
4. **Label confidence per line.** Mark each spine-map entry **VERIFIED** (file opened; links and count confirmed) or **INFERRED** (frontmatter only). Reviewers should know which links you actually checked.

**Then list candidate flags as hypotheses, not conclusions** — two lists, each item framed "verify or refute":
- **Inversion candidates:** any L4 output (OA / Principle / VP) that did not reach an L5 domain, and any high-saturation L3 insight that earned no forward weight.
- **Drop / orphan candidates that survived verification:** any L2 theme or L3 insight with no downstream path that you could *not* explain as a merge / archive / renumber.

A candidate you already refuted during verification does **not** go to the reviewers as an open flag — note the explanation instead. Hand the reviewers the confidence-labeled spine map plus these two lists, explicitly marked **leads to test, not findings.**

## Step 3: Spawn Both Reviewers in Parallel (Independent, Read-Only)

Spawn each reviewer as a registered subagent via the Agent tool's `subagent_type` — the persona's full context, model (opus), and permissions are injected by the harness from `~/.claude/agents/` *(migrated 2026-08-18 from the retired `LoadAgentContext.ts` composition path)*:

- Seat 1: `subagent_type: "qual-researcher"`
- Seat 2: `subagent_type: "design-strategist"` | `"org-strategist"` | `"policy-analyst"`, per domain (BrandStrategist: `"brand-strategist"`)

Spawn both in parallel (one message, two `Agent` calls), each given:
- The task brief.
- The file paths for L2–L5 (and L1 for spot-checks), with the instruction to **read only the written files** — not any prior synthesis context held in this session.
- The spine map and inversion-candidate list from Step 2.
- The five cross-level checks as the brief, plus the scope-discipline rule (cross-level only).
- A request to return its native structured assessment and verdict (QualResearcher → RICH / THIN / FLAWED; DesignStrategist → RESOLVES / PARTIAL / MISSES) plus a findings list, each finding tagged: **level(s) touched · cross-level pattern (inversion / provenance / drift / resurfacing / confirmation) · severity (blocking / advisory) · recommended fix and the level to fix it at.**

**Seat briefs (tier 2, briefed reviewers).** Give each general-purpose agent everything in the list above, plus its seat brief:

- **Seat 1 — evidence integrity.** Read as a qualitative research methodologist.
  - **Judge by depth, not count.** Evidence is judged by depth, saturation, triangulation and disciplined subjectivity, not by the number of participants. Many people answering the same interview question is not a pattern they volunteered.
  - **Keep three kinds of evidence apart up the whole chain:** what participants did (observed or reported behavior), what they say they prefer or would do (stated), and what the analyst concluded (interpretation). Flag any point where one is carried forward as another: stated preference presented as behavior, a participant-described hypothesis promoted to a mechanism, an analyst's reading cited as a finding. Self-report is a weak guide to behavior; what people say they want is not what they choose.
  - **The ladder loses information at every step.** A weak L1 makes a weak L5 however well the upper levels are written.
    - Test whether the L1 findings actually support the L5 domain they are traced to.
    - Hold a sample of load-bearing quotes and paraphrases against the L1 wording itself. A conditional ("would pay if…") that became reported behavior, or an interviewer's words inside a participant's quote, is drift.
  - **Name carried-forward weakness in its own level's terms.** Where a weakness at one level carries forward, name it so: at L2, one participant repeated rather than a cross-participant pattern; at L3, a label for the obvious rather than a real tension; at L4, an opportunity that closes design space rather than opening it.
  - **Treat agreeable results with more suspicion, not less.** Results that confirm what the client or analyst already believed get more scrutiny.
  - **Check how participants came to the study.** Were they recruited through people who know the brand or the researcher, or told about the brand? Could that produce the pattern?
  - **Verdict:** **RICH** (the evidence carries the framework), **THIN** (it holds but rests on less than it claims), **FLAWED** (a load-bearing claim does not follow from its evidence). Add the single most important gap.
- **Seat 2 — strategy, by domain.** Read as a strategist in the framework's `domain:`. Design or product/UX: do the opportunity areas and principles work as decision filters for real design choices, and does the framework resolve the jobs the research found — **RESOLVES / PARTIAL / MISSES**. Organizational: could the principles veto a real budget, process or role decision, and does the framework have a diagnosis, a guiding policy and coherent actions — **ENACTABLE / CONTINGENT / INERT**. Policy/advocacy: does it reach the people it is for, and can frontline staff carry it out — **DELIVERS / CONTINGENT / FAILS**. Brand: is the platform coherent and the positioning genuinely different — **STRONG / CONCERNS / WEAK**. Domain **other** has no brief: the seat is HELD, as in Step 1.

**Independence rule (blocking):** the two reviewers must not see each other's output during their pass. Parallel, not sequential. The whole value is two uncoordinated perspectives on the same chain — sequencing them lets the second anchor on the first.

## Step 4: Reconcile

Merge the two findings lists in the main thread:
- **Corroborated** — both reviewers flagged the same issue → highest confidence; mark it.
- **Single-reviewer** — one flagged it, the other did not → keep it, note the asymmetry. A QualResearcher evidence flag the DesignStrategist didn't reach (or vice versa) is signal, not noise.
- **Disagreement** — the reviewers reach opposite conclusions on the same element → surface the tension explicitly; do not silently pick a side.

Dedupe wording, but never drop a finding to tidy the list. Produce one reconciled table, each row tagged with pattern type, level(s), severity, and fix.

## Step 5: System-Level Verdict

Aggregate to a single ladder verdict:

- **LADDER SOUND** — no blocking cross-level findings; both reviewers cleared (RICH / RESOLVES — or RICH alone for a held seat).
- **REVISE [levels]** — one or more blocking findings; name the levels to revise and the fix. (Most common outcome on a first capstone run.)
- **INVERSION DETECTED** — a confirmed evidentiary-proportionality or provenance failure: forward weight distributed inversely to the evidence. This is the V5 signature and the most serious result — the framework's priorities do not follow its strongest evidence.

The verdict is **worst-of**: any blocking finding caps it at REVISE; a confirmed inversion caps it at INVERSION DETECTED regardless of how clean the rest of the ladder is.

## Step 6: Write the Report

```
## Final Ladder Review — [Project Name]
**Reviewed:** L2 ([N] themes) → L3 ([N] insights) → L4 ([N] OA / [N] Principles / [N] VP) → L5 ([N] domains)
**Domain:** [domain]    **Reviewers:** QualResearcher + [DesignStrategist | Seat 2 HELD]  — or, by tier: Seat 1 (briefed) + Seat 2 (briefed: [domain]) | Single reviewer (no subagents available)
**Date:** [YYYY-MM-DD]

### Reviewer verdicts
- QualResearcher: [RICH / THIN / FLAWED] — [one line]
- DesignStrategist: [RESOLVES / PARTIAL / MISSES] — [one line]   (or: Seat 2 HELD — purpose-built persona required)

### Cross-level findings (reconciled)
| # | Pattern | Level(s) | Severity | Finding | Fix (at level) | Flagged by |
|---|---------|----------|----------|---------|----------------|------------|
| 1 | inversion | L3→L4→L5 | blocking | … | … | both |
| 2 | provenance | L3→L4 | blocking | … | … | QualResearcher |
| … |

### System verdict
LADDER SOUND / REVISE [levels] / INVERSION DETECTED

### Remediation path (if REVISE or INVERSION)
- Sweep run (per discharged finding): <scope searched> · <N further instances / none> · <instrument>
- [Level]: [what to change, which per-level workflow to re-run]
- Re-run FinalLadderReview after remediation if the verdict was INVERSION DETECTED.
```

## Closing the Review — Stopping Rule

The review closes when the blocking findings are fixed. It does not close on a clean release check.

- **REVISE:**
  - Fix the blocking findings at the levels named. Sweep each one under the discharge-sweep rule.
  - Record the fixes in an **Addendum** to this report, then close.
  - Do not re-run the review. Re-running is for INVERSION DETECTED only (above).
  - Do not run a confirmation audit after each round of fixes. If the researcher wants an independent read of the fixes, run one bounded pass that reads only those edits, then close.
  - Where that bounded pass blocks, the next step is the researcher's ruling on each blocking item, not another pass. A fresh auditor's blocking count is one draw from a distribution; the severity line is a proposal, and the judge is the researcher.
- **LADDER SOUND, or a re-run that clears:**
  - Fix blocking items only.
  - Record advisory findings in the report as carried to the next version. Do not apply them now. Every edit is new text no reviewer has read, which creates more audit work.
- **Release-check stops that are bookkeeping, not ladder defects:**
  - Examples: an audit older than a later edit; a confirmation audit that discloses a partial read of the level below; working or test folders left in the tree.
  - Record these in the report under "What this verdict does not cover" as the researcher's ruling.
  - Do not chase them with more audits. Report what the stop means, and let the researcher decide.

*Why (2026-11-08, a client project):*
- A REVISE run followed by a re-run, plus advisories applied after the re-run cleared, produced audit after audit. Each round of fixes went stale against the release check.
- Meridian V7 (2026-07-10) closed on REVISE by discharging its findings with an addendum, and did not hit this loop.
- 2026-11-09 test on the L5 confirmation audit v1e's input (the live Opus 5.5 run, a fresh Opus 5.5 run, two Fable 5.1 runs, same brief, blind): all four blocked one edit; the live run's other two blocking items were advisory to every other reader. The model was not the driver. The per-level audit workflows now carry this rule in their Closing the Audit section; this section is canonical. Record: `Alexander-Method-Prototypes/2026-11-09_audit-severity-model-test/`.

---

## Quality Checks Before Reporting

**Discharge-sweep rule (canonical):** *when a finding is discharged, sweep for the same defect SHAPE — not the same words — before closing. The sweep scope is every artifact derived from the ladder in the project tree — rungs above and below the fix, masters, standalone files, renders (.typ/.pdf), and presentation sources (deck scripts and exported decks) — and the report field records the scope actually searched.* Wording corrected per the 2026-08-21 two-failure replay (`Alexander-Method-Prototypes/2026-08-21_discharge-sweep-replay.md`): the epithet failure and the hedge-lapse deck instance both surface only under this scope definition. Every ladder audit workflow carries the rule + a `Sweep run:` report field; adopted 2026-08-22 (discharge-sweep slot).


- [ ] Every finding is cross-level; none duplicates a per-level audit check (scope discipline held)
- [ ] Both reviewers ran in parallel, read-only, on the written files — or Seat 2 held and explicitly noted
- [ ] The reviewer tier (registered / briefed / single) is on the report's Reviewers line, and a single-reviewer verdict says so
- [ ] Reviewer selection matches the `domain:` field; held seats flagged, never substituted with a generic reviewer
- [ ] Spine map is file-verified, not frontmatter-inferred: counts reconciled (file count vs. cited count), no blank saturation, every entry labeled VERIFIED/INFERRED, and any orphan/drop lead either explained (merge/archive/renumber) or passed as a labeled hypothesis — never as a finding
- [ ] Lead L5 domain traced to L1 by participant name (Check 3 actually executed, not asserted)
- [ ] Verdict is worst-of; every blocking finding names the level to fix
- [ ] Every discharged finding carries a recorded sweep (scope · instances · instrument) per the discharge-sweep rule above
- [ ] Reserved claim verbs checked: grep *validated / confirmed / passed / "from the customer's side"* across the deliverable set; each hit is either an externally-tested claim or gets a judgment call recorded (rule: `../ladder-core/ladder-map.md` → Reserved Claim Verbs; runs each engagement until the exit condition there retires it)

---

## Save the Review Report

After completing the report, write it to the directory containing the L5 framework files:

**Filename:** `FinalLadderReview_[ProjectName]_[version].md`  *(e.g., `FinalLadderReview_MeridianBrandStrategy_V7.md`; use the project name and synthesis version)*
**Location:** Same directory as the L5 framework files (e.g., `.../L5_Framework/`)

This keeps the review co-located with the top of the synthesis ladder it audits and establishes a permanent record of the cross-level findings before delivery.

---

## Final Step: Update the Framework Frontmatter

After saving the report, edit the L5 master framework document's frontmatter: replace `final_ladder_review: pending` with the report filename just saved (e.g., `final_ladder_review: FinalLadderReview_MeridianBrandStrategy_V7.md`). This is the mechanical release check for gate 7 — a framework whose field still reads `pending` (or lacks the field) must not be delivered. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.final_ladder_review_before_delivery`.

*(This is the ladder's one sanctioned back-edit of an upstream artifact — capstone-only, ratified 2026-07-10. All rung-to-rung propagation remains forward-only.)*
