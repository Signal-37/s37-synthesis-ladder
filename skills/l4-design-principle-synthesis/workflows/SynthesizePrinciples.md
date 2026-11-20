# SynthesizePrinciples Workflow

Synthesize a set of L3 Insights into L4 Design Principles — short, active, plain statements that govern how the organization acts in any relevant decision, with five-part structure and a system narrative.

## Before You Start

Read `PrincipleFormat.md` in the skill root. It contains:
- Individual principle file format and master document format
- Principle title test (short, active, plain, governing; the title is written last)
- Plain Writing in the Body
- Decision filter quality test
- Failure mode discipline
- Evidence re-grounding requirements
- Volume calibration
- System narrative format
- Theoretical basis

Also read `DomainScope.md` in the skill root. It parameterizes the "Governs" decision-domain vocabulary and the decision types the principle's filter operates on, per project type (brand/design, product/UX, organizational, policy/advocacy, other).

---

## Step 1: Locate and Load the L3 Files

Confirm with the user:
- Where the L3 Insight files are (full directory path)
- Whether to read the master L3 document or individual L3-NN files (prefer individual files — they are more complete)
- Where to write the output (output directory)
- Project name for file naming
- **Project domain:** brand/design | product/UX | organizational | policy/advocacy | other

List all L3 insight files. Read each one fully before beginning any clustering.

**Inherit the domain:** Check the `domain:` field in the L3 Insight frontmatter. If present, inherit it and confirm rather than re-asking; if the L3 files predate the domain field, confirm explicitly. The domain sets the "Governs" vocabulary and the decision types each principle's filter operates on — read the matching entry in `DomainScope.md`. Carry the confirmed domain into the L4 output frontmatter. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.domain_scope_confirmation`.

**Audit gate (added 2026-09-23):** In the L3 directory, look for `L3_InsightSet_Audit_[ProjectName].md` (AuditInsightSet, "Cleared for L4"). Run it first when the report is missing, when its gate is not cleared and it carries no `advanced_with_open_flags` line, or when any file in the set is newer than the report; tell the user which applied. Procedure: `../ladder-core/ladder-map.md` → Running a level audit. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`.

**Data gate:** If no L3 insight files are provided or located at the stated path, stop here and ask. Do not proceed using general knowledge as a substitute for research data.

---

## Step 2: Build the Insight Inventory

After reading all L3 files, build a working inventory:

```
[L3-NN] — [Title]
Insight claim: <The declarative truth — what is true about this organization>
What this opens (from L3): [Strategic territory the insight named]
Decision demand: [What standing behavioral rule does this insight require?]
```

The "Decision demand" column is new at this level. For each insight, ask: if this is true, what must the organization *always do* — not in one program, but in every relevant decision — to honor it? The answer is the seed of the principle.

After building the inventory, note:
- Which insights demand the same standing behavioral rule (even if they diagnose different symptoms)
- Which insights address the same decision domain (investment, experience, identity, relationship, community)
- Which insights have a shared failure mode — the same breakdown that the principle must prevent
- Any insight whose demand is already captured by another insight's principle — it may be a source insight for an existing principle rather than generating a new one

---

## Step 3: Identify Governing Rule Clusters

This is the compression step. Multiple insights that demand the same standing behavioral commitment collapse into one principle.

**Clustering principles:**

*Decision domain, not insight topic:* Cluster by the type of decision the principle governs, not by the surface subject of the insights. Two insights about "the dealer" and "post-purchase silence" may cluster into one principle if both demand the same rule about how the brand designs relationships. The governing question is: what type of decision does this rule apply to?

*Shared failure mode:* Insights that describe two sides of the same failure belong together. The principle is the standing commitment that prevents both failures simultaneously.

*Chipchase's essence:* For each cluster, ask: what is the irreducible behavioral rule underneath all these insights? The principle should name the essence of the demand — not the surface symptoms.

*One insight, multiple principles:* An insight can contribute to more than one principle if it has multiple behavioral demands. L3-01 (peer advocacy) contributes to investment principles (where to put money) AND relationship principles (how to sustain advocacy). Do not artificially restrict one insight to one principle.

**Document each cluster before writing:**
```
Cluster [N]: <Working label for the cluster — not the title; the title is written last, in Step 5>
Insights: L3-NN, L3-NN
Shared behavioral demand: <One sentence — the standing rule these insights require>
Governs: [Decision domain]
Failure mode prevented: [What breaks if this principle is ignored?]
```

---

## Step 4: Write Each Principle

For each confirmed cluster, write the principle using the format from `PrincipleFormat.md`.

**Writing order (do not deviate):**

1. **The principle** — state the operational demand in plain words, before any title exists. 1–3 sentences. This is the wall-card version. Short. Specific. Every word must earn its place. Rules: `PrincipleFormat.md` → Plain Writing in the Body.

2. **What it means** — name the structural problem, often as two related failure modes with a shared root. Then name what the principle demands as the alternative. 3–5 sentences. This section prevents the principle from being treated as a slogan.

3. **Why it comes from the research** — name participants by name, use direct quotes where they exist. 2–4 sentences. Tight. Make the evidence feel irreducible: to ignore this principle, the organization would have to look these specific people in the eye and decide their experience doesn't matter.

4. **How to apply it** — name the decision types this governs and write the specific test question(s) in quotation marks. 2–4 sentences. The test question is what makes the principle operational. If no clear test question emerges, the principle is too abstract.

5. **What it prevents** — name the specific failure mode precisely. 1–2 sentences. Often two related failure modes (the twin traps). The failure mode should be specific enough to recognize if it is currently happening.

6. **What it rejects** — name the specific alternative approach, program type, or organizational move the principle explicitly refuses. 1–2 sentences. Distinct from "What it prevents": prevents = the failure mode; rejects = the alternative strategy that produces it. Specific enough that a planning-session participant would recognize it as something that has been proposed or considered.

7. **Source insights** — list all contributing L3 insights with IDs and titles.

The title comes next, in Step 5, after every section is written.

**Quality check before moving to the next principle:**
- [ ] Every section, including the test questions, meets `PrincipleFormat.md` → Plain Writing in the Body
- [ ] "The principle" states the operational demand, not just a description of what is true
- [ ] "What it means" names the structural problem and the alternative the principle demands
- [ ] "Why it comes from the research" names participants by name and cites specific evidence
- [ ] "How to apply it" includes at least one specific test question in quotation marks
- [ ] "What it prevents" names a specific, recognizable failure mode
- [ ] Source insights listed with IDs and titles

---

## Step 5: Write the Titles Last

For each principle, write the title after all its sections are written (the researcher, 2026-11-07, carried from the L3 rule of 2026-11-05/06). The title is the short name of what "The principle" demands. It must be short, active, plain and governing (`PrincipleFormat.md` → The Principle Title Test).

**Drafting process:**
1. Identify the imperative verb: what must the organization *do*?
2. Name the governing logic in literal words: spend *where buyers decide which brand to trust* (not just "invest in community")
3. First-read test: could a reader with no project context say what the title asks the organization to do, without its body? If not, rewrite it.
4. Test for governing force: can a decision-maker apply this to a real decision?

Draft 2–3 candidates per principle and keep the one a cold reader would understand soonest, provided it still names the governing logic. Do not choose for rhythm, wordplay or contrast. When short and plain conflict, plain wins.

**Title construction patterns:** see `WritePrinciple.md` → The Principle Title — Construction Patterns. Before and after examples: `PrincipleFormat.md` → The Principle Title Test.

**Quality check for each title:**
- [ ] Written after the principle's sections
- [ ] Begins with an imperative verb; usually 4–10 words
- [ ] Plain: no figure of speech, coined phrase, theory term or working vocabulary; understood on first read
- [ ] Governing: names the decision logic, not a program

---

## Step 6: Check Insight Coverage

After writing all principles, audit coverage:

- Which L3 insights drive at least one principle? List them.
- Which L3 insights appear as source insights in multiple principles? Note — this is expected and valid.
- Which L3 insights have no principle contribution? Why?
  - They may be more precisely captured by an Opportunity Area than a standing rule — this is valid; note explicitly
  - They may belong as additional source context within an existing principle — revise to include
  - They may point to a missed principle — check whether a governing rule was overlooked

**Do not silently drop L3 insights.** Every insight should be explicitly accounted for — driving a principle, contributing to a principle, or noted as captured more fully by an OA.

---

## Step 7: Write the System Narrative

After all principles are written, name how they work together as a system.

**Structure:**
1. Identify the foundation principle — the one that must be honored first because the others depend on its output (the named positioning, the investment logic, the governing identity)
2. Name the acquisition arc: which principles govern how new relationships begin?
3. Name the conversion principle: which principle governs turning contact into lasting relationship?
4. Name the scale condition: which principle determines how far the system can grow?
5. Write the through-line: a short narrative paragraph addressed to the organization — the cumulative commitment they are making if they adopt all principles

The through-line is not a list of principles in prose form. It is a statement of the organizational character that the principles collectively describe: what is this organization like if it honors all of these consistently?

---

## Step 8: Write the Output Files

**Individual principle files** (one per principle):
- Filename: `P-[NN]_[Short_Name].md`
- Format: YAML frontmatter + six sections (see PrincipleFormat.md)
- Write to the specified output directory

**Master principles document:**
- Filename: `L4_Principles_[ProjectName].md`
- Format: YAML frontmatter + How-to-read + all principles in order + summary table + system narrative
- Write to the same output directory

**Summary document:**
- Filename: `L4_Principles_Summary.md`
- Contents: YAML + principles table (ID / title / governs / source insights) + failure modes table + system narrative + through-line
- Useful for presentations and handoffs

---

## Step 9: Confirm Completion

Report:
```
L4 Principles synthesis complete — [Project Name]

[N] principles written to [output directory]:
- P-01: [Title] — from [L3-NN, L3-NN] — governs [domain]
- P-02: [Title] — from [L3-NN, L3-NN] — governs [domain]
...

L3 insight coverage:
- [N] insights driving principles
- [N] insights contributing to multiple principles
- [N] insights not generating new principles (noted in master document)

Compression ratio: [N] insights → [N] principles ([X:1])

System structure: [foundation] → [acquisition arc] → [conversion] → [scale condition]

Before advancing — a fresh agent runs AuditPrincipleSet (Final Step below) and must clear its "Cleared for L5" gate. Do not advance to L5 with unresolved audit flags.

felt_flags: <none-issued | "<report> — settles when <condition>"; semicolon-separate multiple reports on one line>

Next step: L5 Framework — recommended integration point: [OA set + Principle set as dual L4 outputs]
```

---

## Quality Checks Before Writing Files

**For each principle:**
- [ ] Title written last; short, active, plain, governing (`PrincipleFormat.md` → The Principle Title Test)
- [ ] Every section meets `PrincipleFormat.md` → Plain Writing in the Body
- [ ] "The principle" states the operational demand
- [ ] "What it means" names the structural problem AND the principle's alternative
- [ ] "Why it comes from the research" names participants and quotes
- [ ] "How to apply it" includes at least one test question in quotation marks
- [ ] "What it prevents" names a specific recognizable failure mode
- [ ] "What it rejects" names the specific alternative approach or strategy the principle vetoes — specific enough to recognize as a real proposal
- [ ] Source insights listed with IDs and titles
- [ ] YAML frontmatter complete: project, principle_id, synthesis_level, source_insights, governs (from the domain's DomainScope vocabulary), synthesis_date, domain

**For the principle set:**
- [ ] Compression ratio is within calibration (see PrincipleFormat.md)
- [ ] All L3 insights accounted for (driving a principle, contributing to a principle, or explicitly noted)
- [ ] System narrative names structural roles (foundation, acquisition, conversion, scale)
- [ ] Through-line is a narrative commitment, not a list

---

## Final Step: Audit — REQUIRED

After writing all principle files, dispatch a fresh agent to run `AuditPrincipleSet` on the completed set (procedure: `../ladder-core/ladder-map.md` → Running a level audit; canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`). The workflow is not finished until `L4_PrincipleSet_Audit_[ProjectName].md` is saved beside the set and its "Cleared for L5" gate is cleared, or the user has chosen to advance with open flags and that choice is recorded in the report. Do not advance to L5 or share with stakeholders before then. The audit catches title failures, decorative principles, thin evidence re-grounding, vague failure modes, and system narrative gaps that the quality checklist above does not surface.
