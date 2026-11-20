# ReasoningChain Workflow

Document the full inferential chain from research data to design direction. Makes the abductive leap legible and auditable — for clients who need to trust the direction, for teams that need to build on it, and for your own record when the reasoning gets challenged months later.

## When to Use

Before presenting a design direction to a client or stakeholder, when a design decision is being contested and you need to show your work, or at the end of a synthesis phase as the primary deliverable.

## Why This Matters

Abductive reasoning produces conclusions that are neither guaranteed (deduction) nor merely probable (induction) — they are the *best current explanation*. The chain makes that explicit: this is where we started, these are the observations that surprised us, this is what would have to be true to explain them, and this is therefore what we are designing for. The chain is falsifiable, which makes it trustworthy.

**The data-frame lens (Klein):** The ReasoningChain documents a data-frame fit process. You entered the project with frames — explanatory structures formed from the brief, domain knowledge, and prior experience. The chain records how incoming data either fit those frames, required elaborating them, or — when anomalies accumulated beyond what elaboration could accommodate — required reframing. The value of the chain is precisely that it shows *when* and *why* reframing happened, not just what the final frame is.

> **Data gate:** This workflow documents reasoning over the user's actual project material — a real brief, real observations with sources, real synthesis history. If these have not been provided, halt and ask. Never invent observations, participant counts, quotes, or project history to complete the chain: a fabricated link makes the entire chain unauditable, which defeats the workflow's purpose.

---

## Process

### Step 1: Establish the Starting Conditions

```
## Starting Conditions

**Brief as received:** <The stated problem or opportunity>
**Assumptions in the brief:** <What the client believed before research — make these explicit>
**Frames entering synthesis:** <The working explanations or hypotheses the team held at the start of fieldwork>
**Research conducted:** <Methods, participants, duration — brief>
```

### Step 2: Document the Key Observations

Select 3–5 observations that most significantly shaped the direction. Each must be specific and sourced, not a generalization.

```
### Observation <N>
- **What:** <Specific behavior, quote, or data point>
- **Source:** <Who, how many, in what context>
- **Why it matters:** <What assumption it confirms, challenges, or replaces>
- **Frame status:** <Did this fit the entering frame / require elaborating it / ultimately require reframing?>
```

### Step 3: State the Abductive Inferences

For each significant observation, state the inference:

```
### Inference from Observation <N>
- **If <X> were true, this observation would make sense**
- **Competing explanations considered:** <What else could explain this, and why we didn't select it>
- **Confidence:** <High/Medium/Low> based on <supporting evidence>
```

### Step 4: Synthesize to a Design Direction

```
## Design Direction

**Synthesis statement:** <The single most important thing the research revealed>
**What we are now designing for:** <Restated design challenge, reflecting synthesis>
**How this differs from the brief:** <What changed and why — or confirmation that the brief was right>
**Frame that is now operative:** <The working principle that makes the design territory visible>
```

### Step 5: State the Conditions for Revision

Four distinct failure modes — name which applies and what would trigger it:

**Positive falsification:** What specific evidence, if found, would directly contradict the hypothesis? Name the observation that would most damage it.

**Negation as failure:** If further exploration produces no confirming evidence after adequate effort, the hypothesis is presumptively withdrawn. State the threshold: how much exploration without confirmation would cause reconsideration?

**Coherence failure:** What developing understanding — of the client's organizational context, of the market, of adjacent research — would make this hypothesis incoherent with the broader picture, even if the local evidence still supports it?

**Fruitfulness failure:** If the hypothesis generates no productive new design questions, no testable predictions, no interesting directions — if it leads nowhere — that is a signal to reconsider it regardless of evidential fit. State what this hypothesis should open up, and name its failure condition if it doesn't.

```
## Conditions for Revision

**Positive falsification trigger:** <Specific observation that would directly contradict>
**Negation-as-failure threshold:** <Amount of non-confirming exploration before reconsideration>
**Coherence failure trigger:** <Contextual development that would make this incoherent>
**Fruitfulness failure trigger:** <What this must open up; failure if it doesn't>
**What we are monitoring:** <What to watch for as design proceeds>
```

### Step 6: Final Chain Document

```
## Reasoning Chain: <Project> — <Date>

Brief → <original problem statement>
Entering frames → <working explanations held before fieldwork>
Key observations → <3-5 bullets, specific, with source>
Frame evolution → <what held / what required elaborating / what required reframing>
Inferences → <What we concluded from each, and why not the alternatives>
Direction → <Where we're designing>
Operative frame → <The working principle making the territory visible>
Revision conditions → <Positive falsification / negation as failure / coherence failure / fruitfulness failure>
Confidence → <Overall — High/Medium/Low>
```

---

## Output

A reasoning chain document — the synthesis artifact. Can be delivered to clients as a standalone brief, appended to a research report, or archived as the foundation for design rationale.

**Labeling requirement:** The reasoning chain is an abductive artifact — the best current explanation, not a set of findings. Every design direction it asserts carries `[HYPOTHESIS — best current explanation, requires validation]` when delivered, and the Confidence field must reflect evidence density, not narrative plausibility.

**On discarded hypotheses:** A synthesis process that documents failed hypotheses and the evidence that disconfirmed them produces more defensible outputs than one that only records the winning insight. Where possible, maintain a discarded hypotheses layer: what the hypothesis was, what evidence was marshaled for it, what ultimately falsified or weakened it, and what feature of the winning hypothesis addresses the weakness. This creates an audit trail and proves genuine engagement with competing explanations.

