# ObservationToHypothesis Workflow

Move from a surprising or significant research observation to a structured design hypothesis. This is the core abductive move — not deduction (conclusion follows necessarily) and not induction (conclusion is probable) but the creative inference to the best explanation.

**The operative structure:**
```
Surprising Observation + Background Knowledge → Best Explanation (Hypothesis)
```

The hypothesis is not in the data and not in your background knowledge — it is abducted from the relationship between them. The quality of the leap depends on the quality of the background knowledge brought to bear. A practitioner with deep domain experience and cross-project pattern knowledge will generate better hypotheses from the same observation than someone without it.

## When to Use

When you have research data that doesn't fit the current mental model or brief, when you've spotted something unexpected in fieldwork, or when a pattern from PatternRecognition needs to become a testable direction.

> **Data gate:** This workflow operates only on user-supplied material — observations, fieldwork, data (retrospective mode) or a user-supplied VALUE statement (prospective mode). If none has been provided, halt and ask for it. Never invent observations, participants, quotes, or fieldwork to populate the template, and never substitute general knowledge for the user's research artifacts.

---

## Step 0: Select the Abduction Mode

Before beginning, determine which form of abduction applies:

**Retrospective (Peirce):** You have evidence — observations, data, fieldwork — and need to explain what it means. The surprising observation comes first. Proceed to Step 1.

**Prospective (Dorst):** You have a desired outcome (VALUE) but neither the solution (WHAT) nor the working principle (HOW) is known. This is abduction-2: both must be invented together. Instead of starting from a surprising observation, start from the VALUE statement:

```
VALUE statement: <The outcome/experience/impact we are designing toward>
Frame candidates: <At least two working principles borrowed from different domains that could produce this value>
For each frame: "If <this working principle> were true here, what WHAT would follow?"
```

Find a frame — a provisional working principle from an analogous domain — that makes the WHAT searchable. When only one obvious frame exists, you are probably in abduction-1 (known working principle, finding the right fit), not abduction-2. Abduction-2 requires generating frames from outside the immediate domain.

If prospective: after generating WHAT candidates from each frame, treat them as your hypothesis set and return to Step 4 (Evaluate Against the Explanatory Virtues) to continue.

---

## Process

### Step 1: Identify the Surprising Observation

- What data point or pattern doesn't fit the expected picture?
- What are users doing that no one anticipated?
- What belief or behavior is inconsistent with the stated problem?

Peirce's test: abduction starts with *surprise*. If the data confirms what everyone already believed, it doesn't generate new knowledge — it's confirmation. The generative move is off the anomaly.

Surprise test (this skill's heuristic, informed by Timmermans & Tavory's point that surprise registers only against existing theory, 2012, pp. 169, 173): *Could I have predicted this from what I knew before the fieldwork?* If yes, it is confirmatory. Only observations that could not have been predicted merit abductive attention. (Their *defamiliarization* is a different move: re-reading field notes and transcripts to make the taken-for-granted strange, p. 177.)

### Step 2: State the Observation Precisely

```
Observation: <Specific, grounded — what you saw or heard, not interpreted yet>
Source: <Who, how many instances, in what context>
Why it's surprising: <What assumption or expectation it violates>
```

---

### Step 3: Generate Candidate Hypotheses — Aim for 3, Require Diversity

For each observation, generate at least 3 explanations that would, if true, make the observation unsurprising:
- Hypothesis A: <If X were true, then observing this would make sense>
- Hypothesis B: <If Y were true...>
- Hypothesis C: <If Z were true...>

Simplicity governs *selection* (it is a Step 4 virtue), not generation. During generation, deliberately admit the unfamiliar or cross-domain hypothesis even when it introduces new primitives — a cross-domain candidate usually *looks* more complex, and suppressing it here is exactly the bad-lot failure the diversity requirement below exists to prevent.

**Diversity requirement (van Fraassen's "bad lot" prevention):**
The most common synthesis failure is not inadequate evaluation — it is generating all hypotheses from the same theoretical lens or cultural perspective, so the correct explanation was never in the candidate set. Before evaluating, check:
- Are all three hypotheses variants of the same underlying explanation, just phrased differently?
- Did all three emerge from the same disciplinary frame (e.g., all psychological, or all behavioral)?
- Would a researcher from a different domain (organizational theory, economics, anthropology, engineering) generate a different hypothesis entirely?

If yes to any: generate at least one hypothesis from a different theoretical or cultural angle before proceeding.

**Alternative casing (Timmermans & Tavory 2012, p. 177):**
The same observation can be a "case of" multiple different things depending on the theoretical frame applied. Explicitly name what theoretical category each hypothesis is treating this as:
- "This observation is a case of <Category A> → Hypothesis A"
- "This observation is a case of <Category B> → Hypothesis B"

If all your hypotheses treat the observation as a case of the same category, you are not generating diverse alternatives — you are generating variants. Change the category.

**Magnani's mode check:**
Are you in *creative abduction* mode (no known solution type exists — the frame must be invented) or *selective abduction* mode (you know the kind of solution that works, you are finding the right instance)? Creative mode requires deliberately suppressing early closure on familiar patterns. If the hypotheses feel obvious, you may be in selective mode with confirmation bias dressed as hypothesis generation.

**Source discipline:** Background knowledge supplied from training rather than from the user's materials is tagged `[model knowledge — verify]` wherever it does load-bearing work in a hypothesis — a named study, statistic, or domain fact that makes an explanation persuasive must be verifiable or marked.

---

### Step 4: Evaluate Against the Explanatory Virtues (after Lipton and the IBE literature)

Evaluate each hypothesis against the full set of explanatory virtues. The winning hypothesis should maximize across all seven; a hypothesis weak on several virtues signals it is not "lovely" enough to warrant commitment.

> **Anti-fabrication rule:** Mechanism, scope, and coherence entries describe how the hypothesis relates to the user's observations — do not invent supporting statistics, named studies, or domain facts to strengthen a cell. Training knowledge used in a cell carries `[model knowledge — verify]`.

| Virtue | Question to ask | Hypothesis A | Hypothesis B | Hypothesis C |
|---|---|---|---|---|
| **Scope** | How many of the other observations does this explain, beyond the triggering one? | | | |
| **Precision** | Are its predictions specific enough to distinguish it from alternatives? | | | |
| **Mechanism** | Does it name *how* the cause produces the effect — or just that it does? | | | |
| **Unification** | Does it tie together observations that seemed unrelated? | | | |
| **Simplicity** | Does it introduce the fewest unexplained primitives and ad hoc elements? | | | |
| **Coherence** | Is it consistent with everything else you know about this domain and this context? | | | |
| **Fruitfulness** | Does it open up productive new design questions and directions? | | | |

Coherence check (after Thagard's explanatory coherence): weigh the winning hypothesis against the whole set of hypotheses and evidence in play — your other emerging insights, the client's organizational context, the broader domain knowledge — not just with the local evidence. A hypothesis that fits the triggering observation but disrupts coherence with everything else is less likely to be correct than a slightly less elegant hypothesis that fits the whole picture.

---

### Step 5: Bias Checkpoint — Before Selecting

Before committing to a leading hypothesis, run this checkpoint. Each item is a known way abductive reasoning fails in design synthesis contexts.

**Confirmation bias:** Have you spent more time finding evidence for the leading hypothesis than looking for evidence against it? Generate one piece of evidence that would support each of the rejected hypotheses — if you can't, you haven't genuinely evaluated the alternatives.

**Availability bias:** Is the leading hypothesis the one that the most salient or recent observation supports? Check whether the hypothesis would hold up equally well if the most dramatic fieldwork story were removed from consideration.

**Brief anchoring:** Does the leading hypothesis implicitly accept the problem framing from the client brief? If you removed the brief's framing language entirely, would this still be the most convincing hypothesis? If not, the brief is doing unwarranted explanatory work.

**Narrative fallacy:** Does the hypothesis tell a clean, satisfying story that required smoothing away real contradictions in the data? Name one observation that doesn't fit the hypothesis cleanly, and state how the hypothesis accounts for it. If it can't be accounted for, the hypothesis may be narratively compelling but evidentially thin.

**Motivated reasoning:** Is this hypothesis convenient — for the project, for the client relationship, for the direction you were hoping to go? Apply the discomfort test: does stating this hypothesis plainly make you slightly uncomfortable because of what it implies for the client? If the answer is too comfortable, be suspicious.

---

### Step 6: Select the Leading Hypothesis and Formulate

**Withdrawal gate (Magnani):** If no hypothesis scores adequately across the virtues after the bias checkpoint — if the leading candidate is merely least-wrong — **withdraw the set** rather than selecting: return to Step 1 to re-observe, or to Step 3 to generate from a further-removed frame. An honestly-evaluated bad lot does not get a winner by default. Proceeding on a weak leader is a documented decision, not an automatic terminal — record it, with its reason, in the Confidence field.

```
## Design Hypothesis

**Observation:** <What we saw>
**Abduction mode:** <Retrospective (explaining evidence) / Prospective (designing toward VALUE)>
**Best explanation:** <The abductive inference — what would need to be true for this observation to make sense>
**Explanatory virtues strongest:** <Which of the seven virtues this performs best on>
**Explanatory virtues weakest:** <Where this hypothesis is most vulnerable>
**Competing hypotheses considered and set aside:** <Each, with one-line reason for rejection>
**Felt residue (optional):** <any forced feeling or unresolved unease about a set-aside hypothesis — carried to the rung completion report's `felt_flags:` line with a settling condition>
**Design implication:** <If this explanation is correct, then we should design for...>
**How to test:** <What we'd do in design to validate or challenge this hypothesis>
**Confidence:** <High / Medium / Low — based on data density and alternative explanations ruled out>

**Status label (required on every presented output):** [HYPOTHESIS — requires investigation]
```

---

## Output

A set of ranked design hypotheses ready for ReasoningChain documentation or direct design exploration.

**Labeling requirement:** All outputs from this workflow are hypotheses — not findings, not conclusions. When presenting to a client or stakeholder, every output must be clearly labeled `[HYPOTHESIS — requires investigation]`. Never allow an abductive inference to be communicated as a confirmed research finding. The Confidence field (High / Medium / Low) must always be included and must reflect the actual density of evidence, not the plausibility of the explanation.

**Ladder re-entry:** If you escalated here from a ladder rung, the Best explanation maps back directly — returning to L2: the best explanation, named behaviorally, is your theme candidate. Returning to L3: the best explanation, stated declaratively, is your insight candidate.

