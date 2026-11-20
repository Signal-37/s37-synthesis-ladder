# KnowledgeFunnelMapping Workflow

Locate a design problem on Roger Martin's Knowledge Funnel — the continuum from Mystery (open, generative, requiring abduction) through Heuristic (partially codified) to Algorithm (fully specified). Where the problem sits determines what kind of thinking is required.

## When to Use

When a client thinks they're buying an execution problem but you believe it's still a mystery, when scoping a project and needing to be explicit about what kind of work is required, or when a prior design solution has become an algorithm and you need to identify where the next design challenge lives.

> **Data gate:** The funnel diagnostic operates on the user's actual problem statement and what the client or team actually expects. If these have not been provided, halt and ask — do not invent client positions or expectations to fill the diagnostic or the mismatch flags.

## The Knowledge Funnel

```
MYSTERY ──────────────────────────────────────── ALGORITHM
   |                    |                              |
Unknown, open      Partial rules,              Fully specified,
No rules yet       pattern-based               executable
Requires:          Requires:                   Requires:
Abduction          Induction/refinement        Deduction/execution
Design synthesis   Design iteration            Engineering/ops
```

**Mystery:** Nobody knows why it works when it does, or how to solve it reliably. Each instance requires fresh reasoning. Design synthesis lives here.

**Heuristic:** Rules of thumb exist — experienced people can solve it faster than novices, but no guaranteed method. Design iteration lives here.

**Algorithm:** The solution is codified. Given inputs, outputs are deterministic. Engineering and operations live here.

## Process

1. **State the problem as currently framed:**
   - What is the client or team trying to solve?
   - What solution type are they expecting (discovery, improvement, build)?

2. **Apply the funnel diagnostic:**

   | Question | Mystery | Heuristic | Algorithm |
   |----------|---------|-----------|-----------|
   | Can you write a spec for the solution before doing the work? | No | Partially | Yes |
   | Would two experienced practitioners converge on the same solution? | No | Usually | Always |
   | Does prior project experience significantly predict this solution? | Weakly | Moderately | Fully |
   | Is the problem formulation itself contested? | Yes | Somewhat | No |
   | Would more data alone solve it? | No | Maybe | Yes |

3. **Identify where the real design challenge lives:**
   - The algorithm parts can be executed; don't spend synthesis time there
   - The heuristic parts need iteration and calibration
   - The mystery parts require abduction — but which kind?
     - If you have evidence and need to explain it: **ObservationToHypothesis** (retrospective abduction)
     - If you have only a desired VALUE and need both WHAT and HOW: **Frame Creation** (prospective abduction-2) — borrow a working principle from an adjacent domain and ask "if this frame were true here, what would follow?"

4. **Map the full problem space:**
   ```
   ## Knowledge Funnel Map: <Project>

   ### Mystery (needs abduction/synthesis)
   - <Sub-problem 1>: <Why it's still a mystery>

   ### Heuristic (needs iteration/refinement)
   - <Sub-problem 2>: <What rules exist, what's still uncertain>

   ### Algorithm (needs execution)
   - <Sub-problem 3>: <What's already codified>

   ### Mismatch flags:
   - Client is treating <X> as algorithm; we believe it's heuristic/mystery because <reason>
   - Recommended reframe: <How to position the work correctly>

   ### Mystery zone: abduction type required
   - Retrospective (have evidence, need explanation): ObservationToHypothesis
   - Prospective (have desired VALUE, need WHAT + HOW): Frame Creation — identify at least two candidate frames from adjacent domains and test which makes the WHAT searchable
   ```

5. **Use the map to scope the project:**
   - Mystery sections require synthesis phases — scope accordingly
   - Don't undersell mystery as "just research"; it is where the design value is created
   - Algorithmic sections can be time-boxed and parallelized

## Output

A knowledge funnel map that informs project scoping, team structure, and client communication about where the hard work actually is.

---

## Companion Model: The Three Chasms (Kolko)

*(Adapted from Kolko's Figure 6.1, chasm names, and Table 6.1, methods by chasm; the table's structure and wording are this skill's, compared against the book PDF 2026-09-23. Source: Exposing the Magic of Design, Section Three introduction — Figure 6.1 and Table 6.1, pp. 59–62, ahead of Ch. 6 proper (p. 63); locator verified against the book PDF 2026-07-11)*

The Knowledge Funnel maps the *type of reasoning* required. The Three Chasms map *where in the synthesis process* abductive reasoning occurs.

```
Data → [Chasm 1] → Information → [Chasm 2] → Knowledge → [Chasm 3] → Wisdom
```

| Chasm | What must be crossed | Type of abductive move | Synthesis methods |
|-------|---------------------|----------------------|-------------------|
| **1: Making Meaning out of Data** | Raw observations → organized patterns | Abduction from observation to grouping | Affinity Diagramming, Flow Diagramming |
| **2: Experience Frameworking** | Patterns → a coherent model of the design space | Abduction from patterns to structure | Concept Mapping, Ecosystem Mapping, Journey Mapping |
| **3: Empathy and Insight** | Model → design direction and criteria | Abduction from structure to implication | Reframing, Insight Combination |

**How the Funnel and Chasms relate:**
- Chasm 1 work lives deep in the Mystery zone — raw data requires the most open-ended abduction
- Chasm 2 work moves from Mystery toward Heuristic — structure begins to emerge
- Chasm 3 work produces the Heuristic-level output that eventually becomes strategy (and eventually, Algorithm-level execution)

When mapping a project on the Knowledge Funnel, also identify which Chasm the current work is crossing — this determines which synthesis method family is appropriate.

