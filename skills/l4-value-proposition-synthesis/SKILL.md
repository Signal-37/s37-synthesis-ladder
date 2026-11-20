---
name: l4-value-proposition-synthesis
description: Synthesizes L3 Insights into L4 Value Propositions (Customer Profile + Value Map). USE WHEN writing value propositions before concept design.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
---

# l4-value-proposition-synthesis

Synthesizes L3 Insights into a Customer Profile and candidate Value Maps: the explicit bridge between research synthesis and design. The Customer Profile is what rigorous JTBD synthesis *produces*. The Value Map is the first answer to "what could we offer?"

**Where this sits in the synthesis funnel:**

```
[L2 Themes] → [L3 Insights] → [this skill] → [L4 Value Propositions] → [L5 Framework]
```

L4 has four parallel outputs — Opportunity Areas (*where*), Design Principles (*how*), Archetypes (*who*), **Value Propositions** (***what***, this skill). Canonical composition and inputs: `../ladder-core/ladder-map.md` §L4 composition.

Unlike the other three, this one is **gated**:

## GATE — do not run this skill without an agreed target customer

The other three L4 outputs run straight off L3 (Archetypes primarily off L2). **This one does not.**
A Value Proposition is *for someone*. Synthesized across blurred segments, the Customer Profile
describes no one — mutually exclusive jobs average into an incoherent customer.

The target customer arrives one of three ways:

1. **An agreed segmentation already exists** → proceed now.
2. **From L4 Archetypes** → run `l4-archetype-synthesis` first; its named behavioral types supply the target.
3. **Neither** → a quantitative customer segmentation exercise must come first, or you accept a
   segmentation caveat on the output.

**Before running, apply the segment-blur test and pick one of the two clean paths (one VP set per
segment, or a declared primary customer): read `CustomerSegmentation.md`.** If L3 Insights contain
jobs that are mutually exclusive or in tension, the answer is split-then-synthesize — not average.

---

**The critical move at L4-VP:**

L3 Insights declare what is true about customers' jobs and the progress they are trying to make. L4 VP Synthesis asks: given what we know about the job, the circumstance, and the forces pushing and pulling on the customer — what offering could help them make that progress?

| Level | Form | Example |
|-------|------|---------|
| **L3 Insight** | Declarative truth about what customers are trying to do | "Meridian's loyal community is hiring the bike to feel recognized as a serious athlete — a job the brand has never explicitly claimed" |
| **L4 Customer Profile** | Structured account of the job, pains, and gains from the research | Primary job: "Be perceived and perceive myself as a serious competitive cyclist, even when I'm not racing" — Extreme pain: no proof of seriousness exists between races — Desired gain: external markers of authentic athletic identity |
| **L4 Value Map** | Initial hypothesis about what could address the profile | Products & Services: A brand membership platform built around athlete identity milestones; Pain Relievers: visible markers of training volume and commitment, not just race results; Gain Creators: community-conferred recognition that doesn't require podium performance |

The VP sketch is not a product specification. It is the level of abstraction where you can name *what kind of thing* to offer without specifying *what the thing is*. The job-spec vs. product-spec guardrail is the most important quality check in this skill.

---

**The structure:**

**Customer Profile (built from L3 Insights):**
- **Jobs:** The progress the customer is trying to make, with all three dimensions (functional / emotional / social) and the precise circumstance in which the job arises
- **Pains:** What makes progress difficult, costly, or risky — typed by severity (extreme / significant / moderate) and type (undesirable outcome / obstacle / risk)
- **Gains:** What the customer hopes to achieve or experience — typed by category (Required / Expected / Desired / Unexpected)

**Value Map (the offering hypothesis):**
- **Products & Services:** What we would offer — described by what it *does for the customer*, not what it *is* as a product
- **Pain Relievers:** How the offering addresses specific ranked pains — matched to pains by severity
- **Gain Creators:** How the offering creates specific gains — should target Desired and Unexpected gains for differentiation; Required gains are hygiene factors

**Fit:** Does the Value Map address the most important jobs, pains, and gains? The most common failure is a VP that addresses easy (low-severity) pains while leaving the extreme pains unaddressed.

---

**The High-Value Jobs screen** (this ladder's composite drawn from the JTBD literature — the named four-part screen appears in neither the VPD nor the Competing Against Luck corpus notes `[model knowledge — verify]`)**:**

Before building the Customer Profile, rank jobs using four criteria:

| Criterion | Question |
|-----------|----------|
| **Important** | Does the customer care deeply about making this progress? |
| **Tangible** | Is the success condition observable or measurable by the customer? |
| **Unsatisfied** | Do current solutions leave meaningful gaps? |
| **Lucrative** | Is there economic value in solving this better? |

Jobs that pass all four criteria are candidates for the primary Customer Profile position. Jobs that pass fewer than three belong in a secondary layer.

---

**The job-spec vs. product-spec guardrail:**

A valid job is expressed at a level of abstraction where candidates to solve it come from *different product categories*. When the offering hypothesis slips to a level where only same-category products apply, it has become a product specification.

| Valid job (stays abstract) | Product spec (too specific) |
|----------------------------|-----------------------------|
| "Feel recognized as a serious athlete between races" | "A training app with Strava integration" |
| "Make confident financial decisions without expert help" | "A budgeting dashboard with AI-generated advice" |
| "Keep my family safe when something goes wrong on the road" | "A connected car service with emergency call features" |

**Test:** If you removed the brand name and showed the statement to a product manager at three different companies in different industries, could each of them design something to address it? If yes — it's a job. If only one industry makes sense — it's a product spec.

---

## Domain support

The JTBD and value-proposition machinery is domain-agnostic — every system has a beneficiary trying to make progress and an offering that could help. Throughout the skill, **"customer" means the beneficiary the offering serves**: the customer or user for brand/design and product/UX, the employee or internal stakeholder for organizational, the constituent or community member for policy/advocacy. The domain is inherited from the L3 Insights frontmatter, confirmed at the start, and selects who the Customer Profile describes and the "Lucrative"/value register via `DomainScope.md`. The confirmed domain is carried into the L4 output frontmatter.

---

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **SynthesizeValuePropositions** | Synthesize L3 insights into L4 Customer Profile and candidate Value Propositions | `workflows/SynthesizeValuePropositions.md` |
| **WriteValueProposition** | Craft a single VP candidate from a named job cluster | `workflows/WriteValueProposition.md` |
| **AuditValuePropositionSet** | Quality-check a completed VP set before advancing to L5 | `workflows/AuditValuePropositionSet.md` |

---

## Relationship to abductive-reasoning

The L3→L4-VP move — "given this job and these circumstances, what could be offered?" — is an abductive leap. The Customer Profile is read off the insights; the Value Map is inferred from it. The inference asks: if these jobs/pains/gains are true, what is the simplest offering that, if executed well, would help the customer make the progress they are trying to make?

When the derivation needs to be client-defensible — or when competing Value Maps need to be evaluated before advancing — route to the **abductive-reasoning** skill's `ReasoningChain` workflow: document the inferential chain from specific L1 evidence through L3 insights to the job statement, name the competing offering hypotheses considered and why they were set aside, and state what evidence would falsify the chosen VP.

*Note: abductive-reasoning is a separate skill. If not installed, document the chain inline: list the L1 evidence → L3 insights → job statement derivation, name the competing VP candidates considered, and state what evidence would falsify the chosen VP.*

---

## Relationship to L4 Opportunity Areas

VP Synthesis and Opportunity Areas are parallel and complementary, not redundant. An Opportunity Area says "How might we design the full arc of the customer relationship?" — solution-agnostic. A Value Proposition says "We could offer X kind of thing to address the relationship arc job" — the first hypothesis.

If both L4 skills have been run, cross-reference: each VP should address at least one OA's territory. A VP that addresses territory no OA names is a signal to audit the OA set. An OA that no VP candidate addresses is a signal to check whether the job was properly surfaced.

---

## Relationship to L5 Framework

L4-VP outputs optionally inform L5 by adding the *offering dimension* to the strategic framework. Currently L5 integrates OAs (where) + Principles (how) → Framework (what's the integrated architecture). VP Synthesis adds: and what to offer. Not all L5 work requires this — brand strategy engagements focused on positioning and identity may not need explicit VP hypotheses. Engagements that are moving toward product or service design always do.

**After synthesis:** before advancing, check whether the L4 sets constitute sufficient design direction: score them against tiered evaluation principles with observable proxies and a stated phase threshold.

---

## Based On

- Christensen, Hall, Dillon, Duncan, *Competing Against Luck* (HarperBusiness, 2016) — Jobs Theory primary source; job = progress + circumstance; three job dimensions (functional/emotional/social); job-spec vs. product-spec distinction; stack fallacy; passive vs. active data
- Osterwalder, Pigneur, Bernarda, Smith, *Value Proposition Design* (Wiley, 2014) — the Customer Profile + Value Map structure and the fit between them; three types of Fit (Problem-Solution / Product-Market / Business Model); 4 gain types (Required/Expected/Desired/Unexpected); Earlyvangelist criteria (5-point filter for early adopter identification)
- Strategyzer AG (strategyzer.com) — the Value Proposition Canvas, the visual tool the book's structure is best known from. Credited as an influence: this skill does not reproduce the canvas or use its name for its output.
- Kalbach, *The Jobs to Be Done Playbook* (Rosenfeld, 2020) — job stories ("When I [situation], I want to [motivation], so I can [expected outcome]") as the canonical format for expressing a job with circumstance; ODI importance/satisfaction scoring as a validation model; Four Forces as the switching mechanism (Push + Pull + Anxiety + Habit — Kalbach's label for the fourth force; Christensen/Moesta call the same force Inertia)
- Wunker, Wattman, Farber, *Jobs to Be Done* (AMACOM, 2016) — Jobs Atlas (8 blocks) as a structured account of all job dimensions; functional + emotional job distinction; job driver → segmentation connection (the theoretical basis for why VP synthesis can reveal segment-level differences)

---

## Examples

**Example 1: Full L3→L4 VP synthesis pass**
```
User: "Synthesize the Meridian L3 insights into a value proposition"
→ Invokes SynthesizeValuePropositions workflow
→ Reads all L3 insight files
→ Extracts jobs inventory (functional/emotional/social dimensions per insight)
→ Validates job statements against the job-spec test
→ Applies High-Value Jobs screen to rank by importance
→ Constructs Customer Profile (primary job + pains + gains)
→ Generates 2-3 candidate Value Maps (canonical: `ValuePropositionFormat.md` → Canonical VP volume rule; up to 4 when the L3 set is 9–12 insights)
→ Runs fit assessment for each (addresses most important pains/gains?)
→ Checks for product-spec drift
→ Writes individual VP files and master VP document
```

**Example 2: Single VP candidate from a named job cluster**
```
User: "The identity insights all point at the same job — write the VP for it"
→ Invokes WriteValueProposition workflow
→ Identifies L3-02 (identity gap) and L3-05 (community belonging) as the source cluster
→ Constructs Customer Profile: "Be seen as a serious cyclist, not just a consumer of cycling products"
→ Identifies extreme pains: no markers of seriousness beyond racing, brand treats all buyers identically
→ Identifies desired gains: peer recognition, credential that travels beyond race day
→ Writes 2 candidate Value Maps:
  - VP-01A: An identity platform built around athlete milestones (non-race recognition)
  - VP-01B: A dealer-anchored specialist certification that grants visible credentials
→ Assesses fit: VP-01A addresses primary job and desired gains; VP-01B addresses pains better
→ Returns VP-01 formatted for review
```

**Example 3: Quality check before L5**
```
User: "Check the VP set before we build the framework"
→ Invokes AuditValuePropositionSet workflow
→ Checks job validity, Customer Profile completeness, Value Map specificity, fit assessment, product-spec drift, L3 coverage
→ Returns audit with flags and recommended changes
→ Issues "Cleared for L5" verdict
```
