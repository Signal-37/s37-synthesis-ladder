# SynthesizeThemes Workflow

Synthesize a set of L1 Findings files into L2 Themes — cross-participant behavioral patterns grounded in independent evidence from 3+ participants. This is the primary L1→L2 workflow.

## Before You Start

Read `ThemeFormat.md` in the skill root. It contains:
- Individual theme file format
- Master themes document format
- The behavioral name test
- The abductive connection quality check
- Evidence threshold rules
- Volume calibration

Also read `DomainScope.md` in the skill root. It parameterizes the Implication section per project type (the decision-maker the forced question addresses, and the L4-flag register) for brand/design, product/UX, organizational, policy/advocacy, and other.

---

## Step 1: Locate and Load the L1 Files

Confirm with the user:
- Where the L1 Findings files are (full directory path)
- Where to write the output (output directory)
- Whether there is a specific project name for the output files
- **Project domain:** brand/design | product/UX | organizational | policy/advocacy | other

List all L1 files before reading any. Confirm the participant count.

**Inherit the domain:** Check the `domain:` field in the L1 Findings frontmatter. If present, inherit it and confirm with the user rather than re-asking from scratch; if the L1 files predate the domain field or disagree, confirm explicitly. The domain sets the Implication framing for every theme — read the matching entry in `DomainScope.md` before writing any Implication. Carry the confirmed domain into the L2 output frontmatter so it propagates to L3. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.domain_scope_confirmation`.

**Data gate:** If no L1 findings files are provided or located at the stated path, stop here and ask. Do not proceed using general knowledge as a substitute for research data.

---

## Step 2: Build the Inventory

Read all L1 files. For each file, extract:

```
Participant: [Name] | [Segment / role]
Finding N: [Title] — [Signal type] — [Abductive flag, condensed to one clause]
```

Do this for every finding in every file. The inventory is the full dataset held simultaneously — this is the externalization principle (Kolko): you cannot synthesize what you cannot see at once.

**For `source_type: conversation` files:** build one inventory entry per **speaker** (from the `speakers:` list), not one per file, and read each finding's speaker from its `**Speaker:**` field. Tag every finding from a conversation file with its `session_id` — you'll need it for the independence check in Step 5.

**For `source_type: survey` files:** build one inventory entry per findings file (one batch), tagged with its `survey_id`, `batch:` and `independence:` fields. For each finding, note its supporting and contrary row IDs from the file's Row accounting (supporting rows are its respondents for Step 5) and its Claim kind. Copy the file's Limits line into your notes; every theme that cites it carries it forward.

After building the inventory, note:
- Total findings across all participants
- Which signal types dominate (Strong language? Resignation? Specificity?)
- Any finding titles that appear in multiple participants (same words, different people)
- Any abductive flags that point at the same underlying question

---

## Step 3: Cross-Participant Pattern Scan

This is where clustering begins. Apply both Kolko's synthesis acts and Chipchase's observational disciplines.

**Kolko — three synthesis acts:**
- *Prioritizing:* Which findings carry structural weight across multiple participants? Which are specific to one person's situation?
- *Judging:* Does this finding belong to an emerging cluster, or is it adjacent noise?
- *Forging connections:* For any cluster, can you name WHY the findings connect — not what connects them, but why?

**Chipchase — pattern scan disciplines:**
- *Defamiliarization:* Treat the obvious cluster with suspicion. If the pattern feels inevitable ("of course dealers matter"), ask whether you're about to name a label instead of an abductive claim.
- *Range of distribution:* Don't only look at the center. Single-participant findings at the edge may be leading indicators — flag them as hypotheses even if they can't yet become themes.
- *Centers of gravity:* Where do multiple findings concentrate? High-density areas deserve more than one theme.
- *Workarounds as structural signals:* Every Resignation finding cluster is a structural gap the system hasn't acknowledged. These clusters reliably produce themes.
- *Convergent analogies:* Look for findings where different participants reach for different vehicles to describe the same structural meaning (Porsche/Arc'teryx/On Running all encoding the same brand position is a theme, not a coincidence).

**Scan systematically across:**
- Behavioral domains (purchase, usage, community, information, loyalty, identity)
- Participant types (do customers and dealers see the same thing? Do near-purchasers and owners diverge?)
- Signal types (do multiple Resignation signals cluster? Multiple Contradictions?)
- Abductive flags (which flags are asking the same underlying question?)

---

## Step 4: Name the Candidate Clusters

> **Felt check at the discard point:** as candidate names are set aside, notice any forced feeling or unresolved unease about a discarded candidate — if one persists, report it in the completion report's `felt_flags:` line with its settling condition rather than suppressing it.

For each cluster of 3+ independent findings, draft a theme title before writing the theme.

**The behavioral name test (from ThemeFormat.md):**
- Is it a behavioral claim, not a topic label?
- Is it specific to this data?
- Could a reasonable person push back on it?
- Does it name something that wouldn't be obvious without reading the transcripts?

Draft 8–20 candidate theme names before committing. The first five will be the obvious ones. The themes after that are where the insight lives. These are working names for finding the themes. Each final title is written last, after its theme is written, as a plain statement (`ThemeFormat.md` → The Behavioral Name Test).

**Do not name themes yet that only have 1–2 sources.** Instead, flag them:
```
[HYPOTHESIS] [Candidate theme name] — sources: [Participant A, Finding N], [Participant B, Finding N]
```
Hypotheses become themes when a third source confirms them. Flag them now; they may become themes when you read more carefully.

---

## Step 5: Apply the Evidence Threshold

For each candidate theme, count the independent sources:

| Count | Action |
|-------|--------|
| 1 | Flag as outlier — note it, don't theme it |
| 2 | Flag as corroborated hypothesis — may become a theme with one more source |
| 3+ | Confirm as theme — proceed to Step 6 |

**Independence check:** Three findings from one participant do not make a theme. Three findings must come from three different participants, ideally across different participant types (customer + dealer + insider strengthens a theme more than three customers). Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`.

**Single-session rule (hard block):** Distinct speakers in one conversation count as different participants — but a theme whose sources **all share the same `session_id`** is **not** independently corroborated: panelists hear and prime each other in real time, so same-room agreement is weaker than the same claim volunteered in unconnected sessions. Such a candidate is held `[SINGLE-SESSION HYPOTHESIS]` and **cannot be named as a theme until at least one corroborating source comes from a different session** (a different conversation, or an interview). Same `session_id` across all sources → not yet a theme, regardless of speaker count.

**Observer-independence rule (added 2026-07-31, with the observation evidence class):** an observation-class finding is attributed to a participant but *authored* by a researcher. A theme whose sources are **all observation-class findings authored by the same researcher** is corroborated on one observer, not N participants — one person noticing the same thing five times is the structural twin of the single-session rule (an observer primes themselves). Hold it as `[HYPOTHESIS — single-observer corroboration]` until a source of a different evidence class, or a different observer, corroborates. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`.

**Survey independence rule (added 2026-09-27, with the L1 Survey Variant; revised after audit the same day):** survey rows are anonymous, unprompted, self-selected responses to one instrument, and they reach L2 grouped by a category someone else chose. Five parts:
1. **Counting.** A survey finding contributes its **supporting** rows (from the L1 file's Row accounting, not only the rows it quotes). Count distinct respondents: when the L1 file says `independence: verified`, map each supporting row ID to the `(respondent: …)` value on its line in the corpus file and count distinct respondents; otherwise count distinct row IDs, labeled "independence assumed". Ambiguous rows are not counted. Key every ID by survey (`survey_id` + ID): two surveys can both contain `r412`, and the same ID in corpora from two questions of one survey is one respondent, counted once. **Count a supporting row toward the floor only when its Claim kind matches the claim the theme makes** (read it from the row's mark in Row accounting, e.g. `S-087(wish)`; unmarked rows carry the finding's main claim kind): a stated-wish row supporting a theme about what happens to people is listed in Evidence as "also asked for" and not counted, and an incident row supporting a theme about what people ask for is listed as "also reported". Record the count in the theme's `survey_rows:` field, and the number of distinct `survey_id`s in `surveys:`, not in `participants:`, which stays a count of interview and conversation participants. The floor of 3 applies to the two together.
2. **Single-survey hold.** A theme whose sources are all survey findings from one survey (one `survey_id`) is held `[HYPOTHESIS — single-survey]` until another source type (interview, conversation) or a different survey corroborates it. "Different survey" is the researcher's declaration at segmentation (`--survey-id`): separate waves, or channels exported separately, get their own IDs; a re-export of the same collection keeps its ID. Agreement inside one survey shares its question, channel and self-selection, and partly restates the categories that grouped the rows; with `coding_provenance: researcher-imposed` or `tagging_method: classifier | keyword` it can be the coding scheme agreeing with itself. Splitting one survey into more batches does not release the hold.
3. **Survey-only themes.** A theme corroborated across two or more surveys but by no interview or conversation may be named, and carries `[SURVEY-ONLY]` after its title here, in the master document, and into L3.
4. **No volume substitution.** Survey rows count toward the floor of 3 and nothing more. The strength bands (`ThemeFormat.md` → Evidence Threshold and Strength) count independent units only: interview participants, conversation sessions, and surveys. Separately exported channels of one survey (same question, same collection period) may release the single-survey hold, but together they count as one unit in the strength band. A row count is never written as a share of respondents or of a population.
5. **Carry the denominator and the claim kind.** The theme's Evidence gives, per survey finding, `s supporting · c contrary of n read`, and says when every supporting row is a stated wish (then the theme describes what respondents ask for, and its implication asks what the request stands in for).

The checker enforces the single-survey hold from the counts: it halts a theme with `participants: 0` and `surveys:` below 2, and warns when a theme with `participants: 0` from two or more surveys lacks `[SURVEY-ONLY]`. Whether the IDs behind those counts are right, and the single-session hold, are audited in prose (`AuditThemeSet` Audit 2).

Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`.

---

## Step 6: Write Each Theme

For each confirmed theme, use the WriteTheme workflow or write directly using the format from `ThemeFormat.md`.

**Order of writing:** Write behavioral pattern first. Write abductive connection second. Write evidence third. Write implication last.

This order matters: if you write the evidence first, you're describing. If you write the behavioral pattern first and then the abductive connection, you're synthesizing.

**Trace check — Implication and L4-flag text only (PROVISIONAL install; evidence obligation on first live use):** before a theme is finished, set its Implication and any L4-flag text against the theme's own cited evidence. Economic, quantified, or evaluative vocabulary (LTV, spend, price points, market size, percentages, "premium," "loyal") that does not appear in, and is not directly supported by, the cited findings is rewritten in the evidence's own register or hedged to its source — these two sections are where the theme file leaves the participants' register, and downstream rungs import what is written here as if it were evidence. Attribution follows the same two-part rule as L3's trace check (`l3-insight-synthesis/InsightFormat.md` → The Trace Field): who said it, and whose it is — a participant reporting a third party's shop, sale, or figure is a witness, not the owner of the fact, and reported speech is never resolved to the speaker by default. Record any term revised or discarded in a one-line `trace:` note beside the Implication. Authorizing ruling: clause-5 L2 mirror, the researcher 2026-08-22 (regression adjudication ratified same day; installed PROVISIONAL per the Synthesist chair's condition C1 — this instrument's own ledger row is unevidenced until its first live use).

**Quality check before moving to the next theme:**
- [ ] Theme title was written last, passes the behavioral name test, and can be understood on first read with no project context
- [ ] Behavioral pattern is descriptive, not interpretive
- [ ] Text under the title meets `ThemeFormat.md` → Plain words in the body: each limit has its own sentence, no working shorthand
- [ ] Abductive connection introduces new knowledge — it doesn't just restate the pattern
- [ ] Evidence is specific (participant code, finding reference, verbatim quote or behavioral description)
- [ ] Evidence rendered by class: no observation-class finding appears in quotation marks; observation citations carry researcher + capture artifact; photo citations carry consent tier (WriteTheme Step 4)
- [ ] Implication forces a question, not a recommendation
- [ ] Trace check run on Implication and L4-flag text — economic/quantified vocabulary verified, rewritten, or hedged; reported speech carries speaker and subject (PROVISIONAL instrument)
- [ ] All evidence sources are independent (different participants; not all sharing one `session_id`; not all observation-class from one researcher)

---

## Step 7: Review the Theme Set

Before writing any files, review the full theme set together:

**Coverage check:** Are major behavioral domains represented? If a domain appears in many findings but has no theme, you've either missed a theme or those findings don't reach threshold.

**Overlap check:** Can any two themes be merged without losing meaning? If yes, merge them. Two themes that say the same thing from slightly different angles are one strong theme, not two weak ones.

**Outlier audit (Chipchase):**
```
## Outliers (did not reach theme threshold)
- [Participant] [Finding N]: [Why it didn't cluster] — [What structural question it might be pointing at]
```
Outliers belong in the master document, listed explicitly. They are not waste — they are hypotheses for the next research phase.

**Cross-theme relationships:** Do any themes have causal relationships?
- Does Theme A's behavior seem to produce Theme B?
- Are two themes in tension — participants doing opposite things in the same context?
- Do two themes describe different facets of the same underlying dynamic?

Name these relationships explicitly. They will become part of the synthesis statement.

---

## Step 8: Volume Check

Before writing the synthesis statement, check your theme count against the calibration in `ThemeFormat.md`. Look up the participant count from Step 2 and confirm the theme count is within range. Survey sources do not enter the calibration; it is keyed on interview and conversation participants only.

**Under the floor:** Return to Step 3 — look for workarounds, convergent analogies, and silent themes you passed over. (See ThemeFormat.md under-floor check for the full list.)

**Over the ceiling:** Review whether any two themes can be merged without losing meaning. Adjacent sub-patterns of a stronger theme should collapse. (See ThemeFormat.md over-ceiling check.)

A theme count outside range that cannot be corrected should carry an explicit note explaining why — don't silently accept a calibration miss.

---

## Step 9: Write the Synthesis Statement

After all themes are confirmed, write the synthesis statement: the meta-abductive claim about what all themes together reveal.

**The synthesis statement is not a summary.** It is the argument the themes make together — the structural tension or underlying truth that individual themes don't individually name.

**Structure:** Name the central tension. Name what the brand, product, organization, or system has vs. what the behavioral evidence says it lacks. End with the strategic question the themes make unavoidable.

---

## Step 10: Write the Output Files

**Individual theme files** (one per theme):
- Filename: `L2-[NN]_[Short_Name].md`
- Format: YAML frontmatter + four sections (see ThemeFormat.md)
- Write to the specified output directory

**Master themes document:**
- Filename: `L2_Themes_[ProjectName].md`
- Format: YAML frontmatter + How-to-read + all themes in order + outliers section + synthesis statement
- Write to the same output directory

---

## Step 11: Confirm Completion

Report:
```
L2 synthesis complete — [Project Name]

[N] themes written to [output directory]:
- L2-01: [Title] — [N] sources
- L2-02: [Title] — [N] sources
...

[N] outliers flagged (did not reach threshold):
- [Participant] [Finding]: [One-line note]

Total L1 findings synthesized: [N] across [N] participants
Themes span [N] participants

Before advancing — a fresh agent runs AuditThemeSet (Final Step below) and must clear its "Cleared for L3" gate. Do not advance to L3 with unresolved audit flags.

felt_flags: <none-issued | "<report> — settles when <condition>"; semicolon-separate multiple reports on one line>

Next step: L3 Insights — [recommended entry point based on strongest themes]
```

---

## Quality Checks Before Writing Files

**For each theme:**
- [ ] Title is a behavioral claim, not a topic label
- [ ] Behavioral pattern is descriptive (not interpretive)
- [ ] Abductive connection introduces new knowledge
- [ ] Abductive connection is specific — not applicable to any brand everywhere
- [ ] Evidence cites specific findings with participant codes and quotes
- [ ] All sources are independent (different participants)
- [ ] Implication forces a question, not a recommendation

**For the theme set:**
- [ ] 3+ independent sources for every named theme — not all sharing one `session_id` (single-session candidates held as hypotheses, not named)
- [ ] `participants:` counts enacted evidence only; stated, hypothetical and anticipated cases sit under Listed, not counted, and the field matches the Counted list
- [ ] Survey sources: supporting rows counted in `survey_rows:` (deduplicated by survey + ID); not all from one survey (single-survey candidates held); survey-only themes labeled `[SURVEY-ONLY]`; strength band from independent units only; Limits line carried forward
- [ ] Outliers documented explicitly
- [ ] Cross-theme relationships named
- [ ] Synthesis statement makes an argument, not a summary
- [ ] Volume is within calibration (see ThemeFormat.md)

---

## Final Step: Audit — REQUIRED

After writing all theme files, dispatch a fresh agent to run `AuditThemeSet` on the completed set (procedure: `../ladder-core/ladder-map.md` → Running a level audit; canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`). The workflow is not finished until `L2_ThemeSet_Audit_[ProjectName].md` is saved beside the set and its "Cleared for L3" gate is cleared, or the user has chosen to advance with open flags and that choice is recorded in the report. Do not advance to L3 or share with stakeholders before then. The audit catches coverage gaps, threshold failures, weak abductive connections, and synthesis statement problems that the quality checklist above does not surface.
