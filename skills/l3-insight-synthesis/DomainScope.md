<!-- domain-set: v1 | canonical: l1-findings-extraction/DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml → gates.domain_scope_confirmation -->
# Domain Scope Reference

Defines which **Knowledge sources** the L3 knowledge injection draws from for each project type, and the **register** of the "What this opens" section. The synthesis machinery in `InsightFormat.md` — the Observation + Knowledge = Insight formula, the insight title test, compression calibration, the coverage map — is universal. This file parameterizes only the domain-coupled layers.

The Knowledge layer is the single most important section at L3: it is what separates an insight from a restated theme. The *act* of knowledge injection is identical across domains, but the *body of knowledge* you inject is domain-specific. A brand insight draws on brand strategy and category dynamics; an organizational insight draws on org behavior and change management; injecting the wrong body of knowledge produces a confident insight aimed at the wrong decision-maker.

Confirm the domain at the start of SynthesizeInsights (Step 1). If the L2 Themes carry a `domain:` field in their frontmatter, inherit it and confirm rather than re-asking. Carry the domain forward into the L3 output frontmatter.

The five domains match `l1-findings-extraction/DomainScope.md` and `l2-theme-synthesis/DomainScope.md` exactly.

> These menus are starting points, not fences. If the strongest interpretation of a cluster lives in a body of knowledge listed under another domain, use it — and label its provenance per the Knowledge Layer Test. The menu biases the default; it does not foreclose the right blue card.

---

## brand/design

**Decision-maker:** Brand team, design team, product team

**Knowledge sources to draw from:**
- Service design (frontline worker as brand; moments of truth; experience blueprinting)
- Brand strategy (implicit vs. explicit positioning; earned vs. claimed positions; rational→relational phases)
- Behavioral economics (identity purchases; switching costs; social proof; permission barriers)
- Community-led growth models (Arc'teryx, Rapha, LEGO Ambassador Network)
- Category dynamics (how premium categories grow; scarcity and access; price as permission)
- Chipchase's trust ecosystem (authenticity, fulfillment, value, reliability, safety, recourse)
- Chipchase's essence thinking (what survives context change?)

**"What this opens" register:** Strategic territory and investment direction — "the design task," "the brand investment priority," "the organizing question."

---

## product/UX

**Decision-maker:** Product manager, UX team, engineering

**Knowledge sources to draw from:**
- Norman's action model (the gulfs of execution and evaluation; the seven stages; slips vs. mistakes)
- Usability heuristics (Nielsen) and interaction design patterns
- Mental models and conceptual-model mismatch (where the user's model diverges from the system's)
- Cognitive load and perception (Weinschenk; working memory limits; Ware on visual processing)
- Jobs to Be Done (the progress the user is hiring the product to make; the circumstance)
- Adoption and diffusion (friction, switching costs, the cost of the workaround)
- Chipchase's trust ecosystem (reliability and recourse as chronically underinvested)

**"What this opens" register:** Design territory and capability direction — "the interaction design task," "the capability gap to close," "the flow to redesign."

---

## organizational

**Decision-maker:** Leadership, operations, change-management team

**Knowledge sources to draw from:**
- Organizational behavior (incentives, norms, informal vs. formal structure)
- Change management (sources of inertia; what makes adoption stick)
- Systems thinking (feedback loops; where the leverage point actually is)
- Principal–agent and decision-rights theory (who has what information, when; misaligned incentives)
- Sociotechnical systems (how process, tooling, and people co-produce behavior)
- Chipchase's platzgeist (what the organization is constitutionally able to act on)
- Chipchase's trust ecosystem (reliability and recourse inside the organization)

**"What this opens" register:** Organizational design territory — "the capability to build," "the process to redesign," "the decision-right to relocate."

---

## policy/advocacy

**Decision-maker:** Policy team, advocacy organization, government body

**Knowledge sources to draw from:**
- Behavioral public policy (choice architecture; nudge; defaults; friction as a design variable)
- Policy design and implementation science (the gap between policy-as-written and policy-as-experienced)
- Street-level bureaucracy (how frontline discretion reshapes policy intent)
- Equity and access frameworks (who bears the burden; distributional consequences)
- Systems thinking (unintended consequences; second-order effects)
- Chipchase's trust ecosystem (reliability and recourse for the governed)
- Chipchase's essence thinking (the irreducible need the policy must serve)

**"What this opens" register:** Policy-design territory — "the barrier to remove," "the intervention point," "the equity question to resolve."

---

## other

**Decision-maker:** [Confirm with user at Step 1]

**Knowledge sources to draw from (generic — adapt to the project):**
- The body of theory that best explains how this particular system behaves in the structural situation the observation reveals
- Chipchase's trust ecosystem and essence thinking (domain-neutral; apply to any system involving trust or human need)
- Systems thinking (feedback, leverage points, second-order effects)
- Label every injected source per the Knowledge Layer Test; name the field you are drawing from explicitly

**"What this opens" register:** The strategic or design territory the insight makes available, framed for whoever owns the system — direction, not prescription.
