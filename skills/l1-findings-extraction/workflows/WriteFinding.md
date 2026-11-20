# WriteFinding Workflow

Translate a single raw session moment — a participant quote, an observed behavior, a photograph — into a well-formed L1 finding. This is the craft at the center of design synthesis: the move from data to interpreted meaning, done without over-reaching into prescription. A finding has two peer sources: an exact quotation from the participant, or an observation of the research team (sourced from the session field-note file or an L0 delivery annotation — see `FindingsFormat.md` → Evidence Classes).

## Step 0: Confirm Domain

Before writing the abductive flag, confirm or inherit the project domain — it determines who the key decision-maker is:

| Domain | Key decision-maker |
|--------|-------------------|
| brand/design | Brand team, design team, product team |
| product/UX | Product manager, UX team, engineering |
| organizational | Leadership, operations, HR, change management |
| policy/advocacy | Policy team, advocacy organization, government body |
| other | Confirm with user |

If this WriteFinding is called from within an ExtractFindings session, inherit the domain confirmed in Step 1 of that workflow. If called standalone, ask.

## When to Use

When you have a raw moment from a transcript and need to express it as a finding. Can be called for a single moment or iterated across a set of candidates from ExtractFindings.

## The Critical Distinction

| Type | Example | Problem |
|------|---------|---------|
| **Quote (too raw)** | "I always email it to myself before I submit." | No interpretation — the reader has to do the synthesis work |
| **Recommendation (too cooked)** | "Users need a save-draft feature." | Leapt to solution before understanding the need |
| **Finding (right)** | "Users create redundant personal backups before interacting with submission systems, indicating distrust of the system's ability to preserve their work and their own ability to recover from errors." | Grounded in evidence, interpreted at the behavioral level, implies design territory without prescribing a solution |

The finding does interpretive work — it says what the data *means* — but stops short of saying what to *do*. The solution lives downstream in synthesis.

## Finding Format

```
## Finding [N]: <Descriptive Title — behavioral, not evaluative>

**Statement:** <Interpreted description of the behavior, belief, preference, or experience — 1-3 sentences. Specific to this participant.>

**Evidence:** <one of the four evidence classes with its marker (FindingsFormat → Evidence Classes): verbatim quote · [paraphrased — no direct quote] · [observation — researcher, source] · [photo — file, photographer, consent tier; caption]>

**Context:** [Where in the session; what prompted it; whether volunteered or extracted; first or fifth time this topic surfaced]

**Signal type:** [Strong language / Specificity / Surprise / Contradiction / Repetition / Resignation / Delivery]

**Abductive flag:** <The question this finding forces. Not a recommendation — the question the project's key decision-maker can't ignore after reading this. See DomainScope.md for who that is per project type.>
```

## Writing the Statement: Rules

**Write behaviorally.** Describe what people do and believe, not how the system fails or what it should do.
- Wrong: "The system doesn't support recovery"
- Right: "Users develop unofficial recovery behaviors independent of system affordances"

**Interpret, but at the right level.** One inference step from the data — not two.
- Data: "I email it to myself"
- One step: "Users create personal redundancy outside the system" ← finding
- Two steps: "Users don't trust the system" ← getting thin; needs more evidence
- Three steps: "The system has a trust problem" ← conclusion, not a finding

**Stay behavioral.** Not "the participant was frustrated" (your inference about their emotion) but "the participant described their workaround in resigned terms, having abandoned the expectation that the system would do this for them."
- **Delivery carve-out (2026-07-31):** a present researcher's attested delivery reading — sarcasm, deadpan, hesitation, performed confidence, recorded in an L0 delivery annotation or the session field-note file — is admissible evidence and takes the Delivery signal. Inferring tone from transcript text alone remains banned; that inference is how a joke becomes a finding.

**Make the abductive flag specific.** If you could write it without reading the transcript, it's too generic. The flag names what's surprising and what it forces — not a restatement of the finding, not a recommendation.

## Examples

**Raw moment:** "I kind of just... do my own thing at this point. Like the process exists but it doesn't really work for how I work."

```
## Finding 12: Official Process Exists as Formal Record, Not Operational Tool

**Statement:** This participant has developed a parallel personal workflow that coexists with,
but largely bypasses, the official process. The official process functions as a compliance
artifact rather than an actual working method.

**Evidence:** "I kind of just do my own thing at this point. Like the process exists but it
doesn't really work for how I work."

**Context:** Participant is a 6-year employee describing their daily task management.
Volunteered when asked to walk through a typical morning — no prompting required.

**Signal type:** Resignation / Contradiction

**Abductive flag:** If the official process was genuinely designed for this role, why has a
parallel system emerged and persisted for six years? Either the process was designed for a
different context, or the role has evolved faster than the process has been updated. The
deeper question: does the organization know this gap exists, and if so, why hasn't it closed?
```

---

**Raw moment:** Participant spent 4 minutes looking for a feature before giving up and searching externally.

```
## Finding 8: External Search Used as Primary Navigation

**Statement:** This participant exits the product to a search engine as a first-line strategy
for navigating complex features — treating external documentation as more reliable than
in-product help.

**Evidence:** [observation — moderator, FN entry 3] Participant spent approximately 4 minutes
navigating in-product before opening a browser tab and searching "product name + task" without
comment, as though this were routine.

**Context:** Observed during task 3 of usability session; capture artifact is the session
field-note file, entry 3. Participant did not flag this as a problem or unusual — the external
search appeared habitual.

**Signal type:** Surprise / Resignation

**Abductive flag:** The absence of frustration is itself significant — if this felt like a
failure, the participant would have expressed it. The normalized exit to external search
suggests an established coping pattern, not a one-off. What does in-product help currently
offer, and why has it failed to become the default? Is the product even aware that this is
how users navigate it?
```

## Output

A formatted finding ready for inclusion in a findings file, for input to ClusterFindings, or for direct use in PatternRecognition or abductive-reasoning.
