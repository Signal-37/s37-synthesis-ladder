# Scaling Guidance

How to decide, per category, between reading every row, a logged fixed sample, and saturation sampling; and what the tools have been measured to handle. The default is every row. This document is for deciding when to depart from it.

---

## The Four Questions

Answer them per category, and record the decision in `_read_decision.md` in the output directory (`SegmentCorpus` Step 0).

1. **Volume.** How many rows, and how long are they? The cost of a full read is rows times length, paid in the reader's time and context, not in the tools (see Measured Limits).
2. **Tail-risk stakes.** What does missing a pattern that appears in two rows cost? Where a rare response can point to harm, a legal or regulatory exposure, or money taken in error, read every row. Where the question is preference or polish, a rare row missed costs little.
3. **Category spread.** Does most of the text fall into a few recurring patterns, or into many small ones? Concentrated text stops yielding new findings early; widely spread text keeps yielding them, and saturation sampling will take longer to meet its rule.
4. **Question aperture.** A narrow question ("What made you stop using the trip planner?") has a bounded set of answers. A broad one ("Tell us about your experience") ranges across everything the respondent touches.

Stakes decide first: high stakes mean a full read regardless of volume, unless a stakeholder accepts the risk in writing. Volume, spread and aperture then decide between a fixed sample and saturation sampling.

## Provisional Volume Bands

These come from **one prior project** (a full read of several thousand rows, judged practical and worth it for the rare findings it surfaced) and from reasoning about reading cost, not from measured saturation curves. Treat them as starting points to argue with.

| Rows in the category | Starting point | What would move the line |
|---|---|---|
| under ~5,000 | Read every row | A full read at this size proving impractical for the reader, or a project showing no finding came from the last half of the rows |
| ~5,000–50,000 | Decide with the four questions | A category in this band, read in full, where the second half of the rows added no finding the first half lacked (moves the line up), or one where a late-read row changed a finding (moves it down) |
| over ~50,000 | Saturation sampling, unless stakes require a full read | A sampled category later turning up a finding a full read would have caught; that moves the line up for that kind of data |

The 50,000 line is reading-cost arithmetic, not a measurement: at about 60 tokens per row it is about 3,000,000 tokens of reading before any writing, many sessions of work for one category.

**Reading cost, as arithmetic:** use the **mean** characters per row from `ValidateExtract` (`--inspect`), not the median; long rows pull the total up. At a mean of 250 characters and roughly 4 characters per token, a row costs about 60 tokens to read, so 5,000 rows is about 300,000 tokens of reading, more than one standard context window, before writing and the re-reads the workflows require. A full read of several thousand rows is therefore a multi-session job. The 4-characters-per-token figure is the placeholder; text in other languages or with heavy formatting changes it.

## Measured Limits of the Tools

`SegmentSurvey.ts` reads the whole sheet into memory. Measured 2026-09-27 on synthetic data, Apple Silicon, bun 1.3.14:

| Rows | .xlsx size | Sheet XML + shared strings | Time | Peak memory |
|---|---|---|---|---|
| 300,000 (median ~250 chars, tail to ~4,000; nearly all distinct) | 26.1 MB | 56.2 MB + 121.2 MB | 2.6 s | 1.8 GB |

- Memory grows with the uncompressed XML. An export several times larger than this has not been run; run it before promising it.
- Archives that need ZIP64 (any entry over 4 GB, or over 65,535 entries) stop with a clear error; they are not read.
- The tools are not the constraint at these sizes. The reader is.

## If Every Row Must Be Counted at Very Large Scale

When a stakeholder needs exact counts across hundreds of thousands of rows, markdown corpus files and reading are the wrong instrument. Load the rows into a database, classify them offline, report counts from queries, and draw quotes for L1 from the classified rows. That is a different pipeline from this skill, and its counts are classifier output, not findings.
