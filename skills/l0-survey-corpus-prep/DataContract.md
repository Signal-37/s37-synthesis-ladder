# Survey Data Contract

What `l0-survey-corpus-prep` expects from a survey export, and what each gap costs downstream. Real exports nearly always fall short somewhere; the point is to know where, and to carry the right caveat forward.

---

## Required Fields

| Field | Requirement | What a gap costs |
|---|---|---|
| **Verbatim text** | Full, untruncated, one open-ended question per column | Truncated rows (a hard length cutoff, a literal "[truncated]", text ending mid-word) cannot support a finding about what the respondent went on to say. Each one is cited as truncated, never completed by inference. |
| **Response ID** | Stable, unique per row, the same across re-exports | Without it, `SegmentSurvey.ts` falls back to the sheet row (`r<N>`) plus the export file's SHA-256. That traces every citation to one row of one file, but a re-export or re-sort breaks the link. On a row with text, a blank, duplicate or malformed ID in a declared ID column stops the run. |
| **Submission timestamp** | A real per-row date, not a wave label | No per-row date means no trend or before/after claim. The synthesis states that gap rather than implying stability over time. |
| **Category tag** | A real taxonomy, ideally two levels (broad and specific), roughly 15–150 rows per specific category | A single flat tag with a handful of values forces the researcher-coded path, which is a weaker evidence claim than platform coding. |

## Strongly Recommended Fields

| Field | Requirement | What a gap costs |
|---|---|---|
| **Tagging method** | Was the category tag applied by a person, a classifier, or keyword rules? | Without it, the tag is a claim of unknown strength. Record it as unknown rather than assume. Carried as `tagging_method:` in L1 (distinct from `coding_provenance:`, which records whether the categories came from the platform or the researcher). A classifier or keyword tag is closer, as evidence, to researcher-imposed coding than to human coding. |
| **Paired score** (NPS, OSAT, star rating) | Numeric, on the same row as the verbatim | Without it, sentiment is inferred from wording alone, which L1 does not permit. A score lets a pattern be checked against what respondents rated. |
| **Pseudonymous respondent ID** | Hashed, never raw personal data; stable across one respondent's multiple responses | Written on every row line by `SegmentSurvey.ts --respondent-col`; a value that looks like an email address or a formatted phone number stops the run (plain digit IDs are accepted). Without it, "each row is a different person" is an assumption: every L1 and L2 file carries "independence assumed, not verified", and L2 counts rows, not people. |
| **Segment columns** (region, tenure, plan, account type) | Structured columns, not left to self-identification in the text | Without them, a pattern tied to a segment can only be found where respondents happened to mention it, and it cannot be counted. |

## Nice-to-Have Fields

| Field | Why |
|---|---|
| **Channel** (email prompt, in-app prompt, exit survey) | Different channels catch people in different states. A later audit can check whether channel explains a pattern. |
| **Language** | Knowing about non-English rows at intake avoids finding an untranslated quote in the middle of extraction. |

## Format Rules

- One row per response. `.xlsx` preferred; long text with commas and quotes can corrupt silently in CSV.
- Consistent column headers across waves if the export spans more than one collection period.
- Several open-text questions in one export are segmented one column at a time. The same row ID then appears in several corpora; it is one respondent, and L2 counts it once.
- UTF-8 throughout.

---

## Known Limits This Contract Does NOT Fix

Self-selected, single-channel, unprompted open-text responses lean toward strong, usually negative, experiences. Someone with an unremarkable experience rarely writes a paragraph about it. A complete schema does not change who chose to respond. This contract makes a dataset processable and citable; it does not make it representative. The caveat is carried as the Limits line: required in every survey L1 file, in every L2 theme and master themes document that cites one, and with every L3 insight that rests on survey rows. Carrying it into L4 and L5 outputs is a named follow-up, not yet wired.

## Validation Checklist (for `ValidateExtract`)

- [ ] Every column header listed verbatim; row count reported
- [ ] Response ID column present and unique, or its absence and the `r<N>` fallback stated
- [ ] Verbatim column checked for truncation (the longest rows, literal markers, mid-word endings)
- [ ] Per-row timestamp present and parses, or its absence stated
- [ ] Category column: distribution reported (min, median, max rows per category); path 1 or path 2 stated
- [ ] Tagging method known or marked unknown
- [ ] Number of open-text columns and exact-duplicate verbatims reported
- [ ] Paired score checked for, presence stated
- [ ] Respondent ID checked for; absence triggers the "independence assumed" note for every downstream file
- [ ] Encoding UTF-8; non-English rows spot-checked
- [ ] Processing route recorded: may this free text go to a third-party model under this project's terms, or must it stay local?
