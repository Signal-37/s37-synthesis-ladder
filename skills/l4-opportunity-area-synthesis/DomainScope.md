<!-- domain-set: v1 | canonical: l1-findings-extraction/DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml → gates.domain_scope_confirmation -->
# Domain Scope Reference

Defines the domain-coupled vocabulary for L4 Opportunity Areas. The synthesis machinery in `OAFormat.md` — the HMW test, scope discipline, the coverage map, Kolko's problem-finding logic, Chipchase's platzgeist — is universal. This file parameterizes only two layers: the **"Governs" domain vocabulary** (the strategic domains an OA can govern) and the **relationship-map role register** (the structural roles OAs play in the system).

Confirm the domain at the start of SynthesizeOpportunityAreas (Step 1). If the L3 Insights carry a `domain:` field in their frontmatter, inherit it and confirm rather than re-asking. Carry the domain forward into the L4 output frontmatter.

The five domains match the rest of the ladder (`l1-findings-extraction`, `l2-theme-synthesis`, `l3-insight-synthesis`) exactly.

> The vocabularies below are starting points, not fences. If an OA genuinely governs a domain not listed, name it — the field is a label, not a controlled enumeration.

---

## brand/design

**"Governs" domain vocabulary:** Growth strategy · Customer experience & retention · Brand positioning & communications · Community design & activation · Brand access & inclusion · Product strategy

**Relationship-map roles:** Precondition · Growth engine · Converter · Scale condition

---

## product/UX

**"Governs" domain vocabulary:** Product strategy · Onboarding & adoption · Core workflow design · Information architecture · Platform & ecosystem · Accessibility

**Relationship-map roles:** Precondition (foundational capability) · Adoption engine (primary acquisition/activation mechanism) · Retention converter (turns adoption into sustained use) · Scale condition (what unlocks or limits reach)

---

## organizational

**"Governs" domain vocabulary:** Operating model · Process & workflow design · Decision rights & governance · Capability building · Culture & norms · Tooling & systems

**Relationship-map roles:** Precondition (shared frame all others require) · Primary mechanism (the main change lever) · Sustaining mechanism (what makes the change stick) · Scale condition (what allows it to spread across the org)

---

## policy/advocacy

**"Governs" domain vocabulary:** Program design · Access & eligibility · Service delivery · Outreach & engagement · Equity & inclusion · Measurement & accountability

**Relationship-map roles:** Precondition (the enabling condition) · Primary lever (the main intervention) · Sustaining mechanism (what maintains the outcome) · Reach condition (what extends it to those currently excluded)

---

## other

**"Governs" domain vocabulary:** <Confirm with user at Step 1 — name the strategic domains relevant to the system being studied>

**Relationship-map roles:** Use the four structural roles that fit the evidence — typically an enabling precondition, a primary mechanism, a sustaining/converting mechanism, and a scale/reach condition. Name them in the system's own terms.
