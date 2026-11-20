# Changelog

Versions are numbered MAJOR.MINOR.PATCH: the patch number rises for a fix that adds nothing, a defect corrected in a script, a document or a skill's wording; the minor number for content added or corrected; the major for a change of terms or a structural rework. A release with no patch number, such as v1.0, is patch zero. Each skill also keeps its own `CHANGELOG.md` in its folder. Entries before v1.0 are pre-release builds, which the licence in `LICENSING.md` covers.

## v1.3.3, 2026-11-20: invented examples and test text

Examples, test data and documents only. No skill instruction or script changed; the examples inside six skill documents did.
- Three worked examples that drew on interviews from earlier projects are replaced with invented ones: the full-file example in `l0-transcribe-interview/TranscriptFormat.md`, the annotated finding in `l1-findings-extraction/FindingsFormat.md`, and two evidence lines in `l2-theme-synthesis/workflows/WriteTheme.md`.
- The delivery-annotation example in `l0-transcribe-conversation/TranscriptFormat.md`, and the two field-note documents in `l1-findings-extraction` that cite it, use an invented sentence.
- One example sentence in `l3-insight-synthesis/workflows/AuditInsightSet.md` is reworded.
- In the diarize tests, the text of one fixture and of three test strings is replaced with invented wording; time spans and expected results are unchanged. Two quotations are removed from the diarize `CHANGELOG.md`.
- One quotation in the audit pre-pass's test fixtures is reworded.

The nine known gaps listed under v1.3 and v1.3.2 stand.

## v1.3.2, 2026-11-18: one more known gap

Documents only. No skill, script or test changed.
- `TEST-REPORT.md` adds a finding from the independent test of v1.3, reported after v1.3.1 was built.
- One known gap is added to the eight listed under v1.3:

9. In the independent test of v1.3, an agent asked only to audit fixed the Blocking items itself and then ran a second full audit, where the audit says to record the fixes in an addendum and stop. One run; not investigated.

## v1.3.1, 2026-11-18: invented test data throughout

Test data and documents only. No skill or script changed.
- In the audit pre-pass's test fixtures, four example quotations that came from a client project are replaced with invented ones, and one fixture participant is renamed. The fixtures and `prepass.test.ts` change together; the suite has the same number of tests.
- In the diarize tests, one test filename that carried a real person's name is replaced with an invented one.
- `TEST-REPORT.md` adds the independent test of v1.3.
- The known gaps listed under v1.3 are unchanged.

## v1.3, 2026-11-17: audits say what blocks, and stop

**Every audit action is marked Blocking or Advisory, and the audit closes.**
- Each of the seven level audits (L2 themes, L3 insights, the four L4 sets, the L5 framework) marks every recommended action **Blocking** or **Advisory**.
- Each carries a new closing section, Closing the Audit — Severity and Stopping Rule:
  - fix the blocking items only, and carry the advisory ones forward;
  - record the fixes in an addendum to the report; the fixed text is not re-audited;
  - at most one bounded confirmation pass follows;
  - where that pass still blocks, the researcher rules.
- The final ladder review closes the same way.
- The gates checker's audit check (gate 8) names the addendum beside re-audit when a set has files newer than its report.
- On a first audit the report's Sweep run line reads "not applicable"; the sweep for the same defect elsewhere is run and recorded in the addendum, when a fix is made.
- **Why:** on one project, five confirmation audits of a framework in two days each blocked text the previous audit had recommended. This is the fix for known gap 2 under v1.2, "severity runs hot".

**The first read is run first, by a separate reader.** In each audit, the auditor opens the set only to copy out its reader-facing text, before the pre-pass and before reading the level below, and gives that text to a separate reader, which it may start itself. With no separate reader, the auditor reads the text and says the first read was not clean. The reader's list goes into the report word for word. The first read stays advisory.

**Small clarifications from a fresh audit run** (see `TEST-REPORT.md`): each audit says where to run the pre-pass command from; at L2, a title clause or qualifier that claims more than the behavioral pattern supports is Blocking and a title that is only awkward is Advisory; and a pass on the checker's evidence-floor gate does not settle the count of enacted evidence, because the checker reads `participants:` as written. The L2 source counts (3 or more, 5 or more) are counted by enacted evidence, as the v1.2 count rule already required. And each audit's Step 0 says that on a first audit the gates checker's warning that the set has no cleared audit report is expected.

**Titles, names and body text are written in plain statements.**
- At L2 to L5, a title or name is written last, after the text it names, in words a reader new to the project would understand. Each format file has a section on plain writing in the body, with before-and-after examples, and each synthesis workflow ends with an advisory first read.
- **L2:** a theme's title comes from its behavioral pattern, not from the abductive connection. Each clause of the title must trace to a sentence in the pattern, and its qualifier (most, many, several, a few) must match. Audit 3 checks it clause by clause.
- **L4:** an opportunity area's title is a statement of what would be true for the people served, not a label. A How Might We is one question with nothing after it. Principle and archetype names are short but plain.

**L5: the framework is the way into the ladder.**
- The framework holds the ladder together and is itself the way in. The skill no longer leaves room for a separate summary document beside it; a brief is the same framework in short form.
- On every diagram, each opportunity area and principle carries its short name beside its code. Audit 6 checks it.

**Client comments stay out of the research.** A client's reactions to a readout are referenced in presentations, attributed to the client. They are not written into the L1 to L5 files. The rule is in `ladder-core/ladder-map.md`, with pointers from the L3, L4 and L5 skills.

**Two checker fixes.**
- The gates checker's audit check chose the current audit report by which file was saved last, so re-saving an old report could change the result. It now reads the date and version in the report's name (`_v2`, `_v3.1b`, a `YYYY-MM-DD` date), and uses the save time only when the names do not settle it. A report with no version in its name counts as the first.
- The audit pre-pass, from L3 up, checked a quote against every item its file cites. It now checks a quote against the item cited on the quote's own line, and lists a quote found elsewhere in the level below under a new heading, "Found in the level below, but not in the item cited".

**The pre-pass says what it checks.** Its report and README now state that at L2 only the quotes in evidence bullets are checked, and that "present" means the words appear in the source, not that the source quoted them. The check itself is unchanged at L2 (see known gaps).

**Wording of the package.**
- The skills say "the researcher" where they used the author's first name: the person who rules on a judgment call is whoever runs the ladder.
- The dated notes that explain why a rule exists no longer name a client project, and the few examples that came from one are replaced with invented ones.

**Known gaps, open:**
1. No audit run has caught a conditional ("would pay if…") rewritten as reported behavior. One of the three v1.3 test runs caught an interviewer's words left inside a participant quote; the other two did not.
2. At L2 the pre-pass checks quotes only in the evidence bullets, and only that the words appear in the source.
3. The gates checker's audit check recognizes only the exact gate line, so a reworded one warns.
4. In the independent test of v1.2 the agent wrote a recording file's date, flagged for confirmation, where the L0 metadata gate says to ask. In the author's clean-account run of v1.3 the agent asked, with the file's date as the first choice offered.
5. At L2 to L4 the audit workflows name one report per project and do not say how a re-audit's report is named. The checker orders reports by the date or version people add.
6. Audits 8 and 9 are at L2 only.
7. When the level below does not fit in the auditor's context, the fallback read (every uncited finding and every cited one) can be nearly the whole set, as it was in one test run, and the workflow gives no smaller read. The auditor says what it read in the `**Inputs read:**` line.
8. Severity is a judgment and varies between runs: in two test runs of the L2 audit, one marked more items Blocking than the test's author would, and the other left four in Advisory that a scorer would have blocked.

**From v1.2.2, which was prepared and not released: the test report corrected.** `TEST-REPORT.md` as printed in v1.2.1 misdescribed three things in the independent test of v1.2, corrected here from the tester's run files:
- The agent did not ask for the recording date. It wrote the file's date, flagged it for confirmation, and corrected it once told.
- The verbatim check covers the quotations in the L1 findings, not the L2 evidence bullets.
- Two of the four paraphrases the third-session audit found were in evidence bullets, not only in prose.

The report also adds a rescore of the same run, 2026-11-05, which scored the pre-pass, the `**Inputs read:**` line and Audits 8 and 9.

## v1.2.1, 2026-11-05: the test report catches up

Documents only. No skill, script or test changed.
- `TEST-REPORT.md` adds the independent test of v1.2: Method D passing with all three licences accepted, the reviewer check through a symlinked agents folder, and what the automated release test does not reproduce.
- The README names the audit pre-pass among the tools that need Bun.
- The known gaps listed under v1.2 move to v1.2.2, with two more from the independent test: at L2 the pre-pass checks quotes only in the evidence bullets, though its report and README describe the check as covering each double-quoted fragment; and the gates checker's audit check recognizes only the exact gate line, so a reworded one warns.

## v1.2, 2026-11-03: audits read the level below

**Audits read what they judge.**
- Every L2–L5 audit has an Inputs step. The dispatcher passes the directory of the level below, and from L3 up the L1 findings directory as well, for targeted checks.
- The audit runs a new script first, `ladder-core/scripts/synthesis-audit-prepass`, on every audit. It lists:
  - items in the level below that the set never cites;
  - citations that point at nothing;
  - quoted fragments not found in the source they cite, separated from quotes found only in a deeper level, an item quoting its own wording, and draft wording in working notes.

  Its output is candidates for the auditor to judge, not verdicts. The auditor then reads the level below in full, or the candidates plus the cited items when a full read will not fit.
- The report states what was read in an `**Inputs read:**` line. The gates checker's audit check (gate 8) warns when a current cleared report lacks that line, or claims fewer files than are on disk. It halts under `--release`. Reports under `archive/` are exempt.
- The level-audit hand-off in `ladder-core/ladder-map.md` names the level below and L1 among the audit's inputs.

**Two new L2 audits.** `AuditThemeSet` gains Audit 8 (counter-evidence) and Audit 9 (source and segment integrity: stated or behavioral, prompted answers, purchase claims that lean on people who do not buy, whose evidence a theme rests on, and confounds). Audit 9 is a reading, not a tally: it asks whose evidence a theme rests on and never computes shares.
- **How they were adopted:** in a blind seeded test, 10 defects written by a separate reviewer were planted in an interim theme set, and fresh Sonnet audits were scored without knowing which version wrote each report. Over six runs each, the audit with Audits 8 and 9 caught a mean of 6.92 of the 10 defects; the audit without them caught 4.83. That passed a rule fixed before the runs were scored, narrowly.
- A reviewer-stance block, tested at the same time, did not add planted catches at L2 (a mean of 5.8 of 10 against 6.8 without it, over three runs: a gap smaller than the spread of the no-stance arm's own runs) and made the audit stricter (on one run on a cleared set, 17 blocking findings, which the scorer judged 2 real, 15 defensible, 1 false). It is not included in the L2 audit. The test scored planted defects only, so it could not credit independent catches of natural defects, where the stance block had looked strongest in an earlier single run.
- These audits are L2 only. The L3–L5 versions will follow, each after its own test.

**"What would change this" replaces the Falsifier line** at L3 (each insight) and L5 (each framework domain). It has three parts:
- the counter-cases in the data, and how the claim meets them;
- the strongest rival reading, and why this one was preferred;
- what later research would have to show to revise the claim, with no counts, percentages or thresholds.

The audit of it is a judgment per item, not a score. The Falsifier lines had drifted into threshold tests. At L3 a case that does not fit narrows an insight; it rarely overturns it.

**The participant count counts enacted evidence only.** An L2 theme's `participants:` field counts participants whose cited evidence is behavior, or a belief held as their own. Stated preferences, hypotheticals, anticipated cases, advice to a brand and observations of others go under **Listed, not counted**. The Evidence section has three lists, and the audit checks that the field matches the Counted list. Reported by an independent tester from a three-level climb on v1.1.2.

**The final ladder review's briefed Seat 1 carries the full qualitative-methodology brief.** When no reviewer agents are registered (the default on a new install), the evidence-integrity reviewer now receives the method in the workflow text. It covers:
- judging evidence by depth, saturation and triangulation rather than count;
- keeping what participants did, what they say and what the analyst concluded apart up the whole chain;
- holding a sample of quotes and paraphrases against the L1 wording;
- treating agreeable results with more suspicion;
- checking how participants were recruited.

No reviewer agents ship: the method ships as text. It was compared once against the previous brief, on one complete ladder, with no measurable difference in what the review found. One run each cannot separate the brief from run-to-run variation. It is kept because it states the method in full at no cost.

**Smaller changes:**
- Each audit's gate check names its scope: disposition the results for the set being audited and the level below it.
- The Inputs step tells the auditor to read files with a file-reading tool, not by printing them in a shell, where output is truncated.

**Known gaps, to be fixed in a separately tested v1.2.3:**
1. No audit run caught a conditional ("would pay if…") rewritten as reported behavior, or an interviewer's words left inside a participant quote. Several runs reused the planted wording as evidence: the audits trust a theme's paraphrase over the source. A mechanical check, comparing each quote with the finding's Context line, is the candidate fix.
2. Severity runs hot. The new L2 audits can block a set over a miscount or a wording slip that should be a fix condition, not a block.

## v1.1.3, 2026-11-01: the reviewer check works whichever grep the shell has

- `l5-framework-synthesis`'s final ladder review searches each agents folder on its own, only if it exists, and with a trailing slash, when it checks for registered reviewers. The v1.1.1 check passed both folders to one `grep`, and two shells gave wrong answers. The `grep` that ships with macOS does not follow a symlinked folder named without a trailing slash, so where `~/.claude/agents` is a symlink every reviewer was reported not registered. The `grep` in Claude Code's shell exits with an error, not a match, when either folder is missing, so on an install with only one of the two folders every reviewer was reported not registered there too. In both cases the review fell to briefed reviewers when the user's own were registered. The first was reported by an independent tester against v1.1.2; the second was found while testing the fix.

## v1.1.2, 2026-10-28: the third diarization licence

- Method D needs a third Hugging Face licence, for `pyannote/speaker-diarization-community-1`. The installed pyannote.audio (4.0.7) loads the diarization pipeline's segmentation, embedding and PLDA from that repository, so an account that had accepted only the two licences listed before got `GatedRepoError 403`. The diarize `README.md`, `setup.sh`'s closing message and the tool's model-load error now name all three. Reported by an independent tester, who hit it on a clean account (v1.0.1) and reproduced it on v1.1 with a fresh Hugging Face account.
- The diarize `setup.sh` builds its environment with uv's own Python 3.12 (`--python-preference only-managed`), never a Homebrew or system Python on the `PATH`, so the build is the same on every machine. An existing environment is reused; the change applies to a new build or `setup.sh --force`. Reported by the same tester.
- The gates checker exits 2, not 0, when it checked nothing: on an empty folder or a mistyped path every gate skips, and that used to exit 0, the same as a clean pass. It now prints a warning naming the folder. Reported by the same tester.

## v1.1.1, 2026-10-27: the final review finds registered reviewers

- `l5-framework-synthesis`'s final ladder review checks for registered reviewers by the `name:` in each subagent file's frontmatter, the name Step 3 dispatches on, in the user's and the project's agents folders. It used to look for TitleCase filenames, so a reviewer registered under the dispatch name could be reported missing, and the run fell to the briefed tier without saying why.
- The check lists each reviewer as registered or not and says that a run needs only its two seats, so a missing reviewer for another domain no longer reads as a failure.
- Step 1 says that briefed reviewers (tier 2) are the default on a new install, because this package ships no reviewer personas, and that tier 1 applies to reviewers the user registers under the dispatch names.
- A pointer to a file not in this package (`UserAgentContexts.md`) is removed.

## v1.1, 2026-10-26: the audit check

- The gates checker tests that each level's audit report exists beside the set it audits, has cleared (or records that the set advanced with open flags), and is no older than the work it audited. It warns while work is in progress and halts when a later level exists. `synthesis-gates.yaml` adds the gate as `level_audit_before_advance`.
- If `bun` is not found, `ladder-core`, `l0-survey-corpus-prep` and the gate-check step of each of the eight audit workflows tell the agent to call it by its full path, `~/.bun/bin/bun`, before concluding Bun is missing. On a new account the agent's shell may not have Bun's folder on its `PATH` even when the terminal does.
- The L0 skills' workflows add a metadata gate: names, roles, the date and the conversation or interview type come from the user or a document they point to, never inferred; a proposed value (such as a date taken from a file) is used only once the user confirms it.
- The `VERSION` file names the release as the S37 Synthesis Ladder, and the archive is named `S37-Synthesis-Ladder-v<version>-<date>`.
- References to the author's own setup and working notes are removed from the skill text; method content is unchanged.

## v1.0.2, 2026-10-26: no pointers to skills you can't install

- The ladder no longer routes to `DesignSynthesis`, a skill that will not be released. The product, service and experience design variants at L4 and L5 (tiered evaluative qualities; structural-form discovery) are described in `l4-design-principle-synthesis` and `l5-framework-synthesis` themselves, and the ladder map and the synthesist agent point there.
- The sufficiency check after L4 and L5 is described inline in each L4 skill and in `l5-framework-synthesis`, instead of routing to `IllStructuredProblem`.
- `DesignResearchPlanning` and `SensemakingSession` are named as part of the coming S37 Design Research Kit, optional until it ships.
- `README.md` lists the outside skills that remain.

## v1.0.1, 2026-10-23: fixes

- `verify.sh` and the diarize `setup.sh` check only the `HF_TOKEN` environment variable. Neither opens `~/.claude/.env` any more. The diarize tool itself still reads an `HF_TOKEN=` line from that file when the variable is unset, as its README says.
- `SECURITY.md` says what each script reads, including that one file.
- Two passages that named a skill this package does not ship are removed: the L3 handoff to quantitative work in the synthesist agent, and the quantitative sibling note in `l4-archetype-synthesis`.
- Version numbers can carry a patch part.

## v1.0, 2026-10-22: first versioned release, as the S37 Synthesis Ladder

- Released under the Signal 37 (S37) name, as the S37 Synthesis Ladder.
- The `VERSION` file carries the version and build date. `install.sh` now copies it into `ladder-core`, so an installed copy can say which release it is.
- Adds `CHANGELOG.md`, `CONTRIBUTING.md`, `GOVERNANCE.md`, `SECURITY.md`, `SUPPORT.md` and `TEST-REPORT.md`.
- The Releases section of `LICENSING.md` records v1.0 and its terms.

## Pre-release

### 2026-10-11

- Each of the ten L0 to L5 format files opens with a contents list.

### 2026-09-30: fixes from the first outside install

- The attribution gate fails closed on any status other than `resolved`.
- The Hugging Face token loader accepts `export HF_TOKEN=…` lines.
- Kolko is credited as "after Kolko" where the ladder adapts his work.
- `install.sh` warns about the older package's loose files instead of passing over them in silence.
- The README's upgrade section covers three things the installer cannot see: other skills that name the old rungs, fields your setup adds to skills, and an existing synthesist agent.
- The L5 capstone review names its reviewer tiers.

### 2026-09-27

- Adds `l0-survey-corpus-prep`, the thirteenth skill: open-text survey exports into corpus files that L1 cites row by row. Survey rules added to L1, L2 and L3.

### 2026-09-23

- The L2 to L5 audits are wired in as a gate.
- Attribution and copyright fixes in `abductive-reasoning`.
- The optional prose-craft companion is named where the audits suggest a copy-edit pass.

### 2026-09-22: the portable edition

- First build to the open Agent Skills specification: lowercase skill names that match their folders, and one support skill, `ladder-core`, holding the shared files, the two checkers and the diarize tool.
- Tested on a clean macOS account with none of the author's setup; see `TEST-REPORT.md`.
- uv named as the L0 requirement; Method S (one file per participant) needs no token.
- Authorship reads "J. Scott King" throughout.
- The value-proposition skill no longer names its output after a proprietary canvas; the method's source is credited.

### 2026-08-08: licence

- Licensed by artifact type: method content CC BY-SA 4.0, code Apache-2.0, the diarize tool AGPL-3.0. Earlier copies, built before August 2026, carried no public licence.
