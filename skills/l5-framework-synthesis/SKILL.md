---
name: l5-framework-synthesis
description: Integrates L4 Opportunity Areas and Principles into an L5 Strategic Framework. USE WHEN closing the synthesis ladder or writing the framework.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
---

# l5-framework-synthesis

Integrates L4 Opportunity Areas and L4 Design Principles into the final synthesis level: a strategic framework with named domains, a systems diagram, and three practical uses.

**Where this sits in the synthesis funnel:**

```
[L3 Insights] → [L4 OAs + L4 Principles] → [this skill] → [L5 Framework]
               [L4 VPs] ─────────────────────────────────→ validation only
               [L4 Archetypes] ──────────────────────────┄→ optional reading lens
```

L4 Value Propositions are parallel artifacts — not synthesis inputs to the framework, but coherence checks on it. L4 Archetypes are neither: they are an optional lens the finished framework *can* be read through. See **The role of L4 Value Propositions at L5** and **The role of L4 Archetypes at L5** below.

**What L5 does differently from every level below it:**

Every prior level synthesizes by compressing: multiple findings collapse into one theme, multiple themes into one insight, multiple insights into one opportunity area or principle. L5 does something different — it integrates. It takes the L4 outputs (already compressed and crystallized) and builds the architecture that holds them together as a system.

| Level | Synthesis act | Output form |
|-------|--------------|-------------|
| L2 | Compress findings into patterns | Theme set |
| L3 | Compress themes into insight claims | Insight set |
| L4 | Compress insights into OAs, Principles, Value Propositions; derive Archetypes from L2 | OA set + Principle set + VP set + Archetype set (parallel) |
| **L5** | **Integrate OAs and Principles into architecture; validate against VPs** | **Named framework with domains, diagram, three uses** |

A framework is not a summary. A document that lists the OAs and Principles organized by domain is an L4 summary — not an L5 framework. The L5 synthesis act requires:
1. **Pairing** — which Principle(s) govern which OA territory? (requires judgment, not mapping)
2. **Naming** — what is the integrated domain called? (not the OA title; a new name for the combined territory)
3. **Sequencing** — which domain is the precondition? which is the engine? which converts? which scales?
4. **Framing** — what is the strategic premise? what starting condition does the framework address?
5. **Specifying uses** — how is this framework used as a brief, decision filter, and measurement frame?

**What the framework is for:** The framework holds the whole synthesis ladder together, and it is itself the reader's way into the ideas at L4 and below. Those are one job, not two (the researcher, 2026-11-10). When a reader or reviewer asks for an easier way in, improve the framework: names on the diagram, plain role labels, a table that says where to look in L4. Do not build a separate "on-ramp" document beside it. A short form of the framework (a brief, a one-pager, a slide) is the same framework in fewer words, with the same wording for anything it keeps, and it is named as the framework in brief.

**The role of L4 Value Propositions at L5:**

OAs and Principles ask organizational questions — *where* to act and *how* to always act. VPs ask customer-facing questions — *what to offer*, for *whom*, for *what job*. These are different levels of abstraction. The pairing act (OA + Principle → Domain) is unchanged by the VP layer: the framework's domain structure would be architecturally identical whether or not the VP layer exists.

VPs serve a **validation role** at L5: once each domain's strategic task is written, check whether the domain creates conditions for its corresponding VP's Products & Services to exist. Each VP is the offering hypothesis for one OA — so there is one VP per domain, a built-in coherence test. If a domain's strategic task doesn't serve the job in its corresponding VP, the pairing or the task statement may be incoherent. This check happens after all domains are written, in Step 6.5 of the SynthesizeFramework workflow.

**The role of L4 Archetypes at L5:**

**The framework stands without them.** Archetypes are neither a synthesis input (like OAs and Principles) nor a coherence check (like VPs). They are a **lens the framework *can* be read through** — optional, never required to produce or validate it. A project may never produce archetypes, or may produce only proto-archetypes; neither blocks L5.

Where OAs say *where* to act and Principles say *how*, Archetypes say *who*. Reading a completed framework through an archetype asks: *for this behavioral mode, which domains bite hardest, and which principles govern the decisions they will actually face?* That is an interrogation of a finished framework, not a step in building one.

Three consequences, stated so no one wires this the wrong way:
- **Archetypes never gate this skill.** Run L5 whether or not they exist.
- **Domains are never synthesized from archetypes.** Domains come from pairing OAs with governing Principles. An archetype that appears to reshape a domain is a signal the domain was drawn around a customer type rather than a design territory — reopen the pairing; do not encode the archetype.
- **Never re-run L5 per archetype.** One framework, read through several lenses.

If archetypes exist, record which lenses the framework was read through and what each surfaced. That record sits beside the framework, not inside its structure.

**The domain structure:**

Each framework domain pairs one design territory (OA) with one or more governing principles (P). The pairing is the core synthesis act at L5. Each domain has:
- A short plain name (not the OA title), understood on first read without explanation, written after the domain's content
- A one-line domain descriptor: a plain statement of what the domain is for, not a slogan
- The paired OA and Principle(s)
- The strategic task in this domain
- What this domain governs (specific deliverables and programs)
- Its role in the system (precondition / engine / converter / scale condition) and why

The integration machinery is domain-agnostic; only the systems-logic role register and the closing-question / framework-name register are parameterized by project type. The domain (brand/design, product/UX, organizational, policy/advocacy, or other) is inherited from the L4 OA and Principle frontmatter, confirmed at the start, and selects the role vocabulary via `DomainScope.md` — matching the register the OAs used in the L4 relationship map. The confirmed domain is carried into the L5 framework and visual frontmatter, completing the L1→L5 propagation chain.

Every statement a reader sees, and every name, follows `FrameworkFormat.md` → Plain Writing (statements and names): the L3 plain-statement rules unchanged, with names kept short but understood on first read (the researcher, 2026-11-07).

See `FrameworkFormat.md` for exact output format, domain naming discipline, pairing logic, and visual document format. See `DomainScope.md` for the role register and closing-question register per project type.

## Two Approaches to Framework — Choose Based on Project Type

This skill asks: **how do OAs and Principles pair into named domains?** It produces a strategic premise, named domains (each pairing one OA with one or more Principles), a sequenced systems architecture, a Mermaid diagram, and three practical uses (strategy brief / decision filter / measurement frame). Best suited for **brand strategy and organizational strategy** — contexts where the framework is a strategic architecture that guides investment, program design, and organizational behavior.

For **product design, service design, and experience design** contexts, a different approach often fits better: it asks **what structural form fits the data?** Generate 2–3 candidate organizing logics (hierarchy, spectrum, matrix, cycle, hub-and-spoke, ecosystem), test each against the L4 outputs for fit, and apply the generativity test — does the candidate framework answer novel design questions it wasn't built to answer? The structural form is discovered, not assumed.

| Approach | Best for | Central question | Output |
|----------|----------|-----------------|--------|
| **This skill (l5-framework-synthesis)** | Brand / organizational strategy | How do OAs and Principles pair into named domains? | Domain architecture with strategic premise + systems diagram + three practical uses |
| **Structural-form discovery** | Product / service / experience design | What structural form fits the data? | Named framework with candidate-tested organizing logic + generativity test |

If you're working on a product or service design engagement where the framework will be a generative design model rather than a strategic architecture, use structural-form discovery instead of the domain pairing.

---

> **Client comments stay out of the research.** What a client says about a readout never enters or changes this skill's output. Rule: `../../ladder-core/ladder-map.md` → Client Comments Stay Out of the Research — CANONICAL.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **SynthesizeFramework** | Integrate L4 outputs into a full L5 framework | `workflows/SynthesizeFramework.md` |
| **BuildDomain** | Construct a single framework domain from a named OA-Principle pair | `workflows/BuildDomain.md` |
| **AuditFramework** | Quality-check a completed framework before delivery | `workflows/AuditFramework.md` |
| **FinalLadderReview** | End-to-end two-reviewer adversarial audit of the L2–L5 ladder; run after AuditFramework clears, before delivery | `workflows/FinalLadderReview.md` |

---

## Relationship to abductive-reasoning

The L4→L5 integration move — "what organizing logic explains how these domains belong together as a system?" — is the largest abductive leap in the ladder. The framework name is not derived from the OAs and Principles; it is abducted from the relationship between them. This is why a list of OAs and Principles organized by domain is an L4 summary, not an L5 framework: the naming and sequencing introduce knowledge that wasn't in the L4 outputs.

Two **abductive-reasoning** workflows are relevant:

- `ReasoningChain` — documents the full inferential chain from research data to framework architecture; use when the organizing logic needs to be client-defensible or when the pairing decisions will be challenged
- `KnowledgeFunnelMapping` — locates the framework on Roger Martin's Mystery→Heuristic→Algorithm continuum; use when the client needs to understand what the framework can determine (heuristic-level guidance) vs. what remains open (mystery-level questions the framework raises but cannot resolve)

*Note: abductive-reasoning is a separate skill. If not installed:*
*— For ReasoningChain: document the inferential chain inline — L1 evidence → L3 insights → pairing decisions → domain architecture; name competing organizing logics considered; state what evidence would falsify the framing — and carry the competing logics into each domain's **What would change this** section as its rival reading (a recorded field per `FrameworkFormat.md`; written at claim formation otherwise).*
*— For KnowledgeFunnelMapping: apply Martin's framework inline — for each domain, identify whether it provides heuristic-level guidance (testable decision filters) or raises mystery-level questions the framework cannot yet resolve.*

---

## After Synthesis — Sufficiency Evaluation

When the framework is complete (and FinalLadderReview has cleared), check sufficiency before calling the research done: score the L4/L5 outputs against tiered evaluation principles with observable proxies, before/after states and a stated phase threshold. That determines whether the OAs, Principles, and Framework constitute sufficient design direction, and gives a "keep going" recommendation evidential grounding when the problem has no natural stopping rule.

---

## Based On

- Kolko, *Exposing the Magic of Design*, Ch. 4 — The three stages of design work: problem finding / problem understanding / problem solving; the framework is what makes the synthesis usable for problem solving; Kolko's ecosystem mapping (forced semantic zoom) as the theoretical precursor to domain-level systems thinking
- Kolko, *Abductive Thinking and Sensemaking* (*Design Issues*, 2010) — Forging connections as the primary synthesis act; the framework is the product of holding all connections simultaneously and naming the architecture they reveal; "it is the idea of putting together what we had never before dreamed of putting together"
- Chipchase, *Hidden in Plain Sight* — Research as gift: the framework is the primary mechanism by which research access is converted into durable organizational change; the activation frame (this ladder's construct: what the organization must build, not invent) is the research-to-action obligation made explicit; platzgeist governs domain sequencing — what is achievable first, given what the organization is
- Kolko, Concept Mapping — The framework domain is a concept map compressed to its essentials: entity (the domain), relationship (the pairing), direction (the systems logic)
- Nelson & Stolterman, *The Design Way* (2nd ed., 2012) — The framework as *ultimate particular*: a designed thing, not a discovered truth. The L4→L5 move is a descent from universals to a specific designed architecture — the inverse of scientific inquiry. Quality test for the completed framework: the four designed-whole criteria — *adequate* (as complex as needed, not comprehensive), *essential* (all necessary domains present, nothing extraneous), *emergent* (new strategic logic arises from the composition that wasn't in any individual OA or Principle), and *vital* (the framework gives organizational energy rather than constraining it). "Adequate" is the hardest call: the right architecture for real constraints, not the most thorough one possible.

---

## Examples

**Example 1: Full L4→L5 synthesis pass**
```
User: "Build the framework from the L4 outputs"
→ Invokes SynthesizeFramework workflow
→ Reads all L4 OA files and all L4 Principle files
→ If available, reads L4 VP files (for validation use, not pairing)
→ Builds paired inventory: which principles govern which OA territory?
→ Names each domain (integrated territory name, not OA title)
→ Writes the strategic premise (starting condition + strategic task)
→ Writes each domain (four sections)
→ Runs VP coherence check: does each domain's task create conditions for its corresponding VP?
→ Names the systems logic (sequence, hierarchy, feedback)
→ Writes three practical uses (brief / filter / metrics)
→ Names the brand/strategic question the framework answers
→ Writes the framework document and the visual (Mermaid)
→ Confirms output files
```

**Example 2: Single domain from a named pair**
```
User: "The dealer OA and the post-purchase OA both belong in the Experience domain — build that domain"
→ Invokes BuildDomain workflow
→ Takes OA-02 (relationship design) paired with P-03 (design the dealer) + P-04 (earn the relationship)
→ Names the domain: "Experience"
→ Descriptor: "Design the moments that matter"
→ Names the strategic task, what it governs (by phase), and its converter role in the system
→ Returns the domain section ready for inclusion in the master framework document
```

**Example 3: Quality check before delivery**
```
User: "Check the framework before we present"
→ Invokes AuditFramework workflow
→ Checks integration quality (is this a framework or an L4 summary?), domain naming, pairing logic, systems logic, three uses, visual accuracy
→ Returns audit with specific flags and rewrite recommendations
→ Issues "Synthesis complete" verdict
```

---

## Complementary: Structural-Form Discovery

This skill produces a **domain pairing architecture** — the structural form is always a sequenced domain system. Structural-form discovery (see Two Approaches above) takes a different approach: it discovers the structural form from a candidate table (hierarchy, spectrum, matrix, cycle, hub-and-spoke, ecosystem, reinforcing loop, balancing loop) and applies a generativity test.

The two approaches are **complementary, not competing.** Running both on the same L4 inputs surfaces different and mutually reinforcing knowledge:

- This skill (l5-framework-synthesis) answers: *What are the named organizational domains, and in what sequence does the work happen?*
- Structural-form discovery answers: *What is the dynamic logic — the structural form — that explains how the domains compound or leak?*

A domain pairing framework names what to build. A structural form framework names why it compounds. Together they give the client both the architecture and the engine.

**When to run both:**
- High-stakes brand or organizational strategy engagements where the framework will be stress-tested
- When the domain architecture produces a strong static picture but the team cannot articulate why the domains reinforce each other
- When the AuditFramework feedback loop test (Audit 4, Test 2) identifies a weak or absent feedback mechanism — structural-form discovery is specifically built to find it
- When the client needs both a delivery-ready strategic framework (this skill) and a diagnostic tool for evaluating future investment decisions (structural-form discovery's generativity test)

**Practical note on sequencing:** Run this skill first (domain architecture + Mermaid visual + three uses). Then run structural-form discovery on the same L4 inputs as a second structural read. The structural form finding either confirms the domain architecture's logic or surfaces a loop or tension that the domain architecture didn't make explicit. Integrate the findings into the delivery package rather than presenting two separate frameworks.
