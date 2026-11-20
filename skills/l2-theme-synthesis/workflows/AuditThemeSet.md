# AuditThemeSet Workflow

Quality-check a completed L2 theme set before it is used for downstream synthesis or stakeholder presentation. This workflow surfaces gaps, overlaps, weak abductions, and missed structural patterns.

## When to Use

After SynthesizeThemes is complete, before moving to L3 Insights or sharing with stakeholders. Can also be used mid-synthesis to check a partial theme set.

---

## Inputs — required before any audit

You need four things: the set directory, the format file (`ThemeFormat.md`), the project name, and **the directory holding the L1 findings the set was built from** (the set's `source_files:` frontmatter names the files). The dispatcher passes that directory (`../ladder-core/ladder-map.md` → Running a level audit). If it was not passed and cannot be found from the set's source fields, do not audit: return a report whose first line names the missing directory. Coverage and counter-evidence cannot be judged from the set alone.

**Run the first read first (Audit 3b).** Before the pre-pass and before you read the level below, open the set only to copy out its reader-facing text, and give that text to a separate reader. A reader who has seen the working files cannot do the first read.

**Run the pre-pass next, on every audit, whatever the size of the level below.** Run it from this skill's folder, the one that holds `workflows/`: the path that starts `../ladder-core/` resolves from there.

```bash
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts <set directory> <L1 findings directory>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`. The pre-pass lists the findings no file in the set cites, citations that point at nothing, and quoted fragments not found in the source they cite. Its items are candidates, not verdicts: judge each one, and carry the real defects into the report as findings. Paste its Summary section into the report.

**Then read the level below.** Read every L1 finding in full (its Statement, Evidence and Context lines), not its title. If the whole L1 set will not fit in your context, read in full every finding the pre-pass lists as uncited and every finding each theme cites, and say so in the disclosure line. The coverage, threshold and outlier audits below are built from this read.

**Read with a file-reading tool, not by printing files in a shell:** shell output is truncated, and a truncated read is a skim. **State what you read.** The report header carries this line, in exactly this form, which the gate checker reads: `**Inputs read:** <N> files, <M> items (L1 findings)`, followed by `— full read` or `— pre-pass candidates and cited items; not read: <what was not read>`.

---

## Step 0 — Deterministic Gate Check (mechanical, before the prose audit)

Run the zero-LLM gate checker against the project's synthesis directory:

```bash
bun ../ladder-core/scripts/synthesis-gates-check/check.ts <project synthesis dir>
```

If `bun` is not found, run the same command with `~/.bun/bin/bun` in place of `bun`.

The checker reports on every set under the directory you give it. Disposition the results for the set being audited and the level below it; note the others in one line without auditing them. Disposition every HALT and WARN before the prose audit below — fix it, or carry it into the report as a named finding. Do not prose-audit artifacts that fail their mechanical gates. (A gate-7 `final_ladder_review: pending` WARN is expected before the capstone review — no action here.) On a first audit of a set, gate 8 warns that the set has no audit report, or none that has cleared. That is expected and is not a failed gate: this audit is what answers it. Note it in one line and go on; it clears when the report clears the set, or when an Addendum records the blocking fixes.

---

## The Nine Audits

Run all nine. Report findings for each.

**Domain awareness:** Confirm the project domain (from the L2 `domain:` frontmatter field, or ask). When checking each theme's Implication, verify it addresses the decision-maker appropriate to that domain — brand/design team, product team, leadership, or policy body — per `DomainScope.md`. A theme whose Implication is aimed at the wrong decision-maker is a domain-coupling error even if the abductive connection is sound.

---

### Audit 1: Coverage

Does the theme set account for the major behavioral domains present in the L1 findings?

Build a domain map:
- List the major topics that appeared across 3+ participants in L1 (purchase process, information sources, community, identity, loyalty, relationship with brand, product experience, dealer/channel, etc.)
- For each domain, confirm there is at least one theme that addresses it
- Flag any domain with multiple findings but no theme

**Red flag:** A domain with 5+ L1 findings across 3+ participants but no L2 theme. Either you missed a theme or the findings don't cluster — figure out which.

**Common coverage gaps:**
- Post-purchase experience (often under-themed because L1 findings skew toward acquisition)
- Information sources (specific enough at L1 to appear granular; requires zoom-out to see the structural pattern)
- What participants rejected (the alternatives that lost often reveal more than the choices that won)
- Structural absences — what the brand doesn't do that participants work around

---

### Audit 2: Threshold Integrity

Does every named theme have 3+ independent sources? Canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`.

Go through each theme and count:
- How many unique participants contributed enacted evidence? Count by the evidence, not by the `participants:` field (see Count only enacted evidence, below).
- Are all sources independent (different people, not the same participant cited multiple times)?
- Do the sources span more than one participant type? (Customer + dealer + industry insider = stronger; three customers = weaker)

**Flag:** Any theme with fewer than 3 independent sources. Downgrade to hypothesis status and note it explicitly.

**Count only enacted evidence (2026-11-03).** `participants:` counts participants whose cited evidence is enacted (reported or observed behavior, or a belief held as their own). A count that includes a stated preference, a hypothetical, an anticipated case, advice to a brand or an observation of others is a defect even when the bullet is honestly annotated: the field will be read as that many participants. Correct the field and move the participant to Listed, not counted; do not settle for an annotation. Check that the field matches the Counted list. A pass on the gates checker's evidence-floor gate does not settle this: the checker reads `participants:` as written and cannot tell enacted evidence from stated. Count from the evidence bullets.

**Also count by evidence class (2026-07-31):** a theme whose sources are all observation-class findings from one researcher is single-observer corroboration — downgrade per the observer-independence rule (SynthesizeThemes Step 5). Any theme citing photo-class evidence must carry `consent_tiers:` in frontmatter and state the **most restrictive tier** among its cited photos — a theme silently mixing internal-tier photos into outward-bound material is a flag.

**Survey sources (2026-09-27):** a theme citing survey findings must carry `survey_rows:` counted from supporting rows (floor of 3 on participants + survey_rows; canonical: `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`); must carry `surveys:` and must not rest only on one survey (single-survey hold); must count only supporting rows whose Claim kind matches the theme's claim; must carry `[SURVEY-ONLY]` when no interview or conversation corroborates; must not reach the 5+ strength band on survey rows; must carry the L1 Limits line; and must not present row counts as percentages. Per the Survey independence rule (SynthesizeThemes Step 5).

**Bonus:** Note any themes with 5+ independent sources, counted the same way, by enacted evidence (participants, sessions, surveys; not survey rows) — these are load-bearing. They deserve more analytical investment and possibly sub-pattern examination.

---

### Audit 3: Behavioral Name Quality

Does every theme title pass the behavioral name test?

For each theme, check:
- [ ] Is it a claim, not a label?
- [ ] Does it describe behavior?
- [ ] Is it specific to this dataset?
- [ ] Could a reasonable person push back on it?
- [ ] Is it in plain words, with no figures of speech, theory terms or working vocabulary?
- [ ] **Clause source (the researcher, 2026-11-07):** does each clause of the title trace to a sentence in the behavioral pattern, with a matching qualifier? Quote the pattern sentence for each clause. A clause that traces only to the abductive connection, or a qualifier stronger than the pattern's ("most" where the pattern says "one" or "many"), is a finding, not advice: rewrite the title from the pattern. It is **Blocking** when the clause or qualifier claims more than the pattern supports. A title that is only awkward or imprecise is **Advisory**. This is not the First Read (3b), which stays advisory.

Also read the text under each title against `ThemeFormat.md` → Plain words in the body, and flag what fails it.

**Rewrite prompts for weak titles:**
- Replace topic nouns ("Trust," "Community," "Purchase") with behavioral verbs or behavioral claims
- State the claim literally: not "word of mouth" but "riders find out about the brand from people they ride with"
- Make it specific enough that it couldn't be a title in a research report for a different company
- Rewrite from what the theme says. Do not add a clause to fix a word.

---

### Audit 3b: First Read

Can a reader with no project context understand the document on first read? The other audits do not test this, and a set can pass all of them and still be unreadable.

**Who reads.** A separate reader: a person, or a fresh agent pinned to `sonnet`. Give the reader only the document's reader-facing text: titles, behavioral patterns, abductive connections and the synthesis statement. Do not give the reader working files, L1 findings or the rest of this audit. You may start the fresh agent yourself. If no separate reader is available, read that text yourself and say in the report that the first read was not clean, because you had already opened the set. Put the reader's list in the report word for word. Fill the brackets from the project and use the rest of this prompt word for word:

> This document reports [one line: what the research was and who it is for]. You are [the intended reader], reading it for the first time. You know [what that reader already knows, such as the category's brands and product terms]. First names are participants and codes in parentheses point to the evidence; ignore both. Read it once, in order. List only the sentences you could not follow on this read: (A) you cannot say in your own words what the sentence claims; (B) you can only work out what it means by decoding a figure of speech or a private term. Do not list a word you would simply look up, or something the next sentence explains. Do not judge whether the research is right. Do not suggest rewrites. For each, quote the sentence or phrase and give A or B. Your entire response IS the list, with nothing omitted. If there are none, respond with "None".

**Using the list.** The list is advice for the writer and the researcher. It is not a pass or fail, and its findings do not count against "Cleared for L3". The writer decides what to rewrite and rewrites from what the theme says, not by adjusting the words of the flagged sentence. The researcher ruled this on 2026-11-06, after a test at L3 in which the counts did not rank the texts and a blocking rule would have required 20 to 35 rulings per set. L2 keeps its strict scope: plain words never widen a claim beyond its evidence.

This audit does not replace the researcher's line-by-line read.

---

### Audit 4: Abductive Connection Quality

Is every abductive connection actually abductive — or is it descriptive?

For each theme, read only the abductive connection. Ask:
- Does this introduce knowledge not visible in the behavioral pattern?
- Does it name a mechanism (not a correlation)?
- Could it be wrong?
- Is it specific to this research context?

**Red flags:**
- Connection restates the behavioral pattern ("The reason people trust their dealers is because dealers provide trust")
- Connection names the obvious mechanism ("This happens because cycling is a social sport")
- Connection could apply to any brand in any category
- Connection is not falsifiable

**Rewrite prompt:** Replace "The reason this happens is that..." with "The pattern is not [obvious explanation]. It's that [structural mechanism]." The contrast structure forces specificity.

---

### Audit 5: Overlap Check

Can any two themes be merged without losing meaning?

Compare each pair of themes. Ask:
- Are they describing the same behavioral mechanism from two angles?
- Would the evidence for one also support the other?
- Does naming both independently dilute each one's claim?

**Test:** Write one sentence that captures both themes. If it's not painful to write — if it flows easily — the two themes are probably one.

**Merge when:** The themes share the same abductive mechanism, even if the surface behaviors differ.
**Keep separate when:** The themes share a topic but have distinct mechanisms, distinct participant populations, or distinct implications.

---

### Audit 6: Outlier Audit

Are the outliers documented? Are any outliers actually load-bearing?

Apply Chipchase's range-of-distribution principle: the most extreme cases are often the leading indicators.

For each outlier (1-2 source finding that didn't reach theme threshold):
- Is this finding at the edge of a distribution that the theme set's center doesn't capture?
- Is this finding from a participant type not well-represented in the main themes?
- Is this finding surprising in a way that suggests the theme set might be organized around the wrong frame?

**Flag any outlier that:**
- Contradicts a named theme (tension, not noise)
- Is from a participant type underrepresented in the theme set
- Contains a signal type (Surprise, Contradiction) that points at a structural pattern not yet named
- Would change the synthesis statement if it were true for 3 participants instead of 1

---

### Audit 7: Synthesis Statement Quality

Does the synthesis statement make an argument, or does it summarize?

Test:
- Read only the synthesis statement. Without the themes, does it communicate a structural insight?
- Does it name a tension — something the brand or organization has AND lacks?
- Does it end with a question that the themes make unavoidable?
- Could a reasonable reader dispute it, and is it in plain words?

**Rewrite prompts:**
- Replace "We found that..." with "The [brand/organization] has [X] but has not built [Y]"
- Replace theme summaries with the cross-theme relationship: "Theme A creates the conditions for Theme B"
- End with a single question, not a list of implications

### Audit 8: Counter-evidence

For each theme, look for the L1 findings that cut against its title, its behavioral pattern or its abductive mechanism, not only the ones that support it. Start from the pre-pass's list of uncited findings (Inputs step), then the full read.

- Name every contradicting finding the theme does not cite, by participant and finding number.
- Read the theme's own cited evidence in full for citations that cut against it: a supporting citation that describes the opposite case, a stranger where the theme says a known person, a hypothetical where it says a purchase.
- A theme whose mechanism is contradicted by findings it does not cite fails this audit until it cites them as counter-cases and narrows the claim to survive them. A counter-case narrows a theme or names its conditions; it rarely removes it.

### Audit 9: Source and segment integrity

Check what kind of evidence each theme rests on, and whose. This is a reading, not a tally: describe what the evidence is, and do not compute shares or ratios.

- **Stated or behavioral.** Mark evidence that is a stated preference, an answer to a hypothetical question, or advice to a brand, as distinct from reported behavior. A theme whose support is mostly stated or hypothetical must say so; it cannot claim a behavior.
- **Prompted answers.** Where many participants answered the same interview-guide question, the number of participants shows the question was asked, not that the behavior is common or salient. Flag a theme built mostly from one prompted question.
- **Participants who do not buy.** Identify participants who are supplied, sponsored or paid by brands, or who say they have not bought in the category recently. Their statements about what they would pay or buy are hypothetical; flag every purchase claim that leans on them.
- **Whose evidence it is.** Using the segments recorded in the L1 frontmatter, read whether the evidence from one segment tells a different story from the theme, or whether one segment is absent from it. Where it does, the theme must say whose pattern it is. A theme that presents one segment's evidence as everyone's fails. Do not turn this into a group comparison the sample cannot carry: the question is whether the theme is honest about whose evidence it rests on, not whether segments differ.
- **Confounds.** Where a theme states a segment difference, check whether another participant attribute (gender, age, role, how participants were recruited) could explain it as well. If so, the theme must name the alternative or drop the difference.

---

**Discharge-sweep rule** — when a finding from this audit is discharged (fixed and closed), sweep for the same defect **shape** — not the same words — before closing. The sweep scope is every artifact derived from the ladder in the project tree: rungs above and below the fix, masters, standalone files, renders (.typ/.pdf), and presentation sources (deck scripts and exported decks). Record the sweep in the Addendum that records the fix. On a first audit nothing has been discharged, so the report field below reads "not applicable". Canonical: `FinalLadderReview.md` → Quality Checks Before Reporting. *(Corrected wording per the 2026-08-21 two-failure replay; adopted 2026-08-22.)*

## Audit Report Format

```
## L2 Theme Set Audit — [Project Name]

**Inputs read:** <N> files, <M> items (L1 findings) — <full read | pre-pass candidates and cited items; not read: …>

**Pre-pass summary:** <paste the pre-pass Summary section>

**Audited:** [N] themes, [N] participants
**Date:** [YYYY-MM-DD]

### Coverage
[List of domains represented / gaps flagged]

### Threshold Integrity
[Any themes below threshold? Any with 5+ sources worth noting?]

### Behavioral Name Quality
[Titles that need rewriting + suggested revisions]

### First Read (3b)
[Who read it, and whether it was a separate reader; each finding with the words quoted and what the writer did with it; "None" if none]

### Abductive Connection Quality
[Connections that are descriptive, not abductive + rewrite prompts]

### Overlap
[Any themes recommended for merging + rationale]

### Outliers
[Any outliers that may be load-bearing + recommendation]

### Synthesis Statement
<Assessment: strong / needs revision + rewrite recommendation if needed>

### Recommended Actions
- Sweep run: <on a first audit, "not applicable: no finding discharged yet"; in an Addendum, after the fixes: scope searched · N further instances / none · instrument>
- **Blocking** — [Action 1]: <what the text claims that the level below does not support, or what a reader would act on wrongly>
- **Advisory** — [Action 2]: <wording, emphasis, a tighter phrasing; the claim stands>
...
*(Every action carries one of the two words. See Closing the Audit, below.)*

### Counter-evidence (8)
<Per theme: uncited contradicting findings (participant + finding number); cited evidence that cuts against the theme; verdict and the narrowing needed>

### Source and segment integrity (9)
<Per theme: stated or hypothetical support; prompted-question themes; purchase claims leaning on non-buyers; whose evidence the theme rests on; confounds named or missing>

### Cleared for L3: <Yes / No — with condition if No>
```

## Closing the Audit — Severity and Stopping Rule

Every recommended action carries a severity. The auditor proposes it; the researcher rules on it.

- **Blocking:** the text claims something the level below does not support, or a reader would act on it wrongly. Fix in this version.
- **Advisory:** wording, emphasis, a tighter phrasing; the claim stands. Record as carried to the next version. Do not apply now: every edit is new text no reviewer has read, and applying advisories is what makes the next audit find new items.

After the blocking fixes:
- Record the fixes in an **Addendum** to this audit report: date, the edits made, who read them, and the discharge sweep run for each fix. The addendum is what clears the synthesis-gates staleness check (gate 8 compares the set's files with the modification time of the current report, which it picks by the date or version in the report's name). A new audit is not required.
- Do not re-run this audit on the fixed text. If the researcher wants an independent read of the fixes, run one bounded pass that reads only those edits. Where that pass blocks, the next step is the researcher's ruling on each item, not another pass.

Canonical statement and the record of the project it came from: `l5-framework-synthesis/workflows/FinalLadderReview.md` → Closing the Review — Stopping Rule.

*Why (2026-11-09):* on a client project's L5, five confirmation audits in two days (v1 to v1e) each blocked text the previous one had recommended, and the ladder review was re-run. A test on v1e's input (the live Opus 5.5 run, a fresh Opus 5.5 run, two Fable 5.1 runs, same brief, blind) agreed on one of the live run's three blocking items; the other two were advisory to every other reader. A fresh auditor's blocking count is one draw from a distribution, not a verdict. Record: `Alexander-Method-Prototypes/2026-11-09_audit-severity-model-test/`.

---

## Reminder: CopyEdit Before Advancing

Before moving to L3 or sharing with stakeholders, manually run a copy-edit pass (Medium level, research genre; the optional prose-craft companion skill's edit workflow, if installed) on the L2 output documents. Apply to the master themes document and all individual L2-XX theme files. **Supply the source corpus (participant roster, transcripts, figure sources) with the request** — with sources in context the pass verifies names, shop names, and figures against them; without sources it flags only internal inconsistencies, and a wrong-but-consistent attribution will pass. The pass also catches grammatical issues and style inconsistencies that accumulate during synthesis.

---

## Save the Audit Report

After completing the report, write it to the directory containing the audited theme files:

**Filename:** `L2_ThemeSet_Audit_[ProjectName].md`
**Location:** Same directory as the audited theme files (e.g., `.../L2_Themes/`)

This keeps the audit co-located with the synthesis it audits and makes it available to the FinalLadderReview, which reads it to confirm per-level gates have cleared.
