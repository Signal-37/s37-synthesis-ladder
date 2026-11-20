# L4 Opportunity Area Format Reference

The exact output format for L4 Opportunity Area files and the master OA document, including the HMW quality test, scope discipline, relationship map format, and volume calibration.

**Contents** (a reader mid-task may only see this far — jump to the section named):
- Individual Opportunity Area File — the per-OA template (HMW question, why it matters, scope, success horizon, assumptions, source insights)
- Master Opportunity Areas Document · Summary Document — the collected forms and the relationship map
- File Naming Conventions
- **The HMW Question Test** (plain question; the HMW and the OA title are written after Why this matters) · Plain Writing in the Body · The "Governs" Domain Field · Scope Definition Discipline — the gates
- The Success Horizon · The Assumptions Field · The Relationship Map
- Volume Calibration — how many OAs to expect
- Theoretical Basis

---

## Individual Opportunity Area File

Each OA gets its own file. YAML frontmatter + five structured sections.

```
---
project: [Project Name]
opportunity_area_id: OA-[NN]
synthesis_level: L4
source_insights: [L3-NN, L3-NN, ...]
governs: <Strategic domain — drawn from the domain's "Governs" vocabulary in DomainScope.md>
synthesis_date: [YYYY-MM-DD]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L3 Insights>   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation
---

# OA-[NN]: [Opportunity area title]

## The HMW question
How might we [verb phrase naming the design challenge] [what makes it hard, in plain words]?   # written after Why this matters; see The HMW Question Test

## Why this matters
<The L3 insight claims driving this territory, stated as the structural argument. 3–6 sentences. Cite insight IDs in bold. Then re-ground the argument in specific L1 evidence — name participants, cite findings, quote specific moments. The paragraph should move from structural claim (L3) to concrete evidence (L1) to demonstrate that the territory is real, not theoretical. Written in plain words: see Plain Writing in the Body.>

## What's in scope
[Organized by phase or domain if applicable. Each item: "A [noun] [noun]: [description including what it is and why it belongs here]." Items name intervention types, not specific deliverables. 4–10 items.]

## What's not in scope
[Adjacent territory that is explicitly excluded. Each item: "[Name of excluded territory]: <one-phrase reason — different OA, commercial decision, different team, etc.>" 2–5 items. This section is not optional — every OA has adjacent territory that does not belong here.]

## Success horizon
<2–3 observable signals that would tell you this territory is proving itself. These are directional, not prescriptive — they name a type of change, not a measured outcome. Write them as "we'd know we moved the needle if..." statements. See the Success Horizon guidance below for the full quality test.>

## Assumptions
[2–4 organizational or structural conditions the OA depends on that the research did not validate. Each item: "We assume [condition] — [consequence if wrong]." See the Assumptions guidance below for what belongs here and what does not.]

## Source insights
- **[L3-NN]** — [Insight title]
- **[L3-NN]** — [Insight title]
[List all contributing L3 insights]
```

---

## Master Opportunity Areas Document

```
---
project: [Project Name]
synthesis_level: L4
document_type: Opportunity Areas
source: [L3_Insights_[ProjectName].md — N insights]
synthesis_date: [YYYY-MM-DD]
analyst: [Name or system]
felt_flags: [none-issued | "<report> — settles when <condition>"; semicolon-separate multiple]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L3 Insights>
---

# L4 Opportunity Areas — [Project Name]

---

## How to read this document

L4 Opportunity Areas are territories for design action. They emerge from L3 Insights and answer the question: given what we now know, where should the organization act, and in what direction?

Each opportunity area is framed as a "How might we..." question — open enough to generate multiple design concepts, specific enough to keep them grounded in the research. Opportunity areas are not solutions. They are the designed spaces in which solutions live.

[Brief statement of how many L3 insights collapsed into how many OAs, and the organizational logic for the collapse.]

Each area includes:
- **The HMW** — the design question
- **Why this matters** — the insight(s) driving it, re-grounded in research evidence
- **What's in scope** — the kinds of interventions that belong here
- **What's not** — adjacent territory that is out of scope for this area
- **Success horizon** — 2–3 directional signals; observable change types, not metric targets
- **Assumptions** — unvalidated organizational or structural conditions the OA depends on
- **Source insights** — the L3 claims this area is built on

---

## OA-01: [Opportunity area title]

**How might we** [HMW question body]?

### Why this matters

<Full narrative — L3 claims + L1 evidence. 3-6 sentences.>

### What's in scope

[Items with descriptions.]

### What's not in scope

[Items with reasons.]

### Success horizon

[2–3 directional signals. Observable change types, not metric targets.]

### Assumptions

[2–4 items. "We assume [condition] — [consequence if wrong]."]

### Source insights
- **[L3-NN]** — [Title]
...

---

## OA-02: [Opportunity area title]
...

---

## Summary: The [N] opportunity areas

| ID | Opportunity | L3 sources | Governs |
|---|---|---|---|
| OA-01 | [Title] | [L3-NN, L3-NN] | [Domain] |
...

### Reading the map

[Narrative of how the OAs relate as a system. Names dependencies: which OA is the precondition, which is the growth engine, which converts, which is the scale condition. 4–6 sentences, one per OA relationship.]

---

*[Project] L4 Opportunity Areas*
*Synthesized from [N] L3 Insights / [N] L2 Themes / [N] L1 Findings / [N] interviews*
*[Date]*
*Next synthesis level: L5 Design Principles + Framework*
```

---

## Summary Document

```
---
project: [Project Name]
document_type: L4 Opportunity Areas Summary
synthesis_date: [YYYY-MM-DD]
source: <L4_Opportunity_Areas document — N areas from N L3 insights>
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L3 Insights>
---

# L4 Opportunity Areas Summary — [Project Name]

## Opportunity areas by ID

| ID | How might we... | Source insights | Governs |
|---|---|---|---|
| OA-01 | [HMW condensed to one clause] | [L3-NN, L3-NN] | [Domain] |
...

---

## How the areas relate

<One paragraph per OA relationship. Names: precondition, engine, converter, scale condition — or equivalent structural roles for this project.>

---

## The system in one sentence

<A single sentence that names what all OAs together accomplish — from the precondition to the scale condition. Not a list. A claim about the system.>

---

*[Date]*
*Next synthesis level: L5 Design Principles*
```

---

## File Naming Conventions

**Individual OA files:**
```
OA-[NN]_[Short_Descriptive_Name].md
```
Examples: `OA-01_Community_Led_Growth_Architecture.md`, `OA-03_Brand_Identity_Occasion_Strategy.md`

**Master OA document:**
```
L4_Opportunity_Areas_[ProjectName].md
```

**OA ID numbering:**
- Sequential from OA-01
- Number by strategic importance (highest leverage first) or by the sequencing logic of the relationship map — choose one and be consistent

---

## The HMW Question Test

> **Reserved claim verbs:** *validated / confirmed / passed / from the customer's side* are reserved for externally-tested claims — research-derived claims use *attested / evidenced / saturated / hypothesis*. Canonical: `../ladder-core/ladder-map.md` → Reserved Claim Verbs.

An L4 HMW question frames a design territory — not a topic, not a solution.

| Form | Example | Problem |
|------|---------|---------|
| **Too broad** | "How might we improve the brand?" | Could mean anything; no design constraint |
| **Too narrow (solution)** | "How might we create a loyalty program?" | Already a solution; forecloses ideation |
| **Topic label** | "Brand Experience" | Not a question at all |
| **Right** | "How might we plan the customer's whole relationship with the brand, from the first dealer visit through years of ownership, when today each dealer and channel handles its own part?" | Open to multiple solutions; grounded in a specific structural problem; names what makes it hard in plain words |

**The tests, all required (the two-axis test plus the first read):**
1. *Open enough*: Would this HMW generate at least three genuinely different L5 solutions? If only one solution fits, the HMW is too narrow.
2. *Specific enough*: Does the HMW exclude at least some interventions that would be plausible without it? If everything fits, the HMW is too broad.
3. *First read:* Could a reader with no project context understand the question on first read, without stopping to work out what it means? If not, rewrite it, however accurate it is.

**Write the HMW after Why this matters.** Write the Why this matters evidence first, then ask what design challenge it sets, in plain words. A question written first and defended afterwards tends to carry the whole argument in one sentence.

**Plain-question rules (the researcher, 2026-11-05 to 2026-11-07; the L3 title rules in `../l3-insight-synthesis/InsightFormat.md` → The Insight Title Test, applied to the HMW):**
- **Literal words.** No figures of speech, no terms from the theory imported at L3, and no working vocabulary from the synthesis ("the arc", "the vacuum", "the moment of conviction"). The writing is not about the writer.
- **Name what makes it hard in plain words**, inside the question ("when…", "without…", "so that…"). It names the structural problem the evidence shows, and the research grounding lives in Why this matters, not in a packed clause.
- **One question, nothing after it (the researcher, 2026-11-07).** The HMW is a single question. Context that does not fit in a short clause inside it goes in Why this matters, not in a sentence after the question.
- **No dash form.** Do not build the question as "How might we [do X] — [frame] — [constraint]?"
- **One idea at a time.** A question carrying the challenge, the mechanism and the organizing frame at once is split, or its frame moves to Why this matters. There is no length cap.
- **An accuracy fix is a rewrite.** When a check finds a word too strong, rewrite the question from what the evidence says. Do not add another clause to it.

| Fault | Before | After |
|-------|--------|-------|
| Dash form | "How might we build the community — welcoming and visible — as the brand's growth engine?" | "How might we help existing riders bring new riders to the brand, and make those riders feel welcome when they arrive?" |
| Working vocabulary | "How might we close the post-purchase vacuum?" | "How might we stay in contact with customers after they buy, when today the brand hears from them only if something breaks?" |
| Figure of speech | "How might we turn the first ride into the whole case?" | "How might we make a rider's first ride on the product good enough that they come back for a second?" |

**The OA title.** The OA title is a plain statement, not a label (the researcher, 2026-11-07). It states what would be true for the people the organization serves once the opportunity is addressed. It is not what is true now (that is the L3 insight), not a question (that is the HMW), and not what the organization should do (that is a recommendation). Keep it to one sentence. A reader with no project context must understand it on first read: literal words, no figures of speech, no working vocabulary, under the same rules as the L3 titles (`../l3-insight-synthesis/InsightFormat.md` → The Insight Title Test). Write the title last, after the HMW and the scope.

| Fault | Before | After |
|-------|--------|-------|
| Label | "Contact after purchase" | "Buyers hear from the brand after the sale, not only before it." |
| Figure of speech | "The undesigned arc" | "Buyers hear from the brand after the sale, not only before it." |
| Label | "Price" | "Buyers can see why the price is what it is, next to the brands they already buy." |
| Recommendation | "The brand should publish its fit data" | "Buyers can check the fit before they order." |

Audit: `workflows/AuditOpportunityAreaSet.md` → Audit 2 and Audit 2b.

---

## Plain Writing in the Body

The plain-writing rules apply to every section a reader sees: Why this matters, What's in scope and What's not, Success horizon, Assumptions, the guiding image, the relationship map, the through-line and the system sentence (the researcher, 2026-11-07). They are the rules in `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body, held there; the ones a writer most needs at this level:
- **Literal words.** No figures of speech, no imported theory terms, no working vocabulary from the synthesis.
- **A limit gets its own sentence.** Do not attach it to the sentence it limits.
- **No working shorthand.** Write out what the synthesis team would understand from a short phrase.
- **Say whose reading it is, in a plain sentence.** Keep what participants said and did separate from what the synthesist infers, and do not repeat the same label as a formula.
- **State the L3 claims in their own plain words.** Why this matters restates each insight as the L3 states it. Do not paraphrase it into a stronger or broader claim than the insight makes.

| Fault | Before | After |
|-------|--------|-------|
| Figure of speech | "The dealer is where the brand's promise goes to die" | "Buyers judge the brand by how the dealer treats them, and the brand does not design or check that experience." |
| Working shorthand | "Owners-by-scope evidence only" | "We asked only owners about this, so the evidence comes only from owners." |
| Limit packed into the sentence | "Most riders, though fewer of the newer ones, hear about the brand from friends" | "Most riders hear about the brand from someone they ride with. Fewer of the newer riders do." |

Audit: `workflows/AuditOpportunityAreaSet.md` → Audit 2b and Audit 3.

---

## The "Governs" Domain Field

Every OA names the strategic domain it governs. This field enables cross-referencing when OAs are presented separately and helps clients understand the system at a glance. Choose from the **"Governs" vocabulary for the project's domain** in `DomainScope.md` (canonical source — the brand/design vocabulary is repeated below as a convenience reference; update DomainScope.md first):

- Growth strategy
- Customer experience and retention
- Brand positioning and communications
- Community design and activation
- Brand access and inclusion
- Product strategy
- Organizational capability

For product/UX, organizational, and policy/advocacy projects, draw from the matching vocabulary in `DomainScope.md` (e.g. "Process & workflow design" for organizational, "Access & eligibility" for policy/advocacy). An OA may govern more than one domain if its scope genuinely crosses two. Avoid assigning more than two — a genuinely multi-domain OA may need to be split.

---

## Scope Definition Discipline

"What's in scope" names intervention types — the kinds of programs, systems, and design tasks that belong in this territory. It does not name deliverables, vendors, or specific actions.

| Right (intervention type) | Wrong (deliverable) | Wrong (too abstract) |
|---------------------------|---------------------|----------------------|
| "A dealer narrative toolkit: the story of the brand in language dealers can use at retail" | "Hire an agency to produce a dealer training video" | "Improve dealer quality" |
| "A rider recognition program: acknowledging community leaders not by racing results but by longevity and visible passion" | "Create a loyalty points program" | "Build community" |
| "A community mapping framework: identifying where aspirational buyers concentrate and which group rides they inhabit" | "Buy a market research study" | "Understand the market better" |

**The specificity calibration:** Each scope item should be specific enough that a designer or strategist could scope an initial project from it, but not so specific that it prescribes the solution. Think: "This is the type of work" not "This is the exact project."

**"What's not in scope" is required.** The exclusions prevent scope creep and make the system legible. Every OA has adjacent territory that does not belong — either because it belongs to another OA, it's a commercial decision, it requires a different organizational capability, or it's L5 work rather than L4. Name these explicitly.

---

## The Success Horizon

The success horizon names the *direction of change* this OA is pointing toward — not what to build, not how to measure it, but what you would observe if the territory were proving itself.

**Why loose joints matter here.** L4 is the moment before concepting begins. Specifying metric targets at this stage — NPS deltas, retention percentages, adoption timelines — forecloses the creative territory the HMW is trying to open. The success horizon names a direction without a number, in plain words: it keeps the OA accountable to an outcome direction without prejudging which solution gets there or how fast.

**What belongs here:**
- Observable behavioral shifts: what customers, users, or stakeholders would *do differently*
- Experiential signals: what the relationship, interaction, or system would *feel like* from the inside
- Organizational capability signals: what the organization would be *able to do* that it cannot do now
- Cultural signals: what would change about how the organization *talks about* or *prioritizes* this territory

**What does not belong here:**
- Metric targets with numbers or percentages (those belong in L5 or project scoping)
- Timelines or milestones (premature at L4)
- Solution descriptions (those belong in L5)
- Outputs (features shipped, programs launched) — success horizon tracks outcomes, not outputs

**The two-direction test.** A well-written success horizon signal should:
1. *Open* — multiple different L5 solutions could plausibly generate this signal. If only one route gets there, the signal is too narrow and is secretly a solution preference.
2. *Direct* — the signal is specific enough to exclude some outcomes. If any L5 solution would satisfy it, the signal is too vague to be useful.

**Format:** 2–3 bullets. Lead with an observable subject ("Customers…", "The organization…", "Dealers…"). Past tense or conditional: "Customers describe the brand relationship, not just the product, when explaining why they stayed." No numbers, no timeframes.

| ❌ Too metric | ❌ Too solution | ✓ Right |
|---|---|---|
| "NPS increases 15 points in 18 months" | "We've launched a loyalty platform" | "Customers describe the brand relationship, not just the product quality, when explaining why they stayed" |
| "80% dealer retention year-over-year" | "Dealers complete certification program" | "Dealers feel equipped to tell the brand story, not just quote specs" |
| "Community grows to 50K members" | "Community app is live" | "The community activates itself around brand moments without requiring brand management" |

---

## The Assumptions Field

The assumptions field surfaces unvalidated organizational or structural conditions the OA depends on — the platzgeist gaps the research did not and could not resolve.

**What belongs here:** These are not empirical questions about what customers want (those were resolved in L1–L3). They are organizational and structural conditions:
- Capability assumptions: "We assume the organization can develop the internal competency to sustain this" — the research said the territory matters; whether the org can act there is a different question
- Commercial model assumptions: "We assume the commercial structure allows for [X]" — pricing, margin, channel, or partner constraints
- Structural dependencies: "We assume [partner / platform / team] exists or can be stood up" — external dependencies the OA requires
- Platzgeist constraints: "We assume leadership has the appetite to act on this despite [organizational headwind]"

**What does not belong here:**
- Customer behavior assumptions (those are L3 claims — if they're here, they should have been surfaced in research)
- Scope exclusions (those belong in "What's not in scope")
- Empirical research questions that could have been answered (if you're uncertain about customer needs, this is a research gap, not an assumption)

**Format:** "We assume [condition] — [consequence if wrong]." 2–4 items. If an assumption is so uncertain that the OA may be non-viable, flag it: "⚠ This OA is conditional on [assumption]. If wrong, revisit framing before advancing to L5."

| ❌ Customer behavior (belongs in L3) | ✓ Organizational condition (belongs here) |
|---|---|
| "We assume customers want community recognition" | "We assume the brand team has the mandate to build community infrastructure outside the dealer network" |
| "We assume riders will share training data" | "We assume the commercial team will accept lower margin on community-tier products in exchange for relationship equity" |

---

## The Relationship Map

After writing all OAs, name how they depend on each other. The relationship map is not a timeline — it is a system of dependencies. It answers: given these OAs, which ones enable the others? Which one fails if another fails?

**Four structural roles (the brand/design register below; see `DomainScope.md` for the equivalent role names per domain — e.g. "Adoption engine" for product/UX, "Primary mechanism" for organizational, "Primary lever" for policy/advocacy):**

| Role | Meaning | When to use |
|------|---------|-------------|
| **Precondition** | This OA must be addressed first — without it, the others risk incoherence | When one OA provides the shared principle or language that all others require |
| **Growth engine** | This OA drives the primary growth mechanism | When one OA is the main expansion vector |
| **Converter** | This OA turns growth into lasting relationship | When one OA sustains and deepens what the engine produces |
| **Scale condition** | This OA determines how far the system can grow | When one OA unlocks or limits the others' reach |

**Writing the relationship map:**
- One paragraph per OA, naming its role and its dependency
- Name which OA fails or is diminished if this OA is absent
- Write the through-line: one or two sentences that describe the full system as a coherent arc

---

## Volume Calibration

The L3→L4 compression is typically more aggressive than L2→L3. Multiple insights pointing at the same design territory collapse into one OA.

| L3 insights | Expected L4 OAs | Typical compression |
|-------------|-----------------|---------------------|
| 4–6 | 2–4 | 1.5–2:1 |
| 6–9 | 3–5 | 2–2.5:1 |
| 9–12 | 4–6 | 2–3:1 |
| 12–15 | 5–7 | 2–3:1 |

*These ranges are normative calibration, not derived targets — the audit checks are the principle, not the count. Never split, merge, or invent an item to land inside the range.*


**Under the floor (too many OAs, insufficient compression):** You are probably writing one OA per insight. Ask: are any two OAs addressing the same underlying design problem from different angles? If yes, merge them.

**Over the ceiling (too few OAs, over-compression):** A single OA may be absorbing territories that require different organizational owners or different intervention types. If the "What's in scope" section contains items that could belong to fundamentally different projects, split the OA.

**An insight that stands alone:** If an L3 insight has no structural connection to any cluster, it either (a) belongs inside an existing OA as a "Why this matters" contributor, (b) generates a small but standalone OA, or (c) points to a domain outside the current project scope — note it explicitly.

---

## Theoretical Basis

**Kolko's problem-finding stage** (the structural logic of L4):
L4 is the output of the problem-finding phase — before solution generation, after insight synthesis. Kolko distinguishes: *Problem finding* (identifying opportunities) / *Problem understanding* (making sense of data) / *Problem solving* (designing the artifact). L4 lives in problem-finding: the HMW question is the designed problem, not the designed solution. This distinction is what prevents L4 from collapsing into L5.

**Kolko's three synthesis acts applied at L4:**
- *Prioritizing*: Which insight clusters are the most strategically important? What is the hierarchy among OAs?
- *Judging*: Which interventions belong inside this OA and which belong elsewhere? The "What's not in scope" section is this act made explicit.
- *Forging connections*: How do OAs relate as a system? The relationship map is this act made visible.

**Chipchase's platzgeist applied at L4:**
The organizational context governs which OAs are genuinely actionable. An OA that requires organizational capabilities the client does not have should be noted as aspirational — or the HMW should be reframed to fit what the organization can actually do. "What's not in scope" is often where platzgeist constraints live: commercial decisions, structural inclusivity (vs. cultural), HR programs — things that require organizational change the current engagement cannot effect.

**Chipchase's research as gift:**
The "Why this matters" section is the mechanism for honoring the research gift. Re-grounding the OA territory in specific participant names, quotes, and moments keeps the design territory accountable to the people who provided the evidence. OAs that cite only L3 IDs have broken the connection back to the human beings whose lives the research was built from. Name the people.
