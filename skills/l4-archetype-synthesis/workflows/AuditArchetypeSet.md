# AuditArchetypeSet Workflow

Quality-check a completed archetype set before advancing to L5 or delivering to a client. Issues a "Cleared for L5" or "Not cleared — revise" verdict.

## When to run this audit

Run after `SynthesizeArchetypes` has produced a complete archetype set and before:
- Advancing to l5-framework-synthesis
- Delivering the archetype document to a client
- Using the archetype set as input to concept design or experience architecture

---

## Step 0 — Deterministic Gate Check (mechanical, before the prose audit)

Run the zero-LLM gate checker against the project's synthesis directory:

```bash
bun ../ladder-core/scripts/synthesis-gates-check/check.ts <project synthesis dir>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`.

The checker reports on every set under the directory you give it. Disposition the results for the set being audited and the level below it; note the others in one line without auditing them. Disposition every HALT and WARN before the prose audit below — fix it, or carry it into the report as a named finding. Do not prose-audit artifacts that fail their mechanical gates. (A gate-7 `final_ladder_review: pending` WARN is expected before the capstone review — no action here.) On a first audit of a set, gate 8 warns that the set has no audit report, or none that has cleared. That is expected and is not a failed gate: this audit is what answers it. Note it in one line and go on; it clears when the report clears the set, or when an Addendum records the blocking fixes.

---

## Step 1: No action in this edition

Continue at Step 2.

---

## Step 2: Read the Archetype Files

Read the master archetypes document and all individual ARCH-NN files. Read them fully. If they do not exist at the stated path, do not audit: return a report whose first line names what is missing.

**The level below is required too:** the directory holding the L2 themes the set was built from (the cards' `source_themes:` name them; read the L3 insights too when `source_insights:` is populated). The dispatcher passes it, and the L1 findings directory as well (`../ladder-core/ladder-map.md` → Running a level audit). L1 is for targeted checks: quotes the set carries from L1, and claims about participants that the level below does not show. If it was not passed and cannot be found from the source fields, stop the same way.

**Run the first read first (First Read, below).** Before the pre-pass and before you read the level below, open the set only to copy out its reader-facing text, and give that text to a separate reader. A reader who has seen the working files cannot do the first read.

**Run the pre-pass next, on every audit, whatever the size of the level below.** Run it from this skill's folder, the one that holds `workflows/`: the path that starts `../ladder-core/` resolves from there.

```bash
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts <set directory> <L2 themes directory> --also <L1 findings directory>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`. With `--also`, a quote found only in L1 is marked as such rather than not found. The pre-pass lists the themes no file in the set cites, citations that point at nothing, and quoted fragments not found in the source they cite. Its items are candidates, not verdicts: judge each one, and carry the real defects into the report as findings. Paste its Summary section into the report.

**Then read the level below.** Read every L2 theme file the cards cite in full, and the L3 insights named in `source_insights:` where present. The anti-fabrication, anti-demographic-collapse and L3-coherence audits below are built from this read.

**Read with a file-reading tool, not by printing files in a shell:** shell output is truncated, and a truncated read is a skim. **State what you read.** The report header carries this line, in exactly this form, which the gate checker reads: `**Inputs read:** <N> files, <M> items (L2 themes)`, followed by `— full read` or `— pre-pass candidates and cited items; not read: <what was not read>`.

---

## First Read (advisory, run first)

Can a reader with no project context understand the archetype names and cards on first read? The other audits test grounding and form, not readability, and a set can pass all of them and still be unreadable.

**Who reads.** A separate reader: a person, or a fresh agent pinned to `sonnet`. Give the reader only the set's reader-facing text: the archetype names, one-line profiles, behavioral profiles and design implications. Do not give the reader working files, L2 themes, L3 insights or the rest of this audit. You may start the fresh agent yourself. If no separate reader is available, read that text yourself and say in the report that the first read was not clean, because you had already opened the set. Put the reader's list in the report word for word. Fill the brackets from the project and use the rest of this prompt word for word:

> This document reports [one line: what the research was and who it is for]. You are [the intended reader], reading it for the first time. You know [what that reader already knows, such as the category's brands and product terms]. First names are participants and codes in parentheses point to the evidence; ignore both. Read it once, in order. List only the sentences you could not follow on this read: (A) you cannot say in your own words what the sentence claims; (B) you can only work out what it means by decoding a figure of speech or a private term. Do not list a word you would simply look up, or something the next sentence explains. Do not judge whether the research is right. Do not suggest rewrites. For each, quote the sentence or phrase and give A or B. Your entire response IS the list, with nothing omitted. If there are none, respond with "None".

Add one question for the names: for each archetype name, can you say what kind of person this is from the name alone? Quote any name you cannot.

**Then ask where each clause comes from.** With the level below in hand, take each clause of each one-line profile and name the cited evidence behind it. A clause with no participant behind it is cut, or stays only if the card labels it as the synthesist's reading. Theory imported from L3 Knowledge sections is a common source of such clauses.

**Using the list.** The list is advice for the writer and the researcher. It is not a pass or fail, and its findings do not count against "Cleared for L5". The writer decides what to rewrite and rewrites from what the evidence shows, not by adjusting the words of the flagged sentence. The researcher ruled this for L2 and L3 on 2026-11-06, after a test in which the counts did not rank the texts and a blocking rule would have required 20 to 35 rulings per set; the same ruling applies here (2026-11-07). A clause with no participant behind it is different: it comes from the clause-source question and is an ordinary finding under Audit 2.

This audit does not replace the researcher's line-by-line read.

---

## The Five Audits

Run all five. Report findings for each. The final verdict is blocked if any audit has an unresolved flag, except Check 3.6b (card text), which is noted, not blocking.

---

## Audit 1 — Data Gate Integrity

Verify that the archetype status declared in the synthesis is honest and traceable.

**Check 1.1 — Status declaration is explicit:**
Does every archetype card carry an explicit `archetype_status:` field (Full or Proto)? If any card is missing this field, flag as a silent upgrade.

**Check 1.2 — Full archetype conditions are met:**
For every archetype declared Full, verify that the research grade and participant count support it:
- Foundational dominant + ≥12 participants + multi-session depth, OR
- Foundational dominant + qualifying quantitative cluster data

If a Full archetype is declared on Descriptive-dominant or Evaluative-dominant research, or on <12 Foundational participants without quantitative cluster support, flag as a data gate violation. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.archetype_evidence_floor`.

**Check 1.4 — Domain propagated:**
Does every archetype card (and the master archetypes document) carry the `domain:` frontmatter field, matching the domain confirmed upstream? A missing or mismatched `domain:` is a silent cross-rung routing failure — flag it. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.domain_scope_confirmation`.

**Check 1.3 — Confidence ceiling is applied:**
For every archetype with a quantitative data quality flag, verify that the confidence ceiling was applied:
- Attitudinal-only → ceiling Medium-Low
- Adequate → ceiling Medium
- Strong → ceiling High

If any archetype claims High confidence on Attitudinal-only data, flag as a ceiling violation.

**Check 1.4 — Proto-archetype upgrade paths are stated:**
For every archetype declared Proto, verify that the `upgrade path:` field names the specific data needed (not just "more research"). If the path is generic or absent, flag.

Report:
```
Audit 1 — Data Gate Integrity:
1.1 Status declaration: <Pass / Flag — which cards are missing the field>
1.2 Full archetype conditions: <Pass / Flag — which archetypes don't meet the threshold>
1.3 Confidence ceiling: <Pass / Flag — which archetypes violate the ceiling>
1.4 Proto upgrade paths: <Pass / Flag — which paths are missing or generic>
```

---

## Audit 2 — Anti-Fabrication

Verify that every archetype is grounded in specific behavioral evidence from L2 themes or participant observations — not inferred from general knowledge of the category or from L3 summaries alone.

**Check 2.1 — Evidence trail is populated:**
Does every archetype card have an Evidence Trail section with at least 2 L2 theme citations? If any card cites only L3 insights (without tracing to L2), flag as a citation gap — L3 may have pre-averaged the behavioral variation that should ground the archetype.

**Check 2.2 — LeCompte emergence types are named:**
Does each Evidence Trail entry name the emergence type (Declaration, Frequency, Omission, etc.)? If entries list observations without emergence typing, flag — untyped evidence is harder to evaluate for strength.

**Check 2.3 — Negative cases are documented:**
Does each archetype card name at least one negative case — a participant whose behavior does not fit? If a card has no negative cases, either the archetype was not tested against contrary evidence, or the research produced a suspiciously clean cluster. Flag if absent.

**Check 2.4 — Design implications are evidenced:**
Does each "design for" principle in each archetype card trace to a behavioral pattern in the Evidence Trail? A design implication that cannot be traced to behavioral evidence is a hypothesis, not a finding. Flag and label accordingly.

**Check 2.5 — Key Indicators present and observable:**
Does each archetype card have 3–5 Key Indicators? Apply the observability test to each KI: could a researcher in the field, a designer watching a session recording, or an analyst reviewing data apply this signal without knowing what the participant was thinking or feeling? If a KI requires interpretation of internal state (e.g., "has a deep but inarticulate loyalty"), it is a behavioral inference masquerading as an observable signal. Flag cards with fewer than 3 KIs or with KIs that fail the observability test. An archetype without KIs has not been operationalized.

**Check 2.6 — Leading edge signal present and specific:**
Does each archetype card have a populated Leading Edge Signal section? The signal should name: (a) a specific behavior observed in 1–3 outlier participants, (b) what it implies about where the mainstream archetype is heading, and (c) a design implication. Generic or absent signals (e.g., "more research needed") are insufficient — flag. If the research genuinely produced no edge-behavior data, the card should state this explicitly as a confidence limitation, not leave the field empty.

Report:
```
Audit 2 — Anti-Fabrication:
2.1 Evidence trail populated: <Pass / Flag — which cards have no L2 citations>
2.2 Emergence types named: <Pass / Flag — which entries are untyped>
2.3 Negative cases documented: <Pass / Flag — which cards have no negative cases>
2.4 Design implications evidenced: <Pass / Flag — which implications are untraced>
2.5 KIs present and observable: <Pass / Flag — which cards have fewer than 3 KIs or fail the observability test>
2.6 Leading edge signal present: <Pass / Flag — which cards have absent or generic signals>
```

---

## Audit 3 — Anti-Demographic Collapse

Verify that archetypes are behavioral constructs, not demographic relabelings.

**Check 3.1 — Names are behavioral:**
Does each archetype's name describe a behavioral mode rather than a demographic characteristic? Names that reference age, income, gender, life stage as the primary label (e.g., "The Millennial," "The Affluent Buyer," "The Empty Nester") have collapsed the archetype into a demographic segment. Flag any such names and require behavioral renaming.

**Check 3.2 — Profiles are behavioral:**
Does each one-line profile describe what the archetype *does* rather than who the archetype *is* demographically? A profile like "Older riders who have disposable income and are returning to competition" is a demographic description. A profile like "Plans ahead to maximize discovery; confident about desired outcome before engaging; treats research as pleasure, not friction" is behavioral. Flag demographic profiles.

**Check 3.3 — Phase of life is treated as contextual, not segmentation:**
If developmental context (phase of life) appears as a trigger, is it framed as a *condition that activates a behavioral mode* rather than as a segment criterion? The archetype is the behavioral mode; phase of life is one condition that activates it. A card that says "This archetype = people who are returning to a sport" has made phase of life the segment criterion. Flag and reframe: "This archetype is activated when a person returns to a sport after an extended gap — the return event triggers Explorer-mode behavior that may shift toward Doer behavior over time."

**Check 3.4 — The Millennial/Boomer test:**
For each archetype, ask: could two people of the same demographic age, income, and gender exhibit this archetype's behavioral mode? If yes, the archetype is genuinely behavioral. If the archetype only makes sense for one demographic profile, it has collapsed. Flag.

**Check 3.5 — Naming mode consistent across the set:**
SKILL.md Core Concept 6 requires one naming mode applied consistently across all archetypes in a set. Do all archetype names use the same mode — all behavioral action labels or all plain descriptors? A set that mixes modes (e.g., "The Planner" alongside "Buyers Who Want Advice") has a fragmented naming system. Flag any mixed-mode sets and require a naming decision: pick the dominant mode and rename the outliers.

**Check 3.6 — Names and card text are plain (names block; card text does not — the researcher, 2026-11-07):**
- **3.6a Names (blocking).** Does any name use a figure of speech, wordplay or alliteration, a coined term, or a term from the theory or the synthesis's working vocabulary (SKILL.md Core Concept 6)? Flag each and rewrite from what the evidence shows. An unresolved 3.6a flag blocks the verdict like any other flag in this audit. Why names block: they are short, cheap to fix, and the most reused part of an archetype set.
- **3.6b Card text (noted, not blocking).** Does the card text follow `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body (a limit in its own sentence, no working shorthand, the synthesist's reading said in a plain sentence)? List each instance under "Flags noted but not blocking" for the writer. This is the one exception to the rule that an unresolved flag blocks the verdict: card-text findings run long, as the first-read list did at L3, and would turn clearance into line-by-line rulings.

Whether a cold reader can follow the text is the First Read's question, which is advisory; this check covers only these listed faults.

Report:
```
Audit 3 — Anti-Demographic Collapse:
3.1 Names behavioral: <Pass / Flag — which names are demographic>
3.2 Profiles behavioral: <Pass / Flag — which profiles are demographic>
3.3 Phase of life as context: <Pass / Flag — which cards treat phase of life as a segment criterion>
3.4 Millennial/Boomer test: <Pass / Flag — which archetypes are demographically bound>
3.5 Naming mode consistent: <Pass / Flag — name the modes present; which archetypes are outliers>
3.6a Names plain (blocking): <Pass / Flag — quote each figure of speech or coined term in a name>
3.6b Card text plain (not blocking): <Pass / Noted — quote each packed sentence, shorthand or repeated label>
```

---

## Audit 4 — Fluidity Labeling

Verify that the fluidity principle is applied correctly — that archetypes are declared journey-specific or person-level with appropriate evidence, and that developmental context shifts are noted where evidence supports them.

**Check 4.1 — Journey-specificity is declared:**
Does each archetype card carry a Fluidity Note that declares whether the archetype is journey-specific or person-level? If the field is absent or says "unknown," flag.

**Check 4.2 — Person-level claims are supported:**
For any archetype declared person-level (stable across multiple contexts), is there cross-domain corroboration in the evidence? If a person-level claim is made based on single-context observation only, flag as overclaim — downgrade to journey-specific.

**Check 4.3 — Developmental context shifts are noted:**
If research data contained evidence of phase-of-life activation (e.g., returning to sport, first major purchase), are these noted as developmental triggers on the relevant archetype cards? If the synthesis identified such shifts but did not note them, flag as an omission.

**Check 4.4 — Fluidity matrix is present and populated:**
Does the master archetypes document include a fluidity matrix? Is it populated — not left blank or marked "TBD"? If absent or empty, flag.

**Check 4.5 — Beachhead archetype identified:**
Does the master archetypes document (or the synthesis completion report) declare which archetype maps most strongly to early adopters? SynthesizeArchetypes Step 9 (Fluidity Check) requires applying the Chipchase adoption-curve lens. The beachhead archetype is the natural first target for any new offering — its absence from the set documentation means this decision has not been made. Flag if no beachhead designation is present. Note: if the research dataset produced no evidence relevant to adoption curves (no questions surfaced early-adopter behavior), document this explicitly rather than leaving the field blank.

Report:
```
Audit 4 — Fluidity Labeling:
4.1 Journey-specificity declared: <Pass / Flag — which cards lack the declaration>
4.2 Person-level claims supported: <Pass / Flag — which claims lack cross-domain evidence>
4.3 Developmental context noted: <Pass / Flag — which shifts were observed but not recorded>
4.4 Fluidity matrix present: [Pass / Flag]
4.5 Beachhead archetype identified: <Pass / Flag — name the designated archetype, or note absence>
```

---

## Audit 5 — Volume and L3 Coherence

Verify that the archetype set is the right size and accounts for the full L3 insight set.

**Check 5.1 — Volume is within range:**
How many archetypes were derived? Apply the volume calibration from ArchetypeFormat.md:
- <12 participants → expect 2–3 (Proto-archetype status likely)
- 12–15 → expect 3–4
- 15–25 → expect 3–5
- 25+ with quant data → expect 4–6

**Cross-client norm:** 5–6 archetypes. Above 6 requires explicit justification naming the behavioral variation that cannot be collapsed without losing distinct design implications. Above 8 is over-fit in virtually all cases and should be challenged.

If the archetype count is below the expected range: behavioral variation was likely not surfaced or was flattened in L2 synthesis — check whether L2 themes preserved individual-level variation. If above the expected range: check whether any two archetypes have nearly identical design implications and should be merged.

**Check 5.2 — All L2 themes are accounted for:**
Are all L2 themes cited in at least one archetype's Evidence Trail, or explicitly noted as out of scope? Silent omission of L2 themes is a coverage failure. Flag any theme that appears in no archetype and has no documented rationale for omission.

**Check 5.3 — L3 coherence map is complete:**
If L3 insights were available for the coherence check (Step 10 of SynthesizeArchetypes), does the master document include a coherence map? Is every L3 insight accounted for — as confirmatory, cross-cutting, or orphaned? If any L3 insight is unaccounted for, flag.

**Check 5.4 — Orphaned L3 insights are investigated:**
For any L3 insight marked Orphaned in the coherence map, is there a note explaining why? The explanation should be one of: "describes organizational context rather than customer behavior," "addresses a job above the archetype level," "behavioral variation in the L3 was pre-averaged — underlying L2 data may warrant revisiting," or equivalent. Generic "not applicable" notes are insufficient — flag.

**Check 5.5 — No two archetypes share the same design implications:**
For each pair of archetypes, compare the "Design for" sections. If two archetypes have three or more identical or near-identical design principles, they are likely the same archetype described twice. Flag and recommend merging unless a clear behavioral distinction is documented.

**Check 5.6 — Spectrum coverage is not collapsed:**
For each of the four frog spectrums, examine the positions across all archetypes. If all archetypes cluster at the same end of any spectrum (e.g., all are High-Leader on Swagger, or all are High-Emotional on Utility), one of two things has happened: either the research did not surface variation on that dimension (a fieldwork gap, possibly addressable with ArchetypeReadyGuide), or the derivation collapsed real variation into a false consensus. Flag any spectrum where all archetypes sit on the same side with no meaningful spread. This is not a blocking defect — note it as a coverage limitation and name what additional research would surface the missing variation.

Report:
```
Audit 5 — Volume and L3 Coherence:
5.1 Volume: [N archetypes / Expected range for N participants: N–N] — <Pass / Flag — reason>
5.2 L2 theme coverage: <N themes cited / N themes omitted — accounted for as follows: ...>
5.3 L3 coherence map complete: [Pass / Flag]
5.4 Orphaned L3 insights investigated: <Pass / Flag — which lack sufficient explanation>
5.5 No duplicate design implications: <Pass / Flag — which archetype pairs overlap>
5.6 Spectrum coverage: <Pass / Flag — which spectrums are collapsed; what research would address the gap>
```

---

## Step 3: Compile Verdict

Issue the verdict:

```
L4 Archetype Set Audit — [Project Name]
[Date]

VERDICT: <CLEARED FOR L5 / NOT CLEARED — REVISE>

Flags requiring revision before advancing:
[List all blocking failures. Each: Audit [N] — Check [N.N] — [What needs to change]]

Flags noted but not blocking:
<List advisory flags — worth reviewing but don't prevent advancement>

If CLEARED FOR L5:
- Archetype status declared honestly: [Full | Proto | Mixed]
- [N] archetypes grounded in L2 behavioral evidence
- All archetypes behavioral (not demographic)
- Fluidity labeling complete
- L3 coherence accounted for
- Ready for L5 integration (optional) or concept design handoff
```

**The "Cleared for L5" gate means:** the archetype set is well-formed, grounded in behavioral evidence, and free of the five guardrail violations. It does not mean the archetypes are final — they are synthesis outputs, and hypotheses require validation in use. The cleared verdict means the set is ready for the next step.

---

**Discharge-sweep rule** — when a finding from this audit is discharged (fixed and closed), sweep for the same defect **shape** — not the same words — before closing. The sweep scope is every artifact derived from the ladder in the project tree: rungs above and below the fix, masters, standalone files, renders (.typ/.pdf), and presentation sources (deck scripts and exported decks). Record the sweep in the Addendum that records the fix. On a first audit nothing has been discharged, so the report field below reads "not applicable". Canonical: `FinalLadderReview.md` → Quality Checks Before Reporting. *(Corrected wording per the 2026-08-21 two-failure replay; adopted 2026-08-22.)*

## Audit Report Format

```
## L4 Archetype Set Audit — [Project Name]

**Inputs read:** <N> files, <M> items (L2 themes) — <full read | pre-pass candidates and cited items; not read: …>

**Pre-pass summary:** <paste the pre-pass Summary section>

### First Read
<Who read it, and whether it was a separate reader; each finding with the words quoted and what the writer did with it; names a cold reader could not place; clauses with no participant behind them; "None" if none>

**Archetypes audited:** [N] ([Full | Proto | Mixed])
**Participants:** [N] / Research grade: [Grade]
**Date:** [YYYY-MM-DD]

### Audit 1 — Data Gate Integrity
<Pass / Flag — per check, with specific revision notes>

### Audit 2 — Anti-Fabrication
<Pass / Flag — per check, with specific revision notes>

### Audit 3 — Anti-Demographic Collapse
<Pass / Flag — per check, with specific revision notes>

### Audit 4 — Fluidity Labeling
<Pass / Flag — per check, with specific revision notes>

### Audit 5 — Volume and L3 Coherence
<Pass / Flag — per check, with specific revision notes>

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

## Save the Audit Report

After completing the report, write it to the directory containing the audited archetype files:

**Filename:** `L4_Archetype_Set_Audit_[ProjectName].md`
**Location:** Same directory as the audited archetype files (e.g., `.../L4_Archetypes/`)

This keeps the audit co-located with the synthesis it audits and makes it available to the FinalLadderReview, which reads it to confirm per-level gates have cleared.

---

## Reminder: CopyEdit Before Advancing

Before moving to L5 or sharing with stakeholders, run a copy-edit pass (Medium level, research genre; the optional prose-craft companion skill's edit workflow, if installed) on the L4 Archetype documents. Apply to the master archetypes document and all individual ARCH-NN files. **Supply the source corpus (participant roster, transcripts) with the request** — with sources in context the pass verifies participant names and behavioral attributions against them; without sources it flags only internal inconsistencies, and a wrong-but-consistent attribution will pass. The pass also catches style inconsistencies and demographic language that may have crept in during synthesis.
