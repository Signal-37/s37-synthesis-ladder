# l4-value-proposition-synthesis — Design Rationale

*Origin: the author's working session, 2026-06-02, following ingestion of Christensen / Competing Against Luck, the three JTBD texts (Christensen, Kalbach, Wunker), and Osterwalder / Value Proposition Design.*

---

## The question

> Considering this book, the other two JTBD, and also the book on Value Proposition, what is the relationship between JTBD and Value Propositions? My instinct is there is another L4 skill to create that goes along with Opportunity Areas.

---

## The answer

The relationship is sequential, not parallel. JTBD is **diagnosis** — discovering and characterizing the progress people are trying to make. VPD is **response design** — designing an offering to help them make that progress. The Customer Profile (jobs/pains/gains) is the explicit bridge artifact: it's what rigorous JTBD work *produces* and what VPD *requires as its starting point*.

In synthesis ladder terms: L3 Insights are already jobs claims — declarative truths about what people are trying to do in specific circumstances. But the ladder currently converts those Insights into **HMW Opportunity Areas** (where to design) and **Design Principles** (how to design). What it doesn't produce is a structured **value hypothesis** — *what to offer*.

The instinct is correct. There is a missing L4 skill.

**The current L4 layer produces:**
- Opportunity Areas → designed territory (solution-agnostic)
- Design Principles → behavioral decision rules

**What is missing:**
- Value Proposition Synthesis → the initial hypothesis about what could be offered to address the highest-priority jobs/pains/gains

What distinguishes it from OAs: Opportunity Areas ask "where should we design?" — they are deliberately solution-agnostic. A Value Proposition sketch asks "what could we offer?" — it is the first crossing from synthesis into design. It is still upstream of concepts and prototypes, but it names the candidate offering hypothesis.

**What the skill actually does:**

1. Takes L3 Insights as input — these are already the material for a Customer Profile
2. Structures them explicitly as a Customer Profile: ranks jobs by importance (the High-Value Jobs screen — "Important + Tangible + Unsatisfied + Lucrative," this ladder's composite from the JTBD literature), categorizes gains by type (required/expected/desired/unexpected from VPD), identifies pains
3. Generates 2–3 candidate Value Maps (what products/services, what pain relievers, what gain creators)
4. Runs a fit assessment: does the candidate Value Map address the *most important* jobs/pains/gains, or only the easy ones?

**What it is not:** concept generation. That comes later. This skill produces a *value hypothesis before you design anything* — it is the level of abstraction where you can say "we should offer X kind of thing" without yet specifying what X looks like.

The Christensen warning applies: the skill must stay at the job level, not slip into product specification. "Meridian should offer something that makes riders feel recognized as serious athletes between races" is a value hypothesis. "Meridian should build a training app" is a product spec. The skill needs a guardrail that flags when the output has drifted from job-level to solution-level.

**What this does to the L4 layer — four parallel outputs** (canonical list: `../ladder-core/ladder-map.md` §L4 composition)**:**
- L4 Opportunity Areas → WHERE to design
- L4 Design Principles → HOW to design
- L4 Value Proposition Synthesis → WHAT to offer (as a first hypothesis)

These three are genuinely parallel — none depends on the others. OAs frame territory; Principles constrain decisions; VP Synthesis sketches the offering. L5 then integrates all three into the strategic framework.

For Meridian specifically: running this skill on the existing L3 Insights would produce the Customer Profile for Meridian riders (their jobs/pains/gains ranked by research evidence) *plus* the candidate value propositions Meridian could offer in response. That is the exact work that currently happens informally in brand strategy engagements but has no explicit place in the synthesis workflow.

---

## Follow-up: Are L3 Insights too abstracted for input? Should L2 Themes be considered as well?

*Origin: follow-up question from the researcher, 2026-06-02, after running the skill on the Meridian L3 Insights.*

### The question

> Consider the skill — are the L3 Insights too abstracted for input? Would it be helpful to consider L2 Themes as well?

### The answer

L3 Insights are not too abstracted *as the organizational frame*, but they are insufficiently granular for two specific evidence requirements the skill depends on.

**Where L3 is the right source:**
Job statement construction works well at L3. The directional synthesis has already been done — the insight names what the customer is trying to do, frames the circumstance, and identifies the structural gap. Re-deriving that from L2 raw material would be redundant.

**Where L3 creates risk:**
Two VP synthesis decisions require behavioral evidence that L3 regularly compresses away:

1. **Pain severity classification.** Distinguishing EXTREME from SIGNIFICANT requires compensating behavior evidence — the buyer routing around the pain, or the thing they would actively avoid. L3 often embeds compensating behaviors in prose ("Tobi Renn asks three times") but doesn't foreground them structurally. A less well-written L3 would state the pain without the behavioral signal, and the VP author would have to guess severity.

2. **Gain type classification.** Identifying DESIRED vs. UNEXPECTED gains requires behavioral inference — what buyers aspire to but haven't received, or what a workaround reveals they've come to rely on. L3 can smooth this into a general observation. UNEXPECTED gains in particular need the texture that's usually closer to L2 or even L1.

**What L2 adds:**
L2 Themes are closer to the participant behavioral patterns before they get interpreted as directional findings. The `source_themes` pointer already exists in L3 frontmatter — the structural connection is there. L2 is the right reference for: confirming pain severity against compensating behavior evidence, and surfacing DESIRED/UNEXPECTED gain candidates that L3 may have generalized.

**What was added to the skill:**
An optional Step 3 (L2 Evidence Validation) inserted between the jobs inventory (Step 2) and job statement validation (Step 4). It triggers only when pain severity or gain type classification is uncertain — not as a default read. The trigger conditions name exactly what to look for in L2 Themes: compensating behaviors to confirm EXTREME severity, behavioral gaps to confirm DESIRED/UNEXPECTED gain territory.

**The tradeoff:**
Workflow length vs. evidence quality. For projects where L3 was compressed aggressively, skipping L2 risks misclassifying pains as SIGNIFICANT when they're actually EXTREME — which cascades into VP candidates with the wrong fit profile. Well-written L3 Insights that preserve participant-level behavioral detail (as the Meridian V5 set does) are often sufficient without triggering the L2 step.
