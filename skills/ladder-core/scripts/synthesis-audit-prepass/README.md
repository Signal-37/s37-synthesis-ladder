# synthesis-audit-prepass

A deterministic pre-pass for ladder level audits (L2 to L5). It does the mechanical cross-checks between a set and the level below it, so the auditing agent judges candidates instead of re-deriving them.

Why it exists: a fresh audit agent cannot read a whole lower level in one context once a study passes about 20 participants, and an agent that cannot read it all skims. The guard is against that skim, not against an adversary. The researcher's ruling of 2026-10-28: a script pass first, then the agent judges the candidates. This is a report, not a gate.

```
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts <set-dir> <below-dir> [--also <dir>]... [--out <file>]
```

`--also <dir>` (optional, repeatable) names a deeper source, normally the L1 findings directory when auditing L3 or above: L3 Trace sections paste L1 fragments verbatim, and L4 may quote participants. A quote that is not in its cited source but is in an `--also` directory is counted as present (deeper source) and listed under its own heading, not as NOT FOUND. A short fragment (under 4 words) found only in a deeper directory is marked "may match by chance".

Exit 0 always, except exit 2 on bad arguments (missing or unreadable directory, a directory with no recognisable ladder files, `--out` without a path). A report full of defects still exits 0. Read-only. Any folder named `archive/` is ignored, at any depth.

## What it reports (markdown, fixed headings)

| Section | Content |
|---|---|
| `## Inputs` | `Below-level files: <N>; items: <M>` (items are findings at L1, themes/insights/etc. above), the set's file and item counts, and notes: master documents ignored, duplicate ids, participant-code collisions. |
| `## Uncited below-level items` | Every item of the level below that no file in the set cites, grouped by file, with its title. |
| `## Citation check` | Every citation that points at nothing, **unparsed evidence bullets** (listed, never skipped), participant cites (`CODE N`) that are in none of the cited items (L3 and up), and `source_files:` against the files on disk. |
| `## Quote check` | Double-quoted fragments checked in the cited source text; a per-file table. At L2 only the quotes in evidence bullets are checked, against the findings each bullet cites; quotes in the behavioral pattern or other prose are not. From L3 up, a quote on a line that cites an item is checked against that item, and one found elsewhere in the level below is listed under "Found in the level below, but not in the item cited". Present means the words appear in the source, not that the source quoted them. A fragment that is not found is classed: (a) present in a deeper source (`--also`); (b) self-quote, the text occurs in the same item's title, Insight or Observation outside the quote; (c) draft wording, inside a Trace "Revised at the check" or "Near-miss discarded" line; (d) NOT FOUND, everything else. (d) is listed first, in full, as the candidates; (a), (b) and (c) follow under their own headings, one line per item, with counts. Nothing is dropped. Trace "Verified" lines are checked like any other. |
| `## Summary` | The counts of all of the above, and a "Parse caveats" line that lists anything the tool could not read. |

Quote matching normalizes curly quotes, dashes, case, whitespace and markdown emphasis. A fragment joined by an ellipsis (`…`, `...`, `[...]`) is checked piece by piece. A fragment that matches only after dropping all punctuation is counted as "present, punctuation only" and shown in the table, not hidden.

## What is checked at each level

| Set | Cites from below | Quote source |
|---|---|---|
| L2 (`L2-NN_*.md`, or a master `L2_Themes_*.md`) | L1 findings, as `**CODE (Finding N)**` / `(Findings N, M)` in the Evidence section | the cited L1 finding(s) |
| L3 (`L3-NN_*.md` / `L3_Insights_*.md`) | `L2-NN` themes | the L2 theme files each insight cites; `## Trace` sections reported apart |
| L4 (`ARCH-`, `P-`, `OA-`, `VP-NN_*.md` / `L4_*` masters) | `L3-NN` (archetypes also `L2-NN`, `L2-T-NN`) | the cited items' text |
| L5 (`L5_Framework_*.md`) | `P-NN`, `OA-NN`, `VP-NN`, `ARCH-NN` | the cited items' text; "not applicable at this level" if the framework quotes nothing |

The level is detected from the file names in `<set-dir>` and the level below from `<below-dir>` (both searched recursively, `archive/` skipped). When individual item files exist the master document is ignored (and said so); when only a master exists its `## L3-NN:` style sections are the items, and the master's index-table rows count as citations.

**Participant code to L1 file (L2).** First letter of the first and last name in the L1 `participant:` field, diacritics stripped (`Léa Moreau` is `LM`). The format files do not name a more canonical mapping; real project data works this way. A label that is not a code is matched against the full name. When two participants collide on a code, the collision is reported and citations to that code are listed as ambiguous and not checked. Nothing is guessed.

## Limits

- It cannot judge. An uncited finding may be rightly left out; a NOT FOUND may be the author's own phrase in quotation marks.
- A self-quote is detected only against the title, Insight and Observation text. The same wording in Knowledge or "What would change this" still lands in (d). External quotations (a theory, the plan, the discussion guide) also land in (d); they are in no ladder file.
- Without `--also`, a quote that comes from deeper than the level below shows as NOT FOUND (L3 Trace "Verified" lines, L4 participant quotes).
- An odd number of `"` in a paragraph (an inch mark ending a quote, for example) means that paragraph's fragments are not checked. It is listed under "Unbalanced quote marks".
- Removing a citation to a finding that another theme still cites is invisible to it. It sees only findings cited by no one.
- L4 and L5 are built from the format files and synthetic fixtures; no real L4 or L5 set was available to run against (none existed in the author's projects when the tool was built; a 2026-11-03 shakedown on an older complete ladder followed).

## Using it in an audit

Run it before the audit reads anything, save the output beside the audit's working files (not inside the set), and hand it to the auditor with the set and the level below. The audit report's `**Inputs read:**` line (checked by gate 8 of `tools/synthesis-gates-check`) takes its numbers from the `Below-level files: N; items: M` line:

```
**Inputs read:** <N> files, <M> items (L1-findings)
```

```
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts "<L2 set dir>" "<L1 findings dir>" --out "<working dir>/L2_prepass.md"
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts "<L3 set dir>" "<L2 themes dir>" --also "<L1 findings dir>" --out "<working dir>/L3_prepass.md"
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts "<L4 set dir>" "<L3 insights dir>" --also "<L1 findings dir>" --out "<working dir>/L4_prepass.md"
bun ../ladder-core/scripts/synthesis-audit-prepass/prepass.ts "<L5 set dir>" "<L4 dir holding the principles and opportunity areas>" --also "<L1 findings dir>" --out "<working dir>/L5_prepass.md"
```

## Tests

```
bun test    # run from this folder (the one holding prepass.ts)
```

`fixtures/` holds a small L1 set, an L1 set with a code collision, an L2 set carrying one of each defect (wrong finding number, unknown code, altered quote, unparsed bullet, an `archive/` copy and a master document that must be ignored), and small L3, L3-master, L4 and L5 sets. The test file also runs a seeded check: a clean copy raises nothing, then a wrong finding number, an altered quote and a removed citation are planted one at a time.

Built 2026-11-03.
