# WriteOpportunityArea Workflow

Craft a single L4 Opportunity Area from a named cluster of L3 Insights. This workflow covers the move from declarative insight claims to a designed problem frame — the HMW question and its defined territory.

## Step 0: Confirm Domain

Before writing the "Governs" field or naming relationship-map roles, confirm or inherit the project domain — it determines which vocabulary applies.

- **If called from within a SynthesizeOpportunityAreas session:** inherit the domain confirmed in that workflow's Step 1.
- **If called standalone:** ask the user — brand/design | product/UX | organizational | policy/advocacy | other — then read the matching entry in `DomainScope.md` for "Governs" vocabulary and relationship-map role names.   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation

## When to Use

When you have a named insight cluster and need to write the OA. Can be invoked from SynthesizeOpportunityAreas or called directly when the user hands you a specific cluster to develop.

---

## The Critical Distinction

L4 is where synthesis stops claiming and starts framing the design problem.

| Level | Form | Example |
|-------|------|---------|
| **L3 Insight** | Plain statement of what is true | "Buyers judge the brand by how the dealer treats them, and the brand does not design or check that experience." |
| **L4 Opportunity Area** | Designed problem frame (HMW) | "How might we plan the customer's whole relationship with the brand, from the first dealer visit through years of ownership, when today each dealer and channel handles its own part?" |
| **L5 Design Principle** | Organizing principle for solutions | "Plan for the whole relationship, not only the sale" |

The L4 OA does not prescribe what to build. It frames where to build and why — precisely enough to generate good solutions, openly enough to allow multiple different ones.

---

## The Platzgeist Check (Before Writing)

Before writing, apply Chipchase's platzgeist discipline: given what you know about this organization's culture, capabilities, and constraints, is this territory genuinely actionable?

Ask:
- Does this OA require organizational capabilities the client currently has or can reasonably build?
- Does this OA cross into commercial decisions (pricing, distribution, ownership structure) that are outside the engagement scope?
- Does this OA require structural changes (product line, regulatory, HR) with longer lead times than the engagement can address?

If yes to any: either reframe the HMW to fit what is actionable, or note the OA as aspirational with an explicit statement of the organizational prerequisite.

---

## Writing Order

**1. Write "Why this matters" first.** State the L3 claims (bold the insight IDs), then move down to L1 evidence. Name specific participants. Cite specific moments, quotes, and findings. The section makes the case that this territory is real — not just analytically compelling, but grounded in the lives of the people the research covered.

> **Anti-fabrication rule:** Cite only participants, quotes, and moments that appear verbatim in the source L3/L1 files. If no verbatim quote exists for a point, cite the behavioral moment instead — never construct, sharpen, or approximate a quote to strengthen the paragraph. Narrative connective tissue carries `(illustrative framing)`.

3–6 sentences. Write it as a brief to a designer who has not read the research: what the research established, and which people said or did what. Plain words throughout: `OAFormat.md` → Plain Writing in the Body (literal words; a limit gets its own sentence; no working shorthand; say whose reading it is; state each L3 claim as the L3 states it).

**2. Write the HMW question from it.** Ask what design challenge the evidence you just wrote sets, in plain words. Apply the HMW tests (`OAFormat.md` → The HMW Question Test):
- Is it specific enough to exclude some interventions?
- Is it open enough to generate at least three genuinely different solutions?
- Does it say in plain words what makes the challenge hard, with no dash form and no figure of speech or working vocabulary?
- Could a reader with no project context understand it on first read?

Draft 2–3 HMW candidates. Pick the one that is most specific while remaining open, and that a reader with no project context understands on first read.

**3. Define "What's in scope."** List intervention types organized by phase or domain. Each item:
```
- A [noun] [noun]: <description — what it is and why it belongs in this territory>
```

Test each item: Is this a type of intervention (right) or a specific deliverable (wrong)? Could a designer or strategist scope an initial project from this description? If yes, it is scoped correctly.

**4. Define "What's not in scope."** Name adjacent territory that is explicitly excluded and why. This is not a catch-all disclaimer — it is a precise boundary-setting exercise. Each item should name real territory that might otherwise bleed in:
```
- [Adjacent territory]: <One-phrase reason — different OA, commercial decision, L5 work, different team>
```

**5. Write the OA title last.** One plain sentence stating what would be true for the people served once the opportunity is addressed: "Buyers hear from the brand after the sale, not only before it", not "Contact after purchase" (a label) or "The undesigned arc" (a figure of speech). Rule: `OAFormat.md` → The OA title.

**6. List source insights.** All contributing L3 insights with IDs and titles. Include any insights that appear in "Why this matters" but are not primary source drivers — mark these as "supporting evidence" if needed.

---

## The HMW Formulation — Detail

The HMW question has two components, in one plain question (rules: `OAFormat.md` → The HMW Question Test):

**The action clause:** "How might we [verb] [specific outcome]..."
- Use action verbs that name design work: design, build, plan, set up, develop, expand
- The outcome should name a system or relationship, not a deliverable

**What makes it hard (usually):** stated in plain words inside the question; one question, with no sentence after it (further context goes in Why this matters)
- The structural problem the evidence shows: "...when today each dealer and channel handles its own part?"
- Or the condition to keep: "...without losing what current owners value about the brand?"
- Or the result the work must reach: "...so that new riders feel welcome when they arrive?"

No dash form: do not build the question as "[do X] — [frame] — [constraint]". If the question is carrying the challenge, the mechanism and the organizing frame at once, split it or move the frame into Why this matters.

Plain question patterns:
- "How might we [do X] for [whom], when today [the structural problem the evidence shows]?"
- "How might we [do X] from [starting point] through [end point], so that [result]?"
- "How might we [do X] without [losing what the evidence says must be kept]?"

---

## "Why This Matters" — Evidence Re-Grounding

This section is what separates an L4 OA from a strategy deck recommendation. It traces the argument from structural claim (L3) to human evidence (L1).

**Structure:**
1. State each contributing L3 insight in one sentence: "[L3-NN] establishes that..."
2. Name the connective logic: "These are not [N] problems — they are [one structural condition] described [N] ways."
3. Move to L1 evidence: name specific participants, specific moments, specific findings that make the structural claim concrete.

**Test for thin re-grounding:** delete the participant names and the moments they describe, and reread the paragraph. If it makes the same case without them, the re-grounding is too thin.

**Test:** Could a reader who hasn't seen the L3 documents understand why this territory matters, and say which people and moments it rests on? If yes, the section is working. If the section reads as a summary of insight IDs, it needs re-grounding.

---

## Scope Item Format — Detail

Each scope item names an intervention type. The format:

```
- A [noun] [noun]: [one clause description including examples where helpful]
```

Breaking this down:
- "A" — singular, naming one type of program, system, or design task
- First noun — the structural form: toolkit, framework, program, system, calendar, mapping, criteria, narrative, standards, strategy
- Second noun — the domain or audience: dealer, rider, community, World Tour, brand, content, recognition, connection
- The description — what it is and what it does, in language a strategist or designer can act on

**Examples of correctly scoped items:**
- "A community mapping framework: identifying where aspirational buyers are concentrated and which group rides, clubs, and events they inhabit in target markets"
- "A dealer recognition and certification program: preferential investment — pre-release access, marketing co-op, community event support — for dealers who deliver the brand experience well"
- "A rider recognition program: acknowledging community leaders not by racing results but by longevity, visible passion, and the advocacy work they are already doing"

**What scope items are not:**
- Specific vendors, agencies, or partners
- Budget figures or investment levels
- Specific campaign names, platform names, or technology choices
- Actions: "Train dealers" (wrong) vs. "Dealer training programs" (right)

---

## OA Quality Check

Before finalizing:
- [ ] HMW passes the two-axis test (open enough / specific enough)
- [ ] HMW says in plain words what makes the challenge hard; no dash form (`OAFormat.md` → The HMW Question Test)
- [ ] HMW and OA title understandable on first read by a reader with no project context; OA title written last
- [ ] Why this matters and every other section meet `OAFormat.md` → Plain Writing in the Body
- [ ] "Why this matters" cites L3 insight IDs in bold
- [ ] "Why this matters" names specific participants and specific L1 evidence
- [ ] "Why this matters" states the connective logic — why these are one problem, not many
- [ ] Each scope item names an intervention type, not a deliverable
- [ ] No scope item belongs more naturally in another OA
- [ ] "What's not in scope" is present with explicit reasons for each exclusion
- [ ] Source insights listed with IDs and titles
- [ ] YAML frontmatter complete: project, opportunity_area_id, synthesis_level, source_insights, governs (from the domain's DomainScope vocabulary), synthesis_date, domain

---

## Output

A formatted L4 Opportunity Area ready for:
- Inclusion in the master L4_Opportunity_Areas document
- Writing as a standalone OA-NN file
- Direct use in strategy presentation or client handoff
