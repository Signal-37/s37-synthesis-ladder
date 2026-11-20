# L4 Value Proposition Format Reference

The exact output format for L4 Value Proposition files and the master VP document, including the Customer Profile structure, Value Map structure, fit assessment format, job-spec guardrail, and volume calibration.

**Domain note:** Throughout this skill, **"customer" means the beneficiary the offering serves** — read it per the project's domain in `DomainScope.md`. For brand/design and product/UX that is the customer or user; for organizational it is the employee, team, or internal stakeholder; for policy/advocacy it is the constituent, citizen, or community member. The Customer Profile is the profile of that beneficiary. The jobs/pains/gains structure is identical across domains; only the population it describes — and the "Lucrative"/value register that signals the progress is worth enabling — changes.

**Contents** (a reader mid-task may only see this far — jump to the section named):
- Individual Value Proposition File — the per-VP template (customer profile, value map, fit assessment, job-spec check, source insights)
- Master Value Propositions Document — the collected form
- File Naming Conventions
- **The Job Statement Test** — the gate on every VP
- Gain Type Definitions · Pain Severity Definitions
- Volume Calibration — how many VP candidates to expect
- Theoretical Basis

---

## Individual Value Proposition File

Each VP candidate gets its own file. YAML frontmatter + four structured sections.

```
---
project: [Project Name]
value_proposition_id: VP-[NN]
synthesis_level: L4
source_insights: [L3-NN, L3-NN, ...]
primary_job: <Job statement — one clause, verbs and nouns, no adjectives>
governs: <Offering territory — what the organization could provide; see the domain's entry in DomainScope.md>
synthesis_date: [YYYY-MM-DD]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L3 Insights>   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation
---

# VP-[NN]: <Value proposition title — a short name for the offering hypothesis, written last, in literal words a reader with no project context understands on first read: no figures of speech, coined terms, or terms from the theory or the synthesis's working vocabulary. All text in the file follows `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body.>

## Customer Profile

### Primary job
<The progress the customer is trying to make. Full narrative: name the functional dimension (what they need to get done), the emotional dimension (how they want to feel), and the social dimension (how they want to be seen). Name the specific circumstance in which the job arises — not "when they buy a bike" but the moment of need with its specific pressure and context. 3–5 sentences.>

### Pains
[The obstacles, undesirable outcomes, and risks that make progress difficult. Ranked by severity. Each item: "[EXTREME / SIGNIFICANT / MODERATE] — [Pain statement]." 3–7 items. Pain types:
- Undesirable outcomes: what goes wrong, costs too much, or requires too much effort
- Obstacles: what prevents progress from starting
- Risks: what might go wrong, social or functional]

### Gains
[The outcomes and benefits the customer hopes for. Typed by category. Each item: "[REQUIRED / EXPECTED / DESIRED / UNEXPECTED] — [Gain statement]." 3–7 items. Types:
- Required: minimum expected — without this, no solution is considered
- Expected: assumed but not demanding — most solutions provide this
- Desired: wanted but not expected — creates positive surprise if provided
- Unexpected: beyond what the customer thought to ask for — highest differentiation territory]

---

## Value Map

### Products & Services
<What we would offer — described by what it does for the customer, not what it is as a product. Each item names the offering type and the job dimension it addresses. 2–5 items. Test: could a manager from a different industry understand what progress this enables? If the description only makes sense to someone who knows the category, it's a product spec.>

### Pain Relievers
[How the offering addresses the ranked pains. Match to the Pains section — extreme pains first. Each item: "Addresses [pain statement] by [how the offering creates relief]." Acknowledge which pains the offering does NOT address — honest fit assessment requires named gaps.]

### Gain Creators
[How the offering creates the typed gains. Prioritize Desired and Unexpected gains — Required and Expected gains are hygiene factors, not differentiation. Each item: "Creates [gain] by [how the offering delivers it]." 3–5 items.]

---

## Fit Assessment

**Fit verdict:** [Strong Fit / Partial Fit / Weak Fit]

[One paragraph. Name which of the most important jobs/pains/gains this VP addresses and which it does not. "Strong Fit" means the VP addresses the primary job AND at least two of the top three pains AND creates at least one Desired or Unexpected gain. "Partial Fit" means the VP addresses the primary job but misses important pains or only creates Required gains. "Weak Fit" means the VP doesn't address the primary job or only addresses low-severity pains.]

**Addressed (most important):**
- [Job / Pain / Gain] — addressed by [VP element]
- [Job / Pain / Gain] — addressed by [VP element]

**Not addressed:**
- [Job / Pain / Gain] — [why this gap exists and whether it's intentional or a design opportunity]

---

## Job-Spec Check

**Verdict:** [Passes / Needs revision]

[One to three sentences. Does the Value Map describe what the offering *does for the customer* or what the product *is*? Apply the three-industry test: would a product manager from three different industries be able to design something from this description? If any element in Products & Services or Pain Relievers names a specific feature, format, or technology, flag it and rewrite at the job level. Name any flagged elements explicitly.]

---

## Source Insights
- **[L3-NN]** — [Insight title]
- **[L3-NN]** — [Insight title]
[List all contributing L3 insights]
```

---

## Master Value Propositions Document

```
---
project: [Project Name]
synthesis_level: L4
document_type: Value Propositions
source: [L3_Insights_[ProjectName].md — N insights]
synthesis_date: [YYYY-MM-DD]
analyst: [Name or system]
felt_flags: [none-issued | "<report> — settles when <condition>"; semicolon-separate multiple]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L3 Insights>
---

# L4 Value Propositions — [Project Name]

---

## How to read this document

L4 Value Propositions are offering hypotheses — the first structural answer to "given what we know about our customers' jobs, what could we offer?" They emerge from L3 Insights via the Customer Profile and answer the question: what would we build, and for what job?

Each VP candidate includes a Customer Profile (the research-derived account of the job, pains, and gains) and a Value Map (the initial offering hypothesis that responds to it). The fit assessment names where the VP is strong and where it has gaps. These are not product concepts — they are job-level hypotheses at the right level of abstraction to inform concept direction.

[Brief statement of how many L3 insights produced how many VP candidates, and the primary jobs driving the synthesis.]

---

## Customer Profile — [Project Name]

<The unified Customer Profile for this project — the shared account of the customer's job. This section appears once in the master document and applies to all VP candidates. Candidates differ in their Value Maps, not in their Customer Profiles.>

### Primary job
<Full narrative — see format in individual VP file.>

### Pains (ranked)
[Ranked from extreme to moderate.]

### Gains (typed)
[Typed from Required to Unexpected.]

---

## VP-01: [Title]

### Value Map

#### Products & Services
[Items.]

#### Pain Relievers
[Items matched to pains.]

#### Gain Creators
[Items.]

### Fit Assessment
**Verdict:** [Strong / Partial / Weak]
[Assessment paragraph.]
**Addressed:** [Items.]
**Not addressed:** [Items.]

### Job-Spec Check
**Verdict:** [Passes / Needs revision]
[Check paragraph.]

### Source insights
[List.]

---

## VP-02: [Title]
...

---

## Summary: The [N] VP candidates

| ID | Title | Primary job addressed | Fit | Differentiating gain |
|----|----|----|----|---|
| VP-01 | [Title] | <Job — one clause> | [Strong/Partial/Weak] | [Which Desired/Unexpected gain] |
...

### Reading the VP candidates

<Narrative comparing the candidates. Which addresses the primary job most directly? Which creates the most differentiated gains? Which leaves the most important pains unaddressed? 3–5 sentences. This is NOT a recommendation — it is an analysis of the tradeoffs. The recommendation belongs in L5.>

---

*[Project] L4 Value Propositions*
*Synthesized from [N] L3 Insights / [N] L2 Themes / [N] L1 Findings / [N] interviews*
*[Date]*
*Next synthesis level: L5 Framework (optional VP integration)*
```

---

## File Naming Conventions

**Individual VP files:**
```
VP-[NN]_[Short_Descriptive_Name].md
```
Examples: `VP-01_Athlete_Identity_Platform.md`, `VP-02_Specialist_Recognition_Program.md`

**Master VP document:**
```
L4_Value_Propositions_[ProjectName].md
```

**VP ID numbering:**
- Sequential from VP-01
- If multiple candidate VPs address the same job from different angles, number them VP-01A, VP-01B — they share a Customer Profile
- If VPs address genuinely distinct jobs (i.e., distinct job clusters from the L3 set), number sequentially: VP-01, VP-02

---

## The Job Statement Test

> **Reserved claim verbs:** *validated / confirmed / passed / from the customer's side* are reserved for externally-tested claims — research-derived claims use *attested / evidenced / saturated / hypothesis*. Canonical: `../ladder-core/ladder-map.md` → Reserved Claim Verbs.

A valid job statement for the Customer Profile primary job passes three checks:

**1. Verb-noun form:** The job is expressed in verbs and nouns, never adjectives or adverbs. "Feel like a real cyclist" is not valid — "feel" followed by an adjective. Rewrite: "Be recognized and recognize myself as a serious cyclist, with evidence that doesn't depend on racing." That's a job.

**2. The multi-industry test:** Could candidates from genuinely different product categories address this job? If the statement only makes sense as a prompt for companies in the same product category, it's a product requirement, not a job. Raise the level of abstraction until candidates from different categories emerge.

**3. The circumstance anchor:** A job without a circumstance is too generic to be useful. "Stay safe" is not a job. "Keep my family safe and informed when something goes wrong on the road at night" is a job — the circumstance (driving at night, something going wrong) is where the design insight lives.

---

## Gain Type Definitions

| Type | Definition | Design implication |
|------|------------|-------------------|
| **Required** | Minimum threshold — without this, no solution is hired | Must-have. Failure to provide = automatic rejection. Not differentiating. |
| **Expected** | Assumed, though not demanded — most solutions provide this | Table stakes. Meeting these doesn't win; failing them loses. |
| **Desired** | Wanted but not expected — customers would value it if offered | Differentiation territory. Providing these creates positive comparison. |
| **Unexpected** | Beyond what the customer thought to ask for | Delight territory. Customers cannot articulate these — they must be inferred from behavioral evidence. The most powerful differentiation, but also the riskiest to design for. |

The Value Map should always target Desired and Unexpected gains as the primary differentiation zone. A VP that only creates Required and Expected gains is not differentiated — it meets the bar but doesn't clear it.

---

## Pain Severity Definitions

| Severity | Definition | Design implication |
|----------|------------|-------------------|
| **Extreme** | The customer would go to significant lengths to avoid this — it is a primary reason for not hiring, or for firing, the current solution | Must be addressed. A VP that ignores extreme pains has weak fit regardless of how well it creates gains. |
| **Significant** | The customer would prefer not to experience this and would welcome a solution that reduces it | High-priority target. Addressing significant pains when competitors don't creates meaningful differentiation. |
| **Moderate** | An annoyance — the customer tolerates it but would appreciate relief | Address if efficient to do so. Not a primary driver of the hire/fire decision. |

---

## Volume Calibration

The L3→L4-VP compression is typically the most aggressive in the ladder. The goal is not to enumerate every nuance of the job — it is to name the primary job clearly enough that offering design can begin.

**Canonical VP volume rule** *(reconciled 2026-08-25; this file is the single source, matching how L2 / L4-AR / L5
keep theirs in their Format files — the config's `candidates:` block declines to make volume a gate because the
range needs a `participant_count` input it does not have).* **2–3 candidates per Customer Profile (up to 4 when the L3 set is large, 9–12 insights); fewer than 2 or more than 5 is a flag.** Before this reconciliation the count was
stated four incompatible ways across this file, `workflows/AuditValuePropositionSet.md`,
`workflows/SynthesizeValuePropositions.md` and `SKILL.md`; all now carry this number and point here.

| L3 insights | Expected Customer Profile | Expected VP candidates |
|-------------|--------------------------|----------------------|
| 4–6 | 1 unified profile (possibly 2 if distinct segments are clear) | 2–3 candidates |
| 6–9 | 1–2 profiles | 2–3 candidates per profile |
| 9–12 | 1–2 profiles | 2–4 candidates per profile |

**Over the ceiling:** If you have more than 5 VP candidates, you are probably writing VPs for features, not jobs. Compress. Ask: do any two candidates address the same primary job from different tactical angles? If yes, the decision between them belongs in concept design, not synthesis.

**Under the floor:** If you have only 1 VP candidate, you may have decided prematurely. Generate at least a second candidate that approaches the same job from a different structural angle — the contrast is analytically useful.

**The segmentation case:** If the L2/L3 synthesis revealed genuinely distinct behavioral patterns that point to different jobs — not just different priorities on the same job — the skill should produce separate Customer Profiles. This is unusual. Most engagements have one dominant job cluster with secondary variations. If distinct segments are genuinely present, name them in the YAML `primary_job` field with the segment identifier: "VP-01 [Early Adopter segment]: ..."

---

## Theoretical Basis

**Christensen's Jobs Theory — the Customer Profile foundation:**
The Customer Profile is not a persona, an archetype, or a demographic profile. It is a structured account of the progress a customer is trying to make, organized by the JTBD construct. The job has three dimensions (functional / emotional / social), and the circumstance is as important as the job itself — because the same customer has entirely different jobs in different circumstances. The Customer Profile built from this skill is grounded in L3 Insights derived from real research data, not hypothesized from demographic assumptions.

**Value Proposition Design — the integration structure:**
This skill pairs the Customer Profile with a Value Map and tests the fit between them, a structure it takes from Osterwalder et al.'s *Value Proposition Design*. It does not reproduce the Value Proposition Canvas, Strategyzer's visual tool, and its output is not a canvas. It uses the book's four gain types (Required/Expected/Desired/Unexpected) and three pain types (undesirable outcomes/obstacles/risks) as the taxonomic structure. The High-Value Jobs screen (Important + Tangible + Unsatisfied + Lucrative — this ladder's composite from the JTBD literature, not a named VPD framework `[model knowledge — verify]`) is applied during the Customer Profile construction step to ensure the right jobs are foregrounded.

**The synthesis ladder — the source discipline:**
The Customer Profile is not filled in from assumptions. Every job, pain, and gain in the Customer Profile must trace to at least one L3 Insight, and through it to specific L1 evidence (participant names, moments, quotes). The synthesis ladder's chain-of-custody principle — nothing at a higher level is valid unless it traces to participant evidence — applies here without exception. Inferred gains (Desired and Unexpected) that cannot be traced to behavioral evidence should be labeled as hypotheses, not research findings.
