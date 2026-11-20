# SynthesizeFramework Workflow

Integrate L4 Opportunity Areas and L4 Design Principles into an L5 Strategic Framework — a named, domain-structured, diagrammed architecture that makes the full synthesis usable as a strategy brief, decision filter, and measurement frame.

## Before You Start

Read `FrameworkFormat.md` in the skill root. It contains:
- Master framework document format
- Individual domain section format
- Plain Writing (statements and names) — applies to every sentence a reader sees
- Domain naming discipline
- Pairing logic (OA + Principle → Domain)
- Systems logic format and four structural roles
- Visual document format (Mermaid)
- Volume calibration
- Theoretical basis

Also read `DomainScope.md` in the skill root. It parameterizes the systems-logic role register (Precondition / engine / converter / scale condition, named per domain) and the closing-question / framework-name register, for brand/design, product/UX, organizational, policy/advocacy, and other.

---

## Step 1: Locate and Load the L4 Files

Confirm with the user:
- Where the L4 Opportunity Area files are (full directory path)
- Where the L4 Principle files are (full directory path)
- Where to write the output (output directory)
- Project name for file naming
- **Project domain:** brand/design | product/UX | organizational | policy/advocacy | other

List all L4 OA files and all L4 Principle files. Read each one fully before beginning any pairing work. Read both sets before synthesizing either — the integration requires holding both simultaneously.

**Inherit the domain:** Both the L4 OA and Principle files carry a `domain:` field — inherit it (they will agree) and confirm rather than re-asking; if the L4 files predate the domain field, confirm explicitly. The domain sets the systems-logic role register and the closing-question register — read the matching entry in `DomainScope.md`. Carry the confirmed domain into the L5 framework and visual frontmatter. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.domain_scope_confirmation`.

If L4 Value Proposition files are present in the provided paths, note them but do not read them yet. They are used in Step 6.5 (VP Coherence Check) after all domains are written — not during pairing. Reading them before pairing risks anchoring the pairing decisions on VP customer profiles rather than on OA + Principle logic.

**Audit gate (added 2026-09-23):** Check each L4 set this synthesis reads, in its own directory: `L4_OpportunityAreaSet_Audit_[ProjectName].md` and `L4_PrincipleSet_Audit_[ProjectName].md` (both "Cleared for L5"), and `L4_VP_Set_Audit_[ProjectName].md` when VP files are supplied. Run it first when the report is missing, when its gate is not cleared and it carries no `advanced_with_open_flags` line, or when any file in the set is newer than the report; tell the user which applied. Procedure: `../ladder-core/ladder-map.md` → Running a level audit. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`.

**Data gate:** If no L4 OA or Principle files are provided or located at the stated paths, stop here and ask. Do not proceed using general knowledge as a substitute for prior synthesis outputs. VP files are optional — their absence means the Step 6.5 check is skipped, not that synthesis cannot proceed.

---

## Step 2: Build the L4 Inventory

After reading all L4 files, build a unified working inventory. This is not two lists — it is one list that prepares for pairing.

```
OAs:
[OA-NN] — [Title]
Governs: [domain]
Design problem: <one clause — the structural gap this OA addresses>
HMW: <one clause — the design question>

Principles:
[P-NN] — [Title]
Governs: [domain]
Behavioral demand: <one clause — what the organization must always do>
Decision domain: [what types of decisions this governs]
```

After building the inventory, note:
- Which OAs address the same strategic territory as which Principles? (shared domain, shared participants in evidence)
- Which Principles generate test questions that apply directly to an OA's scope items?
- Which OAs might require two governing Principles (two distinct decision moments)?
- Which Principles appear across multiple OAs as secondary constraints?

---

## Step 3: Build the Pairing Map

This is the core synthesis act at L5. Identify which Principle(s) genuinely govern the decisions within which OA territory.

**For each OA:**
1. Read the OA's "What's in scope" items as a list of decision types
2. Ask: which Principle's test question applies to these decision types?
3. If one Principle's test question applies consistently across all scope items → single governing Principle
4. If the OA has two distinct phases or moments, each requiring a different behavioral rule → two governing Principles
5. Check whether any Principle provides a secondary constraint on this OA's decisions — note as secondary, not primary

**Document the pairing map:**
```
<OA-NN: Title>
Primary governing principle: <P-NN: Title>
Reason: <one sentence — why this principle's test question applies to this OA's decisions>
Secondary constraint (if any): <P-NN: Title>
Second governing principle (if applicable): <P-NN: Title>
Reason: [one sentence]

Candidate domain name: [working name]
```

**Check for unpaired OAs or Principles:**
- An OA with no governing Principle may need a new Principle derived from the synthesis (rare — typically means a Principle was missed at L4)
- A Principle that doesn't govern any OA primarily may appear as secondary across several OAs — this is valid
- Do not force pairings that don't serve the architecture

**Governing condition check — required before closing the pairing map:**

Ask: "Is there a Principle or OA that cannot be assigned to a single domain — because it must govern all domains simultaneously?"

If yes:
- Do not force it into a domain pairing
- Name it as a governing condition (see `FrameworkFormat.md` — Systems Logic Roles)
- Document: `Governing condition: [Name] | Source: [P-NN or OA-NN] | Requires: [one-sentence mandate that applies to all domains]`

If no:
- Document explicitly: "No governing condition — all OAs and Principles are domain-specific"

Do not skip this check. Governing conditions forced into domain pairings produce frameworks that cannot hold the cross-cutting logic those OAs and Principles contain — and those elements will be absent from the framework architecture with no explanation.

---

## Step 4: Identify the Domains (working labels)

For each confirmed OA-Principle pairing, identify the integrated domain. The domain is not the OA. It is the combined territory.

1. Identify the integrating concept — what is this domain ultimately about? What do the OA's design territory and the Principle's behavioral demand share at the deepest level? Write it as one plain sentence.
2. Give the domain a working label for your own use (the OA number is enough). **Do not name it yet.** The name and descriptor are written last, in Step 6, after the domain's content (the researcher, 2026-11-07, extending the L2/L3 title-last rule of 2026-11-06). A name chosen first and defended afterwards tends to carry the argument in a clever word.

---

## Step 5: Write the Strategic Premise

Before writing any domain, write the strategic premise — the framing statement that orients the entire framework.

**The strategic premise has four components:**

1. *What the research established:* What does the organization have? State it specifically — the equity, the community, the mechanism, the positioning. Name the evidence: "The evidence is in the research: [specific named findings]."

2. *What built it — and what didn't:* What created this starting position? Often it was the product, the founder, the behavior, or the category — not brand management. Name this specifically. It defines the gap.

3. *The strategic task:* What does this starting condition require the organization to do? State the activation frame: "The work is not [X]. It is [Y]." This is the sentence the framework is built around.

4. *Iteration 2+ additions (if applicable):* Name any findings from subsequent synthesis passes that make the brief more specific.

The strategic premise is typically 2–4 paragraphs. It should be readable without the prior synthesis levels — it orients a client who is encountering the framework for the first time. Write it in plain words: `FrameworkFormat.md` → Plain Writing (statements and names). The activation-frame sentence states what the work is and is not in literal terms; it is not written to be quoted.

---

## Step 6: Write Each Domain

For each confirmed pairing, write the domain section using the format from `FrameworkFormat.md`.

**Writing order:** content first, name last. Every section follows `FrameworkFormat.md` → Plain Writing (statements and names).

1. **The strategic task** — 2–4 sentences. What must be done here and why. Name the structural problem. State the task as an organizational design challenge. Draw from both the OA ("design territory") and the Principle ("behavioral demand"). This is not a list of programs — it is the argument for why this domain is necessary.

2. **What this domain governs** — bullet list. Pull from the OA's scope, but enrich with specific evidence: participant names, quotes, historical precedents, forward strategic references. This section should feel grounded — not abstract programs but specific design work backed by specific human evidence.

> **Anti-fabrication rule:** Cite only participants, quotes, moments, and precedents that appear verbatim in the read L4/L3/L1 artifacts. If no verbatim quote exists, cite the behavioral moment instead — never construct, sharpen, or approximate a quote, and never introduce a historical precedent not present in the source files. Narrative connective tissue carries `(illustrative framing)`.

3. **Why [role]** — 2–4 sentences. The sequencing argument. Why does this domain hold the role it holds (precondition / engine / converter / scale condition)? What breaks if it is absent? This is the connection to the systems logic.

4. **What would change this** — per domain, at claim-formation time: the counter-cases (insights, OAs or evidence that sit awkwardly with the strategic task, and how the domain meets them), the rival reading (the strongest competing way to draw the domain; from the ReasoningChain's competing logics where one ran), and what later research, a pilot or operating experience would have to show for the domain to be re-drawn, with no counts, percentages or thresholds. Format: `FrameworkFormat.md`; definition: `l3-insight-synthesis/InsightFormat.md` → The What Would Change This Field.

5. **Name and descriptor, then the header block** — now state in 1–2 plain words what the domain covers, and write the one-line descriptor as a plain statement of what the domain is for. Test both by first read: could a reader with no project context say what the domain covers from the name and descriptor alone, without explanation? No figures of speech, coined terms, slogans or pairs of imperatives. Patterns and before/after examples: `BuildDomain.md` → Writing Order steps 4–5 and Descriptor Construction. Then write the header block: name, descriptor, OA reference, Principle reference(s).

**Quality check before moving to the next domain:**
- [ ] Domain name is 1–2 words, plain, understood on first read without explanation, not the OA title
- [ ] Descriptor is one plain sentence saying what the domain is for — not a slogan
- [ ] Name and descriptor were written after the domain content
- [ ] All text meets `FrameworkFormat.md` → Plain Writing (statements and names)
- [ ] OA and Principle references are correct
- [ ] "The strategic task" names the structural problem AND the design challenge
- [ ] "What this domain governs" includes specific participant evidence, not just program types
- [ ] "Why [role]" names what specifically fails if this domain is absent

---

## Step 6.5: VP Coherence Check

If L4 Value Proposition files are available, run this check before writing the systems logic. VPs are validation artifacts — they face the customer-facing question (what to offer, for whom) while the framework faces the organizational question (how to act, in what sequence). This check confirms the two faces are coherent.

**For each domain:**
1. Identify the corresponding VP — the VP whose OA reference matches this domain's OA (each VP is the offering hypothesis for one OA; one VP per domain)
2. Read the VP's primary job statement (Customer Profile → Primary job → Functional)
3. Ask: **"Does this domain's strategic task create conditions for the VP's Products & Services to exist?"** — not "does the domain describe the same things as the VP?" but "if this domain succeeds organizationally, does it become possible for the VP to be delivered?"
4. Ask: **"Does 'What this domain governs' address the primary pain the VP names as EXTREME or SIGNIFICANT?"**

**Document the result for each domain:**
```
VP coherence — [Domain name]:
Corresponding VP: VP-NN ([VP title])
VP primary job: [one clause]
Domain task creates conditions for VP: [Yes / Partial / No]
Primary pain addressed in domain governs: [Yes / No]
Flag (if any): [what's missing or incoherent]
```

**If coherent (all domains):** Note "VP coherence check passed" and proceed to Step 7.

**If incoherent:** Do not proceed to systems logic until resolved. Either:
- The domain's strategic task needs adjustment to create conditions for the VP
- The domain's "What this domain governs" is missing the pain the VP identifies as most severe
- Rarely: the VP-to-OA mapping is wrong (check VP's OA Cross-Reference section)

**Important:** You are not retrofitting the domain to match the VP. The domain was correctly built from OA + Principle. You are checking that the organizational architecture creates conditions for the customer-facing offering to succeed. A mismatch is a coherence failure in the pairing, not a reason to reorganize around the VP.

**If no VP layer exists:** Document "No VP layer — coherence check skipped" and proceed to Step 7.

---

## Step 7: Name the Systems Logic

After writing all domains, name the architecture explicitly.

**The systems logic has four components:**

1. **The diagram** — either an ASCII text diagram embedded in the framework document, or a Mermaid flowchart specification in the separate visual document (or both). The diagram must show: the flow from precondition → engine → converter, any parallel operations, and the feedback loop.

2. **The sequence** — numbered list, one entry per domain, naming why each domain occupies its position. The sequence is not just an order — it is an argument for why the work must be done in this order.

3. **The hierarchy** — one bullet per domain, naming its structural role and a brief reason. Use the domain's role register from `DomainScope.md` (precondition / engine / converter / scale condition for brand/design; the equivalent names for product/UX, organizational, or policy/advocacy), matching the register the OAs used in the L4 relationship map.

4. **The feedback loop** — explicitly named: what downstream output feeds back into which upstream input, and why this makes the system compounding rather than linear.

---

## Step 8: Write the Three Practical Uses

For each of the three uses, write specifically — not generically.

**1. As a strategy brief:** Name the priority order for doing the work. The sequence should match the systems logic. What comes first? What runs in parallel? What converts what? Name the activation sequence explicitly.

**2. As a decision filter:** Write the diagnostic questions — in quotation marks, as the actual questions a decision-maker would ask. One or two per domain. These should be drawn from the Principles' "How to apply it" test questions, made specific to the framework context and written as plain questions a decision-maker could ask unprompted. Each question should have a clear directional answer when the framework is being honored.

**3. As a measurement frame:** Name the success metric per domain — explicitly as the alternative to the default metric the organization currently uses. Not "impressions" but "advocacy rate." Not "number of dealer trainings" but "dealer narrative consistency." The metric should be specific enough to measure.

---

## Step 8.5: Write The Refusal Section

The Refusal is a required section in every L5 framework. Write it before the brand/strategic question.

"The Refusal" names what this framework explicitly will not recommend — the program types, campaign categories, market positions, and organizational moves that feel reasonable but that the framework refuses.

**Sources for The Refusal (check each):**
1. Principles' "What it rejects" sections — aggregate across all principles; every entry in any principle's "What it rejects" must appear in The Refusal
2. The governing condition (if present) — name what must be prevented to maintain the governing condition across all domains
3. OA "What's not in scope" sections — aggregated across all OAs, these name the territories the framework deliberately refuses
4. The strategic premise — what the activation frame requires NOT doing

**Writing format:**
```
## The Refusal

This framework does not recommend:
- [Specific program type] — [one-line reason, tied to a Principle or the strategic premise]
- [Specific campaign category] — [reason]
...
[4–8 items; at least one per domain]
```

**Naming discipline:** Each item must be specific enough that a planning-session participant would recognize it as something that has been proposed or considered. Too vague: "programs that compromise the brand identity." Specific enough: "lifestyle brand positioning that competes with the engineering identity rather than extending it."

**Validation:** After writing The Refusal, check it against every principle's "What it rejects" section. Every "What it rejects" entry must have a corresponding item in The Refusal. If any are missing, add them.

---

## Step 9: Name the Brand/Strategic Question

Every framework answers a specific question. Name it.

Write the question in italics as a single plain sentence: *How does [organization] [do what], [for whom or under what conditions]?* A reader with no project context should be able to say what it asks.

Then write the answer the framework gives — 3–5 sentences. This is the closing paragraph of the framework document and the closing statement of a client presentation. It should:
- Name what the organization commits to by adopting this framework
- Restate the activation frame from the strategic premise
- End with a plain statement of what the organization commits to. Do not write a line to be quoted: a sentence earns its place by what it says, not by how it sounds (the researcher, 2026-11-07). Plain Writing (statements and names) applies.

---

## Step 10: Write the Visual Document

Write `L5_Framework_Visual.md` as a separate file using the Mermaid flowchart format from `FrameworkFormat.md`.

**Node content for each domain:**
```
["[DOMAIN NAME (all caps)]<br/>[Positioning phrase from principle]<br/><What it does — 2-3 words><br/>[P-NN · OA-NN]<br/>[ROLE LABEL (all caps)]"]
```

**Edge labels:**
- Label bidirectional edges: "mutually enabling" or equivalent
- Label the feedback loop: "advocates become seeders" or equivalent
- Leave directional edges unlabeled if their meaning is clear from position

**Color coding:** Assign one color per domain. Use distinct colors. Navy/green/purple/dark red is a strong starting palette.

Note the three version options in `L5_Framework_Visual_Notes.md`:
- Minimal (presentation-ready): strip to domain name, principle phrase, role label; remove P/OA codes
- Reference-complete: restore P/OA codes; add edge labels to all arrows
- Narrative-annotated: add numbered sequence to arrows for first-time readers

---

## Step 11: Confirm Completion

Report:
```
L5 Framework synthesis complete — [Project Name]

[N] domains written to [output directory]:
- [Domain 1]: [OA-NN] + [P-NN] — [role]
- [Domain 2]: [OA-NN] + [P-NN] — [role]
...

Systems logic: [precondition] → [engine] ↔ [scale] → [converter] → (feedback to [engine])

Strategic premise: [one sentence naming the activation frame]

Output files:
- L5_Framework_[ProjectName].md — master framework document
- L5_Framework_Visual.md — Mermaid diagram specification
- L5_Framework_Visual_Notes.md — visual design working notes

To render the diagram: use any Mermaid renderer (an optional Mermaid companion skill, if installed)

Synthesis ladder complete:
[N] L1 Findings → [N] L2 Themes → [N] L3 Insights → [N] L4 OAs + [N] L4 Principles → [N] L5 Domains

Before delivery — two gates remain:
1. A fresh agent runs AuditFramework (Final Step below); clear its "Synthesis complete" gate.
2. Then run the FinalLadderReview capstone (two-reviewer cross-level audit of L2–L5). Do not deliver with unresolved flags.
   Delivery HALTS while the framework frontmatter reads final_ladder_review: pending —
   canonical condition: config/synthesis-gates.yaml → gates.final_ladder_review_before_delivery.
felt_flags: <none-issued | "<report> — settles when <condition>"; semicolon-separate multiple reports on one line>
```

---

## Quality Checks Before Writing Files

**For the framework as a whole:**
- [ ] `domain:` is set in the framework and visual frontmatter (inherited from the L4 files); systems-logic roles and the closing question use that domain's register per `DomainScope.md`
- [ ] Strategic premise names the starting condition AND the strategic task (activation frame)
- [ ] Each domain has a name that is NOT the OA title
- [ ] Each domain is correctly paired with its governing Principle(s) — not mechanical, but argued
- [ ] "What this domain governs" includes specific participant evidence, not just abstract program types
- [ ] "Why [role]" names what breaks if the domain is absent
- [ ] Systems logic names sequence, hierarchy, feedback, and any parallel operations
- [ ] Three uses are written specifically — decision filter questions are in quotation marks with directional answers
- [ ] Measurement metrics are named as alternatives to defaults
- [ ] The brand/strategic question is a single plain sentence in italics; the answer closes with a plain statement of what the organization commits to
- [ ] Domain names and descriptors pass the first-read test; every statement meets `FrameworkFormat.md` → Plain Writing (statements and names)
- [ ] Mermaid visual document written with correct node content and edge labels
- [ ] Governing condition check completed — either a governing layer is named and documented, or its absence is documented explicitly
- [ ] "The Refusal" section is present with 4–8 specific items sourced from Principles' "What it rejects," the governing condition, OA scope exclusions, and/or the strategic premise
- [ ] Every principle's "What it rejects" entry has a corresponding item in The Refusal
- [ ] Each Refusal item is specific enough to be used as a veto in a planning meeting — a named program type, not a general category
- [ ] VP coherence check completed (Step 6.5) — either "passed" documented for all domains, or "no VP layer" documented; no incoherence left unresolved

---

## Complementary Check: Structural-Form Discovery

This workflow produces a domain pairing architecture — the structural form is always a sequenced domain system. Structural-form discovery (this skill's `SKILL.md`, Two Approaches) takes a different approach: it discovers the structural form from a candidate table (hierarchy, spectrum, matrix, cycle, hub-and-spoke, ecosystem, reinforcing loop, balancing loop) and applies a generativity test.

**Consider running it when:**
- The domain architecture has feedback dynamics — domains that strengthen each other or correct each other across cycles. If the system logic names a feedback loop (Step 7), the structural form discovery approach may surface loop-form candidates (reinforcing or balancing) worth testing against the data.
- The framework does not feel generative — it describes the OAs it was built from but cannot answer novel design questions. The generativity test in structural-form discovery is specifically designed to catch this failure.
- A second structural read is warranted — for high-stakes work where the organizing logic should be stress-tested from a different angle before delivery.

This is not a required gate. It is a complementary lens — most frameworks that pass the Step 7 systems logic check and the AuditFramework gate do not need it. Use judgment.

---

## Final Step: Audit — REQUIRED

After writing the framework and visual documents, dispatch a fresh agent to run `AuditFramework` on the completed framework (procedure: `../ladder-core/ladder-map.md` → Running a level audit; canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`). The workflow is not finished until `L5_Framework_Audit_[version].md` is saved beside the framework and its "Synthesis complete" gate is cleared, or the user has chosen to proceed with open flags and that choice is recorded in the report. Do not deliver or hand off to FinalLadderReview before then. The audit catches integration failures (L4 summary dressed as L5), domain naming problems, pairing logic gaps, weak systems logic, unusable decision filters, and visual document errors that the quality checklist above does not surface.

After AuditFramework clears, run `FinalLadderReview` for the cross-level L2→L5 audit before final delivery. Final delivery — and any no-return handoff to downstream work — halts unless the review report exists and is referenced from the framework's `final_ladder_review:` frontmatter field. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.final_ladder_review_before_delivery`.
