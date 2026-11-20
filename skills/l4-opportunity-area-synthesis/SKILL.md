---
name: l4-opportunity-area-synthesis
description: Synthesizes L3 Insights into L4 Opportunity Areas (HMW). USE WHEN clustering insights into design territories or writing HMW questions.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
---

# l4-opportunity-area-synthesis

Synthesizes L3 Insights into L4 Opportunity Areas: the designed spaces in which strategic solutions live. L4 is not solutions — it is the precisely framed territory that makes good solutions possible.

**Where this sits in the synthesis funnel:**

```
[L2 Themes] → [L3 Insights] → [this skill] → [L4 Opportunity Areas] → [L5 Framework]
```

**The critical move at L4:**

L3 Insights declare what is true. L4 Opportunity Areas ask what to do about it.

| Level | Form | Example |
|-------|------|---------|
| **L3 Insight** | Plain statement of what the pattern means | "Buyers judge the brand by how the dealer treats them, and the brand does not design or check that experience." |
| **L4 Opportunity Area** | Designed territory for strategic action, framed as HMW | "How might we plan the customer's whole relationship with the brand, from the first dealer visit through years of ownership, when today each dealer and channel handles its own part?" |
| **L5 Framework** | Design principles and strategic direction | "Principle: Plan for the whole relationship, not only the sale" |

This is one of four parallel L4 outputs (see `../ladder-core/ladder-map.md` §L4 composition for the canonical list and the conditions attaching to each) — alongside l4-archetype-synthesis (*who* it designs for), l4-design-principle-synthesis (*how* the organization acts in every decision) and l4-value-proposition-synthesis (*what* it could offer). Principles and Value Propositions synthesize from the same L3 Insight set; Archetypes derive from L2 Themes (L3 as coherence check). All feed L5, and Value Propositions carry a target-customer gate. Run the tracks the engagement warrants.

L4 is the place where the synthesis becomes actionable without becoming prescriptive. The HMW question is open enough to accommodate multiple solutions — it does not specify what to build. But it is specific enough to exclude what does not belong. The "What's in scope" section names intervention types; it does not name deliverables. The "What's not in scope" section is as important as scope — it prevents the OA from collapsing into a different OA or absorbing decisions that belong elsewhere.

**The seven-part OA structure:**

1. **The HMW question** — the design challenge, in one plain question, written after Why this matters (`OAFormat.md` → The HMW Question Test; every section follows Plain Writing in the Body)
2. **Why this matters** — the L3 claims driving this territory, re-grounded in specific L1 evidence (names, moments, quotes)
3. **What's in scope** — intervention types organized by phase or domain
4. **What's not in scope** — adjacent territory explicitly excluded
5. **Success horizon** — 2–3 directional signals that would tell you this territory is proving itself; not KPIs or metric targets, but observable behavioral or experiential shifts; stated as a direction without a number, in plain words, so they open possibility rather than constrain it
6. **Assumptions** — unvalidated organizational or structural conditions the OA depends on (platzgeist gaps not surfaced in research)
7. **Source insights** — the L3 claims this OA is built on

**Compression at L4:**

Multiple L3 insights that point at the same structural gap from different angles collapse into one OA. The compression is usually more aggressive than at L3: 2–3 insights per OA is typical. An insight that stands alone with no structural connection to others may become its own OA — but first ask whether it belongs more naturally inside an existing OA.

The synthesis machinery is domain-agnostic; only the "Governs" domain vocabulary and the relationship-map role names are parameterized by project type. The domain (brand/design, product/UX, organizational, policy/advocacy, or other) is inherited from the L3 Insights frontmatter, confirmed at the start, and selects the vocabulary via `DomainScope.md`. The confirmed domain is carried into the L4 output frontmatter.

See `OAFormat.md` for exact output format, HMW quality tests, scope discipline, and volume calibration. See `DomainScope.md` for the "Governs" vocabulary and role register per project type.

---

> **Client comments stay out of the research.** What a client says about a readout never enters or changes this skill's output. Rule: `../../ladder-core/ladder-map.md` → Client Comments Stay Out of the Research — CANONICAL.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **SynthesizeOpportunityAreas** | Synthesize L3 insights into L4 OAs, cluster insights into design territories, write OA files | `workflows/SynthesizeOpportunityAreas.md` |
| **WriteOpportunityArea** | Craft a single OA from a named insight cluster | `workflows/WriteOpportunityArea.md` |
| **AuditOpportunityAreaSet** | Quality-check a completed OA set before delivery | `workflows/AuditOpportunityAreaSet.md` |

---

## Relationship to abductive-reasoning

The L3→L4 move — "given this meaning, what design territory opens up?" — is an abductive leap. The insight declares what is true; the OA infers what to do about it. This inference is not mechanical — two synthesists working from the same insight set will identify different territories depending on what background knowledge they bring.

When the derivation from L3 insights is contested or the OA needs to be client-defensible, route to the **abductive-reasoning** skill's `ReasoningChain` workflow: document the inferential chain from specific L1 evidence through L3 insights to the design territory, state the competing territories considered and why they were set aside, and name the conditions that would falsify this framing.

*Note: abductive-reasoning is a separate skill. If not installed, document the chain inline: list the L1 evidence → L3 insights → design territory derivation, name competing territories considered, and state what evidence would falsify the framing.*

**After synthesis:** before advancing, check whether the L4 sets constitute sufficient design direction: score them against tiered evaluation principles with observable proxies and a stated phase threshold.

---

## Based On

- Kolko, *Exposing the Magic of Design*, Ch. 4 — Problem finding / Problem understanding / Problem solving; design synthesis as the middle step; the three synthesis acts (Prioritizing, Judging, Forging connections)
- Kolko, *Abductive Thinking and Sensemaking* (*Design Issues*, 2010) — Abduction as the logic of what might be; forging connections as the primary generative act; sensemaking through externalization
- Chipchase, *Hidden in Plain Sight* — Platzgeist as organizational context governing which insights are actionable; centers of gravity for understanding OA dependencies and sequencing; research as gift (the obligation to close the loop from research to action)
- "How Might We" — popularized by IDEO/design thinking (originated with Parnes/Basadur `[model knowledge — verify]`) — a method for framing design problems at the right level of specificity: open enough for ideation, specific enough to stay grounded
- Nelson & Stolterman, *The Design Way* (2nd ed., 2012) — The *parti* as the organizing seed image that should crystallize from insight saturation before territories are clustered (applied as Step 3 in SynthesizeOpportunityAreas); L4 OAs as *ultimate particulars* — designed things produced by compositional judgment, not discovered truths produced by scientific inference; desiderata orientation: the best HMW questions frame toward what is desired, not what is broken.

---

## Examples

**Example 1: Full L3→L4 synthesis pass**
```
User: "Synthesize the L3 insights into opportunity areas"
→ Invokes SynthesizeOpportunityAreas workflow
→ Reads all L3 insight files
→ Builds insight inventory
→ Identifies structural clusters (shared design territory)
→ Applies platzgeist check (organizational actionability)
→ Writes each OA: Why this matters first, then the plain HMW question, scope, and the OA title last
→ Writes relationship map showing OA dependencies and sequencing
→ Writes individual OA-NN files and master L4_Opportunity_Areas document
```

**Example 2: Single OA from a named cluster**
```
User: "The dealer insights and the post-purchase insights point at the same problem — write the OA"
→ Invokes WriteOpportunityArea workflow
→ Combines L3-02 (dealer) and L3-04 (post-purchase) as the source cluster
→ Checks for additional insights that contribute (L3-06, L3-01)
→ Writes "Why this matters" re-grounding in specific L1 evidence
→ Frames HMW from it: "How might we plan the customer's whole relationship with the brand..."
→ Defines scope by phase (purchase / post-purchase)
→ Returns OA-02 formatted for immediate use
```

**Example 3: Quality check before delivery**
```
User: "Check the OA set before we present"
→ Invokes AuditOpportunityAreaSet workflow
→ Runs the first read (advisory), then checks HMW quality, scope definition, insight coverage, relationship map, platzgeist
→ Returns audit with flags and recommended changes
→ Issues "Cleared for L5" verdict
```
