# SaturationSampling Workflow

For one corpus file (one category) too large to read in full: read it in rounds of small, spread-out chunks, cite every finding to the read that returned it, and stop by a rule declared before the first round. The rounds are an audit trail; when the category closes, its L1 file is written in the `l1-findings-extraction` Survey Variant format (Step 8).

**Vocabulary:** "round" and "chunk" here; "batch" belongs to `SegmentCorpus` (a group of category files). A chunk is a contiguous run of rows; a round is a fixed number of chunks read and written up together.

**What the rule measures.** Guest, Namey & Chen (2020), "A simple method to assess and report thematic saturation in qualitative research," *PLOS ONE* 15(5): e0232076, adapted from interviews and themes to rows and L1 findings. It measures **code saturation**: whether recent reading is still adding new findings, relative to what an early base of reading produced. It says nothing about whether each finding is understood well, and it does not find rare rows. Rare rows are found by reading every row. In reports, write "new-information ratio at or below threshold (Guest-style code saturation)", never just "saturated". See `ScalingGuidance.md` → the tail-risk question.

**What a stop can and cannot support.** A simulation during the 2026-09-27 audit re-review (synthetic categories, 40,000 rows, 80-row rounds) found:
- On long-tail categories, 15–53% of distinct patterns were still unseen at a 5% stop, depending on run length: a third or more with a one-round run, a quarter to a third with base 2 / run 2, 15–18% with base 5 / run 5. On concentrated categories, 10% or less.
- On long-tail categories, the chance of missing at least one pattern held by 0.1% of rows or more fell from 77–96% with a one-round run to 3–8% with base 5 / run 5 at 5% or base 2 / run 2 at 0% (1% at base 5 / run 5 at 0%). On concentrated categories the rule stops early, and the same settings still missed such a pattern in 21% and 64% of runs.
- A reader who logged 30% of new patterns as reinforcements raised that chance from 39% to 71% at base 2 / run 2, and stopped 22–27% sooner. Reader drift is the largest single threat to what a stop means.
- Runs shorter than a round are no longer possible because the earlier design, which allowed them, stopped with a fifth to more than a third of common patterns unseen.

A pattern held by a share p of rows, spread evenly through the file, is missed by n randomly read rows with probability about (1−p)^n: for p = 0.001, about 37% at 1,000 rows and 5% at about 3,000. Rows are read in contiguous chunks and rare patterns can cluster in time, so for a clustered pattern the real chance of missing it is higher.

---

## Step 0: Entry and Data Gates

Confirm with the user: the corpus file, its row count (`rows_in_file` in its header), and whether a ledger already exists (resume) or this is round 1.

- **Path gate:** list the corpus directory and confirm the file resolves before reading or planning anything. Never use a path remembered from an earlier session.
- **State gate:** if a ledger exists, run `status` (Step 6) and re-derive the round number, coverage and the frozen base list from the ledger and the rounds file. Never plan from a remembered account of earlier rounds.
- The corpus file is a whole category file. `_below_floor.md` sections are too small for this workflow; read them in full.

## Step 1: Declare the Stopping Rule (round 1 only)

Before any reading, set the parameters with the user and write them into the ledger. They cannot be changed afterwards; `init` refuses to overwrite an existing ledger. There are no house values; choose them for this corpus and record the reasons in the rounds file.

```bash
bun scripts/SaturationLedger.ts init --ledger LEDGER.txt --corpus-file <file-name> --total-rows N \
  --chunk-size 10 --round-chunks 8 --base-rounds B --run-rounds R --new-info-threshold 0.05
```

- **Chunk size:** 5–15 rows, fixed for the category.
- **Round:** at least 8 chunks. The rule is evaluated only at round boundaries, on whole rounds.
- **Base:** the first B counted rounds. Their findings are the denominator, and their finding list is frozen as the reference list (Step 4).
- **Run:** the last R counted rounds, all after the base; R is at least 1. **Enlarging the base raises the allowance, because the threshold is a share of base findings; lengthen the run with it.** A run at least as long as the base is the conservative form. In the audit simulation, base 5 / run 2 stopped sooner and missed more than base 2 / run 2. State run rows against base rows in the declaration.
- **Threshold:** the largest share of new findings in the run, relative to the base, that still meets the rule. Once the base is complete, `status` also states it as a whole number of findings (`allowedNew`); record that number in the rounds file. With a small base, a 5% threshold usually allows zero new findings, which turns the rule into "one run with nothing new"; the run length then carries the whole claim.
- Write one sentence of detection arithmetic for the chosen run (the (1−p)^n line above), so whoever reads the close knows what the rule could miss.

## Step 2: Plan the Round

```bash
bun scripts/SaturationLedger.ts plan --ledger LEDGER.txt --round R
```

- The plan is the round's chunks: aligned blocks that avoid everything already in the ledger. The seed is derived from the corpus file and round number, printed with the plan, and reproducible.
- `append` accepts only the chunks the plan produced for that round.
- `NO_FIT:` means fewer free blocks remain than a round needs, and names the unread gaps. Read the remaining gaps directly and `append` each with `--gap`, under a new round number. Gap rounds, and rounds with fewer chunks than declared, count for coverage but are not counted by the rule. Their New findings still matter: if any uncounted round after the base found something new, `status` will not report `meets_rule`. Findings first seen in a short round before the base is complete leave the base denominator, which makes the rule stricter.
- `COVERAGE_EXHAUSTED:` means every row has been read. That is a census, not saturation; report it as such.
- Chunks are contiguous rows, so each is a small cluster. When the corpus is in date order, check at each stopping decision that the chunks read span the date range, and say so in the round section.

To read row range `start–end`, read the corpus file from line `rows_start_line + start - 1`, for `end - start + 1` lines.

## Step 3: The Read-Cite Loop

For every planned chunk, in order:

1. **Read it.** Make the read; let the rows land in context.
2. **Write findings only from rows in that read's output.** Quote the exact words.
3. **Cite each quote with the read that returned it**, in exactly this form (the audit parses it):
   `- Citation: [<row-id> — read <file-name> @ lines <a>-<b>] [researched] "<exact quote>"`
   where `<a>-<b>` are the first and last line numbers that read returned. Here `[researched]` means "returned by a read in this session". A claim not backed by a quote from a read is not a finding.
4. **Log the chunk immediately**, with the count of findings it produced that are marked New (Step 4):
   ```bash
   bun scripts/SaturationLedger.ts append --ledger LEDGER.txt --round R --start-row S --row-count C \
     --first-id <id> --last-id <id> --read-ref "read <file-name> @ lines <a>-<b>" --new-findings K
   ```
   A finding counts toward the chunk whose read its **first** Citation names. `AuditRound.ts` checks this count against the rounds file (Step 7).

**One read per chunk, reported as such.** A round reported as N chunks read has N reads in the session. If the reads feel slow, make the round smaller in the next category; never write up a chunk that was not read.

**Nothing carried on memory.** A finding from an earlier turn is extended only while its quote is still visible. If it has left context, read the rows again.

**Ambiguous stays ambiguous.** A row that does not settle a mechanism is written up as unresolved, not dropped and not sharpened.

## Step 4: New or Reinforced

The count of New findings drives the rule, and the reader decides it with earlier findings in view. The bias runs toward folding a new pattern into an old finding, which lowers the count and stops the sampling early. Three controls:

- **Frozen base list.** When the base rounds are complete, copy the base findings into a `### Base list (frozen)` section of the rounds file. From then on, **New** means a pattern that cannot sit under any existing finding's statement without rewording that statement.
- **Record reshaping.** Each round's process note states how many findings were merged or split that round.
- **Fresh-context check before any close** (Step 6).

## Step 5: Record the Round

Rounds go in a separate rounds file next to the ledger (`<category>_rounds.md`), not in the L1 file. One section per round; each finding is a `### F<n> —` heading so the audit can find it.

```
## Round [N] — [date] — [chunks] chunks / [rows] rows — running total [X] of [total] ([%])

**Process note:** [what went wrong this round, or "None". Required; leaving it out is not the same as "None". Include: findings merged [n], split [n].]

### F[n] — [finding statement]
New | Reinforced (Fn) | Ambiguous
**Claim kind:** reported incident | stated wish | evaluation
- Citation: [r4102 — read topic.md @ lines 4121-4130] [researched] "exact quote"

### Stopping rule
[output of `status`: counted rounds, base findings, new in run, allowedNew, ratio; date spread of the chunks read]
Decision: [continue / checkpoint for a stakeholder decision / close — and who decided]
```

Running totals come from the ledger (`status`), never from memory or intention.

## Step 6: Check the Rule, and the Fresh Read Before Closing

```bash
bun scripts/SaturationLedger.ts status --ledger LEDGER.txt
```

States: `insufficient` (fewer counted rounds than base + run), `empty_base` (the base produced no findings; this never meets the rule, and says the category may hold nothing to find), `new_in_uncounted_round` (a short or gap round after the base found something new; this state persists for the category, however many clean runs follow, so such a category closes only by a named stakeholder decision), `above_threshold`, `meets_rule`. Short and gap rounds are listed and not counted.

**`meets_rule` informs a decision; it does not make one.** Before any close:
1. **Fresh-context read.** A reader with no earlier findings in view (a new session or a subagent) is given the question and, for each chunk of the last run, the read instruction and the chunk's first and last row IDs from the ledger. It reads those chunks, confirms each read starts and ends on the expected IDs, and lists the patterns it finds with their row IDs. **Check the answer before using it:** every row ID it cites must be in the run's chunks. A fresh read that cites a row outside the run read the wrong lines; discard it and run it again. (The first test-bed run of this check read the five lines before each chunk.)
2. **The fresh reader matches its own patterns.** Only after listing them blind does it receive the frozen base list and the later New findings, and it marks each of its patterns as on a list (which finding) or not. The round writer does not do this matching. Record the reader's count of patterns not on the lists, the round's count of New findings, and every row the two classified differently.
2a. The fresh reader is a model at least as capable as the one that wrote the rounds; record which model it was.
3. If the fresh read finds new patterns the rounds did not, the rule is not met, whatever `status` says; add them as New and continue.

Closing requires a sentence in the rounds file naming the decision, who made it, the percentage read, and the fresh-read result. A stakeholder may also stop earlier for cost or time; record that as the reason, not as saturation.

## Step 7: Audit the Round

The steps above are followed by the same agent that writes the findings. This step checks them against a separate record: the reads that actually happened.

```bash
bun scripts/ExportTranscript.ts SESSION.jsonl [SUBAGENT.jsonl ...] > TRANSCRIPT.json
bun scripts/AuditRound.ts --transcript TRANSCRIPT.json --findings <category>_rounds.md --ledger LEDGER.txt --round R
```

Claude Code keeps session logs under `~/.claude/projects/<project>/<session-id>.jsonl`, and subagent logs under `<session-id>/subagents/`. Other agent tools need a small adapter that writes the same JSON (`{"calls": [{"ref", "file", "text"}]}`; see the header of `ExportTranscript.ts`), or the file assembled by hand from the round's reads.

Verdicts:

| Verdict | Meaning |
|---|---|
| `OK` | The citation checks out |
| `MALFORMED` | A Citation line that does not parse |
| `NO_CITATION` | A finding with no Citation line |
| `UNCHECKED` | A `[model knowledge — verify]` citation: not a finding, fails |
| `NO_FINDINGS` | The file has no findings |
| `MISSING_READ` | No read with that reference |
| `ID_NOT_IN_READ` | The read did not return that row |
| `NO_QUOTE` | A citation with no quote |
| `QUOTE_NOT_FOUND` | The quote is not in that row's text |
| `LINE_TRUNCATED` | The read tool cut the row short; re-read that row alone |
| `LEDGER_READ_MISSING` | A ledgered chunk has no matching read |
| `COUNT_MISMATCH` | A ledger entry's `new_findings` differs from the New findings citing it first |
| `UNLEDGERED_READ` | A New finding's first citation names a read that is not a ledger entry of this round |
| `LEDGER_IDS_MISMATCH` | A ledger entry's first or last row ID is not in the text its read returned |
| `ROUND_NOT_IN_LEDGER` | `--round` names a round with no ledger entries |

Any verdict other than `OK` fails the round, and the round is not counted until the failures are fixed.

## Step 8: Close — Write the L1 File

When the category closes, write its L1 file in the Survey Variant format (`l1-findings-extraction/FindingsFormat.md` → Survey Variant): `sampling: saturation`, the Limits line with its sampling clause, one `## Finding N:` per round finding (Statement, Claim kind, Evidence, Rows, Context, Signal type, Abductive flag), and Row accounting drawn from every round's reads. Rows read but not carried into any finding are listed with a reason. Only this file goes to L2 and the gates checker; the rounds file stays as the audit trail.

**Place every row from the reads, not from memory.** Before writing Row accounting, re-read each ledgered chunk and write its placements into the rounds file under `### Placements`, one line per chunk:
`Chunk S-056–S-060 (read transit-card.md @ lines 37-41): F1 [S-056] · F2 [S-057, S-058] · F3 [S-059] · not carried [S-060]`
Then compile Row accounting from those lines, and check it:
```bash
bun scripts/AuditRound.ts --accounting <L1 file> --ledger LEDGER.txt
```
It fails on an accounted row that was never read (`NOT_READ`), a read row placed nowhere (`NOT_ACCOUNTED`), and a row counted twice (`DUPLICATE`).

## Step 9: Report

```
SaturationSampling round [N] — [category file]

Chunks read: [N] (reads in session: [N])
Rows this round: [N]   Running total: [X] of [total] ([%])
New: [N]   Reinforced: [N]   Ambiguous: [N]   Merged/split: [n]/[n]
Audit: [PASS / FAIL — verdicts]   Citations checked: [N]
Rule: [insufficient / empty_base / new_in_uncounted_round / above_threshold / meets_rule], new in run [n] vs allowed [n]
Fresh read (before close only): [n] patterns, [n] not on the lists
Decision: [continue — round N+1 / stakeholder decision needed / closed by …]
```
