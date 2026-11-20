---
name: l4-archetype-synthesis
description: Synthesizes L2 themes into behavioral archetypes. USE WHEN segmenting behavior for experience, brand, or concept design, or designing archetype-sufficient fieldwork.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
---

# l4-archetype-synthesis

Synthesizes behavioral patterns from L2 themes (primary) and L3 insights (coherence check) into named behavioral archetypes — or proto-archetypes when data is insufficient for confident characterization. Archetypes are behavioral constructs, not demographic segments: the same person can inhabit different archetypes depending on purchase context and phase of life. Applies to consumer, organizational, policy/advocacy, and other domains.

**Where this sits in the synthesis funnel:**

```
[L1 Evidence] → [L2 Themes] → (primary) ─┐
                                           ├─→ [L4 Archetypes] ┄→ [L5 Framework]  (optional lens, not an input)
               [L3 Insights] → (coherence check) ─┘
```

L4 has four parallel outputs — Opportunity Areas (*where*), Design Principles (*how*), **Archetypes** (***who***, this skill), Value Propositions (*what*). Canonical composition and inputs: `../ladder-core/ladder-map.md` §L4 composition.

This skill has **no precondition gate** — it runs in every scenario. What varies is what the data can honestly support: a full Archetype, or a Proto-archetype. See *Archetype vs. Proto-Archetype* below, and `workflows/ArchetypeReadyGuide.md` for designing or auditing the instrument upstream so fieldwork yields archetype-sufficient data.

---

## The Critical Move at L4-Archetype

L2 themes describe behavioral variation across individual participants — what different people do, feel, and struggle with. L4 Archetype Synthesis asks: given the full range of behavioral variation, are there coherent, nameable behavioral modes that recur across participants and that carry design implications?

| Level | Form | Example |
|-------|------|---------|
| **L2 Theme** | Behavioral pattern named from participant observations | "Participants research exhaustively before contacting a dealer — 70%+ complete their decision before setting foot in a showroom" |
| **L4 Archetype** | Named behavioral mode with spectrum position, context triggers, design implications | "The Researcher — researches before buying and arrives knowing what they want, but changes their mind when something better appears; the Explorer mode in a first purchase" |
| **Design implication** | What the archetype demands from the experience | "Design for: pleasurable navigation to support discovery; elevated information density; upstream the planning; early-adopter programs. Friction: anything that cuts off the exploration before the Researcher is ready to decide." |

---

## Archetype vs. Proto-Archetype

Not all data supports full archetypes. The skill declares status explicitly at the start of synthesis and carries it through to every output:

**Full archetype:** Foundational research dominant (≥12 participants, multi-session depth, or quantitative cluster data with behavioral spectrum design). Named with high or medium confidence. Design implications are actionable.

**Proto-archetype:** Data is insufficient — too few participants, single-session only, evaluative research dominant, or attitudinal-only quantitative instrument. Named with low confidence. Upgrade path is stated on every card. Proto-archetypes are first hypotheses, not findings.

The distinction is not a quality judgment on the research — it is an honest accounting of what the data can and cannot support. Canonical condition (full row set at SynthesizeArchetypes Step 4): `../ladder-core/config/synthesis-gates.yaml` → `gates.archetype_evidence_floor`.

---

## Standard Archetype Count

**5–6 archetypes** is the cross-client norm — sufficient to capture meaningful behavioral variation without over-fitting into distinctions too fine to design for. **8** is the valid upper limit, warranted only when domain granularity genuinely demands it (e.g., grocery shopping spanning preparation, planning, and impulse modes; workplace typologies spanning individual contributors through orchestrators). Fewer than 4 typically means behavioral variation was flattened in L2 synthesis. Above 6 requires explicit justification: name the specific variation that cannot be collapsed without losing design implications (see Volume Calibration in `ArchetypeFormat.md`).

---

## Core Concepts

**1. Behavioral spectrums (not demographic categories)**
Every archetype is positioned across behavioral continuums, not demographic bins. The frog four spectrums are the default scaffold:

| Spectrum | Low end | High end |
|---|---|---|
| Utility | Functional / logical / product-focused | Emotional / experience-seeking |
| Swagger | Leader / confident / self-directed | Follower / indecisive / guidance-seeking |
| Spontaneity | Routine / predictable / planned | Spur-of-the-moment / chaotic |
| Motivation | Self-motivated / solo | Validation-seeking / social-sharing |

Additional dimensions may emerge from data — document any substitutions.

**2. The fluidity principle**
Archetypes are 1-to-many: the same person can inhabit different archetypes depending on purchase context. A rider who is an Explorer buying a new frame may be a Doer buying components. Design for the behavioral mode in the context, not for the person as a fixed type.

**3. Contextual triggers at two levels**
Two types of context can shift archetype behavior — both must be noted on every card:
- *Situational* — moment-level triggers: time pressure, occasion type, functional vs. emotional mode sought. Shifts archetype behavior for a single occasion.
- *Developmental* — sustained, identity-adjacent life-stage frame: phase of life (returning to a sport, new parent, first major purchase, newly empty nester). Carries identity weight — it describes who a person is right now, not just their situation. Shifts archetype behavior durably across many purchase moments, not just one. Phase of life is not a demographic proxy — age predicts it poorly; life events predict it well.

**4. Journey-specificity**
Archetypes should be declared journey-specific (activated in a particular purchase context) unless cross-domain corroboration supports a person-level claim.

**5. Evidence typing (LeCompte)**
Every archetype pattern must be characterized by how it emerged from the data — the type of evidence grounds the claim:
- Declaration, Frequency, Omission, Similarity, Co-occurrence, Corroboration/Triangulation, Sequence, A priori hypothesizing

**6. Naming — short names a reader understands on first read**
Archetype names are short handles a team will use in meetings. A name stays short, and it must be understood on first read by a reader with no project context: from the name alone, the reader can say what kind of person this is (the researcher, 2026-11-07). Two modes:

- **Behavioral action labels** (default): The Planner, The Price Checker, The Repeat Buyer — names what the person does
- **Plain descriptors** (when what people want is what separates the archetypes): Buyers Who Want Advice, Diners Who Come for the Occasion — names what the person wants, in literal words

Not allowed in either mode: figures of speech, wordplay or alliteration, coined terms, and terms from the theory or from the synthesis's working vocabulary. Each makes the reader decode the name. Use one mode consistently within a set. The one-line profile carries the detail, but the name must be understood without it. Text under the name follows `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body.

**7. Key Indicators (KIs) — the observable bridge**
Every archetype must include 3–5 Key Indicators: short, observable behavioral signals that make the archetype recognizable in context without a survey instrument. KIs are the layer between the archetype's psychological description and its design implications — they are field-testable:

- "Short dwell time in-store — arrives with decision effectively made"
- "Engages with staff immediately — seeks expert confirmation before committing"
- "Photographs products before purchasing — validates selection asynchronously"

KIs are not behavioral descriptions — they are observable signals a researcher in a store, a designer watching a session recording, or an analyst reviewing data can apply without interpretation. They appear on the archetype card after the behavioral profile and before the design implications. An archetype without KIs has not been operationalized.

---

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ArchetypeReadyGuide** | Design or audit a discussion guide to ensure fieldwork will produce archetype-sufficient data — either build a guide from scratch for a dedicated archetype study (Scenario A) or add archetype-coverage questions to an existing guide (Scenario B) | `workflows/ArchetypeReadyGuide.md` |
| **SynthesizeArchetypes** | Synthesize L2 themes into named archetypes or proto-archetypes | `workflows/SynthesizeArchetypes.md` |
| **WriteArchetype** | Craft a single archetype card from a named cluster — called from SynthesizeArchetypes Step 11 or invoked directly to write or revise one card | `workflows/WriteArchetype.md` |
| **AuditArchetypeSet** | Quality-check a completed archetype set before advancing to L5 | `workflows/AuditArchetypeSet.md` |

---

## Relationship to Other L4 Skills

**l4-value-proposition-synthesis:** VP synthesis asks what to offer; archetype synthesis asks who inhabits the behavioral mode that would hire the offering. When both have been run, cross-reference: each archetype should map to at least one VP candidate, and each VP should name the archetype whose job it primarily addresses. A VP with no archetype home may be addressing a hypothetical customer. An archetype with no VP home signals an unaddressed behavioral mode.

**l4-opportunity-area-synthesis:** OAs name where to act; archetypes name which behavioral mode inhabits that territory. When both are present, the archetype set should indicate which archetypes are the primary population for each OA. An OA with no archetype population is abstract; an archetype with no OA territory is a profile without strategic direction.

---

## Relationship to L5 Framework

Archetypes optionally integrate into L5 as the behavioral population layer — naming who the framework is designed for and in what mode. This is particularly valuable when the research revealed distinct behavioral segments that point toward genuinely different experience architectures. Not all L5 engagements require explicit archetypes — brand strategy work focused on positioning may rely on the Explorer/Doer dimension implicitly. Engagements moving toward product, service, or retail experience design always benefit from archetypes as an explicit L5 input.

---

## Relationship to abductive-reasoning

Archetype derivation is abductive: the synthesist is seeking the best behavioral explanation for a cluster of observations, not deducing it from rules (see the Kolko entry in Based On). When the derivation is stuck — the behavioral explanation for a cluster won't crystallize, or two proto-archetypes feel equally valid — route to the **abductive-reasoning** skill's `ObservationToHypothesis` workflow: treat the cluster as the surprising observation, generate competing behavioral explanations with the diversity requirement, and evaluate against the explanatory virtues. The best explanation, named behaviorally, is the archetype candidate.

*Note: abductive-reasoning is a separate skill. If not installed, apply the move inline: generate at least three competing behavioral explanations for the cluster from different theoretical angles, and select on explanatory power over narrative appeal.*

**After synthesis:** before advancing, check whether the L4 sets constitute sufficient design direction: score them against tiered evaluation principles with observable proxies and a stated phase threshold.

---

## Based On

- Morey, Teichgraeber, King, Darby, Pyrchla — *Consumer Archetypes POV* (frog design, 2018/2019) — five named archetypes; four behavioral spectrums (Utility/Swagger/Spontaneity/Motivation); MaxDiff + cluster methodology; fluidity principle (1-to-many); tailoring table structure; the design implication that Explorers are the natural beachhead archetype for new offerings
- King, Scott — "Consumer Archetypes vs. Traditional Segmentation" (frog designmind, 2018) — 1-to-1 vs. 1-to-many distinction; archetype sizing requires modeling contextual variables (situational triggers, phase of life), not just attitudinal preferences; the Millennial/Boomer coupon finding that motivated behavioral segmentation
- Chipchase, Jan with Steinhardt, Simon — *Hidden in Plain Sight* (HarperBusiness, 2013) — Range of Distribution (edge behaviors as leading indicators); adoption staging (Rogers/Beal-Bohlen diffusion, applied via Chipchase Ch. 3; early adopters as beachhead archetype signal); Threshold Mapping (design implications at the behavioral edge); Research as Gift (research must change what gets designed)
- LeCompte, Margaret D. and Schensul, Jean J. — *Analysis and Interpretation of Ethnographic Data, 2nd ed.* (AltaMira, 2013) — Two-axis analytical model (empirical × theoretical); recursive analytic strategy (7-step loop, negative cases as refinement tool); eight emergence types (Declaration, Frequency, Omission, Similarity, Co-occurrence, Corroboration, Sequence, A priori hypothesizing); pattern → structure derivation
- Kolko, Jon — *Exposing the Magic of Design* (Oxford, 2011) — design implications as the mandatory, evidence-traced output of synthesis (operationalized in every archetype card's Design For section and in WriteArchetype's writing discipline); abductive sensemaking as the mechanism of the recursive derivation loop (Step 7 — the synthesist is seeking the best behavioral explanation for a cluster of observations, not deducing it from rules; see also abductive-reasoning skill)

---

## Examples

**Example 1: Full L2→L4 archetype synthesis pass**
```
User: "Synthesize the Meridian L2 themes into archetypes"
→ Invokes SynthesizeArchetypes workflow
→ Inventories and grades research data
→ Declares Full archetype (Foundational + Descriptive, 23 participants)
→ Extracts behavioral patterns from L2 themes, typed by LeCompte emergence
→ Maps clusters to frog four spectrums
→ Runs recursive 7-step derivation with negative cases
→ Checks fluidity: Explorer in acquisition, Doer in retention — same person, different modes
→ Derives design implications per archetype
→ Cross-checks against L3 insights
→ Writes ARCH-01 through ARCH-[N] + master document
→ Prompts: run AuditArchetypeSet before advancing to L5
```

**Example 2: Proto-archetype from thin data**
```
User: "Do we have enough to name archetypes from the 6 pilot interviews?"
→ Invokes SynthesizeArchetypes workflow
→ Data gate: 6 participants, single-session — Proto-archetype only
→ Derives 2 proto-archetypes from behavioral patterns
→ Flags upgrade path: need 6+ additional foundational participants per cluster
→ Returns proto-archetype cards with explicit confidence: Low
→ Notes which design implications are provisional vs. evidence-grounded
```

**Example 3: Audit before advancing to L5**
```
User: "Check the archetype set before we build the framework"
→ Invokes AuditArchetypeSet workflow
→ Checks data gate, anti-fabrication, anti-demographic collapse,
   citation discipline, fluidity labeling, volume, L3 coherence
→ Returns audit with flags and recommended changes
→ Issues "Cleared for L5" or "Not cleared — revise" verdict
```
