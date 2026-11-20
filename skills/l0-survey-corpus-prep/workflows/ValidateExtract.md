# ValidateExtract Workflow

A pre-flight check of a survey export against `DataContract.md`, before segmenting. It decides the entry path (platform-coded or researcher-coded) and names every caveat the eventual synthesis will need.

**Data gate:** if the export file is not at the stated path, stop and ask. Do not work from a description of the data.

## Step 1: Inspect

```bash
bun scripts/SegmentSurvey.ts EXPORT.xlsx --inspect [--sheet S] [--text-col C] [--group-col G]
```

It writes nothing and prints: the sheets; the chosen sheet; the row count; every header with its column letter and non-blank count; blank or duplicate header names; columns that look like open text; with `--group-col`, the number of categories, min/median/max rows per category and blank categories; with `--text-col`, mean and median characters per row, the ten longest rows (flagging any that end without punctuation or contain "[truncated]"), and exact-duplicate verbatims.

Run it once with no column flags to see the headers, then again with the columns you intend to use. Do not infer a column's meaning from a similar name in another project.

## Step 2: Required Fields

- **Response ID:** is there a column whose values are unique across all rows? The spreadsheet's own row number does not count; it changes on re-export. If absent, state that `SegmentSurvey.ts` will use sheet row plus file hash.
- **Verbatim text:** read the ten longest rows from the inspect output for truncation.
- **Timestamp:** a per-row date column that parses. One wave label shared by every row is not a timestamp.
- **Category tag:** the distribution from the inspect output. Many categories under ~15 or over ~150 rows is a consolidation note, not a blocker. Blank categories will become `(blank)`.

## Step 3: Recommended and Nice-to-Have Fields

Same check, reported as present or absent. Also report:
- **Open-text columns:** how many. Each is segmented separately; the same respondent then appears in several corpora, and L2 counts them once.
- **Exact-duplicate verbatims:** how many. Many duplicates suggest repeat submissions or pasted text, which weakens "independence assumed".
- **Tagging method** (human, classifier, keyword, unknown).

Do not judge here whether a gap matters; the synthesis documents carry that.

## Step 4: Entry Path and Processing Route

State which path applies:
- **Path 1, platform-coded:** a usable category column exists. Segmentation can use it.
- **Path 2, researcher-coded:** no category column, or too coarse. `SegmentCorpus` Step 2 builds a coding scheme first, and every file carries `coding_provenance: researcher-imposed`.

Record the processing route for the free text under this project's terms: third-party model allowed, or local only. Ask if it is not known.

## Step 5: Report

```
Survey Export Validation — [filename]

Rows: [N]   Sheet: [name]   Open-text columns: [N]
Headers: [verbatim list, with column letters]

Required fields:
  [x] Verbatim text — present; 0 truncation flags in the longest 10; mean [n] chars/row
  [ ] Response ID — absent; will use sheet row + file hash (breaks on re-export)
  [x] Timestamp — present, parses (range: [first] – [last])
  [x] Category — 34 values; rows per category min 3 / median 41 / max 612; blank: 0

Recommended: [present/absent per field]
Nice-to-have: [present/absent per field]
Duplicate verbatims: [N]

Entry path: 1 (platform-coded), tagging method: [human / classifier / keyword / unknown]
Processing route: [third-party allowed / local only]

Downstream caveats:
  - No respondent ID: every L1 and L2 file carries "independence assumed, not verified".
  - [each other gap → the specific claim it weakens]

Recommendation: [proceed to SegmentCorpus / fix gaps first / proceed with the caveats above]
```
