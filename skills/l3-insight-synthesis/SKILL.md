---
name: l3-insight-synthesis
description: Synthesizes L2 Themes into L3 Insights via Kolko's Observation + Knowledge = Insight formula. USE WHEN writing insights or moving from L2 to L3.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
---

# l3-insight-synthesis

Synthesizes L2 Themes into L3 Insights using Kolko's insight combination formula:

**Observation** (what the research shows) + **Knowledge** (what the synthesist knows about how these systems work) = **Insight** (a new declarative claim about what is true and what it means)

**Where this sits in the synthesis funnel:**

```
[L2 Themes] → [this skill] → [L3 Insights] → [L4 OA + Principles] → [L5 Framework]
```

L3 Insights are more generalized than L2 Themes and less specific than L4 Opportunity Areas. They are the bridge — the place where behavioral patterns become strategic knowledge. An insight is stated as a declarative truth, not as a question or recommendation. It claims something about the world that carries design and strategy implications.

The critical operation at L3 is **knowledge injection**: the synthesist brings cross-domain knowledge to interpret what the behavioral patterns mean. Without this injection, L3 is just a restatement of L2. With it, the synthesis produces something that wasn't in the data. The *act* of injection is identical across domains, but the *body of knowledge* injected is domain-specific — brand strategy and service design for brand/design; Norman's gulfs and cognitive load for product/UX; org behavior and change management for organizational; behavioral public policy for policy/advocacy. The domain is inherited from the L2 Themes frontmatter, confirmed at the start, and selects the Knowledge-source menu via `DomainScope.md`. Injecting the wrong body of knowledge produces a confident insight aimed at the wrong decision-maker.

L3 also compresses: multiple L2 themes that share an underlying mechanism collapse into one insight. A 16-theme set typically produces 8–12 insights. The compression is how you know you're working at the right level of generalization.

See `InsightFormat.md` for the exact output format, the insight quality check, and volume calibration.

> **Client comments stay out of the research.** What a client says about a readout never enters or changes this skill's output. Rule: `../../ladder-core/ladder-map.md` → Client Comments Stay Out of the Research — CANONICAL.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **SynthesizeInsights** | Synthesize L2 themes into L3 insights, run theme clustering and knowledge injection, write insight files | `workflows/SynthesizeInsights.md` |
| **WriteInsight** | Craft a single insight from a theme cluster and a knowledge layer | `workflows/WriteInsight.md` |
| **AuditInsightSet** | Quality-check a completed insight set before delivery | `workflows/AuditInsightSet.md` |

## Relationship to abductive-reasoning

The knowledge injection step — pairing a research observation with cross-domain knowledge to produce an insight — is the primary abductive act at L3. It is Kolko's operationalization of Peirce's abduction: Observation (L2 Theme) + Background Knowledge (synthesist's domain expertise) → Best Explanation (L3 Insight).

When this pairing is stuck (the connection doesn't feel justified, or the claim is contested), route to the **abductive-reasoning** skill's `ObservationToHypothesis` workflow: generate 3 candidate explanations, evaluate each for explanatory power and parsimony, and select the leading hypothesis. The workflow also enforces the `[HYPOTHESIS — requires investigation]` label discipline required when presenting abductive inferences to clients.

*Note: abductive-reasoning is a separate skill. If not installed, apply the logic inline: generate 3 candidate explanations for the Observation + Knowledge pairing, evaluate each for specificity and falsifiability, and select the leading hypothesis as the insight claim. Either way, the insight records how it is exposed to the evidence in its **What would change this** section (counter-cases, rival reading, what would make us revise it), written at claim formation; a ReasoningChain's rejected candidates supply the rival — `InsightFormat.md` → The What Would Change This Field.*

---

## Based On

- After Kolko, *Exposing the Magic of Design* — insight combination. The ladder adapts the card colors: in Kolko's original, yellow = the whole insight (observation + knowledge), blue = an established design pattern, green = a new design idea from pairing them; the ladder repurposes yellow/blue/green as observation/knowledge/insight for L3 formation
- Kolko, *Abductive Thinking and Sensemaking* (*Design Issues*, 2010) — Abduction as the logic of what might be; the insight as the product of pairing observation with knowledge
- Chipchase, *Hidden in Plain Sight* — Essence thinking; trust ecosystem; proximate literacy; platzgeist as organizational constraint; the research-to-action gap
- Nelson & Stolterman, *The Design Way* (2nd ed., 2012) — The real+true+ideal compound, applied through the ladder's card mapping: observation = the real; knowledge = the true; insight = the move toward the ideal. The knowledge injection step is the point where design inquiry leaves the descriptive and enters the prescriptive.

## Examples

**Example 1: Full L2→L3 synthesis pass**
```
User: "Synthesize the L2 themes into L3 insights"
→ Invokes SynthesizeInsights workflow
→ Reads all L2 theme files
→ Clusters themes by shared mechanism
→ Injects cross-domain knowledge for each cluster
→ Writes declarative insight claims
→ Writes individual L3-NN files and master L3_Insights document
```

**Example 2: Single insight from a named cluster**
```
User: "The dealer themes together point at a service design problem — write the insight"
→ Invokes WriteInsight workflow
→ Combines L2-02 and L2-07 as the observation
→ Injects service design knowledge (frontline worker as brand)
→ Writes the title last, as a plain statement
→ Returns L3-02: "Buyers judge the brand by how the dealer treats them, and the brand does not design or check that experience."
```

**Example 3: Quality check before delivery**
```
User: "Check the insight set before we present"
→ Invokes AuditInsightSet workflow
→ Runs a first read by a reader with no project context, then checks knowledge layer quality, compression ratio, declarative form, theme coverage
→ Returns audit with flags and recommended changes
```
