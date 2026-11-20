<!-- domain-set: v1 | canonical: l1-findings-extraction/DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml → gates.domain_scope_confirmation -->
# Domain Scope Reference

Defines the domain-coupled vocabulary for L4 Value Propositions. The synthesis machinery in `ValuePropositionFormat.md` — the JTBD Customer Profile, the job-statement tests, the High-Value Jobs screen, the gain/pain taxonomies, the job-spec guardrail — is universal: every system has someone trying to make progress, and an offering that could help. This file parameterizes only who that someone is and what "value" means for them.

The one load-bearing substitution: throughout the skill, **"customer" means the beneficiary the offering serves** — read it per the domain below. The Customer Profile is the profile of that beneficiary, whoever they are. The jobs/pains/gains structure does not change; only the population it describes does.

Confirm the domain at the start of SynthesizeValuePropositions (Step 1). If the L3 Insights carry a `domain:` field in their frontmatter, inherit it and confirm rather than re-asking. Carry the domain forward into the L4 output frontmatter.

The five domains match the rest of the ladder exactly.

---

## brand/design

**Who the "customer" is:** The customer or buyer.

**"Lucrative" / value register:** Willingness to pay; purchase, upgrade, and loyalty behavior.

**"Governs" (offering territory):** The product, service, or brand experience the organization could provide.

---

## product/UX

**Who the "customer" is:** The user (and, where relevant, the buyer if distinct from the user).

**"Lucrative" / value register:** Adoption, retention, and engagement; willingness to pay or upgrade; reduced churn.

**"Governs" (offering territory):** The product capability or feature-level service the team could build.

---

## organizational

**Who the "customer" is:** The employee, team, or internal stakeholder the offering serves.

**"Lucrative" / value register:** Productivity, retention, and adoption of the internal offering; the program investment the organization is willing to make; cost avoided.

**"Governs" (offering territory):** The internal service, tool, process, or capability the organization could provide.

---

## policy/advocacy

**Who the "customer" is:** The constituent, citizen, beneficiary, or community member the policy or program serves.

**"Lucrative" / value register:** Participation, access, and outcomes achieved; the program investment, mandate, or political capital the body is willing to commit. (Economic value is not the test — served need is.)

**"Governs" (offering territory):** The program, service, or intervention the body could deliver.

---

## other

**Who the "customer" is:** <Confirm with user at Step 1 — the person or group the offering is meant to help make progress.>

**"Lucrative" / value register:** The form of value that signals this progress is worth investing to enable — economic, mission, participation, or outcome-based, depending on the system.

**"Governs" (offering territory):** Whatever the system's owner could provide to help the beneficiary make the progress named in the primary job.
