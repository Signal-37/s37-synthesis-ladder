<!-- domain-set: v1 | canonical: l1-findings-extraction/DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml → gates.domain_scope_confirmation -->
# Domain Scope Reference

Defines what the **Implication** section means for each project type. The synthesis machinery in `ThemeFormat.md` — behavioral pattern, abductive connection, evidence threshold, Kolko's three acts, Chipchase's disciplines — is universal. This file parameterizes only the two domain-coupled layers: the **decision-maker** the Implication's forced question is addressed to, and the **register** of the optional L4 flag.

Confirm the domain at the start of SynthesizeThemes (Step 1). If the L1 Findings carry a `domain:` field in their frontmatter, inherit it and confirm rather than re-asking. Use the matching entry below to frame the Implication throughout theming, and carry the domain forward into the L2 output frontmatter so it propagates to L3.

The five domains match `l1-findings-extraction/DomainScope.md` exactly — the domain set is consistent across the whole ladder.

---

## brand/design

**Decision-maker the Implication addresses:** Brand team, design team, product team

**Implication register:** The forced question is commercial and strategic — purchase and adoption logic, brand perception, equity, the experience the brand is or isn't designing. "What does this behavioral pattern force the brand to answer about how it grows, what it stands for, or what it has ceded to chance?"

**L4 flag register:** Commercial logic that is already legible at L2 — LTV/upgrade arc, market entry or exclusion, ROI structure, a sequential purchase model. Name it as an Opportunity Area question, not a solution.

---

## product/UX

**Decision-maker the Implication addresses:** Product manager, UX team, engineering

**Implication register:** The forced question is about usability, capability, and adoption — friction, mental-model mismatch, feature gaps, the task the product makes hard. "What does this behavioral pattern force the product team to answer about where the product diverges from how people actually work?"

**L4 flag register:** Product logic already legible at L2 — a capability gap with adoption consequences, a workflow the product forces that users route around, a flow whose redesign is scopeable now. Name it as a design question, not a feature spec.

---

## organizational

**Decision-maker the Implication addresses:** Leadership, operations, change-management team

**Implication register:** The forced question is about process, structure, and decision rights — workarounds, structural gaps, where the official system fails and what that costs. "What does this behavioral pattern force leadership to answer about how the organization actually works versus how it's designed to?"

**L4 flag register:** Operational logic already legible at L2 — a process failure with a measurable cost, a decision-rights gap, a capability the structure lacks. Name it as a design-of-the-organization question, not a reorg directive.

---

## policy/advocacy

**Decision-maker the Implication addresses:** Policy team, advocacy organization, government body

**Implication register:** The forced question is about access, equity, and participation — barriers the current policy produces, unmet needs it fails to address, behavior it creates that it wasn't designed to. "What does this behavioral pattern force the policy body to answer about who the system serves and who it leaves out?"

**L4 flag register:** Policy logic already legible at L2 — an access barrier with equity consequences, a behavior the policy is inadvertently producing, an intervention point scopeable now. Name it as a policy-design question, not a specific rule.

---

## other

**Decision-maker the Implication addresses:** [Confirm with user at Step 1]

**Implication register (generic — adapt to the project):** The forced question names the gap the behavioral pattern reveals in the system being studied, and addresses it to whoever owns that system. "What does this pattern force the system's owner to answer about where it falls short of what people need?"

**L4 flag register:** Any strategic or structural logic already legible at L2 — a consequence visible in the evidence without L3 knowledge injection. Name it as a forward question, not a solution.
