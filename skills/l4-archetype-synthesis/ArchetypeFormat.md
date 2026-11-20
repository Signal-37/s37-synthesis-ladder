# L4 Archetype Format Reference

The exact output format for individual archetype card files and the master archetypes document — including the card schema, confidence definitions, context trigger types, spectrum position notation, and volume calibration.

**Contents** (a reader mid-task may only see this far — jump to the section named):
- Individual Archetype Card File — the per-archetype template (behavioral profile, key indicators, evidence trail, design implications, journey domains, confidence and status)
- Master Archetypes Document — the collected form (data grounding, behavioral spectrums, L3 insight coherence map)
- File Naming Conventions
- **Confidence Level Definitions** — what each status means
- Volume Calibration — how many archetypes to expect

---

## Individual Archetype Card File

Each archetype gets its own file. YAML frontmatter + five structured sections.

```
---
project: [Project Name]
archetype_id: ARCH-[NN]
synthesis_level: L4
archetype_status: [Full | Proto]
confidence: [High | Medium | Medium-Low | Low]
confidence_ceiling: <if capped by data quality flag — state: "Attitudinal-only instrument: ceiling Medium-Low" | omit if not applicable>
source_themes: [L2-T-NN, L2-T-NN, ...]
source_insights: [L3-NN, L3-NN, ...] (optional — populated during L3 coherence check)
journey_domains: [list the purchase contexts in which this archetype is active]
synthesis_date: [YYYY-MM-DD]
domain: [brand/design | product/UX | organizational | policy/advocacy | other]   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation
related_opportunity_areas: [OA-NN, ...] (optional — populate when l4-opportunity-area-synthesis has run; omit if not)
related_value_propositions: [VP-NN, ...] (optional — populate when l4-value-proposition-synthesis has run; omit if not)
---

# ARCH-[NN]: [Archetype Name]
> <One-line behavioral profile — the defining behavioral mode in one sentence. Verb-forward. No adjectives as the primary descriptor.>

---

## Behavioral Profile

### Spectrum positions
<Position on each of the four frog spectrums, or custom dimensions if substituted. Use a short phrase at the relevant pole — do not just name the pole, name where this archetype sits and why.>

| Spectrum | Position | Behavioral evidence |
|---|---|---|
| Utility (Functional ↔ Emotional) | <e.g., "Moderate-Functional — outcome-driven but values the quality of the experience"> | [One clause from L2 evidence] |
| Swagger (Leader ↔ Follower) | <e.g., "Leader — confident about desired outcome before beginning"> | [One clause from L2 evidence] |
| Spontaneity (Routine ↔ Spontaneous) | <e.g., "Planned — researches ahead, but open to deviation when better option appears"> | [One clause from L2 evidence] |
| Motivation (Self ↔ Validation) | <e.g., "Self-motivated — rarely seeks peer approval before deciding"> | [One clause from L2 evidence] |

[If custom dimensions were added, extend the table. Note which frog spectrum each custom dimension replaces or supplements.]

### Context triggers
<The conditions — situational or developmental — that activate or shift this archetype. Be specific.>

**Situational triggers** (moment-level — shifts this archetype for a single occasion):
- <e.g., "Time pressure collapses Explorer behavior into Striver behavior — when in a hurry, this archetype abandons research and accepts the first adequate option">
- [e.g., "High-novelty purchase (first time in category) activates full Explorer mode; repeat purchase activates Doer mode"]

**Developmental triggers** (phase-of-life — shifts this archetype durably across many purchase moments, not just one):
- <e.g., "Return to sport after extended gap (5+ years) — activates Explorer mode; re-entry riders treat the category as new even when they have prior experience">
- <e.g., "First major performance purchase — activates heightened research intensity and peer consultation that recedes once category confidence is established">
- <Note: Phase of life is not a demographic proxy. Age does not predict it; life events do.>

---

## Key Indicators

<3–5 observable behavioral signals that make this archetype recognizable in context without a survey instrument. KIs are field-testable: a researcher in a store, a designer watching session video, or an analyst reading session data should be able to apply them without interpretation. They are not behavioral descriptions — they are observable signals. Standard format: signal in quotes, brief contextual note if needed.>

- "[Signal]" — [contextual note if not self-evident]
- "[Signal]"
- "[Signal]"

---

## Evidence Trail

<Cited L2 themes and any L1 participant moments that ground this archetype. Each item names the L2 theme, the LeCompte emergence type, and a one-clause behavioral note. Do not cite synthesis conclusions — cite behaviors.>

| Source | Emergence type | Behavioral note |
|---|---|---|
| L2-T-NN — [Theme title] | [Frequency / Co-occurrence / Corroboration / etc.] | [What the participants did or said that supports this archetype] |
| L2-T-NN — [Theme title] | [...] | [...] |

**Emergence type key (LeCompte):** Declaration · Frequency · Omission · Similarity · Co-occurrence · Corroboration/Triangulation · Sequence · A priori hypothesizing

**Negative cases:** [Name any participants whose behavior does not fit this archetype and note whether they represent a separate archetype, a hybrid, or were forced by the derivation process. Under-fitting is preferable to fabrication.]

---

## Design Implications

### Design for
[3–5 design principles derived from this archetype's behavioral profile. Each principle names the design move and its behavioral rationale. Format: "**[Principle]** — [why this archetype requires it]."]

1. **[Principle]** — [Rationale from behavioral evidence]
2. **[Principle]** — [Rationale]
3. **[Principle]** — [Rationale]

### Friction
<What breaks the experience for this archetype — the conditions that produce disengagement, frustration, or abandonment. Each item traces to behavioral evidence.>

- <e.g., "Being rushed before research is complete — this archetype self-selects out of time-pressured environments">
- <e.g., "Opaque pricing — the cost-calculation behavior that defines the Spotter archetype breaks down when pricing requires inquiry">

### Leading edge signal
<What the outliers within this archetype cluster foreshadow — Chipchase's Range of Distribution applied. The most extreme members of this cluster are the leading indicators of where the mainstream archetype is heading. Name the behavior and its implication.>

<e.g., "15% of this cluster are already evaluating alternative mobility solutions alongside traditional purchase — the archetype's early adopters are rehearsing a future in which this category is not the primary vehicle for the underlying job.">

---

## Journey Domains

<Which purchase contexts activate this archetype — and whether the archetype is journey-specific or person-level.>

**Confirmed active in:** [List domains where this archetype was observed: e.g., Frame selection / Component upgrade / Apparel / Race entry]

**Fluidity note:** <Is this archetype journey-specific or does evidence support person-level stability? Person-level claims require cross-domain corroboration — state it if present. If journey-specific only, say so explicitly.>

---

## Confidence and Status

**Status:** [Full | Proto]

**Confidence:** [High | Medium | Medium-Low | Low]

**Rationale:** [One paragraph. State why this confidence level was assigned. Reference the data gate outcome, the research grade, the participant count, and the data quality flag if applicable.]

[If Proto:]
**Upgrade path:** <What additional data would move this to Full archetype status — state the specific gap: more participants, foundational fieldwork, instrument redesign to capture contextual variables, etc.>

[If confidence ceiling was set by data quality flag:]
**Ceiling note:** <State the flag and what it means: e.g., "Quantitative instrument was attitudinal-only — behavioral cluster may reflect attitude rather than behavioral mode. Ceiling: Medium-Low until contextual variable data is available.">
```

---

## Master Archetypes Document

```
---
project: [Project Name]
synthesis_level: L4
document_type: Archetypes
source: [L2_Themes_[ProjectName].md — N themes | L3_Insights_[ProjectName].md — N insights (validation)]
archetype_status: <Full | Proto | Mixed — specify>
synthesis_date: [YYYY-MM-DD]
analyst: [Name or system]
felt_flags: [none-issued | "<report> — settles when <condition>"; semicolon-separate multiple]
domain: [brand/design | product/UX | organizational | policy/advocacy | other]
---

# L4 Archetypes — [Project Name]

---

## How to read this document

L4 Archetypes are named behavioral modes — the recurring patterns of how people approach a category, purchase context, or experience. They emerge from behavioral variation across research participants and are positioned on behavioral spectrums, not demographic categories. The same person can inhabit different archetypes depending on context and phase of life.

<Brief statement: N archetypes (or proto-archetypes) derived from N L2 themes across N participants. Research grade. Archetype status.>

<If proto-archetypes: note that the set is provisional and name the upgrade path for the full set.>

---

## Data Grounding

**Research grade:** [Foundational | Foundational + Descriptive | Descriptive | Evaluative | Mixed]
**Participant count:** [N]
**Session depth:** [Multi-session | Single-session]
**L2 themes available:** <Yes | No — L3 fallback used>
**Quantitative data quality flag:** [Strong | Adequate | Attitudinal-only | N/A]
**Archetype status:** [Full | Proto]
**Confidence ceiling:** [High | Medium | Medium-Low | set by: data quality flag / participant threshold / session depth]

---

## The Behavioral Spectrums

[The four dimensions used to position archetypes. State whether custom dimensions were added or substituted.]

| Spectrum | Low end | High end |
|---|---|---|
| Utility | Functional / logical / product-focused | Emotional / experience-seeking |
| Swagger | Leader / confident / self-directed | Follower / indecisive / guidance-seeking |
| Spontaneity | Routine / predictable / planned | Spur-of-the-moment / chaotic |
| Motivation | Self-motivated / solo | Validation-seeking / social-sharing |

[If custom dimensions were added, add rows and note the rationale.]

---

## ARCH-01: [Name]
> [One-line behavioral profile]

<Spectrum position summary — one sentence per spectrum.>

**Context triggers:** <Situational: ... / Developmental: ...>
**Key Indicators:** <2–3 most distinctive KIs — abbreviated from the card>
**Design for:** <3 most important principles — abbreviated from the card>
**Friction:** [Key friction point]
**Leading edge signal:** [One sentence]
**Confidence:** [High / Medium / Medium-Low / Low] — <Status: Full / Proto>

---

## ARCH-02: [Name]
...

---

## Summary: The [N] Archetypes

| ID | Name | One-line profile | Spectrum signature | Status | Confidence |
|----|------|------------------|--------------------|--------|------------|
| ARCH-01 | [Name] | [Profile] | [e.g., "Planned + Self-motivated + Moderate-Functional"] | [Full/Proto] | [High/Med/Low] |
...

### Reading the archetypes

<Narrative comparing the archetypes. Which archetypes are most likely to be the target population for this project? Which are the beachhead archetype for a new offering? Which archetypes could the same person inhabit at different moments? Are any archetypes in tension — i.e., would designing for one create friction for another? 3–5 sentences. This is analysis, not a recommendation — recommendations belong in L5.>

### Fluidity matrix

<For each pair of archetypes, note whether the same person can plausibly inhabit both — and under what conditions. This is the operational version of the fluidity principle.>

| — | ARCH-01 | ARCH-02 | ARCH-03 |
|---|---------|---------|---------|
| **ARCH-01** | — | [Same person? What triggers the shift?] | [...] |
| **ARCH-02** | | — | [...] |
| **ARCH-03** | | | — |

---

## L3 Insight Coherence Map

<For each L3 insight, note which archetype(s) it maps to and how. Orphaned insights — those that don't map to any archetype — are noted separately.>

| L3 Insight | Archetype(s) | Mapping type |
|---|---|---|
| L3-NN — [Title] | ARCH-NN | [Confirmatory / Cross-cutting / Orphaned] |
...

**Orphaned insights:** <List any L3 insights not mapped to any archetype, with a note on why — e.g., "describes organizational context rather than customer behavior," "addresses a job above the archetype level.">

---

*[Project] L4 Archetypes*
*Synthesized from [N] L2 themes / [N] L3 insights (validation) / [N] participants*
*[Date]*
*Next synthesis level: L5 Framework (optional archetype integration)*
```

---

## File Naming Conventions

**Individual archetype card files:**
```
ARCH-[NN]_[Short_Name].md
```
Examples: `ARCH-01_The_Researcher.md`, `ARCH-02_The_Repeat_Buyer.md`, `ARCH-03_The_Price_Checker.md`

**Master archetypes document:**
```
L4_Archetypes_[ProjectName].md
```

**Archetype ID numbering:**
- Sequential from ARCH-01
- If two archetypes are hypothesized variants of the same behavioral mode with insufficient data to distinguish them, number ARCH-01A, ARCH-01B
- If archetypes are genuinely distinct behavioral modes, number sequentially

---

## Confidence Level Definitions

The archetype-vs-proto status these confidence levels rest on is gated by `../ladder-core/config/synthesis-gates.yaml` → `gates.archetype_evidence_floor` (full row set: SynthesizeArchetypes Step 4).

| Level | Meaning | Typical conditions |
|---|---|---|
| **High** | Strong behavioral evidence; multiple participants; cross-context corroboration; Foundational research grade; quantitative instrument captured contextual variables | ≥12 participants, multi-session, Strong data quality flag |
| **Medium** | Good behavioral evidence; pattern is coherent; some edge cases unresolved | Foundational research, 8–12 participants, or Adequate data quality flag |
| **Medium-Low** | Pattern is plausible but evidence is thin or instrument was attitudinal-only | Attitudinal-only data quality flag, or Descriptive-dominant research grade |
| **Low** | Provisional only; significant data gaps; declared Proto-archetype | <8 participants, single-session, or Evaluative-dominant research grade |

**Confidence ceiling rules:**
- Attitudinal-only quantitative instrument → ceiling: Medium-Low
- Adequate instrument → ceiling: Medium
- Strong instrument → ceiling: High (if other conditions met)
- Proto-archetype status → ceiling: Low regardless of other conditions

---

## Volume Calibration

Archetypes compress behavioral variation into a manageable typology. Too few archetypes flatten real variation; too many produce a taxonomy that is analytically useless for design.

| Participant count | Expected archetype range | Notes |
|---|---|---|
| 6–10 | 2–3 (Proto status likely) | Thin evidence; fluidity matrix provisional |
| 12–15 | 3–4 | Sufficient for Full archetype if Foundational research |
| 15–25 | 3–5 | Full spectrum of behavioral variation typically captured |
| 25+ with quant cluster data | 4–6 | Named and sized; quantitative sizing possible |

*These ranges are normative calibration, not derived targets — the audit checks are the principle, not the count. Never split, merge, or invent an item to land inside the range.*


**Under the floor:** Fewer than 2 archetypes means behavioral variation was not surfaced or was flattened in the L2 synthesis. Check whether the L2 themes preserved individual-level variation or pre-averaged across participants.

**Over the ceiling:** More than 6 archetypes are typically over-fit — splitting real variation into distinctions too fine to design for. Compress: ask whether two adjacent archetypes differ enough in design implications to warrant separate names. If the "design for" section of two archetypes is nearly identical, they should be merged.

**The segmentation case:** **8 is the valid upper limit** when domain granularity genuinely requires it — e.g., grocery shopping behavior spanning distinct preparation, planning, and impulse modes, or workplace typologies spanning individual contributors through orchestrators. Above 8 is over-fit in virtually all cases. Justification required: name the specific behavioral variation that cannot be collapsed without losing design implications.
