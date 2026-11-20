# Design Synthesis Ladder

Index and navigation guide for the synthesis ladder's skill family. Not a skill — a reference document. Describes each level of the synthesis ladder, the skill that covers it, the input/output file chain, and the synthesis act at each transition.

> **Provenance:** The L0–L5 synthesis ladder — this `../ladder-core/ladder-map.md`, the ten rung skills, and associated skills such as `abductive-reasoning` — is **J. Scott King's own work**. The abstraction built here (with Claude Code) is his: the leveling, the L0 Utterance/Raw Data floor, the L4 fan-out (Archetype / Design Principle / Opportunity Area / Value Proposition), the L5 Framework, and the gate/audit apparatus, with level transitions grounded in Kolko's abductive synthesis theory. It was **inspired by** work Scott King and Jon Freach did together at frog Design in November 2015 — a whiteboard, photographed, sketched under the in-studio working title "frog's Sensemaking Process," numbering synthesis as levels 0–5 (Utterance/Raw Data, Observation, Theme, Insight, Need, Principle) with phase groupings (Externalize / Interpret / Model) and a staffing gradient — and it draws on residual practitioner knowledge from the researcher's frog years. **Jon Freach's thinking from that 2015 collaboration is acknowledged as an influence**, not as authorship of this build. **Neither the 2015 whiteboard nor this ladder is part of the frog Design Research Toolkit or frog proprietary methodology** — verified 2026-07-23 against the 2016 toolkit (© 2016 frog, 120pp), which carries the observation → theme → insight synthesis method and the frame/learn/make arc but no leveled ladder, no "Utterance/Raw Data" level, and no 0–5 numbering. (The board's "frog's Sensemaking Process" title reflects the studio context in which it was drawn, not frog authorship of the taxonomy.) The original whiteboard photograph is held by the author, who attests to its provenance, and it is documentarily verified. *(The same whiteboard's L1 "Observation" label is also cited for method content: the two-source finding doctrine.)*
>
> **Practice history (researcher-attested 2026-07-31):** circa 2011–2014 the studio ran the L0-exhaustive path literally — recordings sent to a transcription service, transcripts pulled into a script that printed them onto post-it stock, every utterance posted to a studio board (~8,000 in one example) — and abandoned it for cost: "a tiny bit of fidelity" traded for "a ton of speed, which made the consulting offering more affordable." Standard practice became L1 externalization immediately after the interview (post-its carrying **a quote or an observation from the researcher's own notes**; ten minutes of silent note creation, then ten of conversation, then more notes, then more sharing — the silence-first rule is an anchoring guard). The whiteboard's L0 was recorded as a theoretical stratum, not a practiced step. Consequences carried into this ladder (2026-07-31): a finding has **two peer sources** — participant quotation or research-team observation (the whiteboard's own L1 label); near-free local transcription is the return to L0 the 2014 economics forbade, with the observation channel restored beside it (`l1-findings-extraction/FieldNoteFormat.md` + the L0 skills' delivery-annotation convention, adopted provisionally 2026-07-31).

---

## The Ladder

```
[L0 Raw Transcripts]          [Survey exports → l0-survey-corpus-prep → corpus files]
        ↓  l1-findings-extraction   (Survey Variant for corpus files)
[L1 Findings] — Interpreted statements from individual interviews
        ↓  l2-theme-synthesis
[L2 Themes] — Cross-participant behavioral patterns
        ↓  l3-insight-synthesis
[L3 Insights] — Declarative knowledge claims
        ↓  l4-opportunity-area-synthesis    l4-design-principle-synthesis    l4-value-proposition-synthesis
        ↓  l4-archetype-synthesis (L2 primary · L3 coherence check)
[L4 Opportunity Areas]    [L4 Principles]    [L4 Value Propositions]    [L4 Archetypes]
Designed territories      Standing rules     Customer Profile +          Named behavioral modes
for action                                   offering hypothesis         (when fieldwork warrants)
        └────── pair ──────┘                          ┊ coherence check        ┊ optional lens
        ↓  l5-framework-synthesis  ◄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘
[L5 Framework] — Integrated strategic architecture
```

## L4 composition — CANONICAL

> **This section is the single source of truth for what L4 contains.** Every other skill and note
> carries a one-line summary and a pointer here — never a second copy of the count. (Drift audit
> 2026-07-09: seven files asserted four different counts. Do not add an eighth.)

**L3 ends interpretation; L4 begins acting on it.** L4 is a fan-out, not a step: **four parallel
outputs**, none prerequisite to another, and a project need not produce all four.

| Output | Skill | Answers | Primary input |
|---|---|---|---|
| Opportunity Areas | `l4-opportunity-area-synthesis` | *Where* to act | L3 Insights |
| Design Principles | `l4-design-principle-synthesis` | *How* to act, in every decision | L3 Insights |
| Archetypes | `l4-archetype-synthesis` | *Who* you are designing for | **L2 Themes** (L3 = coherence check) |
| Value Propositions | `l4-value-proposition-synthesis` | *What* to offer | L3 Insights **+ a target customer** |

Archetypes are the input exception: behavioral variation lives closer to the individual, so L2 Themes
are the primary source and L3 Insights serve as a coherence check after archetypes are derived.

**Two conditions attach to L4, and they are different in kind. Do not conflate them.**

**1. Value Propositions — a precondition gate.** A VP is *for someone*. Do not run the skill without
an agreed target customer; synthesized across blurred segments the Customer Profile describes no one.
The target arrives one of three ways: an agreed segmentation already exists → proceed now; or it comes
from L4 Archetypes; or it requires a quantitative segmentation exercise first. Enforcement and the
segment-blur test live at the point of use: `l4-value-proposition-synthesis/CustomerSegmentation.md`.

**2. Archetypes — an output-fidelity condition, not a gate.** The skill runs in every scenario. What
varies is what the data can honestly support: a full **Archetype**, or a **Proto-archetype** when data
is insufficient (too few participants, single-session only, evaluative research dominant). That
distinction is an honest accounting of the data, not a quality judgment on the research. Fidelity is
set upstream, at instrument design: `l4-archetype-synthesis/workflows/ArchetypeReadyGuide.md` either
builds a discussion guide around archetype requirements (Scenario A, dedicated) or audits an existing
guide and generates insertions (Scenario B, additive). Where neither was done, archetypes may still
emerge by luck — or only proto-archetypes will.

**Into L5** — three distinct relationships, resolved 2026-07-09 (the researcher):
- **Opportunity Areas + Design Principles** are the **synthesis inputs**. The Framework pairs them into named domains.
- **Value Propositions** are a **coherence check** on the finished framework, not a pairing input.
- **Archetypes** are an **optional lens the framework *can* be read through** — neither input nor check. The framework
  stands without them; they never gate L5, never generate domains, and never justify re-running L5 per archetype.
  Enforcement: `l5-framework-synthesis/SKILL.md` → *The role of L4 Archetypes at L5*.

---

## Level-by-Level Reference

| Level | Skill | Input | Output | Synthesis act | Compression |
|-------|-------|-------|--------|---------------|-------------|
| **L1** | l1-findings-extraction | Raw transcript (.md) | L1 findings file per interview | Interpretation: transcript → stated findings | None — exhaustive extraction |
| **L2** | l2-theme-synthesis | L1 findings files (all) | L2 theme files + master | Cross-participant pattern finding | 15–35 findings (duration-banded — FindingsFormat.md Volume Calibration) → 1–2 themes per participant |
| **L3** | l3-insight-synthesis | L2 theme files (all) | L3 insight files + master | Abductive pairing: observation + knowledge = insight | ~1.5–2 themes per insight |
| **L4-OA** | l4-opportunity-area-synthesis | L3 insight files (all) | L4 OA files + master | Insight clustering → HMW framing | ~2–3 insights per OA |
| **L4-P** | l4-design-principle-synthesis | L3 insight files (all) | L4 Principle files + master | Insight clustering → standing behavioral rule | ~1.5–2 insights per principle |
| **L4-VP** | l4-value-proposition-synthesis | L3 insight files (all) | L4 VP files + master | Job extraction → Customer Profile → Value Map candidates | Most aggressive — 1 Customer Profile from all insights; 2–3 VP candidates |
| **L4-Arch** | l4-archetype-synthesis | L2 theme files (primary) · L3 insight files (coherence check) | L4 archetype cards + master | Behavioral pattern extraction → spectrum mapping → recursive derivation | ~3–5 L2 themes per archetype |
| **L5** | l5-framework-synthesis | L4 OA files + L4 Principle files (**inputs**) · L4 VP files (coherence check) · L4 Archetypes (optional reading lens, not an input) | L5 Framework document + visual | Integration: pairing + naming + sequencing | Not compression — architecture |

---

## The Skills

### l1-findings-extraction
**What it does:** Extracts interpreted findings from a single interview transcript. Each finding is a synthesist's claim — not a quote, not a summary — with evidence, context, signal type, and an abductive question.

**When to invoke:** When you have a new interview transcript and need to produce L1 findings.

**Workflows:**
- `ExtractFindings` — full extraction pass on one transcript
- `WriteFinding` — craft a single finding from identified evidence

**Output format:** YAML frontmatter + `## Finding N:` body. Statement / Evidence / Context / Signal type / Abductive flag per finding.

**Key discipline:** Exhaustive, not selective. Every significant signal is captured. The abductive flag is a question the finding forces — not a recommendation.

---

### l2-theme-synthesis
**What it does:** Synthesizes L1 Findings across participants into cross-participant behavioral patterns. A theme requires 3+ independent sources (canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`). Behavioral pattern + abductive connection + evidence + implication.

**When to invoke:** When you have a complete or substantial L1 findings set and want to identify cross-participant patterns.

**Workflows:**
- `SynthesizeThemes` — full synthesis pass across all L1 files
- `WriteTheme` — craft a single theme from a named participant cluster
- `AuditThemeSet` — quality-check a completed theme set (9 audits, "Cleared for L3" gate)

**Output format:** YAML + behavioral pattern + abductive connection + evidence (by participant) + implication. Theme title is a behavioral claim, not a label.

**Key discipline:** Cluster by shared mechanism, not by topic. Three independent sources minimum. The abductive connection names why the pattern exists — not what it is.

---

### l3-insight-synthesis
**What it does:** Synthesizes L2 Themes into declarative insight claims using Kolko's yellow-blue-green card method. Observation (L2 themes) + Knowledge (cross-domain) = Insight (new declarative truth).

**When to invoke:** When you have a complete L2 theme set and want to move from behavioral patterns to strategic claims.

**Workflows:**
- `SynthesizeInsights` — full synthesis pass across all L2 files
- `WriteInsight` — craft a single insight from a named theme cluster and knowledge layer
- `AuditInsightSet` — quality-check a completed insight set (7 audits, "Cleared for L4" gate)

**Output format:** YAML + Observation + Knowledge + Insight + What this opens + Source themes. Insight title is a declarative truth claim.

**Key discipline:** The knowledge layer must introduce something not in the research data — cross-domain knowledge from design theory, brand strategy, behavioral economics, or Chipchase's frameworks. Without genuine knowledge injection, L3 is just L2 in a new register.

---

### l4-opportunity-area-synthesis
**What it does:** Synthesizes L3 Insights into designed territories for action, each framed as a "How Might We" question with defined scope, evidence re-grounding, and a system-level relationship map.

**When to invoke:** When you have a complete L3 insight set and want to define where the organization should act.

**Workflows:**
- `SynthesizeOpportunityAreas` — full synthesis pass across all L3 files
- `WriteOpportunityArea` — craft a single OA from a named insight cluster
- `AuditOpportunityAreaSet` — quality-check a completed OA set (7 audits, "Cleared for L5" gate)

**Output format:** YAML (includes `governs` field) + HMW question + Why this matters + What's in scope + What's not in scope + Source insights.

**Key discipline:** The HMW must be open enough for multiple solutions but specific enough to exclude some. "What's not in scope" is required. "Why this matters" re-grounds in specific L1 participant evidence — not just L3 IDs.

---

### l4-design-principle-synthesis
**What it does:** Synthesizes L3 Insights into standing decision rules — short, active principle titles a reader with no project context understands on first read (plain-language rules, 2026-11-07) with five-part structure including a test question and a named failure mode.

**When to invoke:** When you have a complete L3 insight set and want to derive how the organization should act in every relevant decision. **This is the brand/org strategy approach.** For product/service/experience design, use this skill's tiered-evaluative approach instead (its Two Approaches section) — it derives tiered evaluative qualities (Foundational/Elevated/Aspirational) rather than standing behavioral rules.

**Workflows:**
- `SynthesizePrinciples` — full synthesis pass across all L3 files
- `WritePrinciple` — craft a single principle from a named insight cluster
- `AuditPrincipleSet` — quality-check a completed principle set (6 audits, "Cleared for L5" gate)

**Output format:** YAML (includes `governs` field) + The principle + What it means + Why it comes from the research + How to apply it + What it prevents + Source insights.

**Key discipline:** The title is the principle — everything else is elaboration. The "How to apply it" section must include a test question in quotation marks. "What it prevents" names a specific, recognizable failure pattern — not a generic risk.

---

### l4-value-proposition-synthesis
**What it does:** Synthesizes L3 Insights into a Customer Profile (jobs/pains/gains derived from the research) and 2–3 candidate Value Maps (initial offering hypotheses). This is the bridge between synthesis and design: the Customer Profile is what JTBD research *produces*; the Value Map is the first answer to *what could we offer?*

**When to invoke:** When you have a complete L3 insight set and want to translate what you know about customers' jobs into a structured offering hypothesis — before concept design begins. Applies to all project types (brand strategy, product design, service design). The three L4 outputs answer different questions: OAs say *where* to act, Principles say *how* to act, VP Synthesis says *what to offer*.

**Workflows:**
- `SynthesizeValuePropositions` — full synthesis pass: build Customer Profile from all L3 files, generate 2–3 candidate Value Maps, run fit assessments
- `WriteValueProposition` — craft a single VP candidate from a named job cluster
- `AuditValuePropositionSet` — quality-check a completed VP set (6 audits, "Cleared for L5" gate)

**Output format:** YAML (includes `primary_job` and `governs` fields) + Customer Profile (Primary job / Pains / Gains) + Value Map (Products & Services / Pain Relievers / Gain Creators) + Fit Assessment + Job-Spec Check + Source insights.

**Key discipline:** The most important guardrail in this skill is the job-spec vs. product-spec boundary. A valid Customer Profile primary job passes the multi-industry test (candidates from different industries could address it). A valid Value Map describes what the offering *does for the customer*, not what it *is* as a product. The three-industry test is applied to every element of Products & Services before the output is finalized.

**Theoretical basis:** Christensen (*Competing Against Luck*) — Jobs Theory; job = progress + circumstance; three job dimensions (functional/emotional/social). Osterwalder (*Value Proposition Design*) — the Customer Profile + Value Map structure; gain types (Required/Expected/Desired/Unexpected); High-Value Jobs screen (Important/Tangible/Unsatisfied/Lucrative). Kalbach (*The Jobs to Be Done Playbook*) — job stories; Four Forces. Wunker (*Jobs to Be Done*) — Jobs Atlas; functional + emotional job distinction.

---

### l4-archetype-synthesis
**What it does:** Synthesizes L2 Themes into named behavioral archetypes — or proto-archetypes when data is insufficient — using a recursive derivation process grounded in the frog Consumer Archetypes POV and LeCompte's 7-step strategy. Archetypes are behavioral constructs, not demographic segments: the same person can inhabit different modes depending on purchase context or phase of life.

**When to invoke:** When you have a substantial L2 theme set and need to answer *who* you are designing for. Requires foundational research (ethnography, contextual inquiry, in-depth interviews) for full archetype status; evaluative or attitudinal-only data yields proto-archetypes with explicit upgrade paths (canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.archetype_evidence_floor`). Use `ArchetypeReadyGuide` to assess data readiness before beginning synthesis.

**Workflows:**
- `SynthesizeArchetypes` — full 8-phase synthesis: data grading → gate declaration → pattern extraction → spectrum mapping → recursive derivation → fluidity check → design implications → L3 coherence check
- `WriteArchetype` — craft a single archetype card from a named behavioral cluster
- `AuditArchetypeSet` — quality-check a completed archetype set (5 guardrails, "Cleared for L5" gate)
- `ArchetypeReadyGuide` — assess whether available data is sufficient for archetype synthesis before beginning

**Output format:** YAML (includes `archetype_status`, `confidence`, `confidence_ceiling`) + Name + One-line profile + Spectrum positions + Key Indicators (3–5 observable behavioral signals) + Evidence trail (cited L2 themes with LeCompte evidence types) + Design implications (Design for / Friction / Leading edge signal) + Journey domains + Context triggers + Proto-archetype flag (if applicable).

**Key discipline:** Every archetype must cite specific L2 themes — no composite archetypes without traceable evidence. Proto-archetype status must be declared explicitly and carried to every card; no silent upgrades to full archetype status. Each archetype must articulate why it is not reducible to a demographic category (the anti-demographic guardrail from the frog POV).

---

### l5-framework-synthesis
**What it does:** Integrates L4 OAs and L4 Principles into a named strategic framework with domains, systems logic, strategic premise, three practical uses, and a Mermaid systems diagram.

**When to invoke:** When you have complete L4 OA and Principle sets and want to produce the final synthesis artifact. **This is the brand/org strategy approach.** For product/service/experience design, use this skill's structural-form discovery instead (its Two Approaches section) — it discovers the structural form (hierarchy/spectrum/matrix/cycle/hub-and-spoke/ecosystem) and applies a generativity test rather than building a domain pairing architecture.

**Workflows:**
- `SynthesizeFramework` — full integration pass across all L4 OA and Principle files
- `BuildDomain` — construct a single framework domain from a named OA-Principle pair
- `AuditFramework` — quality-check a completed framework (7 audits, "Synthesis complete" gate)
- `FinalLadderReview` — end-to-end two-reviewer adversarial audit of the L2–L5 ladder; run after AuditFramework clears

**Output format:** L5_Framework_[ProjectName].md + L5_Framework_Visual.md (Mermaid) + L5_Framework_Visual_Notes.md.

**Key discipline:** L5 is integration, not compression. The most common failure is producing an organized L4 summary — domain names that are OA titles, "strategic task" sections that list programs. Genuine L5 synthesis produces new architectural knowledge: domain names that are neither OA titles nor Principle titles, "strategic task" sections that argue necessity, systems logic that names dependencies not visible in the L4 outputs.

---

## The File Chain

How outputs from each level become inputs to the next:

```
Transcript files (.md)
  → l1-findings-extraction
  → L1_[ParticipantName].md (one per interview)
     [Finding N: / Statement / Evidence / Context / Signal / Abductive]

All L1 files
  → l2-theme-synthesis
  → L2-[NN]_[Short_Name].md (one per theme) + L2_Themes_[Project].md
     [Behavioral pattern / Abductive connection / Evidence / Implication]

All L2 theme files
  → l3-insight-synthesis
  → L3-[NN]_[Short_Name].md (one per insight) + L3_Insights_[Project].md
     [Observation / Knowledge / Insight / What this opens / Source themes]

All L3 insight files
  → l4-opportunity-area-synthesis      → l4-design-principle-synthesis      → l4-value-proposition-synthesis
  → OA-[NN]_[Short_Name].md            P-[NN]_[Short_Name].md             VP-[NN]_[Short_Name].md
  + L4_Opportunity_Areas_[Project].md  + L4_Principles_[Project].md      + L4_Value_Propositions_[Project].md

All L2 theme files (primary) + All L3 insight files (coherence check)
  → l4-archetype-synthesis
  → ARCH-[NN]_[Short_Name].md (one per archetype) + L4_Archetypes_[Project].md
     [Name / One-line profile / Spectrum positions / Key Indicators / Evidence trail / Design implications]

All L4 OA files + All L4 Principle files (+ optional L4 VP and Archetype files)
  → l5-framework-synthesis
  → L5_Framework_[Project].md + L5_Framework_Visual.md
```

---

## Shared Theoretical Corpus

All skills draw from the same theoretical basis. The corpus runs through every level:

**Jon Kolko — Exposing the Magic of Design / Abductive Thinking and Sensemaking**
- Three synthesis acts: Prioritizing / Judging / Forging connections
- Yellow card (observation) + Blue card (knowledge) = Green card (insight) — the abductive pairing at L3
- Problem finding / Problem understanding / Problem solving — L4 is problem finding; L5 is making synthesis usable for problem solving
- Externalization principle: synthesis must produce artifacts, not just thinking

**Jan Chipchase — Hidden in Plain Sight**
- Range of distribution: outliers as leading indicators (applied at L1 and L2)
- Workarounds as structural signals (L1 signal type)
- Centers of gravity (L4 OA relationship map; L5 domain sequencing)
- Platzgeist: organizational context governs what is actionable — applied at L4 and L5 to scope and sequence
- Essence thinking: what survives stripping away context — applied at L3 knowledge layer
- Trust ecosystem (6 dimensions): authenticity / fulfillment / value / reliability / safety / recourse — applied at L3 knowledge layer
- Research as gift: the ethical obligation to close the loop from research to action — completed at L5

**Harold G. Nelson & Erik Stolterman — The Design Way (2nd ed., MIT Press, 2012)**
- Design inquiry as a compound of three forms: the real (contextual/particular), the true (scientific/factual), and the ideal (desiderata/values). The synthesis ladder maps onto this: L1–L2 ground in the real; L3 injects the true as cross-domain knowledge; L4–L5 move toward the ideal, producing designed artifacts aimed at that-which-is-desired.
- The *ultimate particular*: L4 Opportunity Areas and the L5 Framework are *designed things* — ultimate particulars — not discovered truths. They are the product of design judgment, not scientific inference. This distinction matters for how these outputs are defended to clients and how they are revised.
- The *parti*: the organizing seed image that crystallizes from saturation before design territories are drawn. Applied in SynthesizeOpportunityAreas as Step 3 — the guiding image that precedes clustering and governs the whole OA field.
- The *adequate*: designed wholes should be as complex as they need to be, not as comprehensive as possible. Applied in AuditFramework as Audit 7 — the adequacy check that catches over-built frameworks before delivery.
- Desiderata vs. needs: design is initiated by desires, not deficits. The best HMW questions and L5 strategic premises orient toward enabling what is desired, not fixing what is broken.

---

## Two Approaches at L4-Principles and L5

Two levels of the synthesis ladder have alternative approaches depending on project type. The ladder skills above are designed for **brand strategy and organizational strategy**. For **product design, service design, and experience design**, `l4-design-principle-synthesis` and `l5-framework-synthesis` each describe a parallel approach in their Two Approaches sections.

### L4-Principles: Two approaches

| Approach | Skill | Best for | Principle form |
|----------|-------|----------|----------------|
| **Standing behavioral rules** | l4-design-principle-synthesis | Brand / organizational strategy | Short active title (4–8 words) + test question in quotation marks + named failure mode |
| **Tiered evaluative qualities** | l4-design-principle-synthesis (Two Approaches) | Product / service / experience design | "If done well, it would feel…" — organized as Foundational → Elevated → Aspirational |

The difference is what the principles govern: **organizational behavior** (how should we always act?) vs. **design evaluation** (what quality should good solutions have?). A standing behavioral rule survives indefinitely as a decision filter. A tiered evaluative quality governs solution assessment within the design process.

### L5-Framework: Two approaches

| Approach | Skill | Best for | Output |
|----------|-------|----------|--------|
| **Domain pairing architecture** | l5-framework-synthesis | Brand / organizational strategy | Named domains (each pairing one OA + one or more Principles) + strategic premise + systems logic + Mermaid diagram + three practical uses |
| **Structural form discovery** | l5-framework-synthesis (Two Approaches) | Product / service / experience design | Named framework with candidate-tested organizing logic (hierarchy/spectrum/matrix/cycle/hub-and-spoke/ecosystem) + generativity test |

The difference is the synthesis act: **integration** (what architecture holds these OAs and Principles together?) vs. **structural form discovery** (what organizing logic makes these Principles generative?). The domain pairing approach assumes the structural form is always a sequenced domain architecture. The structural form approach treats the form as discovered, not assumed.

### Project-type routing key

| Project type | Principles | Value Propositions | Framework |
|-------------|------------|-------------------|-----------|
| Brand strategy | l4-design-principle-synthesis | l4-value-proposition-synthesis | l5-framework-synthesis |
| Organizational strategy | l4-design-principle-synthesis | l4-value-proposition-synthesis (optional) | l5-framework-synthesis |
| Product design | l4-design-principle-synthesis (Two Approaches) | l4-value-proposition-synthesis | l5-framework-synthesis (Two Approaches) |
| Service design | l4-design-principle-synthesis (Two Approaches) | l4-value-proposition-synthesis | l5-framework-synthesis (Two Approaches) |
| Experience design | l4-design-principle-synthesis (Two Approaches) | l4-value-proposition-synthesis | l5-framework-synthesis (Two Approaches) |

L1–L3 (Findings, Themes, Insights) and L4-OA (Opportunity Areas) are shared across project types — the same skills apply regardless. L4-VP (Value Propositions) is also shared across project types — the question "what could we offer?" applies regardless of whether the engagement is brand strategy, product design, or service design. It is optional for purely organizational strategy engagements where the output is a change agenda rather than an offering design.

---

## Navigation Guide

**Starting a new project from scratch:**
l1-findings-extraction → l2-theme-synthesis → l3-insight-synthesis → l4-opportunity-area-synthesis + l4-design-principle-synthesis + l4-value-proposition-synthesis (all parallel from L3) + l4-archetype-synthesis (parallel, from L2 primary) → l5-framework-synthesis

**Resuming at a specific level:**
Each skill reads its own input files independently. No state is carried between invocations. To resume at L3, point the skill at the L2 theme files — no other context needed.

**Running an audit before advancing:**
Each skill has an Audit workflow. Run the audit at the current level before invoking the next skill. The audit issues a "Cleared for L[N+1]" verdict. Do not advance to the next level with unresolved audit flags.

**Adding new participants mid-project:**
- Add new transcripts: run l1-findings-extraction on new transcripts only
- Revise themes: run l2-theme-synthesis with the new L1 files included; re-audit
- Re-synthesize upward from the level where themes changed

**Iterating a level:**
Iteration 2 additions (e.g., new L2 themes discovered after L3 and L4 are written) should be noted explicitly in each subsequent level's document with a version note. The L5 Framework document supports `version` and `version_note` YAML fields for this purpose.

---

## Reserved Claim Verbs — CANONICAL

> **This section is the single source of truth for the reserved-claim-verbs rule.** Every other
> skill carries a one-line rule + pointer here — never a second copy of the list.
> *(Named "reserved claim verbs," not "register": `DomainScope.md`'s **register** is a different,
> load-bearing house term — the domain-appropriate voice of an Implication. This rule is about
> claim-strength vocabulary, not voice.)*

**The rule:** ***validated*, *confirmed*, *passed*, and *from the customer's side* are reserved for
externally-tested claims** — claims tested on people or systems outside the research team (fielded
instruments, market results, third-party verification). Research-derived claims use the ladder's own
epistemic vocabulary: *attested, evidenced, saturated, hypothesis, working assumption*. The reserved
verbs assert a test that happened; using one on an untested claim dresses synthesis in the authority
of verification. Verification: a standing reserved-verbs line in `FinalLadderReview.md` → Quality
Checks Before Reporting (re-runs each engagement). Exit condition: two consecutive engagements with
zero hits and zero judgment calls → this rule folds into the format docs' prose and the standing
check retires (authorizing ruling: Alexander plan §1.1, the researcher's cheap-lane slot rulings 2026-08-22).

## Client Comments Stay Out of the Research — CANONICAL

> **This section is the single source of truth for the rule.** The readout-level skills (L3, L4
> Opportunity Areas, L4 Principles, L5) carry a one-line rule + pointer here.

**The rule:** the research is the voice of the customer. What a client, founder or sponsor says in
reaction to a readout (facts about their company, their own explanations, disagreement with a
finding) **never enters or changes a research artifact or a readout, at any ladder level.** That
includes labelled forms: not as "the client said" in Assumptions or scope, not as a "client's
reading" beside a rival reading, and not as corroboration of a finding. The client decides how to
apply their own views to the research.

**Where the comments go:** they stay on record in the call folder (the L0 and the meeting brief), and
they may be referenced in later presentations, attributed to the client.

**What still changes an artifact:** a new participant interview, a correction to a quote or a count
against its source, and the researcher's rulings on wording or structure.

*Why (the researcher, 2026-11-10, a client project):* after a client readout, the client's statements were added to L4
Assumptions and scope as "the client said", and an L5 diagnosis was built on one of them. An audit
found the statement used as corroboration of the research. Both were reverted. The researcher: "they cannot
change our research or readouts. That is fundamentally against my process. Our research is the voice
of the customer. His opinions are his and he can choose how to apply them to the research."

## Quality Gates

Each skill's Audit workflow issues a gate verdict before the next level can begin:

| Audit | Gate |
|-------|------|
| L2 AuditThemeSet | Cleared for L3 |
| L3 AuditInsightSet | Cleared for L4 |
| L4 AuditOpportunityAreaSet | Cleared for L5 |
| L4 AuditPrincipleSet | Cleared for L5 |
| L4 AuditValuePropositionSet | Cleared for L5 (or concept design) |
| L4 AuditArchetypeSet | Cleared for L5 (or fieldwork upgrade if proto-archetype) |
| L5 AuditFramework | Synthesis complete |

L1 has no formal gate — the FindingsFormat quality check in ExtractFindings serves this function within the workflow.

### Running a level audit — REQUIRED (added 2026-09-23)

The audit is a step of every L2–L5 synthesis workflow, not a reminder after it, and every L3–L5 synthesis checks the previous level's audit before it starts. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`.

1. **A fresh agent runs the audit.** The session that wrote the set does not grade it. Dispatch a new subagent with no conversation context (in Claude Code, the Agent tool; on a host without subagents, a new session). Give it only: the audit workflow file, the skill's format file, the directory holding the set, **the directory holding the level below it** (the L1 findings for an L2 audit, the L2 themes for L3, the L3 insights for an L4 set, the L2 themes for an archetype set, the L4 opportunity-area and principle documents for L5), **from L3 up, the L1 findings directory as well** (for targeted checks: quotes carried from L1 and participant claims the level below does not show; not a full read), and the project name. Without the level below, the audit cannot check coverage or counter-evidence, and its Inputs step stops. It runs the audit workflow in full, including its "Save the Audit Report" step, and returns the gate verdict.
2. **The writing session makes the fixes.** Read the saved report, fix the flagged items in the set, then dispatch a new fresh agent to re-audit. Repeat until the gate clears.
3. **Advancing with open flags is the user's call, and it is recorded.** If the user chooses to advance before the gate clears, add `advanced_with_open_flags: <date> — <user's reason>` to the report's frontmatter. Never advance on open flags without that line.
4. **Entry check (L3, L4, L5).** Before reading the input set, look in its directory for the previous level's audit report (filenames in each audit's "Save the Audit Report" step). Run the audit per steps 1–3 first when the report is missing, when its gate line is not cleared and it has no `advanced_with_open_flags` line, or when any file in the set is newer than the report. Tell the user which of the three applied.

---

*Ladder map — reference document*
*Ladder skills: l1-findings-extraction / l2-theme-synthesis / l3-insight-synthesis / l4-opportunity-area-synthesis / l4-design-principle-synthesis / l4-value-proposition-synthesis / l4-archetype-synthesis / l5-framework-synthesis*
*Parallel methods (product/service/experience design): l4-design-principle-synthesis (Two Approaches) + l5-framework-synthesis (Two Approaches)*
*Theoretical corpus: Kolko (Exposing the Magic of Design; Abductive Thinking and Sensemaking) + Chipchase (Hidden in Plain Sight) + Christensen (Competing Against Luck) + Osterwalder (Value Proposition Design) + Kalbach (JTBD Playbook) + Wunker (Jobs to Be Done)*
