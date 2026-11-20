# SegmentCorpus Workflow

Turns a survey export into citable corpus files, grouped into batches for L1 extraction.

## Step 0: Confirm Before Running

Run `ValidateExtract` first if it has not run this session. Confirm with the user:
- Entry path (1 platform-coded, 2 researcher-coded) and, for path 1, the category column
- Output directory (new or empty; see `--replace` below)
- Whether any category needs less than a full read, and by which route (`ScalingGuidance.md` → the four questions). The default is every row. Write the decision, one line per category that departs from it, in `_read_decision.md` in the output directory. The tool never writes or deletes that file.

**Data gate:** no export at the stated path → stop and ask. `SegmentSurvey.ts` exits with a `STOP_ASK:` message in that case; treat it as a question for the user, not an error to work around.

## Step 1 (Path 1): Segment on the Existing Categories

```bash
bun scripts/SegmentSurvey.ts EXPORT.xlsx \
  --text-col "Comment" --group-col "Topic" [--parent-col "Parent Topic"] \
  [--id-col "Response ID"] [--respondent-col "Respondent"] [--date-col "Submitted"] [--score-col "Score"] \
  --coding-provenance platform-applied --survey-id ID [--question "verbatim question text"] \
  [--min-count 15] [--sheet "Responses"] --out OUTDIR [--replace]
```

What it writes:
- **One corpus file per category** at or above `--min-count`. YAML frontmatter records the source file name and its SHA-256, the columns used, the category, coding provenance, row counts, sampling status, ID scheme, respondent-ID status, date range, and `rows_start_line`. The body is one line per row: `[<id>] <verbatim>`, then `(respondent: …)`, `(date: …)`, `(score: …)` when those columns are given. Row k of the file is at line `rows_start_line + k - 1`.
- **`_below_floor.md`**: every category under the floor, one `###` section each. Nothing is dropped; these rows are as citable as any others.
- **`_index.md`**: every category with its total, rows written, sampling status and file name.
- **Counts printed at the end:** rows scanned, rows written, blank-text rows skipped, below-floor rows, blank-category rows. Use them in the Step 4 report. A run with no text in any row stops with an error.

**IDs** come from `--id-col` when given, otherwise `r<N>` from the sheet row. They are assigned before any grouping or sampling. On a row with text, a blank, duplicate, or malformed ID (containing `]`, `|` or a line break) stops the run; rows with no text are skipped and do not need an ID.

**Respondent IDs** (`--respondent-col`) are written on every row line. They must be pseudonymous: a value that looks like an email address or a formatted phone number stops the run; plain digit IDs are accepted. Blank cells are allowed; the header then says `respondent_id: partial` with the number missing, and L1 treats independence as assumed.

**Survey ID** (`--survey-id`, required) names the survey the export belongs to and is written into every corpus file; L2 uses it to decide whether two findings come from the same survey. There is no default: a file hash changes on every re-export, and a re-export read as a new survey would release the single-survey hold and count the same respondents twice. Give a re-export of the same collection the **same** ID, and give separate waves, or channels exported separately, **their own** IDs. Values starting with `-` or `sha-` are refused. Record the choice in `_read_decision.md`.

**Blank categories** become a category named `(blank)`, with a warning. **Duplicate column names** that the command refers to stop the run.

**Output directory.** The tool refuses a directory that already holds files unless `--replace` is given. `--replace` deletes every `.md` file in that directory except `_read_decision.md` and `_consolidation_log.md`; keep other notes elsewhere.

**Sampling** happens only with `--sample-size N --sample-reason "..."`: each category over N is sampled reproducibly (seed 42, printed with the reason and `sample_n` of `rows_in_category` in that file's header). Use it only when the Step 0 decision called for a fixed sample. Re-running with a larger N keeps the earlier rows (samples nest) but rewrites the file, so earlier `@ lines a-b` references no longer resolve; row IDs still do.

## Step 2 (Path 2): Build and Apply a Coding Scheme

1. Read a spread of rows from across the whole export, not the first N.
2. Draft 10–20 categories bottom-up from the text. Name them by topic or touchpoint (what the rows are about), not by the explanation you expect.
3. Decide a multi-label policy before applying the scheme: first match, primary topic, or copy into both. A row placed in two categories keeps one ID and counts once at L2. Record the policy in `_consolidation_log.md`.
4. Apply the scheme to every row (keyword rules, a classifier, or reading), add the result as a column, and run Step 1 with `--coding-provenance researcher-imposed`.
5. **Check the coding, don't trust it.**
   - Read at least 20 matched rows per category (all of them if fewer) and record how many do not belong.
   - Read at least 30 rows from the unmatched or residual set and record how many belong somewhere.
   - Record both in `_consolidation_log.md` under each category, with examples of contamination (for example, sarcasm caught by a positive keyword).
6. Record who or what did the coding, and whether the same agent will extract L1. Both are normal; they need to be visible.

## Step 3: Group into Batches

If there are more than about 20–25 category files, group them into batches for L1. A batch is a named list of corpus files, not a merged file, so every file keeps its own header and row positions.

1. **Group by topic or touchpoint**, not by the explanation you expect. Three categories about finding a library book, placing a hold on it, and being told it is ready share a touchpoint (getting a specific book) and can be one batch.
2. **Log each grouping.** In `_consolidation_log.md`, write one line per batch: `B01 <slug>: <files> — <the shared topic>`. If a grouping rests on a suspected mechanism rather than a shared topic, start the line with `interpretive grouping:`, so L2 treats that boundary as a researcher's hypothesis.
3. Decide each `_below_floor.md` section: fold it into the nearest batch (say which), or make it a batch of its own, flagged as an outlier in the log. Either way its rows reach L1, so they can be cited; never drop it.

## Step 4: Report

```
l0-survey-corpus-prep complete — [export file]

Entry path: [1/2]   Coding provenance: [platform-applied / researcher-imposed]   Tagging: [method]
Rows scanned: [N]   Written: [N]   Blank text skipped: [N]   Blank category: [N]
Categories: [N] → [N] batches   Below floor: [N] rows ([folded into B.. / own batch])
Sampled: [none / N categories — reasons in their headers]
Read decision: [_read_decision.md, or "every row"]

Output: [dir]
  _index.md, _below_floor.md, _consolidation_log.md, _read_decision.md
  [category files]

Next step: l1-findings-extraction → Survey Variant, one findings file per batch.
For any category marked for saturation sampling: workflows/SaturationSampling.md.
```
