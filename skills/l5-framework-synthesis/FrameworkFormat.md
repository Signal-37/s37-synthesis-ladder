# L5 Framework Format Reference

The exact output format for the L5 Framework document, individual domain sections, the visual document, and the supporting visual notes file. Includes domain naming discipline, pairing logic, systems logic format, and volume calibration.

**Contents** (a reader mid-task may only see this far — jump to the section named):
- Master Framework Document — the strategic premise, the framework, the systems logic, how to use it, The Refusal
- Domain Section — Detailed Format — the per-domain template
- The Systems Logic Diagram · The Visual Document · The Visual Notes Document — the diagram forms
- File Naming Conventions
- Plain Writing (statements and names) · Domain Naming Discipline · **Pairing Logic — OA + Principle → Domain** · Systems Logic — Four Structural Roles — the gates
- Volume Calibration — how many domains to expect
- Theoretical Basis

---

## Master Framework Document

```
---
project: [Project Name]
synthesis_level: L5
document_type: <Framework name — e.g., "Brand Strategy Framework" for brand/design; name it in the domain's register per DomainScope.md>
source: [L4_Opportunity_Areas_[ProjectName].md (N areas) + L4_Principles_[ProjectName].md (N principles)]
synthesis_date: [YYYY-MM-DD]
version: [1.0 / 2.0 / etc.]
version_note: [If iteration 2+: what was added and why]
analyst: [Name or system]
felt_flags: [none-issued | "<report> — settles when <condition>"; semicolon-separate multiple]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L4 OAs and Principles>   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation
final_ladder_review: pending   # set at creation; FinalLadderReview's final step replaces this with the report filename. `pending` or absent HALTS delivery — config/synthesis-gates.yaml → gates.final_ladder_review_before_delivery
---

# L5 Framework — [The Named Framework] ([version])

---

## How to read this document

<3–4 sentences. Name what each prior level did (L1 captured / L2 identified / L3 named / L4 defined and governed). State what L5 does differently: it integrates. A framework is not a summary — it names the logic connecting the parts and makes the whole actionable as a decision tool.>

---

## The strategic premise

<2–4 paragraphs. This is the framing statement — not a summary of what came before, but a statement of the organization's starting condition and the strategic task that starting condition implies.

Structure:
1. What the research established — what the organization has (the equity, the mechanism, the community, the positioning)
2. What built it — not brand management but something else (the product, the founder, the behavior, the category)
3. The strategic task — activation not invention, or the equivalent for this project
4. Any iteration 2+ additions that make the brief more specific

The strategic premise should name the activation frame: the specific gap between what was built and what hasn't been built yet. This is what the framework is designed to address. Written in plain words: see Plain Writing (statements and names).>

---

## The framework

<One paragraph naming the framework's organizing structure — how many domains, what the pairing logic is, that domains are not independent but operate as a system with defined hierarchy and sequence.>

---

### Domain [N]: [Domain name]
*<One-line domain descriptor — a plain statement of what this domain is for, understood on first read>*

**Design territory:** [OA-NN] — [OA title]
**Governing principle:** [P-NN] — [Principle title]
[or: **Governing principles:** P-NN — [title] | P-NN — [title]]

**The strategic task:** <2–4 sentences. What must be done in this domain, and why. Name the structural problem — often from the insight(s) behind the OA and Principle. State the task as an organizational design challenge, not as a program list.>

**What would change this:** <Three short parts. *Counter-cases:* the insights, opportunity areas or evidence that sit awkwardly with this domain's strategic task, and how the domain meets them or where they mark its edge. *Rival reading:* the strongest other way to draw this domain (a competing organizing logic), and why this one was preferred. *What would make us revise it:* what later research, a pilot or operating experience would have to show for the domain to be re-drawn, stated as a pattern, with no counts, percentages or thresholds. Definition: `l3-insight-synthesis/InsightFormat.md` → The What Would Change This Field.>

**What this domain governs:**
<Bullet list of specific programs, systems, frameworks, and design tasks that belong in this domain. Organized by phase or dimension if appropriate. Pull from the OA's "What's in scope" section and enrich with specific evidence from the research — participant names, findings, historical precedents. 6–12 items.>

**Why [it is the foundation / it follows X / it converts X / it is the scale condition]:**
[2–4 sentences. Name the domain's role in the system and why the architecture requires it to hold that role. Name specifically what fails or becomes incoherent if this domain is absent or deprioritized.]

---

## The systems logic

[Intro sentence naming the system structure.]

```
<ASCII or text diagram showing the four-domain flow — see format below>
```

**The sequence:**
1. [First domain] — [why it comes first]
2. [Second/parallel domains] — [why they operate together or in sequence]
3. [etc.]
4. <The feedback loop — how the system cycles back>

**The hierarchy:**
- [Domain]: [Role] — [brief reason]
- [Domain]: [Role] — [brief reason]
...

---

## How to use this framework

**1. As a strategy brief.** [How the four domains define the work in priority order. Names the sequence in which the work should be done.]

**2. As a decision filter.** <The diagnostic questions per domain — written as questions in quotation marks. One or two per domain. These are the specific questions that reveal whether a proposed program, investment, or campaign honors the framework or violates it.>

**3. As a measurement frame.** <The success metric per domain — named as the alternative to the default metric the organization currently uses. Not "number of impressions" but "advocacy rate." Not "number of dealer accounts" but "dealer narrative consistency.">

---

## The Refusal

[What this framework explicitly will not recommend. 4–8 bullet points. Each item names a specific program type, campaign category, market position, or organizational move that feels reasonable but that the framework refuses.

Sources for The Refusal:
- Principles' "What it rejects" sections — aggregate across all principles; every entry here must appear in The Refusal
- The governing condition (if present) — name what must be prevented to maintain it
- OA "What's not in scope" sections — aggregated across all OAs
- The strategic premise — what the activation frame requires NOT doing

Format:
```
This framework does not recommend:
- [Specific program type] — [one-line reason tied to a Principle or the strategic premise]
- [Specific campaign category] — [reason]
...
```

Naming discipline: each item must be specific enough that a planning-session participant would recognize it as something that has been proposed or considered. "Programs that compromise the brand identity" is too vague. "Lifestyle brand positioning that competes with the engineering identity rather than extending it" is specific enough to be used as a veto in a planning meeting.]

---

## The [brand / strategic / organizational] question this framework answers

*<The framing question — one sentence in italics. The exact question this framework was built to answer.>*

[3–5 sentences. The answer the framework gives — not a tagline but a statement of what the organization commits to by adopting this framework. It ends with a plain statement of that commitment, not a line written to be quoted. Plain Writing (statements and names) applies.]

---

*L5 Framework — [Project Name]*
*v[N] — Synthesized from [N] L4 Opportunity Areas / [N] L4 Principles / [N] L3 Insights / [N] L2 Themes / [N] L1 Findings / [N] participant interviews*
*[Date]*
*[If iteration 2+: Iteration N additions: [list]*]
*Synthesis complete.*
```

---

## Domain Section — Detailed Format

Each domain has four required sections plus a header block.

**Header block:**
```
### Domain [N]: [Domain name]
*[One-line descriptor]*

**Design territory:** [OA-NN] — [OA title]
**Governing principle:** [P-NN] — [Principle title]
```

**The strategic task:** The synthesis statement for this domain. What the organization must do here, why, and what structural problem it addresses. 2–4 sentences. Not a list — a paragraph that argues why this domain matters and what the design challenge is. Draws from both the OA ("What this domain designs") and the Principle ("how every decision within it should be made").

**What would change this:** A short paragraph in three parts, written at claim formation. *Counter-cases:* the insights, opportunity areas or evidence that sit awkwardly with this domain's strategic task, and how the domain meets them or where they mark its edge. *Rival reading:* the strongest other way to draw this domain (a competing organizing logic from the ReasoningChain where one ran), and why this one was preferred. *What would make us revise it:* what later research, a pilot or operating experience would have to show for the domain to be re-drawn, stated as a pattern, with no counts, percentages or thresholds. A framework is the best current architecture, not a law: evidence that does not fit re-scopes a domain more often than it removes one. Definition and the drift tell: `l3-insight-synthesis/InsightFormat.md` → The What Would Change This Field.

**What this domain governs:** The specific contents of this domain — the programs, frameworks, toolkits, and design tasks that belong here. Organized by phase or dimension if appropriate. Informed by the OA's "What's in scope" section, but enriched with:
- Specific research evidence (participant names, findings, quotes)
- Historical precedents from within the organization
- Forward strategic references where appropriate
- Durability of evidence (not just "a rider recognition program" but why, grounded in who)

**Why [role]:** The sequencing argument. Why does this domain hold the role it holds in the system? What breaks if it is absent? This is Kolko's forging connections act applied at the system level — naming not just that the domain matters but what fails without it.

---

## The Systems Logic Diagram

Two format options depending on the document's intended use:

**Option A — ASCII text diagram (for the main framework document):**
```
[DOMAIN 1 NAME]
[Descriptor]
        ↓
[DOMAIN 2]              [DOMAIN 3]
[Descriptor]     ←→    [Descriptor]
        ↓
[DOMAIN 4 NAME]
[Descriptor]
        ↓
(feeds back to [DOMAIN 2] — [feedback mechanism])
```

In either option, an opportunity area or principle shown on the diagram carries its short name with the code beside it, never the code alone (see The Visual Document → Each node contains).

**Option B — Mermaid flowchart (for the visual document, separate file):**
The visual document (`L5_Framework_Visual.md`) contains the Mermaid flowchart specification. See visual document format below.

For rendering the Mermaid diagram, use any Mermaid renderer (an optional Mermaid companion skill, if installed). The render command pattern is documented in `L5_Framework_Visual_Notes.md`.

---

## The Visual Document

Filename: `L5_Framework_Visual.md`

```
---
project: [Project Name]
document_type: Framework Visual
source: [L5_Framework_[ProjectName].md]
synthesis_date: [YYYY-MM-DD]
version: [N.0]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L5 Framework>
---

# The [Framework Name] — Visual

## Systems diagram

<Mermaid flowchart — see format below>

---

## How to read the diagram

**Sequence:** [2–3 sentences explaining the flow direction and why.]

**Hierarchy:**
- **[Domain]** — [role]; [brief reason]
- **[Domain]** — [role]; [brief reason]
...

**[The activation premise or equivalent]:** [One sentence naming the central strategic claim the visual communicates.]
```

**Mermaid flowchart format:**
```mermaid
flowchart LR
    classDef [domain1] fill:[color],color:#ffffff,stroke:[color],stroke-width:3px
    classDef [domain2] fill:[color],color:#ffffff,stroke:[color],stroke-width:2px
    ...

    [D1]["[DOMAIN NAME]<br/>[Descriptor]<br/>[What it does]<br/>[OA short name (OA-NN)]<br/>[Principle short name (P-NN)]<br/>[ROLE LABEL]"]:::[domain1]
    [D2]["[DOMAIN NAME]<br/>..."]:::[domain2]
    ...

    [D1] --> [D2] & [D3]
    [D2] <-->|"[relationship label]"| [D3]
    [D2] & [D3] --> [D4]
    [D4] -.->|"[feedback label]"| [D2]
```

Each node contains:
- Domain name (all caps)
- The domain descriptor (the plain one-line statement from the framework document, shortened if needed; not a tagline)
- What it does (2–3 words)
- The short name of each opportunity area and principle the domain holds, with its code beside it: `Help choosing the right size (OA-04)`. Never a code alone. A reader who has only the diagram cannot tell what OA-02 or P-01 is (the researcher's ruling 2026-11-10, after four reviewers flagged bare codes on a client project's visual). The same applies to the ASCII diagram and to any other rendering of the visual.
- Role label (PRECONDITION / ENGINE / SCALE CONDITION / CONVERTER)

---

## The Visual Notes Document

Filename: `L5_Framework_Visual_Notes.md` — working notes on visual design decisions. Contains:
- Assessment of the current render
- What to address in the next iteration
- Three version options (minimal / reference-complete / narrative-annotated)
- Render command reference (for the Mermaid renderer used)

Not a deliverable — a working document for the visual design process.

---

## File Naming Conventions

**Master framework document:**
```
L5_Framework_[ProjectName].md
```

**Visual document:**
```
L5_Framework_Visual.md
```

**Visual notes:**
```
L5_Framework_Visual_Notes.md
```

**Rendered diagram output:** Written by the Mermaid renderer to the same directory.

---

## Plain Writing (statements and names)

Every statement a reader sees in the framework follows the plain-statement rules in `../l3-insight-synthesis/InsightFormat.md` → The Insight Title Test and Plain Writing in the Body, unchanged (the researcher, 2026-11-05, 2026-11-06 and 2026-11-07). That covers the strategic premise, the framework paragraph, each domain descriptor, the strategic task, What this domain governs, What would change this, the systems logic, the diagnostic questions, the measurement frame, The Refusal, and the framework question and its answer. In short:
- **Literal words.** No figures of speech, no theory terms, no working vocabulary from the synthesis.
- **One idea at a time.** Split a sentence that carries several. A limit gets its own sentence.
- **Say whose reading it is** in a plain sentence, kept apart from what participants said.
- **No line written to be quoted.** A sentence earns its place by saying what is true or what the organization commits to, not by sounding like a slogan.
- **Write names last,** after the content they name.

**Names** (the framework name and the domain names) are the one difference. They stay short, often one or two words, because they are used as handles. But a name must be understood on first read by a reader with no project context, without being explained. A name that needs decoding, a figure of speech, a clever contrast or a coined term fails, however easy it is to recall (the researcher, 2026-11-07).

Audit: `workflows/AuditFramework.md` → Audit 2 (Domain Naming) and Audit 2b (First Read).

---

## Domain Naming Discipline

A framework domain name is not the OA title. It is a new, short, plain name for the integrated territory — the combination of OA (where to act) and Principle (how to act) produces a domain that is larger and more specific than either alone. Write the name and the descriptor after the domain's strategic task and What this domain governs, then name what they cover.

| Form | Example | Problem |
|------|---------|---------|
| **OA title restated** | "Community-led growth architecture" | That's the OA; the domain is larger |
| **Principle title restated** | the governing principle's title, word for word | That's the Principle; the domain contains it |
| **Generic** | "Marketing" / "Operations" | No synthesis value — could apply to any organization |
| **Figurative or coined** | "The Flywheel" / "Ground Truth" | Needs decoding; a cold reader cannot say what it covers |
| **Right** | "Dealers" — *How buyers are treated in the shop, and how the brand checks it* | Short plain name; the descriptor says what the domain is for |

**Domain naming pattern:**
- 1–2 words, noun-based, in the reader's ordinary vocabulary: Identity / Growth / Experience / Access / Community / Dealers / Service
- Followed by a one-line italic descriptor that is a plain statement of what the domain is for. It is not a slogan or a pair of imperatives.

| Fault | Before | After |
|-------|--------|-------|
| Slogan descriptor | *"Name what you stand for. Show where it lives."* | *"What the brand stands for, and where buyers see it."* |
| Figurative descriptor | "Growth" — *Invest where conviction forms* | "Growth" — *Spend where riders decide to buy, which is on rides with people they know.* |

**The naming test (first read):** Could a reader with no project context say, from the name and its descriptor alone, what each domain covers? If any name or descriptor needs explaining, rewrite it from what the domain contains. Do not test whether names are easy to recall: a recall test rewards cleverness.

---

## Pairing Logic — OA + Principle → Domain

The pairing is the core synthesis act at L5. It is not mechanical; it requires judgment about which Principle(s) genuinely govern the decisions within which OA territory.

**How to identify genuine pairings:**

1. *Ask what decisions this OA involves:* Every scope item in the OA is a type of decision. Which principle should govern each one? If the same principle appears consistently across the OA's scope items, it is the governing principle.

2. *Ask whether the principle yields a directional answer within this territory:* A principle that doesn't generate a clear test question for the OA's decisions is not genuinely governing it.

3. *Allow one OA to have two principles when the domain has two genuinely distinct decision moments:* If the OA covers purchase AND post-purchase, and each moment requires a different behavioral rule, the domain has two governing principles. Do not force these into one principle.

4. *Allow one principle to appear in multiple domains as a secondary contributor:* A principle that is primarily governing one domain may also constrain decisions in another. Note it as secondary rather than primary.

**Pairing map format:**
```
<OA-NN: OA title> ← primary governing: <P-NN: Principle title>
                  ← also constrained by: <P-NN: Principle title> (secondary)
Domain name: [Name]
```

---

## Systems Logic — Four Structural Roles

Every framework should name four structural roles for its domains. The role *register* is domain-specific — see `DomainScope.md` for the names per project type (e.g. "Adoption engine" for product/UX, "Primary mechanism" for organizational, "Primary lever" / "Reach condition" for policy/advocacy). These should match the register the domains' OAs used in the L4 relationship map. The brand/design template below is a strong general model:

| Role | Definition | Diagnostic question |
|------|-----------|---------------------|
| **Precondition** | Must be addressed first; without it, no other domain has direction or coherence | "Without [domain], would the other domains know what they're building toward?" |
| **Engine** | Drives the primary growth or value-creation mechanism | "Without [domain], how does the organization bring new [customers / members / relationships] in?" |
| **Converter** | Turns what the engine generates into lasting relationship, advocacy, or value | "Without [domain], what happens to what the engine brings in?" |
| **Scale condition** | Determines how far the system can grow; either enables or limits the others | "Without [domain], what is the ceiling on the system's reach?" |

**Governing condition — check explicitly before closing the pairing map:**

Some frameworks require a fifth structural element that is not a domain. A governing condition operates simultaneously across all domains — it is not sequenced with them, it constrains them. It often surfaces as a Principle whose test question applies to every domain equally (not just one), or as an OA whose scope covers competitive, governance, or identity defense that must be active regardless of which domain is being worked.

Ask: "Is there a Principle or OA that cannot be assigned to a single domain — because it must govern all domains simultaneously?" If yes, do not force it into a domain pairing. Name it as a governing condition in the systems logic and in "The framework" introductory paragraph. It appears in the visual as a spanning element (horizontal bar or enclosing ring), not as a sequential node.

Document the result explicitly either way: "Governing condition present: [name and source]" or "No governing condition — all OAs and Principles are domain-specific."

**The feedback loop:** Every system should have at least one feedback mechanism — a point at which the downstream output feeds back into an upstream input. In the Meridian model: advocates → seeders → feed Growth. The feedback loop is what makes the system compounding rather than linear.

**Parallel domains:** Two domains may operate in parallel rather than strictly sequentially. If they are mutually enabling (each makes the other more effective), name that relationship explicitly with a bidirectional label.

---

## Volume Calibration

The L4→L5 synthesis does not compress in the same way as prior levels. The framework typically has:
- Domains: approximately equal to the number of OAs (usually ± 1)
- One domain may absorb two OAs if they genuinely address the same strategic territory
- One domain may have two governing Principles if it has two distinct decision moments

| L4 OAs | L4 Principles | Expected L5 Domains |
|--------|---------------|---------------------|
| 3–4 | 3–5 | 3–4 |
| 4–5 | 4–6 | 4–5 |
| 5–6 | 5–7 | 4–6 |

*These ranges are normative calibration, not derived targets — the audit checks are the principle, not the count. Never split, merge, or invent an item to land inside the range.*


**The framework is not an index.** A framework with six domains that maps one-to-one with six OAs and six Principles has not synthesized — it has organized. The synthesis act is the pairing, the naming, and the sequencing. Even if the number of domains equals the number of OAs, the framework represents a different kind of knowledge than the OA set.

---

## Theoretical Basis

**Kolko's concept mapping applied at L5:**
The framework is a concept map of the strategy — entities (domains) connected by relationships (sequencing, feedback, parallel operation). Kolko notes that creating the map is generative: the architecture emerges from the act of pairing and connecting, not from prior specification. The framework reveals relationships between the L4 outputs that were not visible when each was written separately.

**Kolko's forced semantic zoom:**
The framework is a zoom-out from the L4 level — the level at which individual OAs and Principles are the units. At L5, the units are domains. The relationships visible at the domain level (precondition → engine → converter → scale) are not visible at the OA level, where each OA stands alone.

**Chipchase's platzgeist at L5:**
The systems logic sequence must respect organizational platzgeist — what can the organization actually do first? A framework that places a difficult, long-lead-time domain as the precondition for all others may be architecturally correct but organizationally impossible. If platzgeist requires sequencing adjustments, name them explicitly in "How to use this framework" — the sequence in which the work "can and should be done."

**Chipchase's research as gift — completed at L5:**
The L5 framework is the final mechanism for honoring the research-as-gift obligation. Prior levels organized the data (L1), found the patterns (L2), named what they mean (L3), defined where and how to act (L4). L5 closes the loop: it makes the entire synthesis usable as an organizational decision tool. The framework is the gift, delivered.

**The activation frame (this ladder's construct, built on Kolko's problem-finding):**
The strategic premise names the gap between what the synthesis reveals about the organization's current state and what the framework requires the organization to build. Kolko's "problem finding" act produces the insight; the framework is what converts that insight into a solvable organizational design problem.
