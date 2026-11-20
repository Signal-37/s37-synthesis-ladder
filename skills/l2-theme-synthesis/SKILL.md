---
name: l2-theme-synthesis
description: Synthesizes L1 Findings into L2 Themes — cross-participant behavioral patterns. USE WHEN identifying patterns across interviews or moving L1 findings to L2.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
---

# l2-theme-synthesis

Synthesizes L1 Findings into L2 Themes using abductive reasoning: the deliberate manipulation, organization, and connection of research data to produce knowledge that was not present in any individual finding.

**Where this sits in the synthesis funnel:**

```
[L1 Findings] → [this skill] → [L2 Themes] → [L3 Insights] → [L4 OA + Principles] → [L5 Framework]
```

L2 Themes are cross-participant behavioral patterns. They are not summary categories — they are abductive claims: posited explanations for *why* findings from different people connect to the same underlying truth. A theme requires independent evidence from 3+ participants; below that threshold it is a hypothesis, not a theme. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`.

The synthesis acts that produce a theme (Kolko):
1. **Prioritizing** — deciding which findings carry more structural weight
2. **Judging** — passing findings through a relevance sieve relative to the question
3. **Forging connections** — naming WHY findings relate, introducing new knowledge not in any single finding

The naming step is where abduction happens. A theme name is not a label ("Trust") — it is a behavioral claim ("Loyal customers cannot articulate their brand attachment — loyalty is embodied, not reasoned"). The claim introduces new meaning not present in individual findings.

The synthesis machinery is domain-agnostic; only the **Implication** layer is parameterized by project type. The domain (brand/design, product/UX, organizational, policy/advocacy, or other) is inherited from the L1 Findings frontmatter, confirmed at the start, and sets the decision-maker the Implication addresses via `DomainScope.md`. The confirmed domain is carried into the L2 output frontmatter so it propagates to L3.

See `ThemeFormat.md` for the exact output format, the behavioral name test, the abductive connection quality check, and volume guidance. See `DomainScope.md` for the Implication framing per project type.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ClusterFindings** | Organize L1 findings across multiple participants, group by behavioral theme, assess cross-participant strength before synthesis | `workflows/ClusterFindings.md` |
| **SynthesizeThemes** | Synthesize L1 findings into L2 themes, run cross-participant pattern analysis, write theme files | `workflows/SynthesizeThemes.md` |
| **WriteTheme** | Craft a single theme from a named cluster of findings | `workflows/WriteTheme.md` |
| **AuditThemeSet** | Quality-check a completed theme set before delivery | `workflows/AuditThemeSet.md` |

## Relationship to abductive-reasoning

The theme-naming step — forging a connection across participants and stating WHY their findings connect to the same underlying truth — is an abductive act. The theme name is not a label applied to grouped data; it is a hypothesis about what the grouped data means. A behavioral name like "Loyal customers cannot articulate their brand attachment — loyalty is embodied, not reasoned" introduces knowledge not present in any individual finding.

When `SynthesizeThemes` is stuck — the behavioral name won't crystallize, or two plausible names feel equally valid — route to the **abductive-reasoning** skill's `ObservationToHypothesis` workflow: treat the cluster as the surprising observation, generate 3 candidate explanations for what connects these findings, evaluate each for explanatory power, and select the leading hypothesis as the theme name.

*Note: abductive-reasoning is a separate skill. If not installed, apply the same logic inline: list 3 candidate explanations for what connects the cluster's findings, evaluate each for mechanism specificity and falsifiability, and select the leading hypothesis as the theme name.*

---

## Based On

- After Kolko, *Exposing the Magic of Design* — affinity diagramming, three synthesis acts, abductive reasoning
- Kolko, *Abductive Thinking and Sensemaking* (*Design Issues*, 2010) — Abduction as the logic of what might be; forging connections as the generative act
- Chipchase, *Hidden in Plain Sight* — Range of distribution; defamiliarization; workarounds as structural failure signals; centers of gravity; essence thinking

## Examples

**Example 1: Cluster findings before synthesis**
```
User: "I have 60 findings from 5 interviews — cluster them before we synthesize"
→ Invokes ClusterFindings workflow
→ Assembles all L1 findings with participant IDs and segment tags
→ Groups by behavioral theme (bottom-up, not pre-categorized)
→ Assesses cross-participant strength; flags outliers
→ Returns cluster map with abductive questions, ready for SynthesizeThemes
```

**Example 2: Full L1→L2 synthesis pass**
```
User: "Synthesize all the L1 findings into L2 themes"
→ Invokes SynthesizeThemes workflow
→ Reads all L1 files, builds cross-participant inventory
→ Identifies behavioral patterns appearing in 3+ independent participants
→ Names each theme as a behavioral claim, not a label
→ Writes individual L2-NN files and master L2_Themes document
```

**Example 3: Single theme from a named cluster**
```
User: "I've identified a cluster around shop trust — write the theme"
→ Invokes WriteTheme workflow
→ Forges the abductive connection across provided findings
→ Returns a formatted T2 theme with behavioral pattern, abductive connection, evidence, implication
```

**Example 4: Quality check before delivery**
```
User: "Check the theme set before we present"
→ Invokes AuditThemeSet workflow
→ Checks coverage, overlap, abductive quality, outliers, cross-theme relationships
→ Returns audit with flags and recommended changes
```
