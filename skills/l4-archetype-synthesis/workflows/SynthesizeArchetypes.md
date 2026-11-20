# SynthesizeArchetypes Workflow

Synthesize L2 themes (primary) and L3 insights (validation) into a set of named consumer archetypes or proto-archetypes — the behavioral segmentation layer that grounds experience design, concept direction, and strategic framework.

## Before You Start

Read `ArchetypeFormat.md` in the skill root. It contains:
- Individual archetype card format and master document format
- Confidence level definitions and ceiling rules
- Context trigger types (situational vs. developmental)
- Spectrum position notation
- File naming conventions
- Volume calibration

---

## Step 1: No action in this edition

Continue at Step 2.

---

## Step 2: Locate and Load Research Files

Confirm with the user:
- Where the L2 theme files are (full directory path)
- Where the L3 insight files are (for validation in Step 9)
- Whether to read L2 theme files individually or from a master L2 document (prefer individual files — they preserve more behavioral detail)
- Where to write the output (output directory)
- Project name for file naming
- **Project domain:** brand/design | product/UX | organizational | policy/advocacy | other

List all L2 theme files. Read each one fully before beginning extraction.

**Inherit the domain:** Check the `domain:` field in the L2 or L3 frontmatter. If present, inherit and confirm; if absent, ask explicitly. Carry the confirmed domain into the L4 output frontmatter. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.domain_scope_confirmation`.

**Audit gate (added 2026-09-23):** Check the audit of whichever set this synthesis reads: `L2_ThemeSet_Audit_[ProjectName].md` (AuditThemeSet, "Cleared for L3") in the L2 directory, or, on the L3 fallback, `L3_InsightSet_Audit_[ProjectName].md` (AuditInsightSet, "Cleared for L4") in the L3 directory. Run it first when the report is missing, when its gate is not cleared and it carries no `advanced_with_open_flags` line, or when any file in the set is newer than the report; tell the user which applied. Procedure: `../ladder-core/ladder-map.md` → Running a level audit. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`.

**Data gate prerequisite:** If no L2 theme files are provided, confirm whether L3 insights are available to use as a fallback. If neither exists, stop and ask — do not proceed from general knowledge as a substitute for research data.

---

## Step 3: Data Inventory and Grading

Before any synthesis begins, produce a data readiness statement that grades the available research. This assessment determines archetype status (Full or Proto) and sets the confidence ceiling.

### 3a — Inventory

Compile a brief data table:

```
Data Inventory — [Project Name]

L2 themes:        [N files | Not available]
L3 insights:      [N files | Not available]
Raw notes/transcripts: [Available | Not available]
Participant count: [N]
Session depth:    [Multi-session (N sessions per participant) | Single-session]
Data format:      [Individual L2 files | Master L2 document | L3 fallback | Raw notes]
Gaps:             <What is missing — e.g., "no L2 files for 4 of 23 participants">
```

### 3b — Research Continuum Grade

Assign a grade based on the dominant data type:

| Grade | Research type | Typical methods | Archetype suitability |
|---|---|---|---|
| **Foundational** | Exploratory / generative — behaviors in natural context, no stimulus anchor | Ethnography, contextual inquiry, diary studies, in-depth interviews in natural context, field observation | High |
| **Descriptive** | Characterizing existing behaviors at scale | Surveys, behavioral analytics, screened category-usage interviews, focus groups | Moderate — can reinforce or size; rarely derives alone |
| **Evaluative** | Reactions to a specific stimulus (product, prototype, concept) | Usability tests, concept tests, A/B tests, prototype feedback sessions | Low — stimulus-anchored |

Mixed datasets: blended grade (e.g., "Foundational + Descriptive") with dominant type listed first.

### 3c — Descriptive Data Quality Flag

If quantitative or survey data is present, assess whether the instrument captured contextual variables alongside attitudes. Contextual variables operate at two levels:

- **Situational context** — moment-level triggers: time pressure, occasion type, functional vs. emotional mode of experience sought. Shifts archetype behavior for a single occasion.
- **Developmental context** — sustained, identity-adjacent life-stage frame: phase of life (returning to a sport, new parent, first major purchase in a category, newly empty nester). Carries identity weight — describes who a person is right now, not just their situation. Shifts archetype behavior durably across many purchase moments, not just one. Age predicts phase of life poorly; life events predict it well.

Assign a data quality flag:
- **Strong** — behavioral spectrums + at least one level of contextual variable captured
- **Adequate** — behavioral attitudes captured; limited contextual variable coverage
- **Attitudinal-only** — demographic or preference-based instrument; no situational or developmental context

### 3d — Output

Write a one-paragraph data readiness statement:

```
Data Readiness — [Project Name]

[N] L2 themes available across [N] participants ([session depth]). Research grade: [Grade]. 
[If descriptive data present: Descriptive data quality flag: [Strong/Adequate/Attitudinal-only] — [one clause explaining why].]
[What additional data would move the grade toward Foundational, if not already there.]
L3 insights: [available for validation / not available].
```

---

## Step 4: Data Gate — Declare Archetype Status

Declare archetype vs. proto-archetype status using both sample threshold and research grade. Make this declaration explicit before proceeding. This table is canonical for the full row set; the gate condition it enforces is `../ladder-core/config/synthesis-gates.yaml` → `gates.archetype_evidence_floor`.

| Condition | Status |
|---|---|
| Foundational dominant + ≥12 participants + multi-session depth | **Full archetype eligible** |
| Foundational dominant + quantitative cluster data (MaxDiff, k-means, EFA) | **Full archetype eligible** |
| Descriptive dominant (any sample size) | **Proto-archetype** — upgrade path: add foundational fieldwork |
| Evaluative dominant (any sample size) | **Proto-archetype** — upgrade path: foundational research required; stimulus-anchoring limits behavioral authenticity |
| Foundational dominant + <12 participants or single-session only | **Proto-archetype** — upgrade path: additional foundational participants |
| L2 not available; L3 fallback used | Note in output; proceed but flag reduced behavioral granularity |

**Confidence ceiling from data quality flag:**
- Strong instrument → ceiling: High
- Adequate instrument → ceiling: Medium
- Attitudinal-only instrument → ceiling: Medium-Low (clusters may reflect attitudes, not behavioral modes)

State the ceiling explicitly. It travels to every archetype card.

---

## Step 5: Behavioral Pattern Extraction

Load all L2 theme files (or L3 insights if L2 is unavailable). Extract behavioral patterns that vary across participants — the variation is the signal.

**Extraction discipline:**
- Group by behavioral mode, not by participant
- Preserve individual-level variation — do not pre-average or describe the "typical" participant
- The participant who doesn't fit the group is as important as the participant who does

**For each behavioral pattern found, note:**
```
Pattern: [Brief descriptive name]
Observed in: [List participant IDs or codes]
L2 source themes: [L2-T-NN, ...]
Emergence type (LeCompte): [Declaration | Frequency | Omission | Similarity | Co-occurrence | Corroboration/Triangulation | Sequence | A priori hypothesizing]
Behavioral note: <What participants do — not what they say they prefer. Behaviors, workarounds, adaptations.>
Edge behavior flag: <Yes / No — is this present in outlier participants who may be leading indicators?>
```

**Edge behavior flag (Chipchase):** Mark any behavior present in 1–3 participants at the extreme of the distribution. These are not outliers to dismiss — they are the range-of-distribution signal. The outlier's behavior is often where the mainstream archetype is heading.

**L3 fallback note:** If using L3 insights as the primary input, patterns will be less behaviorally granular. Note this in the extraction — L3 insights may have pre-averaged variation that would be visible in L2. Flag any pattern where the L3 text describes the group rather than individual behavioral modes.

---

## Step 6: Spectrum Mapping

Map each behavioral pattern from Step 5 onto the four frog spectrums. The goal is to see whether patterns cluster into coherent positions across the four dimensions.

**The four spectrums:**

| Spectrum | Low end | High end |
|---|---|---|
| Utility | Functional / logical / product-focused | Emotional / experience-seeking |
| Swagger | Leader / confident / self-directed | Follower / indecisive / guidance-seeking |
| Spontaneity | Routine / predictable / planned | Spur-of-the-moment / chaotic |
| Motivation | Self-motivated / solo | Validation-seeking / social-sharing |

For each behavioral pattern, place it on each spectrum:

```
Pattern: [Name]
Utility: [Low-F / Moderate-F / Center / Moderate-E / High-E] — [one clause evidence]
Swagger: [High-L / Moderate-L / Center / Moderate-F / High-F] — [one clause evidence]
Spontaneity: [High-R / Moderate-R / Center / Moderate-S / High-S] — [one clause evidence]
Motivation: [High-Self / Moderate-Self / Center / Moderate-Val / High-Val] — [one clause evidence]
```

**Custom dimensions:** If the four spectrums do not capture a dimension of variation that recurs strongly in the data (e.g., "trust in institution vs. trust in community" for a healthcare project), add it. Document the addition and the rationale. Note which frog spectrum it replaces or supplements.

After mapping all patterns: look for natural clusters — groups of patterns that occupy similar positions across the four spectrums. These clusters are the proto-archetypes that the recursive derivation step will formalize.

---

## Step 7: Recursive Archetype Derivation

Apply LeCompte's 7-step recursive loop to each cluster from Step 6. Run the loop for each candidate archetype. Expect to iterate — the loop may split, merge, or collapse clusters before a stable set of archetypes is reached.

**The loop:**

**Step 7.1 — Identify an initial cluster**
Name the cluster based on its dominant behavioral mode. Use a working name — it will be refined. State which behavioral patterns from Step 5 belong to this cluster and why.

**Step 7.2 — Search L2 themes for all matching instances**
Return to the full L2 dataset and look for all instances of this behavioral mode — including instances in participants who were not initially assigned to this cluster. Are there participants whose behavior partially matches but was placed elsewhere?

**Step 7.3 — Examine for behavioral coherence**
Does this cluster hang together? Do the behavioral patterns within it logically cohere — do they arise from the same underlying motivation or constraint? Or does the cluster contain behavioral patterns that are superficially similar but arise from different motivations?

**Step 7.4 — Refine the cluster definition**
Based on Steps 7.2 and 7.3, tighten or expand the cluster definition. Add participants whose behavior now clearly fits; remove patterns that don't cohere. Update the working name if the behavioral mode has become clearer.

**Step 7.5 — Return to the full dataset and re-examine**
With the refined cluster definition, scan all L2 themes again. Have you missed any participants who exhibit this behavioral mode? Are there participants you assigned to this cluster who actually belong elsewhere?

**Step 7.6 — Identify negative cases**
Name the participants whose behavior does not fit this cluster — even if they share surface-level characteristics with cluster members. A negative case is not a failure: it is either:
- The seed of a new cluster (if the behavior is coherent and recurring)
- Evidence that the cluster definition needs further refinement (if the behavior is idiosyncratic)
- A genuine hybrid (if the participant inhabits multiple archetypes — note this in the fluidity check)

**Step 7.7 — Revise or stabilize**
Based on the negative cases: split (if negative cases form a coherent group of their own), merge (if two clusters have nearly identical behavioral profiles), collapse (if a cluster cannot be supported with at least 2 independent participant instances), or stabilize (if the cluster is coherent and the negative cases are accounted for).

**Do not force participants into archetypes.** Under-fitting is preferable to fabrication. If a participant's behavior doesn't cohere with any archetype, note them as unassigned — this is honest data.

**Run the loop for each cluster.** The set is stable when: each archetype has a coherent behavioral definition; all participants are assigned or explicitly unassigned; negative cases are accounted for; no two archetypes share the same behavioral profile.

---

## Step 8: Archetype Naming

Name last: finalize names only after the clusters, profiles and evidence are written. Select the naming mode for this set and apply it consistently across all archetypes. SKILL.md Core Concept 6 defines two modes:

| Mode | When to use | Examples |
|---|---|---|
| **Behavioral action labels** | The default — direct, names what the person does; maximizes cross-functional adoption | The Planner, The Price Checker, The Repeat Buyer |
| **Plain descriptors** | When what people want is what separates the archetypes | Buyers Who Want Advice, Diners Who Come for the Occasion |

**Select one mode for the full set.** Mixed modes within a set are a flagged defect in the audit.

**For each cluster, draft 2–3 candidate names in the selected mode.** Keep the one that:
- Passes the first read: a reader with no project context can say what kind of person this is from the name alone, without the profile
- Uses literal words: no figures of speech, wordplay or alliteration, coined terms, or terms from the theory or the synthesis's working vocabulary
- Is distinct from other names in this set
- Is non-demographic (no age ranges, income brackets, gender, or lifestyle labels as the primary identifier)

Profiles and all text under the name follow `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body.

**Document the chosen naming mode and rationale** — record it in the master archetypes document Data Grounding section so the audit can verify consistency.

---

## Step 9: Fluidity Check

For each archetype, assess whether it is journey-specific or person-level — and where developmental context creates durable shifts.

For each archetype, answer:

**Journey-specificity:**
- In which purchase contexts (journey domains) was this behavioral mode observed?
- Is there evidence that the same participant exhibits this behavior in multiple contexts (person-level stability), or only in one context (journey-specific)?
- Person-level claims require cross-domain corroboration — name it if present.

**Developmental context:**
- Does phase of life appear to shift this archetype durably across many purchase moments, not just one?
- Example: A participant who is an Explorer when returning to cycling after a long gap may settle into Doer behaviors once re-established. This shift is identity-adjacent — it changes who they are right now, not just their situational mode.
- Note any phase-of-life triggers observed in the data, even if they cannot be fully characterized.

**Adoption-curve lens (Chipchase):**
- Which archetypes map to early adopters (highest openness to new offerings, new channels, new experiences)?
- Which map to mainstream adopters?
- The early-adopter archetype is the natural beachhead for any new offering — flag it.

**Fluidity matrix (preliminary):**
Sketch which archetypes can the same person inhabit and under what conditions. This will be formalized in the master document.

---

## Step 10: Key Indicator Derivation

For each archetype, derive 3–5 Key Indicators from the **behavioral specifics extracted in Step 5** — not from the archetype's psychological profile or spectrum positions. KIs are the field-testable layer: the observable behavioral signals that make an archetype recognizable in context without a survey instrument.

**Derivation discipline — apply to each KI candidate:**

1. **Observable?** Could a researcher in a store, a designer watching a session recording, or an analyst reviewing data apply this signal without knowing what the participant was thinking or feeling? If interpretation is required, it is a behavioral inference, not a KI. Rewrite it as something detectable.
2. **Specific?** Does it name a concrete behavior (reaches for physical analogies when asked why they're loyal; photographs products before purchasing; asks for the mechanic by name) rather than a characterization (deeply loyal; aesthetically driven; community-oriented)?
3. **Grounded?** Does it trace to at least one specific behavioral account from the Step 5 extraction? If it sounds right but has no direct grounding, flag it as a hypothesis KI — label `[HYPOTHESIS]` until validated.

**Format — short, quoted-signal style:**
- ✓ "Reaches for physical or somatic analogies when asked why they're loyal — 'shin splints,' 'flying'"
- ✗ "Has an inarticulate but deep brand loyalty" — characterization, not a detectable signal

**Output:** 3–5 KIs per archetype, written in the quoted-signal format. An archetype with no KIs has not been operationalized — do not advance to Step 11 with empty KI lists. If the behavioral specifics in Step 5 are insufficient to derive 3 observable KIs, note the gap and flag it in the Confidence section of the archetype card.

---

## Step 11: Design Implications

For each archetype, derive design implications using frog's tailoring table structure.

**Design for** (3–5 principles):
- Each principle names a design move derived from the archetype's behavioral profile
- Grounded in evidence — trace each principle to a behavioral pattern from Step 5
- Format: "[Design principle] — [behavioral rationale from evidence]"

**Friction** (what breaks the experience):
- The conditions that produce disengagement, frustration, or abandonment for this archetype
- Trace each to behavioral evidence — frustration that was described but not acted on is Significant; frustration that produced a workaround or exit is Extreme

**Leading edge signal** (Chipchase threshold mapping):
- What the edge-behavior participants in this cluster foreshadow
- The most extreme members of the cluster are the leading indicator of where the mainstream archetype is heading
- State the behavior and its design implication

---

## Step 12: L3 Coherence Check

If L3 insights are available, map the derived archetypes against the L3 insight set.

For each L3 insight, determine:
- **Confirmatory** — maps cleanly to one archetype; the insight's behavioral content is explained by the archetype profile
- **Cross-cutting** — relevant to multiple archetypes; sits above the archetype level
- **Orphaned** — does not map to any archetype

**Orphaned insights warrant investigation:**
- Possible missed archetype: does the insight describe a coherent behavioral mode not captured in the current set?
- Insight above the archetype level: does it describe an organizational or category-level pattern that applies across archetypes?
- Insight that was lost in L2→L3 abstraction: was behavioral variation present in the L2 data that the L3 insight smoothed over?

Do not revise archetypes based on L3 alone — but do note where the L3 set and the archetype set diverge. The master document's coherence map surfaces these gaps for the L5 synthesis.

---

## Step 13: Write Output Files

**Individual archetype card files** — invoke `WriteArchetype` for each derived archetype. `WriteArchetype` covers the evidence-first writing order, grounding check, KI observability test, and per-section quality checks. Call it once per archetype; pass the cluster definition, participant list, Evidence Trail entries, and confidence ceiling from Steps 5–4.

If called in a session without `WriteArchetype` available, follow the writing order directly: (1) working name, (2) Evidence Trail, (3) spectrum positions, (4) context triggers, (5) finalize name + one-line profile, (6) Key Indicators, (7) Design Implications, (8) Journey Domains, (9) Confidence and Status, (10) YAML frontmatter.

- Filename: `ARCH-[NN]_[Short_Name].md`
- Format: YAML frontmatter + six sections per `ArchetypeFormat.md`
- Write to the specified output directory

**Master archetypes document:**
- Filename: `L4_Archetypes_[ProjectName].md`
- Format: YAML frontmatter + data grounding + spectrum reference + archetype summaries + summary table + fluidity matrix + L3 coherence map
- Write to the same output directory

---

## Step 14: Confirm Completion

Report:
```
L4 Archetype synthesis complete — [Project Name]

Status: [Full archetypes | Proto-archetypes]
Confidence ceiling: <High | Medium | Medium-Low | Low — set by: data gate / data quality flag>
Research grade: [Grade]
Participants: [N]

[N] archetypes written to [output directory]:
- ARCH-01: [Name] — [One-line profile] — Confidence: [H/M/ML/L]
- ARCH-02: [Name] — [One-line profile] — Confidence: [H/M/ML/L]
...

Unassigned participants: <N — note behavioral notes on each, for potential future archetype>

Fluidity flags:
- [ARCH-NN] and [ARCH-NN] can be inhabited by the same person under [condition]
- Beachhead archetype: [ARCH-NN] — early adopter signal in [context]

Developmental context flags:
- <Any phase-of-life shifts observed — note archetype and condition>

L3 coherence:
- [N] insights confirmatory
- [N] insights cross-cutting
- [N] insights orphaned — [list with note]

Before advancing — a fresh agent runs AuditArchetypeSet (Final Step below) and must clear its "Cleared for L5" gate.
Do not advance to L5 with unresolved audit flags.

felt_flags: <none-issued | "<report> — settles when <condition>"; semicolon-separate multiple reports on one line>

Next step: L5 Framework (optional archetype integration)
```

---

## Quality Checks Before Writing Files

**For each archetype:**
- [ ] Name is behavioral (not demographic — no age ranges, income brackets, or lifestyle labels)
- [ ] Name uses the same naming mode as all other archetypes in the set (mixed modes are a defect)
- [ ] Name passes the first read (understood from the name alone; no figures of speech or coined terms)
- [ ] Profile and card text follow Plain Writing in the Body (`../l3-insight-synthesis/InsightFormat.md`)
- [ ] One-line profile uses verb-forward language
- [ ] 3–5 Key Indicators present; each passes the observability test (detectable by a researcher or analyst without interpretation of the participant's internal state)
- [ ] Spectrum positions are evidenced — each position has a one-clause behavioral note
- [ ] Evidence trail cites L2 themes (not L3 summaries) with LeCompte emergence type
- [ ] Negative cases are named, not silently excluded
- [ ] Design implications (design for, friction, leading edge) trace to behavioral evidence
- [ ] Context triggers distinguish situational from developmental
- [ ] Fluidity note declares journey-specific or person-level status with evidence
- [ ] Confidence level is assigned and rationale is stated
- [ ] If Proto: upgrade path is stated specifically

**For the archetype set:**
- [ ] Naming mode documented in the master document (Step 8)
- [ ] 5–6 archetypes is the cross-client norm; above 6 requires explicit justification naming the behavioral variation that cannot be collapsed (see Volume Calibration in ArchetypeFormat.md); above 8 is over-fit in virtually all cases
- [ ] No two archetypes share the same behavioral profile (if they do, merge or explain the distinction)
- [ ] Fluidity matrix is populated
- [ ] All participants are assigned or explicitly unassigned
- [ ] L3 coherence map is complete (if L3 available)
- [ ] Master document data grounding section is accurate

---

## Final Step: Audit — REQUIRED

After writing all archetype files, dispatch a fresh agent to run `AuditArchetypeSet` on the completed set (procedure: `../ladder-core/ladder-map.md` → Running a level audit; canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`). The workflow is not finished until `L4_Archetype_Set_Audit_[ProjectName].md` is saved beside the set and its "Cleared for L5" gate is cleared, or the user has chosen to advance with open flags and that choice is recorded in the report. Do not advance to L5 or share with stakeholders before then. The audit catches data gate silent upgrades, fabricated archetypes, demographic collapse, citation gaps, fluidity mislabeling, and volume problems that the quality checklist above does not surface.
