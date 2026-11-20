<!-- domain-set: v1 | canonical: l1-findings-extraction/DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml → gates.domain_scope_confirmation -->
# Domain Scope Reference

Defines the domain-coupled vocabulary for L4 Design Principles. The synthesis machinery in `PrincipleFormat.md` — the title test, the decision-filter test, failure-mode discipline, evidence re-grounding, Chipchase's essence thinking — is universal. This file parameterizes only two layers: the **"Governs" decision-domain vocabulary** and the **decision types** the principle's "How to apply it" filter operates on (the kinds of decisions whose test question the principle generates).

Confirm the domain at the start of SynthesizePrinciples (Step 1). If the L3 Insights carry a `domain:` field in their frontmatter, inherit it and confirm rather than re-asking. Carry the domain forward into the L4 output frontmatter.

The five domains match the rest of the ladder exactly.

> The vocabularies below are starting points, not fences. Name the decision domain a principle actually governs even if it isn't listed.

---

## brand/design

**"Governs" decision-domain vocabulary:** Investment allocation · Brand identity · Experience design · Relationship & community

**Decision types the filter operates on:** budget/investment decisions, campaign briefs, dealer/partner programs, community partnership proposals, product-extension decisions

---

## product/UX

**"Governs" decision-domain vocabulary:** Roadmap prioritization · Interaction & flow design · Capability investment · Quality bar

**Decision types the filter operates on:** roadmap and prioritization calls, feature specs, design reviews, platform/architecture decisions, scope/tradeoff calls

---

## organizational

**"Governs" decision-domain vocabulary:** Resource allocation · Process design · Decision rights · Culture & incentives

**Decision types the filter operates on:** budget and headcount decisions, process changes, role/decision-right assignments, policy and SOP authoring, tooling choices

---

## policy/advocacy

**"Governs" decision-domain vocabulary:** Resource allocation · Program design · Access & eligibility rules · Stakeholder engagement

**Decision types the filter operates on:** funding decisions, program-design choices, rule-making and eligibility-setting, outreach strategy, coalition/partnership decisions

---

## other

**"Governs" decision-domain vocabulary:** <Confirm with user at Step 1 — name the decision domains relevant to the system being studied>

**Decision types the filter operates on:** Name the recurring classes of decision the system's owner actually makes, so each principle's test question lands on a real choice. The test-question format ("Does this…?" / "Will this…?") is domain-neutral; only the decisions it governs change.
