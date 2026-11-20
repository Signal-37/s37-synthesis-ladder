// AuditRound: checks a round's findings file against a transcript of the reads actually made,
// and optionally against a SaturationLedger's record of what a round was supposed to cover.
//
// A finding block is a "### F<n>" heading section of the findings markdown (regex ^### F\d+\b).
// "### Stopping rule" and any other heading are not findings. Within a block, every line
// starting with "- Citation:" is checked. A finding block with no Citation line at all is
// NO_CITATION. A file with zero finding blocks is NO_FINDINGS.
//
// Citation line syntax (exact):
//   - Citation: [<row-id> — <read-ref>] [researched] "<quote>"
// or:
//   - Citation: [<row-id> — <read-ref>] [model knowledge — verify]
// where <read-ref> is "read <file-basename> @ lines <a>-<b>". The quote runs from the first
// '"' or '“' after the tag to the LAST '"' or '”' on the line, so a quote containing an
// embedded quotation mark is still captured whole. A [researched] citation with no quote is
// NO_QUOTE, which fails the round. [model knowledge — verify] citations are UNCHECKED, which
// also fails the round (SaturationSampling.md: these are not findings).

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadLedger, verifyCorpusUnchanged, type Ledger } from "./SaturationLedger.ts";

export type Verdict =
  | "OK"
  | "MALFORMED"
  | "NO_CITATION"
  | "NO_FINDINGS"
  | "MISSING_READ"
  | "ID_NOT_IN_READ"
  | "NO_QUOTE"
  | "UNCHECKED"
  | "QUOTE_NOT_FOUND"
  | "LINE_TRUNCATED";

export interface CitationResult {
  heading: string;
  line: string;
  verdict: Verdict;
}

export interface TranscriptCall {
  ref: string;
  file: string;
  text: string;
}

export interface Transcript {
  calls: TranscriptCall[];
}

export interface AuditResult {
  results: CitationResult[];
  passed: boolean;
  citationsChecked: number;
}

// Claude Code's Read tool truncates individual very long lines. We don't know the exact
// threshold at every version, so this is a documented heuristic, not a guarantee: if the
// row's line in the returned text is at least this long and the quote isn't found in it,
// we report LINE_TRUNCATED (a distinct, more informative verdict) instead of QUOTE_NOT_FOUND.
const LINE_TRUNCATION_THRESHOLD = 2000;

const FINDING_HEADING_RE = /^###\s+F\d+\b/;
// A rounds file (SaturationSampling.md) accumulates every round's findings under one
// "## Round N — ..." heading per round. A finding block's round is whichever of these headings
// most recently preceded it; a file with no such headings at all (e.g. a single-round findings
// file, or most test fixtures) leaves every block's round as null, meaning "not sectioned" —
// the ledger cross-check then does not restrict by round, matching its pre-existing behavior.
const ROUND_SECTION_RE = /^##\s+Round\s+(\d+)\b/i;

interface FindingBlock {
  heading: string;
  text: string;
  round: number | null;
}

function splitFindingBlocks(md: string): FindingBlock[] {
  const lines = md.split("\n");
  const blocks: FindingBlock[] = [];
  let current: FindingBlock | null = null;
  let currentRound: number | null = null;
  for (const line of lines) {
    const roundMatch = ROUND_SECTION_RE.exec(line);
    if (roundMatch) {
      currentRound = Number(roundMatch[1]);
      continue;
    }
    if (FINDING_HEADING_RE.test(line)) {
      if (current) blocks.push(current);
      current = { heading: line.trim(), text: line + "\n", round: currentRound };
    } else if (current) {
      current.text += line + "\n";
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

interface ParsedCitation {
  rowId: string;
  readRef: string;
  tag: "researched" | "model knowledge — verify";
  quote: string | null;
}

// The head is fixed syntax; the quote (if present) is captured separately, from the first
// quote-mark after the tag to the LAST quote-mark on the line, so an embedded quotation mark
// inside the quoted text doesn't truncate it.
const CITATION_HEAD_RE = /^-\s*Citation:\s*\[(.+?)\s+—\s+(.+?)\]\s*\[(researched|model knowledge — verify)\]/;

function tryParseCitation(line: string): ParsedCitation | "malformed" | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("- Citation:")) return null;
  const head = CITATION_HEAD_RE.exec(trimmed);
  if (!head) return "malformed";
  const rowId = head[1];
  const readRef = head[2];
  const tag = head[3] as ParsedCitation["tag"];
  const rest = trimmed.slice(head[0].length).trim();

  if (rest === "") {
    return { rowId, readRef, tag, quote: null };
  }
  const firstQuoteIdx = rest.search(/["“]/);
  const lastQuoteIdx = Math.max(rest.lastIndexOf('"'), rest.lastIndexOf("”"));
  if (firstQuoteIdx === -1 || lastQuoteIdx === -1 || lastQuoteIdx <= firstQuoteIdx) {
    return "malformed";
  }
  const quote = rest.slice(firstQuoteIdx + 1, lastQuoteIdx);
  return { rowId, readRef, tag, quote };
}

function stripLineNumberPrefix(line: string): string {
  // transcript call text may carry `cat -n` style prefixes, e.g. "   401\tsome text"
  return line.replace(/^\s*\d+\t/, "");
}

// Finds the row's line, anchored to the line START (after stripping any line-number prefix):
// the line must literally begin with "[<id>] ". This prevents a different row's line that
// merely MENTIONS "[<id>]" somewhere in its text from being mistaken for that row's own line.
function findRowLine(callText: string, rowId: string): string | null {
  const callLines = callText.split("\n").map(stripLineNumberPrefix);
  const prefix = `[${rowId}] `;
  return callLines.find((l) => l.startsWith(prefix)) ?? null;
}

function citationSatisfiedByAnyCall(parsed: ParsedCitation, calls: TranscriptCall[]): Verdict {
  const matchingCalls = calls.filter((c) => c.ref === parsed.readRef);
  if (matchingCalls.length === 0) return "MISSING_READ";

  // If the same ref appears in several calls, the citation passes if ANY of them satisfies it.
  let bestVerdict: Verdict = "ID_NOT_IN_READ";
  for (const call of matchingCalls) {
    const rowLine = findRowLine(call.text, parsed.rowId);
    if (!rowLine) continue; // stays at (at best) ID_NOT_IN_READ unless a later call succeeds
    const afterId = rowLine.slice(`[${parsed.rowId}] `.length);
    if (afterId.includes(parsed.quote!)) return "OK";
    bestVerdict = afterId.length >= LINE_TRUNCATION_THRESHOLD ? "LINE_TRUNCATED" : "QUOTE_NOT_FOUND";
  }
  return bestVerdict;
}

export function auditFindings(findingsMd: string, transcript: Transcript): AuditResult {
  const blocks = splitFindingBlocks(findingsMd);
  const results: CitationResult[] = [];

  if (blocks.length === 0) {
    return { results: [{ heading: "(file)", line: "", verdict: "NO_FINDINGS" }], passed: false, citationsChecked: 0 };
  }

  let citationsChecked = 0;

  for (const block of blocks) {
    const lines = block.text.split("\n");
    const citationLines = lines.filter((l) => l.trim().startsWith("- Citation:"));

    if (citationLines.length === 0) {
      results.push({ heading: block.heading, line: "", verdict: "NO_CITATION" });
      continue;
    }

    for (const line of citationLines) {
      const parsed = tryParseCitation(line);
      if (parsed === "malformed") {
        results.push({ heading: block.heading, line: line.trim(), verdict: "MALFORMED" });
        continue;
      }
      if (parsed === null) continue; // filter above guarantees this doesn't happen

      if (parsed.tag === "model knowledge — verify") {
        // Not a finding backed by a read: fails the round (SaturationSampling.md).
        results.push({ heading: block.heading, line: line.trim(), verdict: "UNCHECKED" });
        continue;
      }

      // tag === "researched"
      citationsChecked++;
      if (!parsed.quote) {
        results.push({ heading: block.heading, line: line.trim(), verdict: "NO_QUOTE" });
        continue;
      }
      const verdict = citationSatisfiedByAnyCall(parsed, transcript.calls);
      results.push({ heading: block.heading, line: line.trim(), verdict });
    }
  }

  const passed = results.every((r) => r.verdict === "OK");
  return { results, passed, citationsChecked };
}

// ---------------------------------------------------------------------------
// Ledger cross-check (ruling 6a): for each ledger entry of the given round, its read_ref must
// appear in the transcript, and the count of "New"-status finding blocks whose FIRST Citation
// cites that read_ref must equal the entry's new_findings.
// ---------------------------------------------------------------------------

export type LedgerCheckVerdict = {
  readRef: string;
  verdict:
    | "OK"
    | "LEDGER_READ_MISSING"
    | "COUNT_MISMATCH"
    | "ROUND_NOT_IN_LEDGER"
    | "UNLEDGERED_READ"
    | "LEDGER_IDS_MISMATCH";
  detail?: string;
};

export interface LedgerAuditResult {
  checks: LedgerCheckVerdict[];
  passed: boolean;
  ledgerEntriesChecked: number;
}

function blockIsNew(block: FindingBlock): boolean {
  const bodyLines = block.text.split("\n").slice(1); // drop the heading line itself
  const firstNonBlank = bodyLines.find((l) => l.trim() !== "");
  return !!firstNonBlank && firstNonBlank.trim().startsWith("New");
}

function firstCitationReadRef(block: FindingBlock): string | null {
  const lines = block.text.split("\n");
  const citationLine = lines.find((l) => l.trim().startsWith("- Citation:"));
  if (!citationLine) return null;
  const parsed = tryParseCitation(citationLine);
  if (parsed === "malformed" || parsed === null) return null;
  return parsed.readRef;
}

export function auditAgainstLedger(findingsMd: string, transcript: Transcript, ledger: Ledger, round: number): LedgerAuditResult {
  const blocks = splitFindingBlocks(findingsMd);
  const roundEntries = ledger.entries.filter((e) => e.round === round);
  const checks: LedgerCheckVerdict[] = [];

  // A round with no ledger entries at all means the check ran on nothing: this must fail
  // loudly rather than report an empty, vacuously-true PASS (the NaN-pass-through pattern).
  if (roundEntries.length === 0) {
    return {
      checks: [{ readRef: "(none)", verdict: "ROUND_NOT_IN_LEDGER", detail: `round ${round} has no entries in this ledger` }],
      passed: false,
      ledgerEntriesChecked: 0,
    };
  }

  const newBlocksByReadRef = new Map<string, number>();
  for (const block of blocks) {
    // A block explicitly sectioned under a DIFFERENT "## Round N" heading belongs to that
    // round, not this one, even though it is still "New" there (it was new when first found).
    // Un-sectioned blocks (round === null) are not restricted, matching pre-existing behavior
    // for a findings file with no round sections at all.
    if (block.round !== null && block.round !== round) continue;
    if (!blockIsNew(block)) continue;
    const ref = firstCitationReadRef(block);
    if (!ref) continue;
    newBlocksByReadRef.set(ref, (newBlocksByReadRef.get(ref) ?? 0) + 1);
    // Reverse check: a New finding's first Citation must name a read this round actually
    // ledgered. Without this, a finding backed by an unledgered (and so uninspected) read
    // could never be caught by the forward, per-ledger-entry loop below.
    if (!roundEntries.some((e) => e.readRef === ref)) {
      checks.push({
        readRef: ref,
        verdict: "UNLEDGERED_READ",
        detail: `finding ${block.heading} is New but its first Citation's read is not a ledger entry of round ${round}`,
      });
    }
  }

  for (const e of roundEntries) {
    const matchingCalls = transcript.calls.filter((c) => c.ref === e.readRef);
    if (matchingCalls.length === 0) {
      checks.push({ readRef: e.readRef, verdict: "LEDGER_READ_MISSING" });
      continue;
    }
    // The ledger's own first_id/last_id must be found in the read they claim to bound: this
    // catches a ledger entry whose recorded ID range does not match what was actually read.
    const idsOk = matchingCalls.some((c) => findRowLine(c.text, e.firstId) && findRowLine(c.text, e.lastId));
    if (!idsOk) {
      checks.push({
        readRef: e.readRef,
        verdict: "LEDGER_IDS_MISMATCH",
        detail: `no call for this read has both a "[${e.firstId}] " and a "[${e.lastId}] " row line`,
      });
      continue;
    }
    const actualNew = newBlocksByReadRef.get(e.readRef) ?? 0;
    if (actualNew !== e.newFindings) {
      checks.push({
        readRef: e.readRef,
        verdict: "COUNT_MISMATCH",
        detail: `ledger says new_findings=${e.newFindings}, but ${actualNew} "New"-status finding block(s) cite this read as their first Citation`,
      });
      continue;
    }
    checks.push({ readRef: e.readRef, verdict: "OK" });
  }

  return { checks, passed: checks.every((c) => c.verdict === "OK"), ledgerEntriesChecked: roundEntries.length };
}

// ---------------------------------------------------------------------------
// ruling 6: `--accounting` — every ID an L1 file's "## Row accounting" section places somewhere
// must have actually been read, and every row actually read must land somewhere in that
// section. See AuditRound.ts's usage text / the rulings file for the exact shapes parsed.
// ---------------------------------------------------------------------------

export type AccountingCategory = "supporting" | "contrary" | "ambiguous" | "single-rows-carried" | "rows-not-carried";

export interface AccountingOccurrence {
  id: string;
  category: AccountingCategory;
}

// Minimal flat frontmatter reader (key: value, one per line) — good enough for the two fields
// this feature reads (corpus_files: [...] on an L1 file, rows_start_line: N on a corpus file).
// It is deliberately not the fuller parser in check.ts: neither field needs comment-stripping.
function frontmatterFields(md: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!md.startsWith("---")) return out;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return out;
  for (const line of md.slice(3, end).split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

function extractRowAccountingSection(md: string): string {
  const idx = md.search(/^##\s+Row accounting\b/m);
  return idx === -1 ? "" : md.slice(idx);
}

// "S-056, S-067 → F1 | F8, S-103" -> ["S-056", "S-067", "S-103"]: a plain ID passes through; an
// arrow-form entry (an ID ambiguous between findings) contributes only the ID before the arrow.
// "none" (case-insensitive) and empty entries are dropped.
function parseBracketList(content: string): string[] {
  return content
    .split(",")
    .map((tok) => tok.trim())
    .filter((tok) => tok.length > 0 && tok.toLowerCase() !== "none")
    .map((tok) => tok.split(/→|->/)[0].trim())
    .filter((tok) => tok.length > 0);
}

// Parses the "## Row accounting" section into individual (id, category) occurrences.
// Two shapes are recognized, in two distinct zones of the section:
//   1. Per-finding lines (everything before the first "### " subheading): a "supporting",
//      "contrary" or "ambiguous" keyword immediately followed by a "[...]" list, e.g.
//      "**Finding 1:** supporting [S-056, S-067] · contrary [S-010]".
//   2. Bullet lines under "### Single rows carried" / "### Rows not carried": "- [ID, ID] reason".
// Splitting on the first subheading keeps a stray "supporting"/"contrary" word inside a bullet's
// free-text reason from ever being mistaken for a per-finding list.
export function parseRowAccounting(l1Md: string): AccountingOccurrence[] {
  const section = extractRowAccountingSection(l1Md);
  if (!section) return [];
  const occurrences: AccountingOccurrence[] = [];

  const firstSubheadingIdx = section.search(/^###\s+/m);
  const findingsPart = firstSubheadingIdx === -1 ? section : section.slice(0, firstSubheadingIdx);
  const subsectionsPart = firstSubheadingIdx === -1 ? "" : section.slice(firstSubheadingIdx);

  const listRe = /\b(supporting|contrary|ambiguous)\s*\[([^\]]*)\]/g;
  let m: RegExpExecArray | null;
  while ((m = listRe.exec(findingsPart))) {
    const category = m[1] as AccountingCategory;
    for (const id of parseBracketList(m[2])) occurrences.push({ id, category });
  }

  let currentHeading: "single-rows-carried" | "rows-not-carried" | null = null;
  for (const line of subsectionsPart.split("\n")) {
    const heading = line.match(/^###\s+(.*)$/);
    if (heading) {
      const h = heading[1].trim().toLowerCase();
      currentHeading = h === "single rows carried" ? "single-rows-carried" : h === "rows not carried" ? "rows-not-carried" : null;
      continue;
    }
    if (!currentHeading) continue;
    const bullet = line.match(/^-\s*\[([^\]]*)\]/);
    if (!bullet) continue;
    for (const id of parseBracketList(bullet[1])) occurrences.push({ id, category: currentHeading });
  }

  return occurrences;
}

export interface RowsReadResult {
  ids: Set<string>;
}

// --ledger L: the ledger's own entries name exactly which rows were read (round-by-round), and
// its header names the single corpus file they were read from. The corpus file's own
// rows_start_line: (its frontmatter) is what turns a ledger entry's startRow/rowCount into
// actual line numbers: row position k sits at line `rows_start_line + k - 1`.
export function rowsReadFromLedger(ledgerPath: string): RowsReadResult {
  const loaded = loadLedger(ledgerPath);
  if (!loaded.exists) throw new Error(loaded.message);

  const ledgerDir = dirname(ledgerPath);
  // final-check item 8: recompute the corpus file's hash and refuse if it no longer matches
  // what the ledger declared at init -- a silently-changed corpus file must never map a
  // ledger's row ranges onto different text.
  let corpusPath: string;
  try {
    corpusPath = verifyCorpusUnchanged(ledgerDir, loaded.header);
  } catch (e) {
    throw new Error(`--accounting --ledger: ${e instanceof Error ? e.message : String(e)}`);
  }

  const corpusText = readFileSync(corpusPath, "utf8");
  const corpusLines = corpusText.split("\n");
  const fm = frontmatterFields(corpusText);
  const rowsStartLine = Number((fm.rows_start_line ?? "").replace(/^"|"$/g, ""));
  if (!Number.isFinite(rowsStartLine)) {
    throw new Error(`--accounting --ledger: ${corpusPath} has no numeric rows_start_line: in its frontmatter`);
  }

  const ids = new Set<string>();
  for (const entry of loaded.entries) {
    for (let j = 0; j < entry.rowCount; j++) {
      const k = entry.startRow + j;
      const lineNum = rowsStartLine + k - 1;
      const lineText = corpusLines[lineNum - 1] ?? "";
      const idMatch = lineText.match(/^\[([^\]]+)\]/);
      if (!idMatch) {
        throw new Error(`--accounting --ledger: no "[ID] ..." row line at ${corpusPath}:${lineNum} (round ${entry.round}, expected row position ${k})`);
      }
      ids.add(idMatch[1]);
    }
  }
  return { ids };
}

// --corpus DIR: the L1 file's own corpus_files: frontmatter list names which files it drew on;
// every row line in every one of those files (in DIR) was read, full stop — this covers
// _below_floor.md too, since its row lines sit under several "### <category>" sections but are
// still just "[ID] ..." lines like any other corpus file.
export function rowsReadFromCorpus(l1Md: string, corpusDir: string): RowsReadResult {
  const fm = frontmatterFields(l1Md);
  const listRaw = fm.corpus_files;
  if (!listRaw) throw new Error("--accounting --corpus: L1 file frontmatter has no corpus_files: list");
  const files = listRaw
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (files.length === 0) throw new Error("--accounting --corpus: corpus_files: list is empty");

  const ids = new Set<string>();
  for (const f of files) {
    const p = join(corpusDir, f);
    if (!existsSync(p)) throw new Error(`--accounting --corpus: corpus file not found: ${p}`);
    const text = readFileSync(p, "utf8");
    for (const line of text.split("\n")) {
      const idMatch = line.match(/^\[([^\]]+)\]/);
      if (idMatch) ids.add(idMatch[1]);
    }
  }
  return { ids };
}

export type AccountingVerdict = "NOT_READ" | "NOT_ACCOUNTED" | "DUPLICATE" | "NO_ROWS_READ" | "ACCOUNTING_MISSING";
export interface AccountingProblem {
  verdict: AccountingVerdict;
  id: string;
}
export interface AccountingResult {
  rowsRead: number;
  idsAccounted: number;
  problems: AccountingProblem[];
  passed: boolean;
}

// DUPLICATE tracks membership across exactly three categories: a supporting list, "Single rows
// carried", and "Rows not carried". An ID landing in more than one of those three is double (or
// un-)counted at L2. A contrary or ambiguous placement never itself triggers DUPLICATE, and
// legitimately coexists with a supporting placement in a DIFFERENT finding — but the same ID
// supporting two different findings is exactly the double-count this check exists to catch, so
// it is flagged even though "supporting" is only one category (ruling 6's explicit carve-out).
export function auditRowAccounting(l1Md: string, rowsRead: Set<string>): AccountingResult {
  const occurrences = parseRowAccounting(l1Md);
  const accounted = new Set<string>();
  const supportingCount = new Map<string, number>();
  const singleRowsCarriedCount = new Map<string, number>();
  const rowsNotCarriedCount = new Map<string, number>();

  for (const occ of occurrences) {
    accounted.add(occ.id);
    const bucket =
      occ.category === "supporting" ? supportingCount : occ.category === "single-rows-carried" ? singleRowsCarriedCount : occ.category === "rows-not-carried" ? rowsNotCarriedCount : null;
    if (bucket) bucket.set(occ.id, (bucket.get(occ.id) ?? 0) + 1);
  }

  const problems: AccountingProblem[] = [];
  // final-check item 4: a ledger with no entries (rows read = 0) or an L1 file with no
  // "## Row accounting" section at all used to leave both comparison loops below with nothing
  // to iterate, printing "0 row(s) read, 0 ID(s) accounted for / PASS" — a zero-checked PASS.
  // Both conditions now fail loudly with a distinct verdict, independent of each other and of
  // whatever the id-by-id comparison below finds.
  if (rowsRead.size === 0) problems.push({ verdict: "NO_ROWS_READ", id: "(0 rows read — nothing was checked)" });
  if (extractRowAccountingSection(l1Md) === "") problems.push({ verdict: "ACCOUNTING_MISSING", id: "(no ## Row accounting section in the L1 file)" });
  for (const id of accounted) {
    const sc = supportingCount.get(id) ?? 0;
    const src = singleRowsCarriedCount.get(id) ?? 0;
    const rnc = rowsNotCarriedCount.get(id) ?? 0;
    const groupsPresent = (sc > 0 ? 1 : 0) + (src > 0 ? 1 : 0) + (rnc > 0 ? 1 : 0);
    if (sc >= 2 || groupsPresent > 1) problems.push({ verdict: "DUPLICATE", id });
  }
  for (const id of accounted) {
    if (!rowsRead.has(id)) problems.push({ verdict: "NOT_READ", id });
  }
  for (const id of rowsRead) {
    if (!accounted.has(id)) problems.push({ verdict: "NOT_ACCOUNTED", id });
  }
  problems.sort((a, b) => (a.verdict === b.verdict ? a.id.localeCompare(b.id) : a.verdict.localeCompare(b.verdict)));

  return { rowsRead: rowsRead.size, idsAccounted: accounted.size, problems, passed: problems.length === 0 };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseFlags(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      args.set(argv[i].slice(2), argv[i + 1]);
      i++;
    }
  }
  return args;
}

function printHelp(): void {
  console.log(`Usage:
  bun AuditRound.ts --transcript T.json --findings F.md [--ledger L --round R]
  bun AuditRound.ts --accounting L1_FILE (--ledger L | --corpus DIR)
  bun AuditRound.ts --help

--ledger and --round must be given together: --ledger requires --round (a positive integer),
and --round requires --ledger.

--accounting checks the L1 file's "## Row accounting" section against the rows actually read:
give it --ledger L (rows read = the ledger's entries, resolved against the corpus file its
header names) or --corpus DIR (rows read = every row in the files the L1 frontmatter's
corpus_files: list names, read from DIR) — exactly one of the two.`);
}

function runAccountingCli(args: Map<string, string>): number {
  const l1Path = args.get("accounting");
  if (!l1Path) throw new Error("--accounting requires an L1 findings file path");
  const ledgerPath = args.get("ledger");
  const corpusDir = args.get("corpus");
  if ((ledgerPath === undefined) === (corpusDir === undefined)) {
    throw new Error("--accounting requires exactly one of --ledger L or --corpus DIR");
  }

  const l1Md = readFileSync(l1Path, "utf8");
  const rowsRead = ledgerPath !== undefined ? rowsReadFromLedger(ledgerPath) : rowsReadFromCorpus(l1Md, corpusDir!);
  const result = auditRowAccounting(l1Md, rowsRead.ids);

  console.log(`${result.rowsRead} row(s) read, ${result.idsAccounted} ID(s) accounted for`);
  for (const p of result.problems) {
    console.log(`${p.verdict}\t${p.id}`);
  }
  console.log(result.passed ? "PASS" : `${result.problems.length} problem(s): FAIL`);
  return result.passed ? 0 : 1;
}

async function mainCli() {
  const argvAll = process.argv.slice(2);
  if (argvAll.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const args = parseFlags(argvAll);

  if (args.has("accounting")) {
    process.exit(runAccountingCli(args));
    return;
  }

  const transcriptPath = args.get("transcript");
  const findingsPath = args.get("findings");
  if (!transcriptPath || !findingsPath) {
    throw new Error("usage: AuditRound.ts --transcript T.json --findings F.md [--ledger L --round R]");
  }

  const ledgerPath = args.get("ledger");
  const roundRaw = args.get("round");
  if (roundRaw !== undefined && ledgerPath === undefined) {
    throw new Error("--round requires --ledger");
  }
  let round: number | undefined;
  if (ledgerPath !== undefined) {
    if (roundRaw === undefined) {
      throw new Error("--round is required when --ledger is given, as a positive integer");
    }
    round = Number(roundRaw);
    if (!Number.isInteger(round) || round <= 0) {
      throw new Error(`--round must be a positive integer, got: ${roundRaw}`);
    }
  }

  const transcript: Transcript = JSON.parse(readFileSync(transcriptPath, "utf8"));
  const findingsMd = readFileSync(findingsPath, "utf8");
  const { results, passed, citationsChecked } = auditFindings(findingsMd, transcript);
  for (const r of results) {
    console.log(`${r.verdict}\t${r.heading}\t${r.line}`);
  }

  let overallPassed = passed;
  if (ledgerPath !== undefined && round !== undefined) {
    const loaded = loadLedger(ledgerPath);
    if (!loaded.exists) throw new Error(loaded.message);
    const ledgerResult = auditAgainstLedger(findingsMd, transcript, loaded, round);
    for (const c of ledgerResult.checks) {
      console.log(`${c.verdict}\t${c.readRef}${c.detail ? `\t${c.detail}` : ""}`);
    }
    console.log(`${ledgerResult.ledgerEntriesChecked} ledger entr${ledgerResult.ledgerEntriesChecked === 1 ? "y" : "ies"} checked`);
    overallPassed = overallPassed && ledgerResult.passed;
  }

  console.log(`${citationsChecked} citation(s) checked: ${overallPassed ? "PASS" : "FAIL"}`);
  process.exit(overallPassed ? 0 : 1);
}

if (import.meta.main) {
  mainCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
