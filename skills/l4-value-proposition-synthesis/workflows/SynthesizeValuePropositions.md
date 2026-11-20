# SynthesizeValuePropositions Workflow

Synthesize a set of L3 Insights into a Customer Profile and 2–3 candidate Value Propositions — the initial offering hypotheses that respond to the research findings.

## Before You Start

Read `ValuePropositionFormat.md` in the skill root. It contains:
- Individual VP file format and master document format
- Job statement validity tests
- Gain type definitions (Required/Expected/Desired/Unexpected)
- Pain severity definitions (extreme/significant/moderate)
- The job-spec vs. product-spec guardrail
- Volume calibration

Also read `DomainScope.md` in the skill root. It parameterizes who the "customer" is (the beneficiary the offering serves — customer, user, employee, or constituent), the "Lucrative"/value register, and the offering territory, per project type. "Customer Profile" means the profile of that beneficiary throughout.

---

## Step 1: Locate and Load the L3 Files

Confirm with the user:
- Where the L3 Insight files are (full directory path)
- Whether to read the master L3 document or individual L3-NN files (prefer individual files — they are more complete)
- Where to write the output (output directory)
- Project name for file naming
- **Project domain:** brand/design | product/UX | organizational | policy/advocacy | other
- Whether L4 Opportunity Area files exist (optional cross-reference)

List all L3 insight files. Read each one fully before beginning any extraction.

**Inherit the domain:** Check the `domain:` field in the L3 Insight frontmatter. If present, inherit it and confirm rather than re-asking; if the L3 files predate the domain field, confirm explicitly. The domain sets who the "customer" is (the beneficiary the Customer Profile describes) and the "Lucrative"/value register — read the matching entry in `DomainScope.md`. Carry the confirmed domain into the L4 output frontmatter. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.domain_scope_confirmation`.

**Audit gate (added 2026-09-23):** In the L3 directory, look for `L3_InsightSet_Audit_[ProjectName].md` (AuditInsightSet, "Cleared for L4"). Run it first when the report is missing, when its gate is not cleared and it carries no `advanced_with_open_flags` line, or when any file in the set is newer than the report; tell the user which applied. Procedure: `../ladder-core/ladder-map.md` → Running a level audit. Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`.

**Data gate:** If no L3 insight files are provided or located at the stated path, stop here and ask. Do not proceed using general knowledge as a substitute for research data. The Customer Profile must be grounded in the specific research, not in assumptions about the project's domain.

---

## Step 2: Build the Jobs Inventory

After reading all L3 files, extract the jobs being described across the insight set. For each L3 insight, identify:

```
[L3-NN] — [Insight title]
Functional dimension: [What the customer needs to get done]
Emotional dimension: [How they want to feel in the process or outcome]
Social dimension: [How they want to be seen, or how they want to see themselves in relation to others]
Circumstance: <The specific context in which this job arises — when, where, under what pressure>
Pains mentioned: [Obstacles, undesirable outcomes, or risks named in the insight]
Gains mentioned: [Outcomes or benefits the customer hopes for]
Compensating behaviors: <Workarounds noted — these are gold signals of unsatisfied demand>
```

After extracting from all insights, note:
- Which insights describe the same underlying job from different angles
- Which insights describe related pains and gains without a clear job statement
- Which insights contain explicit compensating behaviors (high-priority: workarounds signal strong unmet need)
- Whether any insights suggest genuinely distinct job clusters (i.e., two groups of customers trying to make fundamentally different progress — a segmentation signal)

---

## Step 3: L2 Evidence Validation (Optional — trigger on uncertainty)

L3 Insights abstract and compress the L2 Themes that produced them. For two specific classification decisions — pain severity and gain type — the behavioral evidence closest to the participant is more reliable than a synthesized interpretation. If either classification is uncertain after Step 2, read the contributing L2 Themes before proceeding.

**When to trigger this step:**

- **Pain severity is uncertain:** You cannot distinguish EXTREME from SIGNIFICANT for one or more pains because the L3 Insight describes the pain without a clear compensating behavior or intensity signal. EXTREME requires behavioral evidence — a workaround, a deliberate avoidance pattern, an explicit reason for firing the current solution. If the L3 text asserts severity without showing the behavior behind it, that assertion needs validation.
- **Gain type is uncertain:** You cannot classify a gain as DESIRED or UNEXPECTED because the L3 Insight describes a general aspiration without naming a specific behavior or behavioral gap. UNEXPECTED gains in particular must be inferred from what participants *do*, not what they *say* — and that behavioral texture is often more visible at L2 than L3.

**How to execute:**

For each uncertain pain or gain, find the contributing L3 Insight's `source_themes:` YAML frontmatter. Read those L2 Theme files. Look specifically for:
- **Compensating behaviors** (workarounds, substitutions, deliberate avoidances) — these confirm EXTREME severity
- **Emotional intensity signals** in participant language — these calibrate SIGNIFICANT vs. MODERATE
- **Behavioral gaps** (things participants tried to do but couldn't, or didn't know to ask for) — these confirm DESIRED or UNEXPECTED gain territory
- **Explicit statements vs. behavioral inference** — explicit = REQUIRED/EXPECTED; inferred from behavior = DESIRED/UNEXPECTED

After reading, update the jobs inventory from Step 2 with confirmed or revised severity and type, each with a one-clause evidence note: `[Pain] — EXTREME (confirmed: [compensating behavior])` or `[Gain] — UNEXPECTED (inferred from <behavioral signal>)`.

**Skip this step when:** All pains have clear compensating behavior evidence already visible in the L3 Insight text, and gain types are supported by behavioral signals the L3 author preserved. Well-written L3 Insights that retain participant-level behavioral detail are often sufficient. Do not read L2 Themes as a default — only when L3 evidence is genuinely ambiguous for a specific classification.

---

## Step 4: Validate Job Statements

Before ranking, apply the three-part job statement test to each candidate job identified in Step 2.

**Test 1 — Verb-noun form:**
Is the job expressed in verbs and nouns? If it uses adjectives or adverbs as the primary descriptors, it is describing an experience, not a job. Rewrite to verb-noun form before proceeding.

**Test 2 — Multi-industry test:**
Could candidates from genuinely different product categories (not just different brands in the same category) address this job? If the job only makes sense as a prompt for one industry, it is too specific — raise the level of abstraction until different-industry candidates become plausible.

**Test 3 — Circumstance anchor:**
Does the job statement include the specific circumstance in which the need arises? A job without a circumstance is too generic to design against. If the same job would arise in all circumstances for all people, it is not yet a job — it is a human need. Add the circumstance.

**Flag any jobs that fail a test.** Do not discard them — rewrite them until they pass all three. A job that cannot pass all three tests after two rewrite attempts should be noted as "needs client clarification" and held aside.

---

## Step 5: Apply the High-Value Jobs Screen

For each validated job, rate it on four criteria:

| Criterion | Question to answer |
|-----------|-------------------|
| **Important** | Does the research show the customer cares deeply about making this progress? (Evidence: compensating behaviors, explicit frustration, emotional intensity in L1 quotes) |
| **Tangible** | Can the customer themselves observe or measure whether the job is done well? (Not measurable only from the outside) |
| **Unsatisfied** | Do current solutions — what the customer currently hires — leave meaningful gaps? (Evidence: compensating behaviors, switching patterns, workarounds) |
| **Lucrative** | Is the progress worth investing to enable? Use the domain's value register from `DomainScope.md`: willingness to pay / purchase behavior for brand/design and product/UX; productivity, retention, or cost avoided for organizational; participation, access, outcomes, or program mandate for policy/advocacy. (Economic value is the test only where the domain is commercial; elsewhere, served need is.) |

Score each job: how many of the four criteria does it pass?

```
Job: [Statement]
Important: <Pass / Weak / Fail — one-clause evidence>
Tangible: <Pass / Weak / Fail — one-clause evidence>
Unsatisfied: <Pass / Weak / Fail — one-clause evidence>
Lucrative: <Pass / Weak / Fail — one-clause evidence>
Score: [4/4 / 3/4 / 2/4 / 1/4]
Primary candidate: [Yes (4/4 or 3/4 with strong evidence) / Secondary / Out of scope]
```

Jobs scoring 4/4 or 3/4 are candidates for the Customer Profile primary job position. Jobs scoring 2/4 may appear in the Customer Profile as secondary jobs. Jobs scoring 1/4 or below are either out of scope for this VP synthesis or should be revisited after the primary job is defined.

---

## Step 6: Construct the Customer Profile

Build the unified Customer Profile from the primary job and the supporting jobs, pains, and gains identified across the L3 set.

**Primary job — full narrative:**
Write 3–5 sentences naming the functional dimension, the emotional dimension, the social dimension, and the specific circumstance. The circumstance is where the design insight lives — do not smooth it out in favor of a generic statement. Name the tension or pressure that makes the job feel urgent.

**Pains — ranked by severity:**
Identify all pains mentioned across the L3 insights. For each, assign a severity level (extreme / significant / moderate) based on the evidence:
- Extreme: the pain is a primary driver of not hiring, or of firing, the current solution; compensating behaviors exist specifically to avoid this pain
- Significant: the pain is named explicitly and causes effort or frustration, but the customer tolerates it
- Moderate: the pain is a background annoyance; the customer barely notices it unless asked

Rank from extreme to moderate. Aim for 3–7 total pains. If more than 7 emerge, consolidate the moderate ones.

**Gains — typed by category:**
Identify all gains mentioned across the L3 insights. For each, assign a type (Required / Expected / Desired / Unexpected) based on the evidence:
- Required and Expected: what the customer assumes or demands — usually explicit in the research
- Desired: what the customer would value but has never received — often implicit in what they aspire to or compare themselves against
- Unexpected: what the customer cannot articulate — must be inferred from behavioral evidence (e.g., a workaround that creates a side benefit they have come to rely on)

**Note:** Desired and Unexpected gains are the differentiation territory. If all identified gains are Required and Expected, the research may not have probed deeply enough, or the insight synthesis may not have reached the right level of inference. Flag this.

---

## Step 7: Generate 2–3 Candidate Value Maps

For the primary Customer Profile, generate 2–3 candidate Value Maps (canonical: `ValuePropositionFormat.md` → Canonical VP volume rule; up to 4 when the L3 set is 9–12 insights). Each represents a genuinely different approach to addressing the same Customer Profile — different structural logic, different entry point, different emphasis in the pain/gain space.

**For each candidate:**

**Products & Services:**
Name the offering type — described by what it does for the customer, not what it is as a product. Each item: "[What the offering does] — [for what purpose]." Test each item against the job-spec guardrail before writing.

**Pain Relievers:**
For each extreme and significant pain in the Customer Profile, name how this candidate VP addresses it (or note that it doesn't). Do not skip extreme pains — a VP candidate that ignores an extreme pain has weak fit regardless of how strong its gains are.

**Gain Creators:**
Focus on Desired and Unexpected gains. Name how this candidate VP creates them. Required and Expected gains can be noted briefly — they are hygiene factors, not the differentiating design territory.

**Strategy for generating genuinely different candidates:**
- VP-01: addresses the primary job most directly (the most obvious structural response)
- VP-02: addresses the pains most directly (the highest-severity pain as the entry point, even if the gain creation is weaker)
- VP-03 (optional): addresses the Desired/Unexpected gains most directly (optimized for differentiation, even if it tackles fewer pains)

This structure ensures the comparison across candidates is analytically useful, not arbitrary.

---

## Step 8: Run Fit Assessments

For each candidate VP, assess fit against the Customer Profile.

**Fit criteria:**
- **Strong Fit:** VP addresses the primary job AND at least two of the top three extreme/significant pains AND creates at least one Desired or Unexpected gain
- **Partial Fit:** VP addresses the primary job but misses important pains or only creates Required/Expected gains
- **Weak Fit:** VP does not address the primary job, OR only addresses low-severity pains, OR only creates Required gains

**For each candidate:**
1. List which primary jobs, extreme pains, and Desired/Unexpected gains are addressed
2. List which important jobs/pains/gains are NOT addressed
3. Assign the fit verdict
4. Note the key tradeoff: what does this candidate optimize for, and what does it sacrifice?

The fit assessment should reveal a genuine tradeoff between candidates — if all candidates have the same fit profile, either the candidates are not genuinely different or the Customer Profile needs revision.

---

## Step 9: Apply the Job-Spec Guardrail

Review every element of every Value Map. For each item in Products & Services and Pain Relievers, apply the three-industry test:

*"Would a product manager from three different industries — none of them the client's — be able to design something to address this?"*

If yes: it passes.
If no: it has slipped to product specification. Rewrite at the job level.

Common failure patterns:
- Naming a specific technology, platform, or format ("a mobile app," "a dashboard," "a subscription service") — rewrite as what it does: "a system that makes [progress] accessible anywhere" / "visibility into [status] without requiring [friction]"
- Naming a specific interaction ("a notification when X happens") — rewrite as the job-level outcome: "immediate awareness of [situation] at the moment it matters"
- Naming a specific channel ("dealer training," "social media presence") — rewrite as what it accomplishes: "the knowledge and language to represent [value] at the point of first contact"

**Note:** It is valid to *mention* channels or technologies in the "Why this works" annotation after a VP element — but the primary statement must pass the guardrail.

---

## Step 10: Cross-Reference with L4 OAs (Optional)

If L4 Opportunity Area files exist in the project directory, read them and note:

- Which VP candidates address at least one OA's territory?
- Is there an OA for which no VP candidate provides a clear offering response? (Note this as a gap in VP coverage)
- Is there a VP candidate that addresses territory not covered by any OA? (May signal a missing OA or a VP that has drifted to product spec)

Cross-reference is analytical, not prescriptive. The VP synthesis stands on its own — the cross-reference is a consistency check, not a dependency.

---

## Step 11: Write the Output Files

**Individual VP files** (one per candidate):
- Filename: `VP-[NN]_[Short_Name].md` (or `VP-[NN][A/B]_[Short_Name].md` for variants of the same job)
- Format: YAML frontmatter + four sections (see ValuePropositionFormat.md)
- Write to the specified output directory

**Master VP document:**
- Filename: `L4_Value_Propositions_[ProjectName].md`
- Format: YAML frontmatter + Customer Profile (once) + all VP candidates + summary table + reading narrative
- Write to the same output directory

---

## Step 12: Confirm Completion

Report:
```
L4 VP synthesis complete — [Project Name]

Customer Profile:
- Primary job: <Job statement — one clause>
- Pains: [N] identified ([N] extreme, [N] significant, [N] moderate)
- Gains: [N] identified ([N] Required, [N] Expected, [N] Desired, [N] Unexpected)

[N] VP candidates written to [output directory]:
- VP-01: [Title] — Fit: [Strong/Partial/Weak] — optimizes for: [primary job / pain relief / gain creation]
- VP-02: [Title] — Fit: [Strong/Partial/Weak] — optimizes for: [primary job / pain relief / gain creation]
...

Job-spec check: [N] elements passed / [N] elements revised / [N] flagged

L3 insight coverage:
- [N] insights contributing to Customer Profile
- [N] insights not surfacing a new job/pain/gain (covered by others)

[If L4 OAs exist:]
OA cross-reference:
- [N] VP candidates address L4 OA territory
- [N] OAs have a corresponding VP candidate
- Gaps: [any OAs without VP coverage]

Before advancing — a fresh agent runs AuditValuePropositionSet (Final Step below) and must clear its "Cleared for L5" gate. Do not advance to L5 with unresolved audit flags.

felt_flags: <none-issued | "<report> — settles when <condition>"; semicolon-separate multiple reports on one line>

Next step: L5 Framework (optional VP integration)
```

---

## Quality Checks Before Writing Files

**For the Customer Profile:**
- [ ] Title written last, in literal words a reader with no project context understands on first read
- [ ] All text follows Plain Writing in the Body (`../l3-insight-synthesis/InsightFormat.md`)
- [ ] Primary job passes all three validity tests (verb-noun form, multi-industry, circumstance anchor)
- [ ] Primary job passed High-Value Jobs screen (3/4 or 4/4)
- [ ] All pains traced to at least one L3 insight (with L3-NN citation)
- [ ] All gains traced to at least one L3 insight (with L3-NN citation)
- [ ] At least one Desired or Unexpected gain is present (if absent, flag and explain)
- [ ] Extreme pains have compensating behavior or intensity evidence

**For each VP candidate:**
- [ ] Products & Services describes what the offering does, not what it is
- [ ] Pain Relievers address all extreme pains (or explicitly acknowledge gaps)
- [ ] Gain Creators target at least one Desired or Unexpected gain
- [ ] Fit assessment is honest — it names gaps, not only strengths
- [ ] Job-spec guardrail applied and passed (or flagged with revision notes)
- [ ] YAML frontmatter complete: project, value_proposition_id, source_insights, primary_job, governs, synthesis_date, domain

**For the VP set:**
- [ ] 2–3 candidates (canonical: `ValuePropositionFormat.md` → Canonical VP volume rule; up to 4 when the L3 set is 9–12 insights) — not more, unless multiple distinct segments are present
- [ ] Candidates represent genuinely different structural approaches, not just variants
- [ ] Reading narrative names the tradeoff between candidates, not a recommendation
- [ ] All L3 insights accounted for (contributing to Customer Profile or explicitly noted as out of scope)

---

## Final Step: Audit — REQUIRED

After writing all VP files, dispatch a fresh agent to run `AuditValuePropositionSet` on the completed set (procedure: `../ladder-core/ladder-map.md` → Running a level audit; canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.level_audit_before_advance`). The workflow is not finished until `L4_VP_Set_Audit_[ProjectName].md` is saved beside the set and its "Cleared for L5" gate is cleared, or the user has chosen to advance with open flags and that choice is recorded in the report. Do not advance to L5 or share with stakeholders before then. The audit catches Customer Profile validity failures, Value Map quality problems, pain-reliever tautologies, candidate differentiation gaps, L3 insight coverage drops, and platzgeist issues that the quality checklist above does not surface.
