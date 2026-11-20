# L2 Theme Format Reference

The exact output format for L2 Theme files and the master themes document, including the behavioral name test, the abductive connection quality check, and volume calibration.

**Contents** (a reader mid-task may only see this far — jump to the section named):
- Individual Theme File — the per-theme template (behavioral pattern, abductive connection, evidence, implication)
- Master Themes Document — the collected form and its synthesis statement
- File Naming Conventions
- **The Behavioral Name Test** — the gate on every theme name
- The Abductive Connection Quality Check · Implication Quality Check
- Evidence Threshold and Strength
- Volume Calibration — how many themes to expect
- The Synthesis Statement · Theoretical Basis

---

## Individual Theme File

Each theme gets its own file. YAML frontmatter + four structured sections.

```
---
project: [Project Name]
theme_id: L2-[NN]
synthesis_level: L2
participants: <N — number of independent interview and conversation participants whose cited evidence for this theme is ENACTED: reported or observed behavior, or a belief held as their own. Stated preferences, hypotheticals, anticipated cases, advice to a brand and observations of other people are listed in Evidence but never counted here (count rule, 2026-11-03). Survey respondents go in survey_rows:>
synthesis_date: [YYYY-MM-DD]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L1 Findings>   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation
survey_rows: <omit unless the theme cites survey findings; then N distinct supporting respondents, deduplicated by survey + ID, plus "(independence assumed)" when the L1 file says so, e.g. 7 (independence assumed). The floor of 3 applies to participants + survey_rows (SynthesizeThemes Step 5 → Survey independence rule)>
surveys: <omit unless the theme cites survey findings; then the number of distinct survey_id values among them. The checker holds participants: 0 with surveys below 2>
consent_tiers: <omit unless the theme cites photo-class evidence; then list the tiers of all cited photos, e.g. [internal] — the readout check reads this field>
---

# L2-[NN]: [Full behavioral theme title]

## Behavioral pattern

<What the data shows across participants. Descriptive, not interpretive — this is the observable pattern. 2-4 sentences. Third-person behavioral register: what people do, say, avoid, feel. Do not introduce interpretation here; save that for the abductive connection.>

## Abductive connection

<WHY these findings connect to the same underlying truth. This is the abductive leap — new knowledge not present in any single finding. Name the mechanism, not the correlation. One paragraph. It should be specific enough that it couldn't apply to a different theme in a different research project, and written in plain words.>

## Evidence

<Split into three labelled lists. **Counted:** enacted evidence only, the participants who enter `participants:` and the 3+ floor. **Listed, not counted:** stated preference, hypothetical or anticipated cases, advice to a brand, and observations of others, each saying which. **Counter-cases and bounds:** findings that cut against the theme. A participant whose only evidence is listed is not counted; the field and the Counted list must agree. An exception needs the researcher's recorded ruling, named in the theme. Each bullet: **Participant code (Finding reference):** "Direct quote or behavioral description" — one-line interpretation of what this instance contributes to the theme. For conversation-derived findings, cite as **Speaker Name (Finding ref, session_id):** so the session is visible at the point of citation, not just in frontmatter. **Render by the L1 finding's evidence class** (WriteTheme Step 4 carries the four-branch rule): quotes in quotation marks; paraphrase and observation classes as behavioral description, the observation citing its researcher + capture artifact inline and never quoted; photo class as caption + file, carrying its consent tier.>

## Implication

[What the project's decision-maker must now answer — the brand/design team, product team, leadership, or policy body, depending on the domain. See `DomainScope.md` for the decision-maker and implication register per domain. Not a recommendation — a forced question. The theme's abductive connection, applied to the strategic situation. 2-4 sentences.

If the strategic consequence of this theme is already fully legible at L2 — commercial logic, design opportunity, or investment question visible without further synthesis — add an explicit L4 flag on a new line:

**L4 flag:** [The design question this theme surfaces for L4, named as a question not a solution.]

The flag names the question; it does not answer it. "The upgrade-journey commercial model should be addressed at L4 as an Opportunity Area" is correct. "Meridian needs an entry-level product" is a premature solution the synthesis hasn't earned. See the Implication Quality Check below.]
```

---

## Master Themes Document

One document per project containing all themes, their evidence, and the synthesis statement.

```
---
project: [Project Name]
synthesis_level: L2
document_type: Cross-Participant Themes
source_files: [L1_FirstName_LastName_YYYY-MM-DD_findings.md, L1_FirstName_LastName_YYYY-MM-DD_findings.md, ...]
synthesis_date: [YYYY-MM-DD]
analyst: [Name or system]
felt_flags: [none-issued | "<report> — settles when <condition>"; semicolon-separate multiple]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from the L1 Findings>
threshold: Each theme requires 3+ independent instances from different participants   # canonical: ../ladder-core/config/synthesis-gates.yaml → gates.theme_evidence_floor
---

# L2 Themes — [Project Name]
## Cross-Participant Patterns from [source base]

**Source base:** [N] interview participants, [M] conversation sessions, [K] surveys ([R] survey rows read; independence [verified / assumed]). *(Omit the parts that do not apply.)*
**Limits:** *(required whenever any theme cites survey findings; copied from the L1 files)* Self-selected open-text responses: processable and citable, not representative. [independence / sampling clauses as in the L1 files]

---

## How to read this document

L2 Themes are behavioral patterns that appear independently across multiple participants. They are not summary categories — they are abductive claims: a posited explanation for *why* findings from different people connect to the same underlying truth. Each theme is followed by its evidence base and a statement of what the connection implies.

<Participant key: abbreviations for each participant>

---

## L2-01: [Full theme title]

**Behavioral pattern:** [...]

**Abductive connection:** [...]

**Evidence:**
- **<Code (Finding N):** "Quote" — interpretation>
- ...

**Implication:** [...]

---

## L2-02: [Full theme title]
...

---

## Synthesis: The central abductive claim

<What all themes together reveal — the meta-abduction. One paragraph per major tension or structural truth the full theme set exposes. This is not a summary of themes; it is the argument the themes make together.>

---

*End of L2 Themes — [Project Name]*
*Source: [N] L1 Findings files, synthesized [date]*
*Next synthesis level: L3 Insights*
```

---

## File Naming Conventions

**Individual theme files:**
```
L2-[NN]_[Short_Descriptive_Name].md
```
Examples: `L2-01_Community_Visibility.md`, `L2-07_Dealer_Narrative_Improvisation.md`

**Master themes document:**
```
L2_Themes_[ProjectName].md
```

**Theme ID numbering:**
- Sequential from L2-01
- Number by order of evidence strength (strongest first) or by narrative logic in the master document — choose one and be consistent

---

## The Behavioral Name Test

> **Reserved claim verbs:** *validated / confirmed / passed / from the customer's side* are reserved for externally-tested claims — research-derived claims use *attested / evidenced / saturated / hypothesis*. Canonical: `../ladder-core/ladder-map.md` → Reserved Claim Verbs.

A theme title must pass this test before writing the theme:

| Criterion | Fail | Pass |
|-----------|------|------|
| Is it a claim, not a label? | "Trust" | "Loyal customers can't say why they stay with the brand" |
| Does it name behavior? | "Purchase motivation" | "Riders decide to stay with a brand after their first ride" |
| Is it specific to this data? | "Community matters" | "Riders find out about the brand by seeing it on people they ride with, and see its marketing after they have decided" |
| Could it be wrong? | "People use word of mouth" (obvious) | "Race sponsorship does not lead riders to buy" (debatable, specific) |
| Can it be understood on first read? | "Riders build kit slot by slot" | "Riders choose a brand one item at a time, and trust in a brand for one item doesn't always carry to the next" |

**The test:** If the theme title reads as obvious, it is probably a label, not a claim. A good theme title names something that a skeptic might push back on, in words a reader with no project context can follow on first read.

**Write the title last.** A working name guides the writing; the final title states in plain words what the behavioral pattern shows.

**The title comes from the behavioral pattern, not the connection (the researcher, 2026-11-07).** Each clause of the title must trace to a sentence in the behavioral pattern, and its qualifier (most, many, several, a few) must match the pattern's. The abductive connection is the synthesist's reading: it stays in the connection, labeled as such, and does not go into the title, not even as a plain-sounding clause. Why: in a client project's L2 v4 title review, four of eight titles carried a clause found only in the connection (of this kind, reworded here: "most switch only after a friend recommends it", "more than they can explain", "late delivery is the most common complaint"), and three of them had passed every audit since v3.

**Plain words (the researcher, 2026-11-06).** No figures of speech, no terms from theory, and no working vocabulary from the synthesis. Use the words participants use where they are clear to an outside reader. Split a title that is carrying several ideas. An accuracy fix is a rewrite of the sentence, not another clause. The writing is not about the writer.

**L2 stays strict.** Unlike L3, an L2 title keeps its scope to the participants and the counts or qualifiers the evidence requires, including "these runners" where it applies. Plain words do not widen the claim.

**Plain words in the body (the researcher, 2026-11-06).** The same rules apply to the behavioral pattern, the abductive connection, the implication and any description written for a reader. L2's strict scope stays, so limits and counts stay too: give a limit its own sentence, not a clause attached to the sentence it limits, and write out working shorthand. "The evidence is from owners by scope" becomes "We asked only owners about this, so the evidence comes only from owners." The abductive connection labels itself as the synthesist's reading in a plain sentence.

Audit: `workflows/AuditThemeSet.md` → Audit 3 and Audit 3b.

---

## The Abductive Connection Quality Check

The abductive connection is the sentence that creates new knowledge. It is not a summary of the evidence — it is the proposed explanation for why the evidence connects.

**A strong abductive connection:**
- Names a mechanism, not a correlation ("The pattern is not that advertising fails — it is that the category's purchase logic doesn't run through advertising")
- Introduces something not visible in any single finding
- Could be wrong — it is a posited explanation, not a proven fact
- Is specific to this research context, not applicable to all brands everywhere

**A weak abductive connection:**
- Restates the behavioral pattern in different words
- Names the obvious ("people trust people they know")
- Could apply to any brand, any category
- Is not falsifiable
- Reads as a summary, not a hypothesis

**The test:** Read the abductive connection without the evidence. Does it introduce new knowledge? Or does it just describe what the evidence already shows? If it's the latter, go deeper.

---

## Implication Quality Check

Every implication answers a standard question: *what does this behavioral pattern suggest we investigate further?* That is the L3-pointing question — it surfaces what needs knowledge injection to become an insight.

But some L2 clusters already contain a commercial or strategic implication that is **fully legible at L2** — visible without L3 knowledge injection, because the behavioral pattern already carries its own logic (a sequential purchase model, a market sizing consequence, an ROI structure). When this is true, the implication should carry an explicit `**L4 flag:**` in addition to the standard forced question.

**When to add an L4 flag:**
- The cluster contains domain logic that doesn't require cross-domain knowledge to see — it is already in the evidence. The form this logic takes depends on the domain (see `DomainScope.md`, "L4 flag register"): commercial logic (LTV arc, market entry/exclusion, ROI) for brand/design; a capability gap with adoption consequences for product/UX; a process failure with a measurable cost for organizational; an access barrier with equity consequences for policy/advocacy
- The strategic consequence is a design or investment question that could be scoped as an Opportunity Area without waiting for L3
- The theme may be compressed or absorbed into another theme during synthesis — the flag preserves the implication even when the theme-level behavioral claim is absorbed

**How to write the flag:**
- Names the design question, not the solution: *"What acquisition program gets Meridian in front of the first-time serious performance buyer before they default to a competitor?"* — not *"Meridian needs an entry-level product"*
- Is scoped as an L4 Opportunity Area question: actionable enough to brief against, open enough that the design work hasn't been foreclosed
- Is written even if the theme itself is strong and unlikely to be compressed — the flag survives theme merges; a buried implication does not

**Why this matters:** The synthesis ladder is bottom-up by design. Knowing the L4 destination before L3 would bias clustering. But some commercial implications are visible at L2 because the evidence already contains them — not because the synthesist is working backward from a desired conclusion. The L4 flag is how you preserve that visibility without corrupting the bottom-up process. It is a note to the L4 synthesist, not a constraint on the L3 synthesist.

---

## Evidence Threshold and Strength

| Participant count | Status |
|-------------------|--------|
| 1 source | Hypothesis — worth noting, not theming |
| 2 sources | Corroborated hypothesis — flag for follow-up |
| 3+ independent sources | Theme — name it |
| 5+ independent sources (participants, sessions, surveys — not survey rows) | Strong theme — consider whether it has sub-patterns |

**Independence matters:** Three findings from the same participant do not make a theme. Three findings from three different participants, in different contexts, with different roles, do.

**Single-session caveat (hard block):** Distinct speakers within one conversation are different participants, but a theme whose sources all share one `session_id` is **not** independently corroborated — panelists prime each other in the room. Such a candidate is held as a `[SINGLE-SESSION HYPOTHESIS]` and cannot be named until a corroborating source arrives from a different session (another conversation or an interview). The `session_id` travels on each conversation-derived finding; see `SynthesizeThemes.md` Step 5.

**Survey sources:** held hypotheses are recorded in the outliers-and-hypotheses list, not as theme files; the checker halts a theme file whose survey sources do not clear the hold. Channels of one survey count as one unit in the strength band. Distinct supporting respondents count toward the floor through `survey_rows:` (floor of 3 on participants + survey_rows). **The strength bands count independent units only** (interview participants, conversation sessions, surveys); survey rows never lift a theme above "Theme". A theme corroborated only within one survey is held `[HYPOTHESIS — single-survey]`; one corroborated across surveys but by no interview or conversation is named with `[SURVEY-ONLY]`. Row counts are never written as percentages. See `SynthesizeThemes.md` Step 5 → Survey independence rule.

**Outliers matter (Chipchase):** Findings that appear in only one participant but are structurally significant should be flagged, not discarded. One extreme case can be the leading indicator of where the full distribution is heading.

---

## Volume Calibration

| Participant count | Expected themes |
|-------------------|----------------|
| 5–8 participants | 5–10 themes |
| 10–15 participants | 10–18 themes |
| 15–20 participants | 14–22 themes |
| 20–30 participants | 18–28 themes |

*These ranges are normative calibration, not derived targets — the audit checks are the principle, not the count. Never split, merge, or invent an item to land inside the range.*


**Under the floor:** You are probably only naming the obvious. Go back and look for:
- Workarounds: resignation findings that cluster into structural gap themes
- Convergent analogies: different vehicles encoding the same structural meaning (Chipchase: the outlier is often a leading indicator)
- Silent themes: what everyone experiences but no one mentions first — the invisible center of gravity

**Over the ceiling:** You may be naming sub-patterns within a stronger theme. Check: can any two themes be merged without losing meaning? If yes, merge them.

---

## The Synthesis Statement

The synthesis statement at the end of the master document is not a summary — it is the meta-abductive claim: what do all themes together reveal about the underlying structural tension?

**Strong synthesis statement:**
- Names a central tension or structural truth that the individual themes don't individually name
- Could be disputed by a reasonable reader, and is in plain words
- Points to a strategic choice, not a list of recommendations
- Ends with a question the themes make unavoidable

**Weak synthesis statement:**
- Summarizes the themes ("We found 16 themes covering community, dealer relationships, and engineering identity...")
- Lists recommendations
- Restates the project brief

---

## Theoretical Basis

**Kolko's three synthesis acts** (present in every theme):
1. *Prioritizing* — the threshold rule (3+ sources) forces selection; not all findings become themes
2. *Judging* — the relevance sieve: which findings belong to this theme and which are adjacent noise?
3. *Forging connections* — the abductive connection: the new knowledge created by naming WHY findings relate

**Chipchase's observational disciplines** (applied to theme discovery):
- *Range of distribution*: Don't synthesize only from the center. The strongest themes often emerge from outlier findings that reveal where the mainstream is heading.
- *Defamiliarization*: Treat obvious clustering with skepticism. If the theme feels inevitable, ask whether you're naming a label instead of making an abductive claim.
- *Centers of gravity*: Where many findings concentrate, that's where structural insight lives. High-density clusters deserve more theme investment, not just one theme.
- *Essence*: Beneath behaviors, what is the irreducible human need? Theme names that reach for essence survive context change; those built on surface behaviors do not.
