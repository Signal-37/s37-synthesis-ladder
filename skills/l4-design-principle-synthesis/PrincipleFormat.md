# L4 Design Principle Format Reference

The exact output format for L4 Design Principle files and the master principles document, including the principle title test, decision filter quality check, failure mode discipline, and volume calibration.

**Contents** (a reader mid-task may only see this far — jump to the section named):
- Individual Principle File — the per-principle template (the principle, what it means, why it comes from the research, how to apply, what it prevents/rejects, source insights)
- Master Principles Document · Summary Document — the collected forms and the through-line
- File Naming Conventions
- The Principle Title Test (short, plain; the title is written last) · Plain Writing in the Body · **The Decision Filter Test** · Failure Mode Discipline — the gates
- "Why It Comes From The Research" — Evidence Discipline
- Volume Calibration — how many principles to expect
- The System Narrative · Theoretical Basis

---

## Individual Principle File

Each principle gets its own file. YAML frontmatter + six structured sections.

```
---
project: [Project Name]
principle_id: P-[NN]
synthesis_level: L4
source_insights: [L3-NN, L3-NN, ...]
governs: <Decision domain — drawn from the domain's "Governs" vocabulary in DomainScope.md>
synthesis_date: [YYYY-MM-DD]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L3 Insights>   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation
---

# P-[NN]: [Short active principle title]

## The principle
<The full statement of the principle. 1–3 sentences. States the operational demand: what the organization must do, ask, or test in any relevant decision. Written before the title; the title is the short name for this demand. This is the wall-card version of the principle: short enough to read at a glance, specific enough to govern a real decision. Written in plain words: see Plain Writing in the Body.>

## What it means
<Full articulation of what the principle demands and why it demands it. 3–5 sentences. Name the structural problem — often two related failure modes with a shared root. State what the principle requires as the alternative. This section proves that the principle is more than a slogan — it has real, specific organizational meaning.>

## Why it comes from the research
<The specific L1 evidence that makes this principle non-negotiable. 2–4 sentences. Name participants by name. Use direct quotes where they exist. The principle is grounded here — without this section it is a management consulting heuristic, not a research-derived commitment. The evidence should feel irreducible: to ignore this principle, the organization would have to ignore these specific people.>

## How to apply it
<The decision filter in practice. 2–4 sentences. Name the specific question(s) the principle generates — often written in quotation marks as the actual question a decision-maker should ask. Name the types of decisions this governs. Can include parallel design tracks, phased application, or a specific test the principle implies.>

## What it prevents
<The specific failure mode this principle guards against. 1–2 sentences. Be precise — not "bad decisions" but the named pattern of failure that the research shows is already happening or is likely to happen. Often names two related failure modes (the twin traps, the dual risk) since many principles respond to compound failures.>

## What it rejects
<The specific alternative approach, program type, or organizational move the principle explicitly refuses — the choice the organization might actively make that this principle vetoes. 1–2 sentences. This is distinct from "What it prevents": "What it prevents" names the failure mode that results when the principle isn't honored; "What it rejects" names the alternative strategy that produces it. Specific enough that a planning-session participant would recognize it as something that has been proposed or considered.>

## Source insights
- **[L3-NN]** — [Insight title]
- **[L3-NN]** — [Insight title]
[List all contributing L3 insights]
```

---

## Master Principles Document

```
---
project: [Project Name]
synthesis_level: L4
document_type: Design Principles
source: [L3_Insights_[ProjectName].md — N insights]
synthesis_date: [YYYY-MM-DD]
analyst: [Name or system]
felt_flags: [none-issued | "<report> — settles when <condition>"; semicolon-separate multiple]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L3 Insights>
---

# L4 Design Principles — [Project Name]

---

## How to read this document

Design Principles answer a different question than Opportunity Areas. Opportunity Areas ask *where should the organization act?* Principles ask *how should the organization act, in every decision, regardless of context?*

Principles are not strategies. They don't name specific programs or investments. They are the standing rules that govern how the organization behaves — the commitments that, if honored consistently, produce the outcomes the Opportunity Areas describe. They are most useful as decision filters: when facing any choice about [relevant decision types for the project], each principle should yield a clear directional answer.

[Brief statement of how many L3 insights collapsed into how many principles, and the organizational logic for the collapse.]

Each principle is structured as:
- **The principle** — a short, plain, active statement
- **What it means** — the full articulation
- **Why it comes from the research** — the evidence behind it
- **How to apply it** — what decisions this governs
- **What it prevents** — the failure mode this principle guards against
- **What it rejects** — the alternative approach the principle explicitly refuses

---

## P-01: [Principle title]

**The principle:** [Full statement]

**What it means:** [Articulation]

**Why it comes from the research:** [Evidence]

**How to apply it:** [Decision filter]

**What it prevents:** [Failure mode]

**What it rejects:** [Alternative approach explicitly excluded]

**Source insights:** [L3-NN, L3-NN, ...]

---

## P-02: [Principle title]
...

---

## The [N] principles as a system

| ID | Principle | Governs |
|---|---|---|
| P-01 | [Title] | [Domain] |
...

### How they work together

<Narrative of how the principles relate as a system. Names structural roles: which principle is the foundation (precondition for the others' coherence), which govern the acquisition arc, which governs conversion, which governs scale. 4–6 sentences. Should describe the cumulative outcome — what the organization is like if it honors all principles consistently.>

### Cross-application: Principles × Opportunity Areas

[Used to validate the L5 pairing logic before framework synthesis. Maps which principles govern which OAs as primary governing rule vs. secondary constraint.]

| Principle | Primary OA | Secondary OAs |
|---|---|---|
| P-01 | [OA-NN] | [OA-NN, ...] |
...

<One sentence noting any principles that are cross-cutting rather than domain-specific — these are candidates for governing-condition status in L5 rather than domain-level pairings.>

---

*[Project] L4 Design Principles*
*Synthesized from [N] L3 Insights / [N] L2 Themes / [N] L1 Findings / [N] interviews*
*[Date]*
*Next synthesis level: L5 Framework*
```

---

## Summary Document

```
---
project: [Project Name]
document_type: L4 Principles Summary
synthesis_date: [YYYY-MM-DD]
source: <L4_Principles document — N principles from N L3 insights>
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L3 Insights>
---

# L4 Principles Summary — [Project Name]

## Principles by ID

| ID | Principle | Governs | Source insights |
|---|---|---|---|
| P-01 | [Title] | [Domain] | [L3-NN, L3-NN] |
...

---

## What each principle prevents

| Principle | Failure mode it guards against |
|---|---|
| P-01 | [Named failure mode] |
...

---

## How the principles work together

<One paragraph per structural role. Names: foundation, acquisition system, converter, scale condition — or equivalent structural roles for this project.>

---

## The through-line

<A short paragraph that addresses the organization directly. Not a list of principles; a single statement, in plain words, of what the organization commits to by adopting these principles. A reader with no project context should understand it on first read. 3–5 sentences.>

---

*[Date]*
*Next synthesis level: L5 Framework*
```

---

## File Naming Conventions

**Individual principle files:**
```
P-[NN]_[Short_Descriptive_Name].md
```
Examples: `P-01_Spend_Where_Buyers_Decide.md`, `P-03_Design_The_Dealer_Visit.md`

**Master principles document:**
```
L4_Principles_[ProjectName].md
```

**Principle ID numbering:**
- Sequential from P-01
- Number by strategic importance (highest leverage first) or by narrative logic — choose one and be consistent

---

## The Principle Title Test

> **Reserved claim verbs:** *validated / confirmed / passed / from the customer's side* are reserved for externally-tested claims — research-derived claims use *attested / evidenced / saturated / hypothesis*. Canonical: `../ladder-core/ladder-map.md` → Reserved Claim Verbs.

An L4 principle title is the short name of the principle: a plain, active statement of what the organization must do. It is not a description, a label or a question. People use it as a handle in meetings, so it stays short, but a reader with no project context must understand it on first read without having it explained (the researcher, 2026-11-07).

| Form | Example | Problem |
|------|---------|---------|
| **Label** | "Community investment" | A topic, not a rule |
| **Description** | "The brand should invest in community" | An observation, not a standing rule |
| **Question** | "Where do buyers decide which brand to trust?" | L3 answers questions; L4 makes demands |
| **Recommendation** | "Invest more in community programs" | A strategy, not a principle |
| **Coined phrase** | "Invest where conviction forms" | Short and active, but a cold reader cannot say what "conviction forms" means |
| **Right** | "Spend where buyers decide which brand to trust" | Short; active verb; names the governing logic; needs no decoding |

**Four title qualities, all required:**

1. *Short:* usually 4–10 words, short enough to put on a card or slide header. When short and plain conflict, plain wins: add the words a cold reader needs.

2. *Active:* Begins with an imperative verb. Verbs: spend, design, keep, state, welcome, build, measure, begin, treat, give. The verb names what the organization must *do*, not what is *true*.

3. *Plain (the first-read test):* A reader with no project context can say in their own words what the title asks the organization to do, on first read. Literal words: no figures of speech, no coined phrases, no terms from the theory in the L3 Knowledge sections, and no working vocabulary from the synthesis. Do not reach for rhythm, wordplay or a sharp contrast; a title passes by being clear, never by being striking.

4. *Governing:* Names the decision logic, not the output. "Spend where buyers decide which brand to trust" tells you how to make spending decisions. "Increase community spending" tells you what to decide; that is a strategy, not a principle.

**Write the title last.** Write The principle, What it means, Why it comes from the research, How to apply it, What it prevents and What it rejects first. Then name in plain words what The principle demands. A title written first and defended afterwards tends to become a slogan the body has to explain.

**Plain-title rules (the researcher, 2026-11-05 to 2026-11-07, carried from the L3 title rules):**
- **Literal words.** If the title needs its body to be understood, rewrite it.
- **One demand.** Two demands joined by a semicolon are usually two principles. If they truly are one, join them with "and" in plain words.
- **No two-part dash form**, and no "X, not Y" reversal used for effect. Use "not just" only when the common default is the failure the principle prevents, and say the default plainly.
- **An accuracy fix is a rewrite.** When a check finds a word wrong, rewrite the title from The principle. Do not add a clause to it.

| Fault | Before | After |
|-------|--------|-------|
| Coined phrase | "Invest where conviction forms" | "Spend where buyers decide which brand to trust" |
| Compressed object | "Design the dealer" | "Design what buyers experience at the dealer" |
| Clever twin | "Name it; extend it" | "State what the brand stands for, and show it beyond the product" |
| Categorical reframe | "Welcome as a brand act" | "Treat welcoming new buyers as part of the brand" |
| Figure of speech | "Earn the relationship; give it a language" | "Stay in touch with owners after the sale" |

**Draft test:** Show the title alone to someone who hasn't seen the research. Can they say what the organization must do, and apply it to a real decision? If they have to ask what it means, rewrite it.

Audit: `workflows/AuditPrincipleSet.md` → Audit 2 and Audit 2b.

---

## Plain Writing in the Body

The plain-writing rules also apply to the text under the title: The principle, What it means, Why it comes from the research, How to apply it (including its test questions), What it prevents, What it rejects, How they work together, and the through-line (the researcher, 2026-11-06, ruled for L3; applied to L4 2026-11-07). The full rules and examples are in `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body. Enforced here:

- **Literal words.** No figures of speech, no theory terms, no working vocabulary from the synthesis. Where a section names a framework, say in plain words what it holds.
- **One idea at a time.** Split a sentence that carries the failure, its cause and the fix at once.
- **A limit gets its own sentence.** Do not attach it to the sentence it limits.
- **No working shorthand.** Write out what the synthesis team would understand from a short phrase.
- **Keep what participants said separate from what the synthesist infers**, and say whose reading it is in a plain sentence. A clause with no insight or participant behind it stays only if it is labeled as the synthesist's reading.
- **No two-part dash form** in statements, test questions or the through-line.

| Fault | Before | After |
|-------|--------|-------|
| Figure of speech | "The dealer floor is where the brand is won or lost" | "Buyers decide whether to trust the brand during the dealer visit." |
| Packed | "Two failures share a root: impression-buying that misses conviction and credibility signals that never activate" | "Two failures share one cause. The brand pays for reach where buyers are not deciding. And the proof buyers look for is never put in front of them." |
| Working shorthand | "Applies to the owner-side arc" | "Applies to decisions about owners after they buy." |

Audit: `workflows/AuditPrincipleSet.md` → Audit 2b and the body checks in Audits 3 to 6.

---

## The Decision Filter Test

"How to apply it" is the mechanism that makes a principle useful rather than decorative. It converts the principle from a slogan into an operational tool.

**A strong "How to apply it" section:**
- Names the specific question(s) a decision-maker should ask — in quotation marks, as the actual question
- Names the types of decisions this governs — drawn from the domain's decision-type list in `DomainScope.md` (brand/design: investment decisions, dealer programs, campaign briefs, community partnerships; product/UX: roadmap calls, feature specs, design reviews; organizational: budget/headcount, process changes, role assignments; policy/advocacy: funding decisions, program design, rule-making)
- Is specific enough that a decision-maker could apply it to a real decision this week
- Sometimes names two parallel design tracks if the principle has a dual structure

**A weak "How to apply it" section:**
- Restates the principle in different words
- Says "apply this principle consistently across all decisions" (meaningless)
- Names only abstract domains without naming the decision mechanism
- Omits the test question

**The test question format:** Write one or two questions in quotation marks that a decision-maker would ask before approving any relevant program, budget, or campaign. The question should have a clear directional answer when the principle is being honored, and a clear warning signal when it is not.

Examples of strong test questions (engagement-neutral):
- "Does this put the brand's products with people that likely buyers already watch and trust?"
- "Does this improve what buyers experience at the dealer?"
- "Does this give an owner something new to tell others about the brand?"
- "Who does this make feel welcome, and who does it leave out?"

---

## Failure Mode Discipline

"What it prevents" is what distinguishes a design principle from a management heuristic. Every principle derived from research has a specific, named failure mode — a pattern already visible in the research or demonstrably likely given the structural conditions identified.

**Strong "What it prevents":**
- Names a specific failure pattern, not a general risk
- Often names the twin failure modes, the two sides of the same gap (paying for reach where buyers are not deciding, and never putting the proof buyers look for in front of them, are both halves of the same spending failure)
- Is precise enough that the organization could check whether the failure is currently happening
- Connects back to the research evidence implicitly or explicitly

**Weak "What it prevents":**
- "Suboptimal decisions" — too generic
- "Missing opportunities" — too vague
- Restates what the principle demands in negative form ("prevents not investing in community")

**The newspaper test:** Could this failure mode appear as a specific critique in a strategy review or a competitive analysis? If yes, it is specific enough.

---

## "Why It Comes From The Research" — Evidence Discipline

This section re-grounds the principle in specific human evidence. It is what prevents a principle from being imported from a strategy deck without research backing.

**Requirements:**
- Names at least one participant by name
- Uses a direct quote where one exists (a quote shows the reader what the participant said; a paraphrase asks the reader to trust the synthesist)
- Connects the evidence to the principle's demand — the evidence should make the principle feel inevitable
- 2–4 sentences. Tight. Every sentence should add a new participant, quote, or finding.

**The re-grounding test:** Read the "Why it comes from the research" section to someone who hasn't seen the research. Does it feel like evidence that demands a behavioral response? If it feels like background context, it is not doing its job.

---

## Volume Calibration

The L3→L4 Principles compression is typically similar to OA compression: 1.5–2 insights per principle.

| L3 insights | Expected L4 Principles | Typical compression |
|-------------|------------------------|---------------------|
| 4–6 | 3–4 | 1.5–2:1 |
| 6–9 | 4–6 | 1.5–2:1 |
| 9–12 | 5–7 | 1.5–2:1 |
| 12–15 | 6–8 | 1.5–2:1 |

**Note on duplication with OAs:** The number of principles does not need to match the number of OAs. Principles and OAs answer different questions and cluster differently. Some insights generate a clear OA but no new principle; others generate a clear principle but belong inside an existing OA.

**Under the floor (too many principles, insufficient compression):** You may be writing one principle per insight. Ask: do any two principles govern the same type of decision? If yes, merge them — the shared decision domain is the principle.

**Over the ceiling (too few principles, over-compression):** A single principle may be absorbing genuinely different decision types. If "How to apply it" requires two entirely different test questions that don't share a logic, split the principle.

---

## The System Narrative

After writing all principles, name how they work together as a system.

**Structure:**
1. Name the foundation principle — the one without which the others risk incoherence (typically the principle that names what the organization stands for or its governing investment logic)
2. Name the acquisition arc (principles that govern how new relationships begin)
3. Name the conversion principle (what turns initial contact into lasting relationship)
4. Name the scale condition (what allows the system to compound rather than plateau)
5. Write the through-line: a short narrative paragraph that states the cumulative organizational commitment

**The through-line test:** Could a reader with no project context say, after one read, what the organization is committing to? If it reads as a list of bullet points in prose form, rewrite it as one statement. If it reaches for a quotable line, rewrite it in plain words.

---

## Theoretical Basis

**Kolko's principle as compressed synthesis:**
A design principle is what remains when synthesis is complete — the irreducible behavioral rule that the insight set demands. Kolko's synthesis acts (Prioritizing, Judging, Forging connections) produce insights; the principle is the forged connection carried to its behavioral conclusion. The principle is what the organization must do differently — the minimum organizational behavior change the research requires.

**Chipchase's essence thinking applied at L4:**
Each principle names the irreducible essence of what the research demands in a given domain. Chipchase asks: what survives if you strip away all context-specific features and market conditions? The principle is the answer: the rule that holds regardless of which program, campaign, or market the organization is operating in.

**Chipchase's research as gift:**
Principles are the primary mechanism for closing the loop from research to action. A research engagement that produces findings but no standing behavioral commitments has broken the gift relationship with participants. Principles convert the gift into durable organizational change — they make the participant's access to the researcher permanently consequential.

**The "What it prevents" section as constraint-challenging:**
Kolko treats challenging constraints as one of the culture-of-synthesis qualities (via Eames): the designer recognizes as many constraints as possible and works within them, and the most actionable constraints are discovered in the research data, not handed down in a brief. (It is a culture quality, not one of his three synthesis acts — those are prioritizing, judging, and forging connections.) "What it prevents" applies that discipline to principles: it names the assumed constraint the principle challenges, and the failure mode that persists if the constraint is never challenged.
