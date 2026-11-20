# WriteValueProposition Workflow

Craft a single Value Proposition candidate from a named job cluster. Used when you want to write one VP at a time — either iterating after a full synthesis pass, or drafting a specific candidate that was identified but not yet written.

## When to use this workflow

- After `SynthesizeValuePropositions` identified a job cluster but you want to write a specific candidate more carefully
- When a new L3 insight has been added to a project and you want to update the VP set without re-running the full synthesis
- When the user names a specific job ("write the VP for the identity job") and L3 files are available

---

## Step 1: Establish the Source Cluster

Confirm with the user:
- Which job cluster or L3 insights form the source material
- Whether an existing Customer Profile exists (from a prior synthesis pass) or needs to be built from scratch
- What candidate angle to pursue: primary job / pain-focused / gain-focused (or let the research dictate)
- **Project domain** (inherit from the L3/existing VP `domain:` frontmatter; confirm if absent). It sets who the "customer"/beneficiary is and the value register — see `DomainScope.md`. Carry it into the VP frontmatter.

If an existing Customer Profile exists for this project, read it before proceeding. The Customer Profile is the shared foundation — do not rebuild it from scratch if it already exists. Write only the new Value Map candidate and fit assessment.

If no Customer Profile exists, build it from the named L3 insights before generating the Value Map. Follow Steps 4–6 of SynthesizeValuePropositions (Steps 4: Validate Job Statements, 5: High-Value Jobs Screen, 6: Construct Customer Profile). If pain severity or gain type is uncertain during that process, apply Step 3 (L2 Evidence Validation) first.

---

## Step 2: Read the Source Insights

Read all L3 insight files named as the source cluster. Read them fully — not summaries.

**Data gate:** Do not generate a VP from a described insight rather than a read insight. If the file path does not resolve, stop and ask.

After reading, confirm:
- The primary job (with all three dimensions and the circumstance)
- The pains most strongly evidenced in these specific insights
- The gains most strongly evidenced in these specific insights
- Any compensating behaviors — these identify the most acutely felt unmet demand

---

## Step 3: Write the Value Map

Write the candidate VP following the format in `ValuePropositionFormat.md`.

**Products & Services first:** Before writing Pain Relievers or Gain Creators, name what the offering actually is — at the job level. This is the structural commitment. If you cannot name what kind of thing would address the job at the job level of abstraction, stop and revisit the job statement. The job statement may be too narrow (already a product spec) or too broad (needs a circumstance anchor).

**Apply the job-spec test as you write:** At each item in Products & Services, ask the three-industry test before moving forward. If you catch a product spec drifting in, rewrite immediately — do not save it for the guardrail check at the end.

**Pain Relievers before Gain Creators:** Address the most severe pains first, before writing gain creators. A VP that leads with delight while ignoring extreme pain has a fit problem that will surface in the assessment. The honest structure is: show that the offering earns the right to create gains by first addressing what causes the most friction.

---

## Step 4: Write the Fit Assessment

Assign a fit verdict (Strong / Partial / Weak) with specific evidence.

Do not write a "Partial Fit" without naming what specifically is missing. "Addresses the primary job but misses the extreme pain around X" is a useful fit assessment. "Partial fit because not everything is covered" is not.

The gap list in the fit assessment is as important as the match list. Name what the offering leaves unaddressed and why — whether that is intentional (a design decision to focus) or a genuine weakness (a gap to address in concept design).

---

## Step 5: Apply the Job-Spec Guardrail

Review the completed Value Map. Apply the three-industry test to every element.

If any element fails, rewrite it before delivering the output. Flag revised elements explicitly: "<REVISED from: original statement>" so the user can review the change.

---

## Step 6: Assign an ID and Write the Output File

If other VP files already exist for this project, assign the next sequential ID. If this is the first VP for a project, use VP-01.

If this candidate is a variant of an existing job cluster (addresses the same job from a different angle than a VP that already exists), use a letter suffix: VP-01A, VP-01B.

**Write the title last,** after the Customer Profile, Value Map and Fit Assessment. State in plain words what the offering hypothesis is. A reader with no project context should understand it on first read: no figures of speech, coined terms, or terms from the theory or the synthesis's working vocabulary. All text in the file follows `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body (a limit in its own sentence, no working shorthand, the synthesist's reading said in a plain sentence).

Write the output file to the project's output directory following the filename convention in `ValuePropositionFormat.md`.

---

## Step 7: Confirm Completion

Report:
```
VP candidate written — [Project Name]

[VP-NN]: [Title]
Primary job: [One-clause statement]
Fit: [Strong / Partial / Weak]
Optimizes for: [primary job / pain relief / gain creation]
Addresses [N] extreme pains: [list]
Creates [N] Desired/Unexpected gains: [list]
Gaps: [what it does not address]
Job-spec check: [Passes / N elements revised]
Source insights: [L3-NN, L3-NN]

Output: [file path]
```
