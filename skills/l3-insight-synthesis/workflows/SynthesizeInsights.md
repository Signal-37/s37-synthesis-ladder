# SynthesizeInsights Workflow

Synthesize a set of L2 Themes into L3 Insights — declarative claims about what behavioral patterns mean, produced by pairing research observations with cross-domain knowledge.

## Before You Start

Read `InsightFormat.md` in the skill root. It contains:
- Individual insight file format
- Master insights document format
- The insight title test
- The knowledge layer test
- The "What this opens" test
- Volume calibration
- Theoretical basis

Also read `DomainScope.md` in the skill root. It parameterizes the **Knowledge-source menu** per project type — the body of theory the knowledge injection draws from — for brand/design, product/UX, organizational, policy/advocacy, and other. The knowledge act is identical across domains; the knowledge you inject is not.

---

## Step 1: Locate and Load the L2 Files

Confirm with the user:
- Where the L2 Theme files are (full directory path)
- Whether to read the master L2 document or individual L2 theme files (prefer individual files — they are more complete)
- Where to write the output (output directory)
- Project name for file naming
- **Project domain:** brand/design | product/UX | organizational | policy/advocacy | other

List all L2 theme files. Read each one fully before beginning any clustering.

**Inherit the domain:** Check the `domain:` field in the L2 Theme frontmatter. If present, inherit it and confirm rather than re-asking; if the L2 files predate the domain field, confirm explicitly. The domain determines which Knowledge-source menu the injection draws from — read the matching entry in `DomainScope.md` before Step 4. Carry the confirmed domain into the L3 output frontmatter. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.domain_scope_confirmation`.

**Audit gate (added 2026-09-23):** In the L2 directory, look for `L2_ThemeSet_Audit_[ProjectName].md` (AuditThemeSet, "Cleared for L3"). Run it first when the report is missing, when its gate is not cleared and it carries no `advanced_with_open_flags` line, or when any file in the set is newer than the report; tell the user which applied. Procedure: `../ladder-core/ladder-map.md` → Running a level audit. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`.

**Data gate:** If no L2 theme files are provided or located at the stated path, stop here and ask. Do not proceed using general knowledge as a substitute for research data.

---

## Step 2: Build the Theme Inventory

After reading all L2 files, build a working inventory:

```
[L2-NN] — [Title]
Behavioral pattern: [One-clause summary]
Abductive connection: [One-clause summary of the mechanism]
Implication: [One-clause summary]
Participant count: [N]
```

This is the full yellow-card deck. You cannot cluster what you cannot see simultaneously.

After building the inventory, note:
- Which themes share an underlying mechanism (the same structural explanation, even if the surface behaviors differ)
- Which themes describe different facets of the same strategic gap
- Which themes are in causal relationship (Theme A creates the conditions for Theme B)
- Which themes share the same participant population or participant type
- Any theme that appears to stand alone — with a mechanism unlike the others

---

## Step 3: Cluster Themes by Shared Mechanism

This is the compression step. Multiple themes that share an underlying structural explanation become candidates for a single insight.

**Clustering principles:**

*Mechanism, not topic:* Cluster by WHY themes connect, not by topic. Themes about "dealers" and themes about "brand communication" may cluster together if both reveal the same mechanism (the brand has not designed the experience, so staff improvise it). Topics are for navigation; mechanisms are for synthesis.

*Causal chains:* Themes that are cause-and-effect belong together. "Community is the real awareness channel" + "Race sponsorship doesn't lead to purchase" + "Access is socially mediated" are three facets of the same structural claim about how the brand grows.

*The tension structure:* Look for pairs of themes that name what the brand has vs. what it lacks — these reliably produce L3 insights because the insight is the gap between them.

*Chipchase on essence:* Ask for each cluster: what is the irreducible claim underneath all these themes? The insight should name the essence, not just aggregate the surface behaviors.

**Document each cluster before writing:**
```
Cluster [N]: <Plain working note of what the cluster is about. Not a draft title; the title is written last (Step 5)>
Themes: L2-NN, L2-NN, L2-NN
Shared mechanism: <One sentence — the structural explanation that connects them>
Working insight candidate: [First draft of the declarative claim]
```

---

## Step 4: Inject the Knowledge Layer

For each cluster, identify the cross-domain knowledge that interprets what the cluster means. This is the blue card in the ladder's mapping (in Kolko's original scheme, blue = an established design pattern).

**Draw from the domain's Knowledge-source menu** (`DomainScope.md`, matching the confirmed project domain). For brand/design that means service design, brand strategy, and category dynamics; for product/UX, Norman's gulfs, mental-model mismatch, and cognitive load; for organizational, org behavior, change management, and decision-rights theory; for policy/advocacy, behavioral public policy and implementation science. The menus are defaults, not fences — if the best interpretation lives in another domain's body of knowledge, use it and label its provenance. Every Knowledge-layer claim carries one of the three provenance labels at generation time — (a) synthesist-imported theory, (b) participant-observed pattern (3+ independent; survey-sourced only with its label and Limits line), (c) participant-described analog/hypothesis (1–2 participants, named) — canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.insight_knowledge_provenance`.

**The knowledge layer is not in the research.** It comes from the synthesist's prior knowledge of how analogous systems behave. Ask:

- What does design theory say about this structural situation?
- How do analogous systems behave when this mechanism is present?
- What does brand strategy, service design, organizational behavior, or behavioral economics tell us about why this pattern exists and what it means?
- What is the trust dimension at stake? (Chipchase: authenticity, fulfillment, value, reliability, safety, recourse — reliability and recourse are chronically underinvested)
- Is this an essence problem or a surface problem? (Chipchase: what survives if you strip away the current market context?)
- Is this a platzgeist problem — is the organization constitutionally unable to act on this, and if so, does the insight need to name that?

**Write the knowledge layer before writing the insight.** The insight is the product of the pairing; you cannot write it before you have both inputs.

**Source discipline:** If citing a named theorist (Kolko, Chipchase, etc.), reference the specific concept you're drawing on — e.g., *(after Kolko, Exposing the Magic of Design — insight combination)*. Do not cite chapter numbers you cannot verify. If the knowledge is synthesist judgment rather than a citable source, label it explicitly with the registered form: `(inferred from synthesist reasoning)`. Never attribute a specific claim to a source you cannot locate.

---

## Step 5: Write Each Insight

For each confirmed cluster, write the insight using the format from `InsightFormat.md`.

**Begin with the YAML frontmatter block:**

```
---
project: [Project Name]
insight_id: L3-[NN]
synthesis_level: L3
source_themes: [L2-NN, L2-NN, ...]
synthesis_date: [YYYY-MM-DD]
domain: <brand/design | product/UX | organizational | policy/advocacy | other — inherited from Step 1>
---
```

**Then write the sections in this order (do not deviate):**

1. **Observation** — what the source themes show. Cite theme IDs. Descriptive. 2-4 sentences.

2. **Knowledge** — the cross-domain interpretation. What you know about how these systems work. 2-4 sentences. This must introduce something not in the data.

3. **Insight** — the declarative claim in full. Observation + Knowledge = new truth. 2-4 sentences. State it in plain words.

3b. **What would change this** — write at claim-formation time, before the insight's prose is finished: the counter-cases in the data and how the insight meets them, the strongest rival reading, and the pattern in later research that would make us revise it (no counts, percentages or thresholds). Where a ReasoningChain ran, its rejected candidates supply the rival. Format: `InsightFormat.md` → The What Would Change This Field.

3c. **Trace check (felt test at the trace)** — before the insight's prose is finished, set the drafted claim against the actual participant language in its cited L2 themes. Every load-bearing term of the claim — especially economic, quantified, or evaluative vocabulary (LTV, spend, price points, market size, percentages, "premium," "loyal") — must appear in, or be directly supported by, the cited evidence; where it is not, rewrite the claim in the evidence's own register or hedge it to its source. At each abductive leap, carry the participant's words inline — never a paraphrase standing in for them.

   **Attribution is checked in two parts, separately: who said it, and whose it is.** For every quoted or cited fact, name the speaker; and where the fact concerns a person, shop, brand, or event other than the speaker, name that subject too — including when speaker and subject are the same, so the check is visible either way. Reported speech is the trap: a participant describing someone else's shop, sale, or number is a witness, not the owner of the fact, and a term verified against their words is still unattributed until its subject is named. Any fact whose subject cannot be established from the cited theme text is carried as "reported by X, subject not established" — never resolved to the speaker by default.

   This check governs the **Observation** and **Insight** registers. The **Knowledge** layer's job is to import what the data does not contain; terms there are not verified against the corpus but labeled `(a) synthesist-imported`. A claim that fails the trace check because it is knowledge rather than observation is relocated to the Knowledge layer with its label, not discarded — discard is for claims with no home in either register. Where the trace check finds a term unsupported for want of a specific artifact, name that kind of research in What would change this, part 3 (3b).

   Record the check in the insight's `Trace` field: each verified term recorded by **pasting the cited fragment verbatim with its speaker tag and, where different, its subject** — not by asserting that the check was run; which terms were revised; and any near-miss claim discarded at this step. A Trace entry that states a conclusion about attribution without the fragment that supports it does not satisfy this step. Format: `InsightFormat.md` → The Trace Field.

4. **What this opens** — strategic territory, not recommendation. 2-3 sentences. Names a direction the insight makes available, using frames like "the design task," "the investment priority," "the organizing question."

5. **Source themes** — list all contributing L2 themes with IDs and titles.

6. **Title** — written last, and placed at the top of the file. State in plain words what the sections above reached. Ask what people do or say, and what follows from it. Apply `InsightFormat.md` → The Insight Title Test, including its plain-statement rules. Read it as someone with no project context, and replace any figure of speech with the literal statement.

**Quality check before moving to the next insight:**
- [ ] Title was written last: a plain statement, not a label, question, or recommendation, that could be contested and understood on first read
- [ ] Observation cites specific L2 themes and is descriptive
- [ ] Knowledge introduces something from outside the research data
- [ ] Insight combines observation and knowledge into a new claim
- [ ] Insight is stated as truth, not possibility
- [ ] Text under the title meets `InsightFormat.md` → Plain Writing in the Body: each limit has its own sentence, no working shorthand
- [ ] What would change this present: counter-cases (including any the Trace found), a real rival, and a revision pattern with no counts or thresholds
- [ ] Trace check run — claim set against its cited quotes; economic/quantified vocabulary verified or revised
- [ ] Speaker and subject named separately for every cited fact; reported speech not resolved to the speaker by default
- [ ] "What this opens" names direction without prescribing action
- [ ] All source themes are listed

---

## Step 6: Coverage Map — Every Theme Must Be Accounted For

This is a blocking check. Do not proceed to Step 7 until every L2 theme has an explicit entry in the coverage map below.

**Build the coverage map.** For every L2 theme in the set, write one entry using this format:

```
[L2-NN] — [Theme title]
Status: CONTRIBUTING → L3-[NN]: [Insight title]
Mechanism carried forward: <One clause — what this theme's distinctive claim adds to the insight>

[L2-NN] — [Theme title]
Status: ABSORBED → L3-[NN]: [Insight title]
Mechanism carried forward: <One clause — what this theme's distinctive signal adds>
What is NOT carried: [If the theme had a distinctive signal not captured in any insight, name it explicitly; "nothing significant" is a valid answer]

[L2-NN] — [Theme title]
Status: NOT REACHING L3
Reason: <One of: too context-specific to generalize / single-mechanism outlier / below generalization threshold>
Disposition: <One of: flag as outlier in master document / flag as hypothesis for next research phase / revise existing insight to absorb this signal>
```

**Valid dispositions for themes not reaching L3:**
- *Too context-specific:* Note as additional context in the master document — do not drop it silently
- *Hypothesis:* Flag for the next research phase — name the question it would answer if additional participants confirmed it
- *Gap indicator:* The insight set is missing something — revise an existing insight or write a new one before this check clears

**A theme with no coverage map entry is a blocking issue.** It means either the theme was missed during clustering (return to Step 3) or it has no L3 home and must be explicitly documented. Silent omission produces uncaught gaps in the final synthesis that are only discoverable by comparing with a prior version or external source.

After completing the map, report:
- [N] themes CONTRIBUTING
- [N] themes ABSORBED (with what was not carried forward)
- [N] themes NOT REACHING L3 (with dispositions)

---

## Step 7: Volume Check

Before writing the synthesis statement, check your insight count against the compression ratio calibration in `InsightFormat.md`. Count your L2 themes (from Step 2) and your derived insights, then confirm the ratio is within the 1.5–2 themes-per-insight norm.

**Under the floor:** You may be writing one insight per theme rather than compressing across themes. Check whether any two insights draw from the same structural tension — if so, merge them. (See InsightFormat.md under-floor check.)

**Over the ceiling:** You may be writing at theme level rather than insight level. Check whether each insight has a genuine knowledge layer — something not in the L2 data — or is restating a theme in a new form. (See InsightFormat.md over-ceiling check.)

A compression ratio outside range that cannot be corrected should carry an explicit note.

---

## Step 8: Write the Synthesis Statement

After all insights are written, write the synthesis statement: the meta-synthesis of what all insights together reveal.

**Structure:**
1. Name 2–4 underlying tensions — each tension is a pair or cluster of insights that define the same structural gap between what the organization has and what it lacks
2. Name any non-tension findings — affirmative structural assets, positioning recognitions, or resolved questions
3. Write the through-line: one or two sentences that name the central strategic condition all insights collectively diagnose

**The through-line must answer:** Given everything these insights reveal, what is the single most important thing to understand about this organization's strategic situation?

---

## Step 9: Write the Output Files

**Individual insight files** (one per insight):
- Filename: `L3-[NN]_[Short_Name].md`
- Format: YAML frontmatter + five sections (see InsightFormat.md)
- Write to the specified output directory

**Master insights document:**
- Filename: `L3_Insights_[ProjectName].md`
- Format: YAML frontmatter + How-to-read + all insights in order + synthesis statement
- Write to the same output directory

**Optional summary document:**
- Filename: `L3_Insights_Summary.md`
- Contents: YAML + insight table (ID / title / source themes) + tension groupings + through-line
- Useful for presentations and handoffs

---

## Step 10: Confirm Completion

Report:
```
L3 synthesis complete — [Project Name]

[N] insights written to [output directory]:
- L3-01: [Title] — from [L2-NN, L2-NN]
- L3-02: [Title] — from [L2-NN, L2-NN]
...

L2 themes coverage:
- [N] themes contributed to insights
- [N] themes not reaching L3 (noted in master document)

Compression ratio: [N] themes → [N] insights ([X:1])

Before advancing — a fresh agent runs AuditInsightSet (Final Step below) and must clear its "Cleared for L4" gate. Do not advance to L4 with unresolved audit flags.

## Near-miss discards (trace check)

<Claims drafted and discarded at the trace check, each with the term or evidence gap that discarded it. "none" if none.>

felt_flags: <none-issued | "<report> — settles when <condition>"; semicolon-separate multiple reports on one line>

Next step: L4 Opportunity Areas — recommended starting point: [insight ID with highest strategic leverage]
```

---

## Quality Checks Before Writing Files

**For each insight:**
- [ ] Title is a plain statement, not a label, question, or recommendation, and meets the plain-statement rules in `InsightFormat.md`
- [ ] Observation is descriptive and cites L2 source themes
- [ ] Knowledge introduces cross-domain interpretation not in the research data
- [ ] Knowledge is specific — not a generic principle applicable everywhere
- [ ] Insight combines observation and knowledge into a new claim
- [ ] Insight is stated as truth, not as possibility or recommendation
- [ ] "What this opens" names strategic territory without prescribing specific actions
- [ ] Source themes listed

**For the insight set:**
- [ ] Compression ratio is within calibration (see InsightFormat.md)
- [ ] Coverage map complete — every L2 theme has an explicit status (CONTRIBUTING / ABSORBED / NOT REACHING L3) with no silent omissions
- [ ] Synthesis statement names tensions, not a summary
- [ ] Through-line makes a single claim about the central strategic condition

---

## Final Step: Audit — REQUIRED

After writing all insight files, dispatch a fresh agent to run `AuditInsightSet` on the completed set (procedure: `../ladder-core/ladder-map.md` → Running a level audit; canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`). The workflow is not finished until `L3_InsightSet_Audit_[ProjectName].md` is saved beside the set and its "Cleared for L4" gate is cleared, or the user has chosen to advance with open flags and that choice is recorded in the report. Do not advance to L4 or share with stakeholders before then. The audit catches compression failures, weak knowledge layers, provenance gaps, iceberg depth failures, theme coverage drops, and synthesis statement problems that the quality checklist above does not surface.
