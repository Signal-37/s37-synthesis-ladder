# ClusterFindings Workflow

Organize findings from multiple interviews into a structured, synthesis-ready form. Clustering is not categorization — the goal is not to file findings into pre-existing buckets but to let structure emerge from what the data actually says.

## When to Use

After extracting findings from 2+ interviews, when you need to see across participants before forming patterns or hypotheses. Primary next step: **SynthesizeThemes**. When a specific cluster needs deeper abductive work before naming, the **abductive-reasoning** skill's ObservationToHypothesis workflow can be run on that cluster independently.

## Principles

**Cluster by behavioral theme, not topic.** Topics are the researcher's categories; behavioral themes are the participants'. "Onboarding" is a topic; "users defer real engagement until they feel competent enough not to fail publicly" is a behavioral theme.

**Let clusters form bottom-up.** Start with the findings, not the categories. Resist the impulse to name clusters before grouping — name them after.

**Cross-participant strength matters.** A finding from one participant is a hypothesis. The same finding from three independent participants is a pattern candidate (canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`).

**Preserve outliers.** Findings that don't fit any cluster are often the most generative — they may be pointing at something the emerging clusters are too coarse to capture.

## Process

1. **Assemble all findings in one place:**
   - List each with participant ID, segment/archetype, and abductive flag visible
   - Format: `[Finding ID] [Participant] [Segment] — [Finding title]`
   - The segment tag matters: when a cluster contains findings from only one segment, that's a niche need. When it spans multiple segments, that's a universal need.

2. **First pass — affinity sorting:**
   - Group findings that feel related — don't name groups yet
   - If a finding could fit two groups, put it in both; resolve later
   - Aim for 3–7 groups; fewer means too coarse, more means too granular

3. **Name each cluster behaviorally:**
   - Name describes what people do, not what category the researcher used
   - Test: would the name make sense to the participants themselves?

   | Too abstract | Too specific | Behavioral |
   |-------------|-------------|-----------|
   | "Trust issues" | "User 3's email backup habit" | "Users create personal redundancy outside system-sanctioned paths" |

4. **Assess cluster strength:**

   For each cluster:
   ```
   Cluster: [Name]
   Findings: [List by ID]
   Participant count: [How many independent sources]
   Segments represented: <Which participant segments contributed — single segment = niche; multiple = universal>
   Strength: [Single-source / Corroborated / Consistent across participants]
   Abductive potential: [What's the most generative question this cluster raises?]
   ```

5. **Identify cross-cluster relationships:**
   - Do two clusters describe different facets of the same underlying dynamic?
   - Does one cluster's behavior seem to cause another?
   - Are there clusters in tension — participants who do opposite things in the same context?

6. **Flag outliers explicitly:**
   ```
   ## Outliers (don't fit current clusters)
   - [Finding ID]: [Why it doesn't fit] — [What it might be pointing at]
   ```

7. **Produce the cluster map:**

   ```
   ## Finding Cluster Map: [Project] — [N participants, N findings]

   ### Cluster 1: [Behavioral name]
   **Strength:** [Single-source / Corroborated / Consistent]
   **Participants:** [IDs]
   **Key findings:** [2-3 representative finding IDs with titles]
   **Abductive question:** [What this cluster is asking]

   ### Cluster 2: [Behavioral name]
   ...

   ### Outliers
   - [Finding ID]: [Note]

   ### Cluster relationships:
   - [Cluster A] and [Cluster B] may be two expressions of [underlying dynamic]
   - [Cluster C] and [Cluster D] are in tension: participants in each context do opposite things

   ### Recommended next move:
   → SynthesizeThemes: Clusters [X, Y, Z] are ready — run full L1→L2 synthesis
   → abductive-reasoning (ObservationToHypothesis): Cluster [Z]'s abductive question is strong — run abduction on it before naming
   → More data: Cluster [W] has only one source — needs corroboration before synthesis
   ```

## Output

A cluster map saved as:
```
L2_ClusterMap_[ProjectName]_[YYYY-MM-DD].md
```
Write to the output directory specified by the user. If no directory is specified, write to the same directory as the L1 Findings files.

The cluster map is the primary input to **SynthesizeThemes**. It also serves as a standalone synthesis artifact for research readouts, and individual clusters with strong abductive questions can be routed to the abductive-reasoning skill before naming.
