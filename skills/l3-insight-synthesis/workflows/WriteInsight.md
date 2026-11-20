# WriteInsight Workflow

Craft a single L3 Insight from a named cluster of L2 Themes and a knowledge layer. This workflow covers the abductive pairing at the center of L3 synthesis: combining a research observation with cross-domain knowledge to produce a new declarative claim.

## Step 0: Confirm Domain

Before writing the Knowledge layer, confirm or inherit the project domain — it determines which Knowledge-source menu the injection draws from.

- **If called from within a SynthesizeInsights session:** inherit the domain confirmed in that workflow's Step 1.
- **If called standalone:** ask the user — brand/design | product/UX | organizational | policy/advocacy | other — then read the matching entry in `DomainScope.md`.   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation

## When to Use

When you have a named cluster of L2 themes and need to write the insight. Can be invoked from SynthesizeInsights or called directly when the user hands you a specific cluster to develop.

---

## The Critical Distinction

L3 is the level at which synthesis stops describing and starts claiming.

| Level | Form | Example |
|-------|------|---------|
| **L2 Theme** | Behavioral pattern + abductive connection | "Loyal customers can't say why they stay with the brand" |
| **L3 Insight** | Plain statement of what the pattern means | "Riders stay loyal because of how the product has performed for them, and the brand does nothing to build on that loyalty." |
| **L4 OA** | Strategic opportunity with direction | "Design a community architecture for Meridian's existing loyal customer base" |

The L3 insight does not just describe the pattern — it claims what the pattern means in strategic terms. It is more generalized than the theme (multiple themes feed one insight) and less specific than an opportunity area (it doesn't prescribe the action).

---

## The Yellow-Blue-Green Card Method (the ladder's adaptation of Kolko)

The ladder adapts the card colors from Kolko's insight-combination vocabulary. In Kolko's original scheme, a **yellow card is the whole insight** (observation "I saw this" + knowledge "I know this"), a **blue card is an established design pattern**, and a **green card is a new design idea** struck by pairing yellow with blue — his "insight combination" is that downstream ideation step. The ladder repurposes the colors for insight *formation*; in the ladder's mapping, L3 insight production is the green card:

- **Yellow card** (L2 themes) = research observation: "I saw this across participants"
- **Blue card** (knowledge layer) = cross-domain knowledge: "I know this about how these systems work"
- **Green card** (L3 insight) = the new claim: "Therefore, what must be true is..."

The pairing is the creative act. The insight is not in the themes alone, and it is not in the knowledge alone. It emerges from putting them together. This is Peirce's abduction: "the idea of putting together what we had never before dreamed of putting together."

Write the yellow card first. Write the blue card second. Only then write the green card.

---

## Writing Order

The title is written last. Keep a plain working note of what the cluster is about until then; it is not a draft title.

**1. Write the Observation.** Summarize what the source L2 themes show — 2-4 sentences. Cite theme IDs. Descriptive only. Do not interpret yet.

**2. Write the Knowledge layer.** This is where L3 separates from L2. Introduce cross-domain knowledge that gives the observation meaning — drawn from the **domain's Knowledge-source menu** in `DomainScope.md` (brand strategy and service design for brand/design; Norman's gulfs and mental-model mismatch for product/UX; org behavior and change management for organizational; behavioral public policy for policy/advocacy). 2-4 sentences.

Prompts:
- How do analogous systems behave in this structural situation?
- What does the relevant field of knowledge say about why this pattern exists?
- What is the trust dimension at stake? (Chipchase: authenticity, fulfillment, value, reliability, safety, recourse)
- What is the irreducible truth underneath these themes? (Chipchase: essence thinking)
- What organizational capability does this structural situation require — and does the organization have it?

**3. Write the Insight.** The declarative claim in full. 2-4 sentences. State it plainly, as if presenting to a skeptical client who needs to decide whether to act on it, in words that client would use. Could a reasonable strategist push back on it? If not, it may be a summary.

**4. Write "What this opens."** Name the strategic territory this insight makes available. Not a recommendation. Not a list of actions. A direction — the design or strategy task that the insight points toward. 2-3 sentences.

**5. Write the title.** State in plain words what the sections above reached. Ask what people do or say, and what follows from it. Apply `InsightFormat.md` → The Insight Title Test, including its plain-statement rules. Read the title as someone with no project context, and replace any figure of speech with the literal statement.

---

## Insight Structure

```
## L3-[NN]: [Declarative insight title]

**Observation (from [L2-NN, L2-NN]):** [What the source themes show. 2-4 sentences. Descriptive. Cite theme IDs.]

**Knowledge:** [Cross-domain interpretation. 2-4 sentences. What the synthesist knows about how these systems work. Must introduce something not in the research data.]

**Insight:** [The declarative claim. 2-4 sentences. Stated as truth. Combines observation and knowledge. The green card.]

**What this opens:** [Strategic territory. 2-3 sentences. Direction without prescription. The frame for L4 opportunity areas.]
```

---

## Knowledge Layer — Sources and Discipline

The knowledge layer is where the synthesist's own knowledge determines the quality of the output. It cannot be mechanically derived from the data.

The sources below are the **brand/design** menu. `DomainScope.md` is the canonical source — this list is a convenience reference; update DomainScope.md first. For product/UX, organizational, policy/advocacy, or other projects, draw from the matching menu in `DomainScope.md` instead — same discipline, different body of knowledge.

**Strong knowledge sources (brand/design):**
- *Service design:* The frontline worker as the brand; moments of truth (Carlzon); experience blueprinting
- *Brand equity theory:* Rational phase then relational phase; implicit vs. explicit positioning; earned vs. claimed positions
- *Community-led growth:* Arc'teryx, Rapha, Peloton, LEGO Ambassador Network as structural models
- *Behavioral economics:* Identity purchases; switching costs; social proof; permission barriers built by occasion frames
- *Chipchase's trust ecosystem:* Which of the six dimensions is failing? Reliability and recourse are chronically underinvested
- *Chipchase's essence:* What survives if you strip away the current market context? What is the minimum viable expression?
- *Organizational design:* What capabilities the insight requires vs. what the organization currently has
- *Category dynamics:* How premium categories grow; the role of scarcity and access; price as permission barrier

**The test:** Read the knowledge section without the observation. Does it communicate a genuine principle about how systems work? If it collapses without the research context, it's not knowledge — it's interpretation of the data.

---

## "What This Opens" — Direction Without Prescription

"What this opens" names the strategic territory. It uses organizing frames, not action verbs.

| Frames that name territory (right) | Frames that prescribe action (wrong) |
|-----------------------------------|------------------------------------|
| "A rider-seeding strategy as the primary growth investment" | "Pay influential cyclists to ride the bikes" |
| "The design of a post-purchase relationship system" | "Create a loyalty program" |
| "A dealer experience design program" | "Train dealers" |
| "The organizational capability question" | "Hire a community manager" |

The right version names a strategic territory and a design frame. The wrong version names an action. L4 names the actions; L3 opens the territory.

---

## Insight Quality Check

Before finalizing:
- [ ] Title was written last and passes the insight title test: a plain statement that could be contested, understood on first read with no project context
- [ ] Observation is descriptive and cites specific L2 source themes
- [ ] Knowledge introduces cross-domain content not present in the research data
- [ ] Knowledge is specific — names a principle that applies to this structural situation, not everywhere
- [ ] Insight combines observation and knowledge into a new truth claim
- [ ] Insight is stated as truth, not as possibility or question
- [ ] Insight is in plain words, with no figures of speech, theory terms or working vocabulary
- [ ] Text under the title meets `InsightFormat.md` → Plain Writing in the Body: each limit has its own sentence, no working shorthand
- [ ] "What this opens" names strategic territory without prescribing specific actions
- [ ] Source themes listed with IDs and titles

---

## Output

A formatted L3 insight ready for:
- Inclusion in the master L3_Insights document
- Writing as a standalone L3-NN file
- Direct use in strategy presentation or stakeholder handoff
