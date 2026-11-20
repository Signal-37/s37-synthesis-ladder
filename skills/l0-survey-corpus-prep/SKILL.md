---
name: l0-survey-corpus-prep
description: Turns open-text survey exports into ID-cited corpus files for L1 extraction. USE WHEN preparing NPS, OSAT, or open-ended survey verbatims for synthesis.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in this folder.
---

# l0-survey-corpus-prep

Turns a raw survey export (an .xlsx with hundreds to hundreds of thousands of open-text rows, none of them attributed to a speaker or session) into corpus files that `l1-findings-extraction` can cite row by row. The skill owns the plumbing between a spreadsheet and a source document. It interprets nothing.

**Where this sits in the synthesis funnel:**

```
Survey export (.xlsx) → [this skill] → corpus files → [l1-findings-extraction, Survey Variant] → [L1 Findings] → [l2-theme-synthesis] → ...
```

It runs parallel to the two L0 skills: L0 turns recordings into attributed transcripts; this skill turns survey exports into citable corpus files.

## What This Is NOT

- **Not a synthesis skill.** It never writes a finding, a theme, a frequency claim, or a judgment about what the text means. That starts at `l1-findings-extraction` → Survey Variant.
- **Not for transcripts.** Recordings and interviews have speakers and sessions; use `l0-transcribe-interview` or `l0-transcribe-conversation`.
- **Not a correction for who responded.** Self-selected, unprompted open-text responses lean toward strong experiences. This skill makes such data processable and citable, not representative (`DataContract.md` → Known Limits).

## Two entry paths

1. **Platform-coded.** The export carries a usable category column. Segment on it; do not invent categories that already exist.
2. **Researcher-coded.** No category column, or one too coarse to segment on. A coding pass comes first (`workflows/SegmentCorpus.md` → Step 2).

Every corpus file records which path produced it (`coding_provenance: platform-applied | researcher-imposed`). The two are different evidence claims, and L1 and L2 carry the label forward.

## Reading every row, or sampling

Every row is written and read by default. Two ways to read less, each explicit and recorded:

- **A logged sample** (`--sample-size` with `--sample-reason`), for a category where a fixed sample is enough.
- **Saturation sampling** (`workflows/SaturationSampling.md`), for a category too large to read in full, with a stopping rule declared before the first round. It measures whether reading still adds new findings (code saturation); it does not find rare rows.

`ScalingGuidance.md` has the four questions for choosing between them and the measured limits of the tools.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ValidateExtract** | Check a survey export, is this export usable, validate before segmenting | `workflows/ValidateExtract.md` |
| **SegmentCorpus** | Segment a survey export, prepare survey verbatims for L1 extraction | `workflows/SegmentCorpus.md` |
| **SaturationSampling** | Sample a large category in rounds, run another saturation round, is this category saturated | `workflows/SaturationSampling.md` |

## Tools

All in `scripts/`, TypeScript on bun, no dependencies. `cd scripts && bun test` runs the suite. If `bun` is not found, call it by its full path, `~/.bun/bin/bun`, before concluding it is missing.

| Tool | Does |
|---|---|
| `SegmentSurvey.ts` | `--inspect`: prints headers, category spread, longest rows, duplicates; writes nothing. Otherwise reads the export and writes one corpus file per category, `_below_floor.md`, `_index.md` |
| `SaturationLedger.ts` | Declares the stopping rule in whole rounds, plans each round's chunks, records reads, reports the rule's state |
| `ExportTranscript.ts` | Converts a Claude Code session log into the transcript format `AuditRound.ts` reads |
| `AuditRound.ts` | Checks a round's citations, and the ledger's counts, against the reads that actually happened |

See `DataContract.md` for what the export needs and what each gap costs downstream.

## Based On

The synthesis ladder (J. Scott King; provenance in `../ladder-core/ladder-map.md`), extended to survey data after a trial run of the ladder on large open-text exports. Stopping rule: Guest, Namey & Chen (2020), "A simple method to assess and report thematic saturation in qualitative research," *PLOS ONE* 15(5): e0232076, adapted from interviews and themes to rows and findings.

## Examples

**Example 1: An export with a real category column**
```
User: "Segment this survey export by its Topic column for L1 extraction"
→ ValidateExtract: `SegmentSurvey.ts --inspect` lists headers, category spread, longest rows; confirms platform-coded
→ SegmentCorpus: one corpus file per topic, every row written, IDs from the Response ID column
→ Below-floor topics go to _below_floor.md; related topics grouped into batches in _consolidation_log.md
→ Hands off to l1-findings-extraction, Survey Variant
```

**Example 2: An export with no usable categories**
```
User: "This export has one comment column and nothing else — get it ready for synthesis"
→ ValidateExtract flags the researcher-coded path
→ SegmentCorpus Step 2: draft a coding scheme from a spread of rows, apply it, check a sample per category
→ Every file carries coding_provenance: researcher-imposed
```

**Example 3: A category too large to read in full**
```
User: "This category has 40,000 rows. Sample it until it saturates"
→ SaturationSampling: declare chunk size, round size, base and run in rounds, threshold before round 1
→ Read each round's chunks, cite each finding to the read that returned it, log each chunk
→ AuditRound checks citations and ledger counts against the session log; the ledger reports the rule's state
→ Before any close, a fresh-context read of the last run; closing is a named decision
→ At close, the category's L1 file is written in the Survey Variant format
```
