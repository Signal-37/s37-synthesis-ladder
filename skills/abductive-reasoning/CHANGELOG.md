# abductive-reasoning — Changelog

---

## 2026-09-23 — Attribution-accuracy pass for the portable edition (the researcher asked for a copyright review)

Copyright: no verbatim quotations from any source; FrameCreation carries Dorst's step structure and names with credit (method, not expression). Attribution fixes in `citations.md`: Weedon 2019 restated to its abstract (the entry had credited him with a claim the abstract does not make); Huh 2016 corrected to 29(2), 47–63, full title; Lee 2020 pages added; the closing note no longer calls Dorst p. 75 confirmed. KnowledgeFunnelMapping's Three Chasms table captioned as adapted from Kolko's Table 6.1.

**Checked against *Frame Innovation* (book PDF) the same day.** Provenance note: the book entered this skill through the 2026-06-03 research pass, not a reading; this is the first check against the text. Confirmed: nine steps and their names (Figure 4.1, p. 75), nineteen case studies (p. xvi). Not supported, removed: "most anonymized," and the unsourced "secondary sources cite 10 steps." **Corrected: "Dorst's three criteria" is not an enumerated list in the book.** FrameCreation Step 7 now says the three criteria are drawn from the Futures step (pp. 78–79: "on the right track," "fruitfulness," a value proposition for all parties), with the numbered wording marked as this skill's. Copyright: Step 2's paradox definition was a close paraphrase of Dorst's (p. 51) without credit; now reworded and credited. Step 6's template now credits Dorst's frame formulation (p. 78). The 2026-06-03 entries below that say "Dorst's three criteria" and "confirmed from … p. 75" are superseded by this one. The portable edition in s37-collab picks these up at its next build.

**Free-online sources checked the same day** (source PDFs kept; findings spot-checked by grep against each). Peirce CP vol. 5, Thagard 1989, Tversky & Kahneman 1974, Timmermans & Tavory 2012, Dorst 2015 (*She Ji*), Dorst 2018. Fixed:
- **ObservationToHypothesis Step 1:** "Could I have predicted this…?" had been quoted as "Timmermans & Tavory's defamiliarization test." The question is not in their article, and their defamiliarization is a different move (p. 177). Now labeled the skill's own surprise test.
- **Peirce / "best explanation":** Peirce's form (CP 5.189) concludes only "reason to suspect." SKILL.md Form 1 and citations.md now say the skill's formula adapts 5.189 and that choosing the best candidate comes from the later IBE literature.
- **Dorst 2018:** had been credited with a 1–7 / 8–9 "organizational embedding" split it does not make; FrameCreation's scope line now marks the boundary as the skill's own.
- **"Alternate casing" → "alternative casing"** everywhere (the article's term).
- **ECHO** = "Harmany" (Thagard's pun on Harman), not "Harmony"; "full belief network" softened to the hypotheses and evidence in play.
- **Timmermans & Tavory 2012, Tversky & Kahneman, Dorst 2015 (*She Ji*):** summaries restated to what the sources say, with page cites; the skill's design applications marked as its own. DOIs added for Thagard and Dorst 2018.
Not checked: the 2014 *Abductive Analysis* book and the book-only sources (Lipton, van Fraassen, Magnani, Martin, Klein, Weick, Ragin, Johnson-Laird).

**Unchecked sources restated to general credit (the researcher, same day: locating every source is not worth the work).** `citations.md` now opens with an attribution rule: a claim about what an author wrote carries a checked locator or is phrased as general credit, with the skill's own applications marked. Restated: Harman, Lipton, van Fraassen, Magnani, Goldschmidt, Martin, Klein 1993, Klein et al. 2007, Weick, Hallihan & Shu, Croskerry, Tavory & Timmermans 2014, Ragin, Johnson-Laird. Removed: the "six sensemaking activities," Lipton's "threshold condition," Magnani's "negation as failure" as his formal term, and SKILL.md's claim that "Code" is Kolko's rendering of Martin. Kolko 2010 checked against the article: the "synthesis ladder" was the entry's wording, not Kolko's; now marked as the skill's use. Step 4 renamed "Evaluate Against the Explanatory Virtues (after Lipton and the IBE literature)", since the seven virtues are not Lipton's list. Dorst 2011: primary text not found; corroborated by a secondary reading summary and marked so.

## 2026-08-22 — Alexander cheap lane (the researcher slot rulings 2026-08-22; details in skills/CHANGELOG.md)

ObservationToHypothesis: 'Felt residue (optional)' field added at the competing-hypotheses discard point (clause-4 pairing; feeds rung felt_flags).


## 2026-07-11 — Quad-chair audit (Architect + Engineer + QualResearcher + DesignStrategist): guardrails installed, locators corrected, workflows given teeth

First audit of this skill, and the first to seat a scoped fourth chair (DesignStrategist, on the two generative workflows as instruments). All four fix sets researcher-approved.

**Engineer (the largest gap — one guardrail type of five was implemented):** Data gates added at the entry of all four workflows (the skill was generative with no halt-if-no-data anywhere — a model could invent observations and launder them through a correctly-formed `[HYPOTHESIS — …]` tag). ReasoningChain, the client-facing deliverable, gained its missing labeling requirement. Anti-fabrication rules added at the free-narrative steps (FrameCreation Steps 4/7, ObservationToHypothesis Step 4). Source-discipline line added for model-injected background knowledge. `citations.md` gained an epistemic-status header (author/work/year citable; finer locators `[model knowledge — verify]` unless dated-verified). Inline status labels added inside the two output template blocks (point-of-use, not just trailing Output sections). All 124 square-bracket template placeholders converted to angle brackets per the frozen convention (22 were dash-clause tag lookalikes).

**QualResearcher (fidelity vs the Kolko corpus + bibliographic web checks):** The out-of-corpus theoretical apparatus (Peirce, Harman, Lipton, van Fraassen, Thagard, Magnani, Dorst, Klein, Weick, Timmermans & Tavory + 6 more) checked out — bibliographic details confirmed where resolvable (Dorst 2011/2015 incl. the 9-step count, Magnani DOI, Kolko 2010), zero fabricated-precision findings. The real errors were in-corpus: **concept/ecosystem mapping mislocated to "Ch. 4" — they are Ch. 7** (corrected with TOC evidence); the Lipton seven-virtue list softened to "adapted from the IBE literature, principally Lipton"; Dorst "p. 75" diagram locator tagged to-verify; Martin funnel "→ Code" disclosed as Kolko's rendering, not Martin's (SKILL.md + CORE map aligned to three-stage). **Locator counter-ruling:** the audit initially flagged "Section Three Introduction introduces the Three Chasms" as a mislocation — the TOC proves it correct (section intro pp. 59–62; Ch. 6 begins p. 63). The chair's seed from the orchestrator carried the wrong premise; the TOC page numbers settled it. KnowledgeFunnelMapping's source line tightened to the verified locator; "Experience Framing" → Kolko's "Experience Frameworking."

**DesignStrategist (workflows as instruments — O2H RESOLVES, FrameCreation PARTIAL):** FrameCreation gained an **Exclusion criterion** (Step 6 table + Step 7 evaluation, disclosed as PAI-added — a frame that rules nothing out is a generativity engine, not a decision filter) and a **rejection gate** at Step 6 (weak on Novelty/Transferability, or excludes-nothing → discard, not advance). Mid-ladder entry note added (Steps 1/3 draw on client history + existing L0/L1 data; if neither exists, wrong escalation). ObservationToHypothesis gained the **withdrawal gate** (Magnani's hypothesis withdrawal, named in Based On since June but never operationalized — an honestly-evaluated bad lot no longer crowns a leader by default), the simplicity instruction re-scoped to selection (it was suppressing cross-domain candidates at the generation step it shared with the diversity requirement), a frame-naming guard at FrameCreation Step 1, and ladder re-entry notes in both outputs (best explanation → L2 theme / L3 insight candidate).

**Architect:** Frontmatter description recut to add the missing FrameCreation trigger surface. l4-archetype-synthesis added to Invoked From (+ reciprocal Relationship section in that skill — it was the only L4 sibling without the escalation, despite its own Sources note calling archetype derivation abductive). Timmermans/Tavory author-order corrected in Based On (2014 book is Tavory & Timmermans); Peirce edition aligned across SKILL.md and the CORE map (Collected Papers, Vol. 5). Verified clean: all 12 pre-existing inbound routes, routing table ↔ file inventory, sibling-fallback conventions, no archived-skill references.

*Correction to the 2026-05-06 entry below (2026-07-11): that entry's title says "Chapter 4 Integration" — the Three Chasms are not Ch. 4 material; its "Section Three Introduction" source line, however, was correct (pp. 59–62, verified via the book TOC). The workflow content it produced was substantively right; only the title's chapter label was wrong.*

## 2026-06-03 — FrameCreation workflow added (Dorst Steps 1–7)

**Source:** Dorst, *Frame Innovation* (MIT Press, 2015); Dorst, *Design Studies* (2011); secondary: Weedon 2019, Lee 2020, Huh 2016.

**Basis:** Structural gap identified — KnowledgeFunnelMapping could route to "Frame Creation (abduction-2)" but no workflow existed to execute it. Scope decision: Option A — fourth workflow inside abductive-reasoning, covering the nine-step process's synthesis portion (Steps 1–7 only).

---

### `workflows/FrameCreation.md` — new file

**Covers:** Dorst's nine-step Frame Creation process, Steps 1–7 (Archaeology, Paradox, Context, Field, Themes, Frames, Futures). Steps 8–9 (Transformation, Integration) are organizational change management — explicitly noted as out of scope.

**Step-by-step structure:**
- Step 1 — Archaeology: problem genealogy, implicit frames in prior attempts, pattern of failures
- Step 2 — Paradox: the structural deadlock formulated as two true statements that cannot be combined; what a successful frame must dissolve
- Step 3 — Context: ethnographic mapping of what current stakeholders actually do (practices, routines, workarounds)
- Step 4 — Field: widening to full intellectual/economic/cultural ecosystem; adjacent domains list as primary feed for Step 6
- Step 5 — Themes: cross-stakeholder structural patterns (descriptive, not normative); explicit distinction between themes and frames
- Step 6 — Frames: the core abductive operation; domain borrowing technique (structural dynamic → candidate source domains → working principle → IF/THEN formulation → paradox test); frame quality criteria table (fruitfulness, paradox dissolution, stakeholder coherence, transferability, novelty)
- Step 7 — Futures: scenario development per frame; evaluation against Dorst's three criteria (directional validity, fruitfulness, stakeholder value); selected frame output with rationale and solution territory

**Key scaffolding decisions:**
- Step 6 most heavily scaffolded — it is the expertise-dependent, under-specified operation in Dorst's methodology (Weedon 2019)
- Themes vs. frames distinction formalized as a comparison table (most common practitioner error)
- IF/THEN frame construction template explicit
- Frame quality criteria table drawn from Dorst 2011 + 2015 with fruitfulness as the primary test
- Frame failures sourced from Lee 2020 (organizational/client resistance) added to Limitations section

**Step count correction:** Workflow uses 9 steps throughout. Secondary sources widely cite "10 steps" in error; canonical count confirmed from process model diagram in Frame Innovation 2015 p. 75.

**Output:** Frame Creation document (genealogy → paradox → practice map → field map → themes → frame candidates → evaluated scenarios → selected frame). Selected frame feeds back to ObservationToHypothesis (prospective mode) or directly to design research.

**Labeling requirement:** All outputs labeled `[FRAME HYPOTHESIS — requires testing]`. *(Historical: this tag was an unregistered variant; remediated 2026-07-10 to the conforming `[HYPOTHESIS — selected frame, a provisional bet; requires testing before presenting as strategy]`, which is what the workflow ships.)*

---

### `SKILL.md` — additions

- FrameCreation added to Workflow Routing table
- Two new examples added: "tried three solutions that all fail the same way" → FrameCreation; "know the outcome but not the solution type" → FrameCreation

---

### `citations.md` — additions (same session)

New file created with full bibliographic record for all abductive-reasoning sources. Added in this session: Dorst 2015 (She Ji), Dorst 2018 (TIM Review), Weedon 2019, Lee 2020, Huh 2016. Step count correction noted.

**Pre-change state for FrameCreation:** N/A — new file; no prior content to restore. To rollback: delete `workflows/FrameCreation.md`; remove FrameCreation row from SKILL.md Workflow Routing table; remove two new examples from SKILL.md Examples section.

---

## 2026-06-03 — Theoretical expansion: Dorst / Magnani / Lipton / Klein / Timmermans & Tavory

**Source:** Extensive research across 7 angles — Dorst (Design Studies 2011, Frame Innovation 2015), Magnani (Abductive Cognition 2010), Lipton (IBE 2nd ed. 2004), van Fraassen (bad lot critique), Klein (RPD model; Data-Frame Theory 2007), Timmermans & Tavory (Abductive Analysis 2014).

**Basis:** Research commissioned to identify gaps against current (Peirce + Kolko + Martin) foundation.

---

### `SKILL.md`

**Added two-form architecture to "What This Skill Does":**
- Form 1 (Peirce) — retrospective abduction: explaining evidence
- Form 2 (Dorst) — prospective abduction: designing toward VALUE when only the outcome is known; WHAT+HOW=VALUE equation; abduction-1 vs. abduction-2 distinction; frames as provisional working principles
- Note on Magnani's manipulative abduction — external representations (diagrams, clusters, prototypes) as epistemic mediators that produce hypotheses through action, not just record prior thoughts

**Expanded "Based On":** Added Dorst, Magnani, Lipton, Klein, Timmermans & Tavory with specific works cited.

---

### `workflows/ObservationToHypothesis.md` — 4 substantive additions

**Step 0 (new): Mode selection.** Determines whether the abduction is retrospective (have evidence, explain it) or prospective (have VALUE, must invent WHAT + HOW). Prospective path uses Dorst's frame-generation approach: borrow a working principle from another domain, ask what WHAT would follow.

**Step 3 expanded: Hypothesis generation diversity.**
- Van Fraassen's "bad lot" prevention — explicit diversity requirement; hypotheses must span theoretical lenses, not just vary phrasing of the same underlying explanation
- Alternate casing (Timmermans & Tavory) — explicitly name what theoretical category each hypothesis treats the observation as; if all hypotheses use the same category, generate alternatives
- Magnani's creative vs. selective mode check — creative mode (no known solution type) requires deliberately suppressing familiar patterns

**Step 4 replaced: Evaluation matrix now uses Lipton's 7 explanatory virtues.**
Old: simple Consistent/Testable/Explanatory Power matrix.
New: scope, precision, mechanism, unification, simplicity, coherence, fruitfulness — with Thagard's coherence check added (winning hypothesis must cohere with full belief network, not just local evidence).

**Step 5 (new): Bias checkpoint before selecting the leading hypothesis.**
Five named biases with specific detection questions: confirmation bias, availability bias, brief anchoring, narrative fallacy, motivated reasoning.

---

### `workflows/ReasoningChain.md` — 2 substantive additions

**Step 1 expanded:** Added "Entering frames" field — the working explanations held at the start of fieldwork. Makes the data-frame evolution traceable.

**Step 2 expanded:** Added "Frame status" field per observation — did this fit the entering frame, require elaborating it, or ultimately require reframing?

**Step 4 expanded:** Added "Operative frame" field — the working principle that is now making the design territory visible.

**Step 5 replaced: Three failure modes named explicitly.**
Old: single open "what would falsify this?" question.
New: four distinct failure triggers:
- Positive falsification (evidence directly contradicts)
- Negation as failure (extended exploration without confirmation)
- Coherence failure (broader context makes hypothesis incoherent even if local evidence holds)
- Fruitfulness failure (hypothesis leads nowhere productively)

**Added: Discarded hypotheses recommendation** — document what was considered and rejected; audit trail makes synthesis more defensible and proves genuine engagement with alternatives.

**Added: Klein's data-frame lens to "Why This Matters"** — situates the chain as a formal data-frame fit document.

---

### `workflows/KnowledgeFunnelMapping.md` — 1 addition

**Step 3 expanded:** Mystery zone now distinguishes two required abduction types:
- Retrospective (have evidence): route to ObservationToHypothesis
- Prospective (have VALUE only): route to Frame Creation (abduction-2) — borrow candidate frames from adjacent domains

**Step 4 expanded:** Mystery zone section in the map template now includes the abduction-type determination.

---

### Pre-change state (rollback reference)

Complete original content for every section that was replaced or materially altered. To rollback: restore each block to the named file at the named location.

---

**`SKILL.md` — "What This Skill Does" (entire section, before two-form architecture):**

```markdown
Makes abductive reasoning — the creative inferential move at the heart of design synthesis — legible
and auditable. Abduction produces new knowledge by selecting the best explanation for a surprising
observation. It's neither deduction (guaranteed true) nor induction (probabilistically true) — it
creates hypotheses that warrant investigation.

**Peirce's abductive formula:**

```
Surprising Observation + Background Knowledge → Best Explanation (Hypothesis)
```

The three-part structure is the operative unit of abductive reasoning:
1. **Surprising Observation** — something that doesn't fit the current model (if it confirms what
   everyone believed, it's not generative)
2. **Background Knowledge** — what you already know from experience, prior work, and domain
   expertise (this is what enables the leap — without it you're just guessing)
3. **Best Explanation** — the hypothesis that, if true, would make the surprising observation
   unsurprising; selected from competing candidates by explanatory power and parsimony

The third element introduces new knowledge. It is not in the data and not in the background
knowledge — it is abducted from the relationship between them. This is why synthesis cannot be
automated: the background knowledge is held by the practitioner, not the data.

This skill helps you structure the leap, document the chain, and position design decisions on
Roger Martin's Knowledge Funnel (Mystery → Heuristic → Algorithm → Code).
```

---

**`SKILL.md` — "Based On" (entire section, before expansion):**

```markdown
Kolko, *Exposing the Magic of Design*, Ch. 3 — Abductive Reasoning; Peirce on abduction;
Johnson-Laird on insight; Roger Martin, *The Design of Business*
```

---

**`workflows/ObservationToHypothesis.md` — Step 4 (replaced evaluation matrix):**

```markdown
4. **Evaluate against existing evidence:**
   | Hypothesis | Consistent with data? | Testable? | Explanatory power |
   |------------|----------------------|-----------|-------------------|
   | A | [Yes/Partial/No] | [Yes/No] | [Low/Med/High] |
   | B | ... | ... | ... |
   | C | ... | ... | ... |
```

---

**`workflows/ObservationToHypothesis.md` — Steps 5–6 (before bias checkpoint was inserted and template was expanded):**

```markdown
5. **Select the leading hypothesis:**
   - Which hypothesis explains the most with the least?
   - Which, if true, opens the most significant design territory?
   - Which can be meaningfully tested or explored?

6. **Formulate the design hypothesis:**
   ```
   ## Design Hypothesis

   **Observation:** [What we saw]
   **Best explanation:** [The abductive inference — what would need to be true for this
     observation to make sense]
   **Design implication:** [If this explanation is correct, then we should design for...]
   **How to test:** [What we'd do in design to validate or challenge this hypothesis]
   **Confidence:** [High / Medium / Low — based on data density and alternative
     explanations ruled out]
   ```
```

---

**`workflows/ReasoningChain.md` — Step 1 template (before "Entering frames" field was added):**

```markdown
1. **Establish the starting conditions:**
   ```
   ## Starting Conditions

   **Brief as received:** [The stated problem or opportunity]
   **Assumptions in the brief:** [What the client believed before research]
   **Research conducted:** [Methods, participants, duration — brief]
   ```
```

---

**`workflows/ReasoningChain.md` — Step 2 observation block (before "Frame status" field was added):**

```markdown
   ```
   ### Observation [N]
   - **What:** [Specific behavior, quote, or data point]
   - **Source:** [Who, how many, in what context]
   - **Why it matters:** [What assumption it confirms, challenges, or replaces]
   ```
```

---

**`workflows/ReasoningChain.md` — Step 4 template (before "Operative frame" field was added):**

```markdown
   ```
   ## Design Direction

   **Synthesis statement:** [The single most important thing the research revealed]
   **What we are now designing for:** [Restated design challenge, reflecting synthesis]
   **How this differs from the brief:** [What changed and why — or confirmation that
     the brief was right]
   ```
```

---

**`workflows/ReasoningChain.md` — Step 5 (entire step, before four failure modes replaced single question):**

```markdown
5. **State the conditions for revision:**
   - What would falsify this direction?
   - What data, if we found it, would change the design direction?
   - What are we monitoring for as design proceeds?
```

---

**`workflows/ReasoningChain.md` — Step 6 chain template (before expansion):**

```markdown
   ```
   ## Reasoning Chain: [Project] — [Date]

   Brief → [original problem statement]
   Key observations → [3-5 bullets, specific]
   Inferences → [What we concluded from each, and why]
   Direction → [Where we're designing]
   Falsification conditions → [What would change our minds]
   Confidence → [Overall — High/Medium/Low]
   ```
```

---

**`workflows/ReasoningChain.md` — "Why This Matters" section (before Klein's data-frame lens was added):**

```markdown
## Why This Matters

Abductive reasoning produces conclusions that are neither guaranteed (deduction) nor merely
probable (induction) — they are the *best current explanation*. The chain makes that explicit:
this is where we started, these are the observations that surprised us, this is what would have
to be true to explain them, and this is therefore what we are designing for. The chain is
falsifiable, which makes it trustworthy.
```

---

**`workflows/KnowledgeFunnelMapping.md` — Step 3 bullet (before abduction-type branching was added):**

```markdown
   - The mystery parts require abduction — ObservationToHypothesis
```

---

### What was NOT changed

- KnowledgeFunnelMapping Three Chasms section (Kolko) — still accurate, no change needed
- The core Peirce formula — retained as Form 1; not replaced by Dorst, only complemented
- Workflow routing table in SKILL.md — no new workflows added (Frame Creation would warrant its own workflow but deferred pending scope decision)
- Invoked From table — updated separately (2026-06-03, same session)

---

## 2026-05-06 — Kolko Book Chapter 4 Integration (Three Chasms)

**Source:** Kolko, *Exposing the Magic of Design*, Section Three Introduction (Oxford University Press, 2011)

### Updated

**`workflows/KnowledgeFunnelMapping.md`:**
- Added "Companion Model: The Three Chasms (Kolko)" section — maps the DIKW progression (Data→Information→Knowledge→Wisdom) as three chasms, each requiring a different family of abductive moves; relates chasms to synthesis method families (Affinity/Flow Diagramming for Chasm 1; Concept/Ecosystem/Journey Mapping for Chasm 2; Reframing/Insight Combination for Chasm 3); explains how the Knowledge Funnel (type of reasoning) and the Three Chasms (position in synthesis process) complement each other
