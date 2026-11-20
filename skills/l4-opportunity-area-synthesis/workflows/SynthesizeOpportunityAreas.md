# SynthesizeOpportunityAreas Workflow

Synthesize a set of L3 Insights into L4 Opportunity Areas — designed territories for strategic action, framed as How Might We questions, with defined scope and a system-level relationship map.

## Before You Start

Read `OAFormat.md` in the skill root. It contains:
- Individual OA file format and master document format
- The HMW question test, the plain-question rules and the OA title rule
- Plain Writing in the Body (applies to every section a reader sees)
- Scope definition discipline
- The relationship map format
- Volume calibration
- Theoretical basis

Also read `DomainScope.md` in the skill root. It parameterizes the "Governs" domain vocabulary and the relationship-map role names per project type (brand/design, product/UX, organizational, policy/advocacy, other).

---

## Step 1: Locate and Load the L3 Files

Confirm with the user:
- Where the L3 Insight files are (full directory path)
- Whether to read the master L3 document or individual L3-NN files (prefer individual files — they are more complete)
- Where to write the output (output directory)
- Project name for file naming
- **Project domain:** brand/design | product/UX | organizational | policy/advocacy | other

List all L3 insight files. Read each one fully before beginning any clustering.

**Inherit the domain:** Check the `domain:` field in the L3 Insight frontmatter. If present, inherit it and confirm rather than re-asking; if the L3 files predate the domain field, confirm explicitly. The domain sets the "Governs" vocabulary and the relationship-map role names — read the matching entry in `DomainScope.md`. Carry the confirmed domain into the L4 output frontmatter. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.domain_scope_confirmation`.

**Audit gate (added 2026-09-23):** In the L3 directory, look for `L3_InsightSet_Audit_[ProjectName].md` (AuditInsightSet, "Cleared for L4"). Run it first when the report is missing, when its gate is not cleared and it carries no `advanced_with_open_flags` line, or when any file in the set is newer than the report; tell the user which applied. Procedure: `../ladder-core/ladder-map.md` → Running a level audit. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`.

**Data gate:** If no L3 insight files are provided or located at the stated path, stop here and ask. Do not proceed using general knowledge as a substitute for research data.

---

## Step 2: Build the Insight Inventory

After reading all L3 files, build a working inventory:

```
[L3-NN] — [Title]
Observation summary: [One-clause summary of what the themes show]
Knowledge layer: [One-clause summary of the cross-domain principle applied]
Insight claim: <The declarative truth claim — verbatim or closely paraphrased>
What this opens: [Strategic territory named by the insight]
```

This is the full green-card deck. You cannot cluster what you cannot see simultaneously.

After building the inventory, note:
- Which insights share an underlying design problem (the same structural gap, even if the surface claims differ)
- Which insights name different facets of the same broken system or missing capability
- Which insights are in causal or dependency relationship
- Which insights describe the same experience breakdown at different touchpoints
- Any insight that stands alone — whose mechanism does not connect to others

---

## Step 3: Pause for the Guiding Image

Before clustering, pause on a single question:

**Has a guiding image emerged from reading all the insights simultaneously?**

This is the *parti* — the organizing intuition that should govern the whole OA field before any individual territory is drawn. It is not a solution concept, not an OA title, and not a strategy statement. It is what this body of research is ultimately *about* at the design level. You may reach it by intuition, but you write it down as a plain statement.

**How to surface it:**

Read back through the full insight inventory — not to analyze, but to sense. Ask:
- If these insights are together telling us one thing, what is it?
- What organizing tension runs across the whole set?
- What kind of field of action does this research want to open?

Write the guiding image in one or two sentences. It should be:
- A plain statement that a reader with no project context understands on first read: literal words, no figures of speech, no working vocabulary (`OAFormat.md` → Plain Writing in the Body)
- Broad enough to hold the entire OA field
- Specific enough that some design territories clearly don't belong in this synthesis

**Examples:**
- "Customers value the product the brand makes, and the brand does little with its relationship with them after the sale."
- "The service is built to sign people up, and nothing is planned for what happens to them after they join."
- "People trust the device, and no one is responsible for the person who depends on it."

**Use it as a test in Step 4:**

When identifying design territory clusters, ask of each candidate: does this cluster contribute to or derive from the guiding image? If a cluster doesn't connect, it may belong inside another OA's scope — or the guiding image itself may need revision.

**If no image emerges:** Don't force it. Proceed to Step 4 and return here after the clusters are visible. The image often becomes apparent only when the territories are spread out — articulate it retrospectively as a through-line check before writing the OAs.

**Document it:** Write the guiding image in the master OA document's introduction section. It serves as the orienting premise for the OA set and gives the L5 framework synthesis a clear starting point for the integration move.

---

## Step 4: Identify Design Territory Clusters

This is the compression step. Multiple insights that point at the same structural gap from different angles collapse into one OA.

**Clustering principles:**

*Shared design problem, not shared topic:* Cluster by the same design intervention territory, not by surface topic. Two insights about "the dealer" and "post-purchase silence" may cluster together if both show the same broken relationship after purchase: the design problem is that relationship, not either touchpoint.

*Complementary diagnoses:* Look for insight pairs that name opposite poles of the same gap: what the organization has vs. what it lacks, what the customer expects vs. what they receive, what the brand claims vs. what the evidence shows.

*Scale and dependency:* Some insights reveal a condition that enables or limits others. These belong in the same OA, or in OAs with explicitly named dependencies.

*Chipchase's platzgeist check:* Before finalizing a cluster, ask whether this design territory is genuinely actionable for this organization. An insight that requires organizational capabilities the client does not have may need to be in its own OA (named as aspirational), or the territory may need to be scoped to what is achievable.

**Document each cluster before writing:**
```
Cluster [N]: <Working name — will become OA title>
Insights: L3-NN, L3-NN, L3-NN
Shared design problem: <One sentence — the structural gap or broken system that connects them>
Governs: [Strategic domain]
Working HMW candidate: [First draft of the design question]
```

**For insights that don't cluster:** Note them explicitly. They either (a) belong inside an existing OA's "Why this matters" without needing their own OA, (b) generate a small but standalone OA, or (c) describe territory that is out of scope for this synthesis.

---

## Step 5: Working HMW Candidates

For each cluster, keep the working HMW candidate from Step 4 as a clustering aid only. The final HMW is written in Step 6, after Why this matters (`OAFormat.md` → The HMW Question Test: a question written first and defended afterwards tends to carry the whole argument in one sentence).

**Test each working candidate:**
- Start with "How might we..."
- Name the specific design challenge — not the general topic
- Would this generate at least three genuinely different solutions? If only one solution fits, the HMW is too narrow. If everything fits, it is too broad.

If a cluster cannot produce a candidate that passes this test, revisit the cluster before writing the OA.

---

## Step 6: Write Each Opportunity Area

For each confirmed cluster, write the OA using the format from `OAFormat.md`.

**Writing order (do not deviate):**

1. **Why this matters** — state the L3 claims (bold insight IDs), each as the L3 states it, then re-ground in L1 evidence. Name specific participants. Cite specific findings and moments. 3–6 sentences. This section argues that the territory is real — it moves from structural claim to human evidence. Plain words: `OAFormat.md` → Plain Writing in the Body (a limit gets its own sentence; no working shorthand; say whose reading it is).

2. **HMW question** — written from Why this matters: the design challenge it sets, in one plain question. What makes it hard is said in plain words, with no dash form, no figure of speech and no working vocabulary. Rules: `OAFormat.md` → The HMW Question Test.

3. **What's in scope** — intervention types, organized by phase or domain if appropriate. Each item: "A [noun] [noun]: [description]." 4–10 items. Name what kinds of programs, systems, frameworks, or design tasks belong here — not specific deliverables.

4. **What's not in scope** — explicitly excluded adjacent territory. Each item: "[Name]: [one-phrase reason]." 2–5 items. Required — not optional.

5. **Success horizon** and **Assumptions** — per `OAFormat.md`, in plain words.

6. **OA title, last** — one plain sentence stating what would be true for the people served once the opportunity is addressed; a statement, not a label. Rule: `OAFormat.md` → The OA title.

7. **Source insights** — list all contributing L3 insights with IDs and titles.

**Quality check before moving to the next OA:**
- [ ] HMW is specific enough to exclude some interventions but open enough for multiple solutions
- [ ] HMW written after Why this matters; plain question, no dash form; OA title written last and plain
- [ ] "Why this matters" names L3 insight IDs AND cites specific L1 evidence with participant names
- [ ] Every section meets `OAFormat.md` → Plain Writing in the Body
- [ ] "What's in scope" names intervention types, not specific deliverables
- [ ] No scope item crosses into another OA's territory
- [ ] "What's not in scope" is present and explains why each exclusion is excluded
- [ ] Source insights listed with IDs and titles

---

## Step 7: Check Insight Coverage

After writing all OAs, audit coverage:

- Which L3 insights contributed to at least one OA? List them.
- Which L3 insights appear in "Why this matters" but are not primary source insights? Note these as supporting evidence.
- Which L3 insights have no OA? Why?
  - They may belong inside an existing OA — revise to include them
  - They may point to territory outside the current project scope — note explicitly
  - They may warrant a standalone OA that was missed — check whether a cluster was overlooked

**Do not silently drop L3 insights.** Every insight that was written should be explicitly accounted for — either driving an OA, supporting an OA's "Why this matters," or noted as out of scope for this synthesis.

---

## Step 8: Write the Relationship Map

After all OAs are written, name how they depend on each other as a system.

**Identify structural roles:**
- *Precondition*: Which OA must be addressed first — without it, the others risk incoherence?
- *Growth engine*: Which OA drives the primary expansion or acquisition mechanism?
- *Converter*: Which OA turns the engine's output into lasting relationship or value?
- *Scale condition*: Which OA determines how far the system can grow?

Not every project will have all four roles — use the roles that fit the evidence.

**Write the map:**
- One paragraph per OA, naming its role and its dependency relationship to the others
- Conclude with the through-line: one or two sentences that describe the full system as a coherent arc — what do all four OAs together accomplish that none accomplishes alone?

---

## Step 9: Write the Output Files

**Individual OA files** (one per OA):
- Filename: `OA-[NN]_[Short_Name].md`
- Format: YAML frontmatter + five sections (see OAFormat.md)
- Write to the specified output directory

**Master OA document:**
- Filename: `L4_Opportunity_Areas_[ProjectName].md`
- Format: YAML frontmatter + introduction (including the guiding image from Step 3) + How-to-read + all OAs in order + summary table + relationship map
- Write to the same output directory

**Summary document:**
- Filename: `L4_Opportunity_Areas_Summary.md`
- Contents: YAML + OA table (ID / HMW / Source insights / Governs) + relationship narrative + system sentence
- Useful for presentations and handoffs

---

## Step 10: Confirm Completion

Report:
```
L4 synthesis complete — [Project Name]

Guiding image: <The parti from Step 3 — one or two sentences>

[N] opportunity areas written to [output directory]:
- OA-01: [Title] — from [L3-NN, L3-NN] — governs [domain]
- OA-02: [Title] — from [L3-NN, L3-NN] — governs [domain]
...

L3 insight coverage:
- [N] insights driving OAs
- [N] insights supporting OAs as additional evidence
- [N] insights not reaching L4 (noted in master document)

Compression ratio: [N] insights → [N] OAs ([X:1])

Relationship map: [precondition OA] → [engine] → [converter] → [scale condition]

Before advancing — a fresh agent runs AuditOpportunityAreaSet (Final Step below) and must clear its "Cleared for L5" gate. Do not advance to L5 with unresolved audit flags.

felt_flags: <none-issued | "<report> — settles when <condition>"; semicolon-separate multiple reports on one line>

Next step: L4 Design Principles (parallel track), then L5 Framework once both L4 sets clear — recommended starting point: [OA with highest strategic leverage]
```

---

## Quality Checks Before Writing Files

**For each OA:**
- [ ] HMW is open enough for multiple solutions, specific enough to exclude some
- [ ] HMW and OA title meet `OAFormat.md` → The HMW Question Test and The OA title (plain, first-read, no dash form)
- [ ] "Why this matters" cites L3 insight IDs and specific L1 evidence with participant names
- [ ] Every section meets `OAFormat.md` → Plain Writing in the Body
- [ ] "What's in scope" names intervention types, not deliverables
- [ ] No scope item bleeds into another OA's territory
- [ ] "What's not in scope" is present with reasons
- [ ] Source insights listed with IDs and full titles
- [ ] YAML frontmatter complete: project, opportunity_area_id, synthesis_level, source_insights, governs (from the domain's DomainScope vocabulary), synthesis_date, domain

**For the OA set:**
- [ ] Guiding image documented in master OA document introduction, as a plain statement
- [ ] Relationship map, through-line and system sentence in plain words
- [ ] Compression ratio is within calibration (see OAFormat.md)
- [ ] All L3 insights accounted for (driving an OA, supporting an OA, or explicitly noted as out of scope)
- [ ] Relationship map names structural roles and dependencies
- [ ] Through-line describes the system as a coherent arc

---

## Final Step: Audit — REQUIRED

After writing all OA files, dispatch a fresh agent to run `AuditOpportunityAreaSet` on the completed set (procedure: `../ladder-core/ladder-map.md` → Running a level audit; canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`). The workflow is not finished until `L4_OpportunityAreaSet_Audit_[ProjectName].md` is saved beside the set and its "Cleared for L5" gate is cleared, or the user has chosen to advance with open flags and that choice is recorded in the report. Do not advance to L5 or share with stakeholders before then. The audit catches HMW framing problems, sentences a first reader cannot follow (Audit 2b, advisory), scope definition failures, insight coverage gaps, relationship map weaknesses, platzgeist failures, and leverage-point mismatches that the quality checklist above does not surface.
