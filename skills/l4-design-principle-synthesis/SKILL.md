---
name: l4-design-principle-synthesis
description: Synthesizes L3 Insights into L4 Design Principles — standing behavioral decision filters. USE WHEN deriving principles from insights.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
---

# l4-design-principle-synthesis

Synthesizes L3 Insights into L4 Design Principles: the standing decision rules that govern how the organization acts — in every program, investment, and communication — regardless of context.

**Where this sits in the synthesis funnel:**

```
[L2 Themes] → [L3 Insights] → [this skill] → [L4 Design Principles] → [L5 Framework]
```

**The critical distinction:**

L4 has four parallel outputs — Opportunity Areas (*where*), Design Principles (*how*), Archetypes (*who*), Value Propositions (*what*). Canonical composition, inputs, and the conditions on VPs and Archetypes: `../ladder-core/ladder-map.md` §L4 composition. Principles and Opportunity Areas are the pair that feed the L5 Framework; they answer different questions and serve different purposes.

| Level | Question answered | Form | Used as |
|-------|------------------|------|---------|
| **L3 Insight** | What is true about this organization's strategic situation? | Declarative truth claim | Knowledge base for L4 |
| **L4 OA** | Where should the organization act? | HMW design frame + scope | Design territory framing |
| **L4 Principle** | How should the organization act, in every decision? | Short active statement + five sections | Standing decision filter |
| **L5 Framework** | What is the organizing structure across all findings? | Strategic framework | Strategy document |

## Two Approaches to Principles — Choose Based on Project Type

This skill derives **standing behavioral decision rules**: short active titles with named failure modes and specific test questions in quotation marks. Best suited for **brand strategy, organizational strategy, and experience investment** — contexts where principles govern how an organization acts across every decision, not what it builds.

For **product design, service design, and experience design** contexts, a different approach often fits better: **tiered evaluative qualities** (Foundational → Elevated → Aspirational) that answer "if done well, it would feel..." and span multiple Opportunity Areas. These principles govern what gets built and how good solutions should feel — not standing organizational commitments, but design evaluation criteria.

| Approach | Best for | Principle form | Output |
|----------|----------|----------------|--------|
| **This skill (l4-design-principle-synthesis)** | Brand / organizational strategy | Standing behavioral rule — short active title + test question + failure mode | Decision filter set with named failure modes |
| **Tiered evaluative qualities** | Product / service / experience design | Tiered evaluative quality — "If done well, it would feel..." | Foundational / Elevated / Aspirational set |

If you're working on a product or service design engagement where principles will govern solution evaluation rather than organizational behavior, use the tiered-evaluative approach instead: generate principles as "If done well, it would feel..." statements, organized as Foundational / Elevated / Aspirational tiers spanning the relevant Opportunity Areas.

---

Principles are not strategies. They don't name specific programs or investments. They are the standing rules that govern how the brand behaves — the commitments that, if honored consistently, produce the outcomes the Opportunity Areas describe. They are most useful as decision filters: when facing any choice about product, marketing, community, partnership, or communication, each principle should yield a clear directional answer.

**The five-part principle structure:**

1. **The principle** — short, plain, active statement (usually 4–10 words; begins with an imperative verb; understood on first read by a reader with no project context; written last, after the other parts)
2. **What it means** — full articulation of what the principle demands and why it demands it
3. **Why it comes from the research** — the specific L1 evidence that makes the principle non-negotiable
4. **How to apply it** — the decision filter in practice: what questions to ask, what this governs
5. **What it prevents** — the specific responsibility-escape route this principle closes: *moving* (deferring to client preference or prescribed method), *hiding* (distributing accountability so no one owns it), or *removing* (claiming data, market forces, or inevitability made the decision). Name the escape route, not just a generic failure mode.

**Compression at L4 Principles:**

Multiple L3 insights that demand the same standing rule collapse into one principle. One principle can govern multiple insights, and one insight can contribute to multiple principles. The compression is typically 1.5–2 insights per principle — similar to Opportunity Areas. The same insight may appear in both an OA and a principle, addressed from different angles.

The synthesis machinery is domain-agnostic; only the "Governs" decision-domain vocabulary and the decision types each principle's filter operates on are parameterized by project type. The domain (brand/design, product/UX, organizational, policy/advocacy, or other) is inherited from the L3 Insights frontmatter, confirmed at the start, and selects the vocabulary via `DomainScope.md`. The confirmed domain is carried into the L4 output frontmatter.

See `PrincipleFormat.md` for exact output format, principle title discipline, decision filter quality test, and volume calibration. See `DomainScope.md` for the "Governs" vocabulary and decision types per project type.

---

> **Client comments stay out of the research.** What a client says about a readout never enters or changes this skill's output. Rule: `../../ladder-core/ladder-map.md` → Client Comments Stay Out of the Research — CANONICAL.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **SynthesizePrinciples** | Synthesize L3 insights into L4 design principles, write principle files | `workflows/SynthesizePrinciples.md` |
| **WritePrinciple** | Craft a single principle from a named insight cluster | `workflows/WritePrinciple.md` |
| **AuditPrincipleSet** | Quality-check a completed principle set before delivery | `workflows/AuditPrincipleSet.md` |

---

## Relationship to abductive-reasoning

The L3→L4 Principles move — "given these insights, what standing behavioral rule do they demand?" — is an abductive leap. The principle is not read off the insight; it is inferred from it. The inference asks: if these insights are true, what is the simplest rule that, if honored consistently, would address the underlying need across every decision the organization faces?

When a principle's derivation from the research needs to be explicit — for internal alignment, client presentation, or future accountability — route to the **abductive-reasoning** skill's `ReasoningChain` workflow: document the inferential chain from specific L1 evidence (participant names, moments, quotes) through L3 insights to the standing rule, name the failure mode the principle guards against, and state what evidence would change the rule.

*Note: abductive-reasoning is a separate skill. If not installed, document the chain inline: list the L1 evidence → L3 insights → standing rule derivation, name the failure mode explicitly, and state what evidence would require revising the rule.*

**After synthesis:** before advancing, check whether the L4 sets constitute sufficient design direction: score them against tiered evaluation principles with observable proxies and a stated phase threshold (standing behavioral rules work directly as evaluation principles here).

---

## Based On

- After Kolko, *Exposing the Magic of Design* — problem finding, problem understanding and problem solving. The framing of design principles as standing rules that govern subsequent design decisions — the compressed form of the insight set's demand — is this skill's own construct, built on Kolko's synthesis positioning rather than stated by him
- Kolko, *Abductive Thinking and Sensemaking* (*Design Issues*, 2010) — Forging connections as the generative act; the principle as the rule that emerges from holding multiple connections simultaneously
- Chipchase, *Hidden in Plain Sight* — Research as gift: principles are the primary mechanism for honoring the research-to-action obligation; the principle converts the gift of participant access into a standing organizational commitment; essence thinking applied at scale (what is the irreducible behavioral rule?)
- Chipchase trust ecosystem — Principles that govern experience, community, and inclusion can be read as commitments to specific trust dimensions (reliability, recourse, authenticity) rendered as standing organizational rules
- Nelson & Stolterman, *The Design Way* (2nd ed., 2012) — Design principles as the organization's *guarantor-of-design* made institutional: the designer's character rendered codeable. The g.o.d. chapter identifies three routes by which designers escape responsibility — *moving* it (deferring to client or method), *hiding* it (distributing so no one owns it), *removing* it (claiming data or market forces decided). A well-written principle closes one of these routes explicitly. This is the theoretical basis for the "What it prevents" section.

---

## Examples

**Example 1: Full L3→L4 Principles synthesis pass**
```
User: "Synthesize the L3 insights into design principles"
→ Invokes SynthesizePrinciples workflow
→ Reads all L3 insight files
→ Builds insight inventory
→ Identifies which insights demand the same standing behavioral rule
→ Writes five-part principle for each cluster, in plain words
→ Writes principle titles last (short, active, plain)
→ Names the failure mode each principle guards against
→ Writes system narrative showing how principles work together
→ Writes individual P-NN files and master L4_Principles document
```

**Example 2: Single principle from a named insight**
```
User: "The dealer insights demand a standing rule about experience design — write the principle"
→ Invokes WritePrinciple workflow
→ Identifies that L3-02 (dealer as experience designer) and L3-04 (relationship infrastructure) demand the same rule
→ Writes the principle: "Buyers judge the brand by how the dealer treats them. Plan and check the dealer visit with the same care the brand gives the product."
→ Re-grounds in L1 evidence: Karl, Sam Jansen, Sara Nadia
→ Writes the title last: "Design what buyers experience at the dealer"
→ Returns P-NN formatted for immediate use
```

**Example 3: Quality check before delivery**
```
User: "Check the principle set before we present"
→ Invokes AuditPrincipleSet workflow
→ Runs the first read (advisory), then checks title quality, decision filter clarity, failure mode specificity, insight coverage
→ Returns audit with flags and recommended rewrites
→ Issues "Cleared for L5" verdict
```
