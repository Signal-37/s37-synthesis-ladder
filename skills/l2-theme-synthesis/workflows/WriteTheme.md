# WriteTheme Workflow

Craft a single L2 Theme from a named cluster of L1 findings. This workflow covers the abductive act at the center of synthesis: forging the connection between independent findings to produce knowledge not present in any individual one.

## Step 0: Confirm Domain

Before writing the Implication, confirm or inherit the project domain — it determines who the forced question is addressed to.

- **If called from within a SynthesizeThemes session:** inherit the domain confirmed in that workflow's Step 1.
- **If called standalone:** ask the user — brand/design | product/UX | organizational | policy/advocacy | other — then read the matching entry in `DomainScope.md`.   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation

## When to Use

When you have a named cluster of findings (3+ independent sources — `../ladder-core/config/synthesis-gates.yaml` → `gates.theme_evidence_floor`) and need to write the theme. Can be invoked from SynthesizeThemes or called directly when the user hands you a specific cluster to write.

---

## The Critical Distinction

| Type | Example | Problem |
|------|---------|---------|
| **Label (too flat)** | "Dealer Relationships" | A category, not a claim — could be a section heading in any research report |
| **Summary (too descriptive)** | "Dealers are important for purchase decisions" | Describes what everyone already suspected |
| **Theme (right)** | "How buyers get on with the shop decides whether they buy, and whether they come back" | Behavioral claim; specific; could be wrong; in plain words |

A theme does interpretive and abductive work. It says what the cluster of findings *means* and posits *why* the findings connect — but stops short of saying what to *do*. The strategic direction lives downstream in L3 Insights.

---

## Writing Order

Write in this order. The sequence prevents you from sliding into description.

**1. Write a plain working name.** State what the cluster seems to show, in plain words. This guides the writing; it is not the title. The title is written last (step 6).

**2. Write the behavioral pattern.** Descriptive. What the data shows across participants. Third-person behavioral register. No interpretation yet.

**3. Write the abductive connection.** The hardest part. Name the mechanism — WHY these findings connect. This is where new knowledge enters. Use Peirce's structure:
- *We observe:* [behavioral pattern, condensed]
- *We know from other contexts:* [relevant principle, analogy, or structural fact]
- *Therefore we posit:* [the mechanism that explains the connection]

You are making a claim that could be wrong. State it in plain words.

**4. Write the evidence.** Specific citations: participant code, finding reference, direct quote or behavioral description, one-line interpretation.

> **Anti-fabrication rule — branch on the L1 finding's evidence class** (four classes since 2026-07-31; `l1-findings-extraction/FindingsFormat.md` → Evidence Classes):
> - **Verbatim quote** → quote only verbatim from the cited L1 finding, in quotation marks.
> - **`[paraphrased — no direct quote]`** → behavioral description here — never a reconstructed or approximated quote.
> - **`[observation — <researcher>, <source>]`** → behavioral description **carrying the researcher and capture artifact inline** (e.g., "observed by the researcher, FN entry 4"), **never in quotation marks** — an observation rendered as a quote presents the researcher's noticing as the participant's words, the exact laundering the two-source doctrine forbids.
> - **`[photo — …]`** → caption plus file reference, **carrying the consent tier** at the point of citation.

**5. Write the implication.** The question the theme forces the project's decision-maker to answer — the brand/design team, product team, leadership, or policy body, depending on the domain (see `DomainScope.md`). Not a recommendation — a question that cannot be ignored after reading the theme.

**6. Write the title.** State in plain words what the behavioral pattern shows. Take each clause and each qualifier from the pattern; the abductive connection's reading stays in the connection (`ThemeFormat.md` → The title comes from the behavioral pattern). Then apply `ThemeFormat.md` → The Behavioral Name Test:
- Is it a claim, not a label?
- Does it name behavior?
- Is it specific to this data?
- Could a reasonable person push back on it?
- Can a reader with no project context understand it on first read?

If it doesn't pass, rewrite it from what the theme says. If no plain statement can be written, the theme isn't ready.

Then read the text under the title against `ThemeFormat.md` → Plain words in the body.

---

## Theme Structure

```
## L2-[NN]: [Full behavioral theme title]

**Behavioral pattern:** <What the data shows across participants. 2-4 sentences. Descriptive only — no interpretation. Third-person behavioral register.>

**Abductive connection:** [WHY these findings connect to the same underlying truth. One paragraph. New knowledge not in any single finding. Names the mechanism, not the correlation. Could be wrong.]

**Evidence:**
- **[Participant code] ([Finding N]):** "[Direct quote or behavioral description]" — [One-line interpretation of what this instance contributes to the theme]
- **[Participant code] ([Finding N]):** "[...]" — [...]
- [Continue for all sources]

**Implication:** [The question this theme forces. 2-4 sentences. Not a recommendation.]
```

---

## How to Forge the Abductive Connection

The abductive connection is the sentence that Kolko calls "forging connections" — the creative act that introduces knowledge not present in the original data. It is not discovered in the findings; it is posited by the synthesist.

**Prompts to help write it:**
- *Why would this pattern exist?* Not "because people want X" — but "because the structure of [category / context / relationship] makes X the path of least resistance / the rational choice / the only option"
- *What assumption would have to be true for all these findings to make sense simultaneously?*
- *If I had to defend this pattern to a skeptic, what's the single most important thing to say?*
- *What does this pattern mean for a brand or organization that didn't know it existed?*

**Chipchase check:**
- Does the connection name a mechanism that's "hidden in plain sight" — obvious once named, invisible before?
- Does it reveal something about the structure of the ecosystem rather than just the behavior of an individual?
- Does it hold at the essence level — not just in this specific context but in the underlying human dynamic?

---

## Evidence Citation Format

```
- **[Abbreviation] ([Finding reference]):** "[Verbatim quote or behavioral description]" — [One clause interpreting what this instance contributes]
```

Examples:
```
- **NB (Finding 14):** "Most of the new members came because a friend brought them... The posters did very little." — Former club manager confirming the mechanism retrospectively; not a customer opinion but a practitioner's observation.

- **LV (Finding 6):** "Half the weekend ride was on one. That is how I knew the name." — All brand awareness community-sourced; the participant could not recall any advertising for the brand.
```

**Evidence ordering:** Order from most direct/explicit to most inferential. Lead with the quote that most clearly demonstrates the pattern; end with the finding that requires more interpretation.

---

## Implication vs. Recommendation

The implication forces a question; a recommendation answers it. L2 is for forcing questions. Recommendations come at L4 (Opportunity Areas).

| Implication (right) | Recommendation (wrong) |
|---------------------|----------------------|
| "If the dealer is the brand at the moment of purchase, what does Meridian currently invest in the quality of that relationship — and is that investment proportionate to its strategic importance?" | "Meridian should invest more in dealer training" |
| "If test ride access is the conversion mechanism that advertising cannot replicate, is Meridian's investment in trial-creation proportionate to the ROI it actually delivers?" | "Create more demo events" |

---

## Output

A formatted L2 theme section ready for:
- Inclusion in the master L2_Themes document
- Writing as a standalone L2-NN file
- Direct use in presentation or stakeholder readout
