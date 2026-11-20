// SaturationLedger: deterministic mechanics for saturation sampling of one corpus file.
//
// This module does not decide when to stop. It plans non-overlapping row-range chunks,
// records what was read in a plain-text ledger, and reports the pre-registered stopping
// rule's current state, measured in WHOLE ROUNDS (a round is a batch of --round-chunks
// chunks). Closing a round of reading is a named human decision made elsewhere, using
// stoppingStatus()'s report as input.

import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";

// ---------------------------------------------------------------------------
// seeded shuffle (shared shape with SegmentSurvey.ts, kept local: zero dependencies)
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = items.slice();
  const rng = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// FNV-1a, 32-bit: a small deterministic hash so a round's seed is derived from the corpus
// file name and round number, never passed in and never left to chance.
export function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function deriveSeed(corpusFile: string, round: number): number {
  return fnv1a32(`${corpusFile}:${round}`);
}

// ---------------------------------------------------------------------------
// planChunks
// ---------------------------------------------------------------------------

// row ranges not covered by any ledgered range, in order
export function unreadGaps(totalRows: number, covered: Range[]): Range[] {
  const read = new Uint8Array(totalRows + 1);
  for (const r of covered) for (let i = Math.max(1, r.start); i <= Math.min(totalRows, r.end); i++) read[i] = 1;
  const gaps: Range[] = [];
  for (let i = 1; i <= totalRows; i++) {
    if (read[i]) continue;
    const start = i;
    while (i + 1 <= totalRows && !read[i + 1]) i++;
    gaps.push({ start, end: i });
  }
  return gaps;
}

export interface Range {
  start: number; // 1-based, inclusive
  end: number; // 1-based, inclusive
}

export interface PlanChunksOptions {
  allowOversize?: boolean;
}

function overlaps(a: Range, b: Range): boolean {
  return a.start <= b.end && b.start <= a.end;
}

// aligned grid blocks: 1, 1+chunkSize, 1+2*chunkSize, ... ; the last block may be shorter than
// chunkSize. No end-aligned extra candidate: that used to double the selection chance of the
// last rows in the corpus.
function buildCandidateStarts(totalRows: number, chunkSize: number): number[] {
  const starts: number[] = [];
  for (let s = 1; s <= totalRows; s += chunkSize) {
    starts.push(s);
  }
  return starts;
}

export function planChunks(
  totalRows: number,
  chunkSize: number,
  numChunks: number,
  coveredRanges: Range[],
  seed: number,
  options: PlanChunksOptions = {}
): Range[] {
  if ((chunkSize < 5 || chunkSize > 15) && !options.allowOversize) {
    throw new Error(`chunkSize ${chunkSize} is outside the 5-15 hard cap; pass { allowOversize: true } to override`);
  }

  const starts = buildCandidateStarts(totalRows, chunkSize);
  const candidates: Range[] = starts
    .map((s) => ({ start: s, end: Math.min(s + chunkSize - 1, totalRows) }))
    .filter((c) => !coveredRanges.some((cov) => overlaps(c, cov)));

  const shuffled = seededShuffle(candidates, seed);

  const chosen: Range[] = [];
  for (const cand of shuffled) {
    if (chosen.length >= numChunks) break;
    if (chosen.some((u) => overlaps(cand, u))) continue;
    chosen.push(cand);
  }

  if (chosen.length < numChunks) {
    const gaps = unreadGaps(totalRows, coveredRanges);
    const unread = gaps.reduce((s, g) => s + (g.end - g.start + 1), 0);
    // exhaustion means every row has been read; anything else is a planning shortfall, and saying
    // "exhausted" there would hide unread rows
    if (unread === 0) throw new Error(`COVERAGE_EXHAUSTED: all ${totalRows} rows already ledgered`);
    throw new Error(
      `NO_FIT: cannot plan ${numChunks} chunk(s) of size ${chunkSize}; ${unread} of ${totalRows} rows unread, in gaps ` +
        gaps.map((g) => `${g.start}-${g.end}`).join(", ") +
        `. Plan fewer chunks, or read the remaining gaps directly and append each read.`
    );
  }

  return chosen.sort((a, b) => a.start - b.start);
}

// ---------------------------------------------------------------------------
// ledger file: header + append-only entries, plain text
// ---------------------------------------------------------------------------

export interface LedgerHeader {
  totalRows: number;
  corpusFile: string;
  // final-check item 8: the corpus file's sha256 at the moment the ledger was declared (init).
  // plan/append/AuditRound --accounting --ledger recompute it and refuse on a mismatch, so a
  // ledger can never silently map its row ranges onto a corpus file that has since changed.
  corpusSha256: string;
  chunkSize: number;
  roundChunks: number;
  baseRounds: number;
  runRounds: number;
  newInfoThreshold: number;
  declared: string; // YYYY-MM-DD, the stopping rule declared before round 1
}

// initLedger's caller declares everything EXCEPT corpusSha256, which init derives itself by
// resolving --corpus-file and hashing it -- it is never an input a caller can assert.
export type InitLedgerHeader = Omit<LedgerHeader, "corpusSha256">;

export interface LedgerEntry {
  round: number;
  startRow: number;
  rowCount: number;
  firstId: string;
  lastId: string;
  readRef: string;
  seed: number;
  newFindings: number;
  oversize: boolean;
  // A gap entry is a read of an unread gap left behind by a NO_FIT (see planChunks). It may be
  // any size >= 1 and does not need to match a planned chunk. A round containing any gap entry
  // is never a counted round (stoppingStatus): it still counts toward coverage, never toward
  // the base/run rule.
  gap: boolean;
  date: string;
}

export interface Ledger {
  header: LedgerHeader;
  entries: LedgerEntry[];
}

const HEADER_KEYS: Record<string, keyof LedgerHeader> = {
  total_rows: "totalRows",
  corpus_file: "corpusFile",
  corpus_sha256: "corpusSha256",
  chunk_size: "chunkSize",
  round_chunks: "roundChunks",
  base_rounds: "baseRounds",
  run_rounds: "runRounds",
  new_info_threshold: "newInfoThreshold",
  declared: "declared",
};

// non-numeric header fields (parsed as raw strings, not coerced through Number())
const STRING_HEADER_FIELDS = new Set<keyof LedgerHeader>(["declared", "corpusFile", "corpusSha256"]);

const NUMERIC_HEADER_FIELDS: Array<keyof LedgerHeader> = [
  "totalRows",
  "chunkSize",
  "roundChunks",
  "baseRounds",
  "runRounds",
  "newInfoThreshold",
];

function validatePositiveInteger(name: string, value: number): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got: ${value}`);
  }
}

// final-check item 7: the shape regex alone (\d{4}-\d{2}-\d{2}) accepts "2026-13-45" -- a
// well-formed but nonexistent date. Building the date from its numeric parts with Date.UTC
// (which silently rolls an out-of-range month/day into the next one) and comparing the
// round-tripped result back against the original string catches that: a real calendar date is
// the only input that survives the round trip unchanged.
function isValidCalendarDate(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [, yStr, moStr, dStr] = m;
  const y = Number(yStr), mo = Number(moStr), d = Number(dStr);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (Number.isNaN(dt.getTime())) return false;
  const pad = (n: number, len: number) => String(n).padStart(len, "0");
  const roundTrip = `${pad(dt.getUTCFullYear(), 4)}-${pad(dt.getUTCMonth() + 1, 2)}-${pad(dt.getUTCDate(), 2)}`;
  return roundTrip === s;
}

function validateHeader(header: InitLedgerHeader & { corpusSha256?: string }): void {
  validatePositiveInteger("--total-rows", header.totalRows);
  validatePositiveInteger("--chunk-size", header.chunkSize);
  if (header.chunkSize < 5 || header.chunkSize > 15) {
    throw new Error(`--chunk-size must be in the 5-15 hard cap range, got: ${header.chunkSize}`);
  }
  validatePositiveInteger("--round-chunks", header.roundChunks);
  if (header.roundChunks < 8) {
    throw new Error(`--round-chunks must be at least 8, got: ${header.roundChunks}`);
  }
  validatePositiveInteger("--base-rounds", header.baseRounds);
  validatePositiveInteger("--run-rounds", header.runRounds);
  if (header.runRounds < 1) {
    throw new Error(`--run-rounds must be at least 1, got: ${header.runRounds}`);
  }
  if (!Number.isFinite(header.newInfoThreshold) || header.newInfoThreshold < 0 || header.newInfoThreshold > 1) {
    throw new Error(`--new-info-threshold must be finite and in [0,1], got: ${header.newInfoThreshold}`);
  }
  if (!header.corpusFile || header.corpusFile.trim() === "") {
    throw new Error("--corpus-file must be a non-empty name");
  }
  if (/[|\n\r]/.test(header.corpusFile)) {
    throw new Error(`--corpus-file must not contain "|" or a newline`);
  }
  if (!header.declared || header.declared.trim() === "") {
    throw new Error("--declared must be a non-empty date");
  }
  if (/[|\n\r]/.test(header.declared)) {
    throw new Error(`--declared must not contain "|" or a newline`);
  }
  // corpusSha256 is only present once a ledger has been loaded from disk (init computes it
  // itself, after this validation runs) -- when present, it must look like a real sha256 hex
  // digest, catching a hand-edited or truncated header field.
  if (header.corpusSha256 !== undefined && !/^[0-9a-f]{64}$/i.test(header.corpusSha256)) {
    throw new Error(`corpus_sha256 must be a 64-character hex sha256 digest, got: "${header.corpusSha256}"`);
  }
}

// final-check item 8: a corpus file lives either directly beside the ledger, or in a `corpus/`
// subfolder next to it -- the same resolution AuditRound.ts uses for --accounting --ledger.
export function resolveCorpusFile(ledgerDir: string, corpusFileName: string): string {
  const direct = join(ledgerDir, corpusFileName);
  const nested = join(ledgerDir, "corpus", corpusFileName);
  if (existsSync(direct)) return direct;
  if (existsSync(nested)) return nested;
  throw new Error(`corpus file "${corpusFileName}" not found at ${direct} or ${nested}`);
}

function hashFile(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

// Recomputes the resolved corpus file's current hash and compares it against the ledger
// header's declared corpus_sha256, refusing on a mismatch. Called wherever a ledger's row
// ranges are about to be trusted against the corpus file's actual line numbers/content: the
// `plan` and `append` CLI commands, and AuditRound's --accounting --ledger (rowsReadFromLedger).
export function verifyCorpusUnchanged(ledgerDir: string, header: Pick<LedgerHeader, "corpusFile" | "corpusSha256">): string {
  const corpusPath = resolveCorpusFile(ledgerDir, header.corpusFile);
  const actual = hashFile(corpusPath);
  if (actual !== header.corpusSha256) {
    throw new Error(
      `corpus file changed since the ledger was declared: ${corpusPath} now hashes to ${actual}, ledger header says corpus_sha256: ${header.corpusSha256}`
    );
  }
  return corpusPath;
}

export function initLedger(path: string, header: InitLedgerHeader): void {
  if (existsSync(path)) {
    throw new Error(`ledger already exists at ${path}; refusing to overwrite`);
  }
  validateHeader(header);
  const corpusPath = resolveCorpusFile(dirname(path), header.corpusFile);
  const corpusSha256 = hashFile(corpusPath);
  const lines = [
    `# total_rows: ${header.totalRows}`,
    `# corpus_file: ${header.corpusFile}`,
    `# corpus_sha256: ${corpusSha256}`,
    `# chunk_size: ${header.chunkSize}`,
    `# round_chunks: ${header.roundChunks}`,
    `# base_rounds: ${header.baseRounds}`,
    `# run_rounds: ${header.runRounds}`,
    `# new_info_threshold: ${header.newInfoThreshold}`,
    `# declared: ${header.declared}`,
  ];
  writeFileSync(path, lines.join("\n") + "\n", "utf8");
}

export type LoadLedgerResult = { exists: true; header: LedgerHeader; entries: LedgerEntry[] } | { exists: false; message: string };

// round|startRow|rowCount|firstId|lastId|readRef|seed|newFindings|oversize|gap|date
const ENTRY_FIELD_COUNT = 11;

export function loadLedger(path: string): LoadLedgerResult {
  if (!existsSync(path)) {
    return { exists: false, message: `no ledger yet at ${path}` };
  }
  const text = readFileSync(path, "utf8");
  const rawLines = text.split("\n");
  const header: Partial<LedgerHeader> = {};
  const seenHeaderKeys = new Set<string>();
  const entries: LedgerEntry[] = [];

  rawLines.forEach((line, i) => {
    const lineNum = i + 1;
    if (line.length === 0) return;
    if (line.startsWith("#")) {
      const m = /^#\s*([a-z0-9_]+):\s*(.+)$/.exec(line);
      if (!m) throw new Error(`malformed ledger header at line ${lineNum}: "${line}"`);
      const [, key, val] = m;
      const field = HEADER_KEYS[key];
      if (!field) throw new Error(`unknown ledger header field at line ${lineNum}: "${key}"`);
      if (seenHeaderKeys.has(key)) {
        throw new Error(`duplicate ledger header key "${key}" at line ${lineNum}`);
      }
      seenHeaderKeys.add(key);
      if (STRING_HEADER_FIELDS.has(field)) {
        (header as any)[field] = val;
      } else {
        const n = Number(val);
        if (!Number.isFinite(n)) {
          throw new Error(`malformed ledger header at line ${lineNum}: "${key}" is not a finite number: "${val}"`);
        }
        (header as any)[field] = n;
      }
    } else {
      const parts = line.split("|");
      if (parts.length !== ENTRY_FIELD_COUNT) {
        throw new Error(`malformed ledger entry at line ${lineNum}: expected ${ENTRY_FIELD_COUNT} fields, got ${parts.length}`);
      }
      const [round, startRow, rowCount, firstId, lastId, readRef, seed, newFindings, oversize, gap, date] = parts;
      const numericFields = { round, startRow, rowCount, seed, newFindings };
      for (const [name, val] of Object.entries(numericFields)) {
        if (val.trim() === "" || !Number.isFinite(Number(val))) {
          throw new Error(`malformed ledger entry at line ${lineNum}: non-numeric ${name} field "${val}"`);
        }
      }
      if (firstId.trim() === "" || lastId.trim() === "" || readRef.trim() === "") {
        throw new Error(`malformed ledger entry at line ${lineNum}: firstId, lastId and readRef must all be non-empty`);
      }
      entries.push({
        round: Number(round),
        startRow: Number(startRow),
        rowCount: Number(rowCount),
        firstId,
        lastId,
        readRef,
        seed: Number(seed),
        newFindings: Number(newFindings),
        oversize: oversize === "true",
        gap: gap === "true",
        date,
      });
    }
  });

  const missing = (Object.keys(HEADER_KEYS) as Array<keyof typeof HEADER_KEYS>).filter((k) => header[HEADER_KEYS[k]] === undefined);
  if (missing.length > 0) {
    throw new Error(`ledger header incomplete at ${path}: missing ${missing.join(", ")}`);
  }
  for (const field of NUMERIC_HEADER_FIELDS) {
    const v = header[field] as number;
    if (!Number.isFinite(v)) {
      throw new Error(`ledger header at ${path} has a non-finite value for ${field}: ${v}`);
    }
  }
  // Re-run the same structural/range validation init() applies, so a hand-edited header
  // (e.g. round_chunks below 8, or a threshold outside [0,1]) is rejected on load too, not
  // just at the moment it was written.
  validateHeader(header as LedgerHeader);

  return { exists: true, header: header as LedgerHeader, entries };
}

export interface AppendEntryInput {
  round: number;
  startRow: number;
  rowCount: number;
  firstId: string;
  lastId: string;
  readRef: string;
  newFindings: number;
  date?: string;
  // A read of an unread gap left behind by a NO_FIT. May be any size >= 1 and is exempt from
  // the "must match a planned chunk" check below.
  gap?: boolean;
}

// The chunks plan() would return for `round`, computed from the ledger state EXCLUDING that
// round's own entries. This is what both the `plan` CLI command and appendEntry's plan-match
// check use, so that appending chunk 1 of round R can never change what round R's other
// chunks are: only entries belonging to OTHER rounds ever count as "already covered" here.
export function planChunksForRound(loaded: { header: LedgerHeader; entries: LedgerEntry[] }, round: number): Range[] {
  const coveredRanges: Range[] = loaded.entries
    .filter((e) => e.round !== round)
    .map((e) => ({ start: e.startRow, end: e.startRow + e.rowCount - 1 }));
  const seed = deriveSeed(loaded.header.corpusFile, round);
  return planChunks(loaded.header.totalRows, loaded.header.chunkSize, loaded.header.roundChunks, coveredRanges, seed);
}

// appendEntry validates against the loaded ledger before writing, so the append-only file can
// never be poisoned with a malformed line, a NaN count, a range that double-counts rows already
// ledgered, or a range that does not correspond to the pre-registered plan for that round. The
// seed is derived (deriveSeed), never passed in.
export function appendEntry(path: string, input: AppendEntryInput): void {
  const loaded = loadLedger(path);
  if (!loaded.exists) throw new Error(loaded.message);

  validatePositiveInteger("--round", input.round);
  validatePositiveInteger("--start-row", input.startRow);
  validatePositiveInteger("--row-count", input.rowCount);
  if (!Number.isFinite(input.newFindings) || !Number.isInteger(input.newFindings) || input.newFindings < 0) {
    throw new Error(`--new-findings must be a non-negative integer, got: ${input.newFindings}`);
  }
  for (const [name, val] of [
    ["--first-id", input.firstId],
    ["--last-id", input.lastId],
    ["--read-ref", input.readRef],
  ] as const) {
    if (!val || val.trim() === "") throw new Error(`${name} must be a non-empty string`);
    if (/[|\n\r]/.test(val)) throw new Error(`${name} must not contain "|" or a newline: "${val}"`);
  }
  if (input.date !== undefined && !isValidCalendarDate(input.date)) {
    throw new Error(`--date must be a real YYYY-MM-DD calendar date, got: "${input.date}"`);
  }

  const endRow = input.startRow + input.rowCount - 1;
  if (input.startRow < 1 || endRow > loaded.header.totalRows) {
    throw new Error(`append range ${input.startRow}-${endRow} falls outside 1..${loaded.header.totalRows}`);
  }
  const newRange: Range = { start: input.startRow, end: endRow };
  const overlap = loaded.entries.find((e) => overlaps(newRange, { start: e.startRow, end: e.startRow + e.rowCount - 1 }));
  if (overlap) {
    throw new Error(
      `append range ${input.startRow}-${endRow} overlaps an already-ledgered range ${overlap.startRow}-${overlap.startRow + overlap.rowCount - 1} (round ${overlap.round})`
    );
  }

  const gap = input.gap === true;
  const roundEntriesSoFar = loaded.entries.filter((e) => e.round === input.round);
  if (gap) {
    // final-check item 6: --gap exists for exactly one situation -- plan() cannot fit a full
    // round of chunks (NO_FIT: fewer free aligned blocks than round_chunks). If plan() would
    // still succeed, a gap read is choosing rows by hand instead of taking the pre-registered
    // random chunk, which is exactly what saturation sampling's randomization is meant to
    // prevent (quant N7 / MINOR 3).
    let noFit = false;
    try {
      planChunksForRound(loaded, input.round);
    } catch (e) {
      noFit = e instanceof Error && e.message.startsWith("NO_FIT");
      if (!noFit) throw e; // a different failure (e.g. COVERAGE_EXHAUSTED) is not --gap's case
    }
    if (!noFit) {
      throw new Error(
        `--gap is refused: round ${input.round} still has room for a full chunk plan (round_chunks=${loaded.header.roundChunks}); --gap is only for a round where plan() returns NO_FIT.`
      );
    }
    // a round is either a gap round or a planned round, never both
    if (roundEntriesSoFar.some((e) => !e.gap)) {
      throw new Error(`--gap is refused: round ${input.round} already has a planned (non-gap) entry; a round cannot mix planned and gap entries.`);
    }
  } else {
    if (roundEntriesSoFar.some((e) => e.gap)) {
      throw new Error(`round ${input.round} already has a gap entry; a planned (non-gap) entry cannot join a gap round.`);
    }
    const plannedChunks = planChunksForRound(loaded, input.round);
    const matches = plannedChunks.some((c) => c.start === newRange.start && c.end === newRange.end);
    if (!matches) {
      throw new Error(
        `append range ${input.startRow}-${endRow} does not match any chunk plan() returns for round ${input.round}: ` +
          plannedChunks.map((c) => `${c.start}-${c.end}`).join(", ") +
          `. Pass --gap for a read of an unread gap outside the normal chunk plan.`
      );
    }
  }

  const seed = deriveSeed(loaded.header.corpusFile, input.round);
  const oversize = input.rowCount > loaded.header.chunkSize;
  const line = [
    input.round,
    input.startRow,
    input.rowCount,
    input.firstId,
    input.lastId,
    input.readRef,
    seed,
    input.newFindings,
    oversize,
    gap,
    input.date ?? new Date().toISOString().slice(0, 10),
  ].join("|");
  appendFileSync(path, line + "\n", "utf8");
}

// ---------------------------------------------------------------------------
// stoppingStatus
// ---------------------------------------------------------------------------

export type StoppingState = "insufficient" | "empty_base" | "above_threshold" | "meets_rule" | "new_in_uncounted_round";

export interface StoppingStatus {
  state: StoppingState;
  rowsRead: number;
  totalRows: number;
  pctRead: number;
  countedRounds: number;
  shortRounds: number;
  baseRows: number;
  baseFindings: number;
  runRows: number;
  newInRun: number;
  allowedNew: number;
  ratio: number;
  // total new_findings from short/gap rounds after the last base round (never counted in
  // baseFindings or newInRun). Non-zero here means meets_rule cannot be reported: see
  // "new_in_uncounted_round" below.
  uncountedNewFindings: number;
}

export function stoppingStatus(ledger: Ledger): StoppingStatus {
  const { header, entries } = ledger;

  // distinct covered rows (overlap is already rejected at append time, but rowsRead is defined
  // as distinct covered rows regardless, so double-reads from before this fix never inflate it)
  const coveredMask = new Set<number>();
  for (const e of entries) for (let r = e.startRow; r < e.startRow + e.rowCount; r++) coveredMask.add(r);
  const rowsRead = coveredMask.size;
  const totalRows = header.totalRows;
  const pctRead = totalRows > 0 ? rowsRead / totalRows : 0;

  // group entries by round; a round is "counted" if it has at least round_chunks entries AND
  // contains no gap entry. Rounds that fail either test are "short" (this also covers a round
  // that contains a gap entry, regardless of its size) -- they still count toward coverage
  // (rowsRead above) but are excluded from the base/run rule itself.
  const byRound = new Map<number, LedgerEntry[]>();
  for (const e of entries) {
    if (!byRound.has(e.round)) byRound.set(e.round, []);
    byRound.get(e.round)!.push(e);
  }
  const roundNumbers = [...byRound.keys()].sort((a, b) => a - b);
  const countedRoundNumbers: number[] = [];
  let shortRounds = 0;
  for (const rn of roundNumbers) {
    const es = byRound.get(rn)!;
    const hasGap = es.some((e) => e.gap);
    if (!hasGap && es.length >= header.roundChunks) countedRoundNumbers.push(rn);
    else shortRounds++;
  }
  const countedRounds = countedRoundNumbers.length;

  const base = <T>(fn: (e: LedgerEntry) => T) => {
    const baseRoundNumbers = countedRoundNumbers.slice(0, header.baseRounds);
    return baseRoundNumbers.flatMap((rn) => byRound.get(rn)!).map(fn);
  };
  const run = <T>(fn: (e: LedgerEntry) => T) => {
    const runRoundNumbers = countedRoundNumbers.slice(countedRoundNumbers.length - header.runRounds);
    return runRoundNumbers.flatMap((rn) => byRound.get(rn)!).map(fn);
  };

  if (countedRounds < header.baseRounds + header.runRounds) {
    const baseRows = countedRounds >= 1 ? base((e) => e.rowCount).reduce((s, n) => s + n, 0) : 0;
    const baseFindings = countedRounds >= 1 ? base((e) => e.newFindings).reduce((s, n) => s + n, 0) : 0;
    return {
      state: "insufficient",
      rowsRead,
      totalRows,
      pctRead,
      countedRounds,
      shortRounds,
      baseRows,
      baseFindings,
      runRows: 0,
      newInRun: 0,
      allowedNew: 0,
      ratio: NaN,
      uncountedNewFindings: 0,
    };
  }

  // base and run are disjoint sets of counted rounds by construction: base is the first
  // base_rounds counted rounds, run is the last run_rounds counted rounds, and countedRounds
  // >= base_rounds + run_rounds guarantees they never share a round.
  const baseRows = base((e) => e.rowCount).reduce((s, n) => s + n, 0);
  const baseFindings = base((e) => e.newFindings).reduce((s, n) => s + n, 0);
  const runRows = run((e) => e.rowCount).reduce((s, n) => s + n, 0);
  const newInRun = run((e) => e.newFindings).reduce((s, n) => s + n, 0);
  // + 1e-9 guards against float noise in T * baseFindings landing just under a whole number
  // (e.g. 0.29 * 100 = 28.999999999999996) and being floored down one lower than intended.
  const allowedNew = Math.floor(header.newInfoThreshold * baseFindings + 1e-9);
  const ratio = baseFindings > 0 ? newInRun / baseFindings : newInRun > 0 ? Infinity : 0;

  // Findings first seen in a short or gap round after the base is complete count toward
  // neither baseFindings nor newInRun, but they are still real new information: report them
  // rather than let the rule pass having never looked at them.
  const baseRoundNumbers = countedRoundNumbers.slice(0, header.baseRounds);
  const lastBaseRoundNumber = baseRoundNumbers[baseRoundNumbers.length - 1];
  let uncountedNewFindings = 0;
  for (const rn of roundNumbers) {
    if (countedRoundNumbers.includes(rn)) continue; // handled by base/run above
    if (rn <= lastBaseRoundNumber) continue; // only rounds after the last base round matter here
    uncountedNewFindings += byRound.get(rn)!.reduce((s, e) => s + e.newFindings, 0);
  }

  if (baseFindings === 0) {
    return {
      state: "empty_base",
      rowsRead,
      totalRows,
      pctRead,
      countedRounds,
      shortRounds,
      baseRows,
      baseFindings,
      runRows,
      newInRun,
      allowedNew,
      ratio,
      uncountedNewFindings,
    };
  }

  let state: StoppingState;
  if (newInRun > allowedNew) {
    state = "above_threshold";
  } else if (uncountedNewFindings > 0) {
    state = "new_in_uncounted_round";
  } else {
    state = "meets_rule";
  }
  return { state, rowsRead, totalRows, pctRead, countedRounds, shortRounds, baseRows, baseFindings, runRows, newInRun, allowedNew, ratio, uncountedNewFindings };
}

// ---------------------------------------------------------------------------
// CLI: bun SaturationLedger.ts init|plan|append|status ...
// ---------------------------------------------------------------------------

const BOOLEAN_FLAGS = new Set(["gap"]);

function parseFlags(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      if (BOOLEAN_FLAGS.has(key)) {
        args.set(key, "true");
        continue;
      }
      args.set(key, argv[i + 1]);
      i++;
    }
  }
  return args;
}

function reqNum(args: Map<string, string>, name: string): number {
  const v = args.get(name);
  if (v === undefined) throw new Error(`--${name} is required`);
  return Number(v);
}

function printHelp(): void {
  console.log(`Usage:
  bun SaturationLedger.ts init --ledger L --corpus-file NAME --total-rows N --chunk-size C --round-chunks K --base-rounds B --run-rounds R --new-info-threshold T [--declared D]
  bun SaturationLedger.ts plan --ledger L --round R
  bun SaturationLedger.ts append --ledger L --round R --start-row S --row-count N --first-id A --last-id Z --read-ref "..." --new-findings K [--date D] [--gap]
  bun SaturationLedger.ts status --ledger L
  bun SaturationLedger.ts --help`);
}

async function mainCli() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const [cmd, ...rest] = argv;
  const args = parseFlags(rest);
  const ledgerPath = args.get("ledger");
  if (!ledgerPath) throw new Error("--ledger is required");

  if (cmd === "init") {
    initLedger(ledgerPath, {
      totalRows: reqNum(args, "total-rows"),
      corpusFile: args.get("corpus-file") ?? "",
      chunkSize: reqNum(args, "chunk-size"),
      roundChunks: reqNum(args, "round-chunks"),
      baseRounds: reqNum(args, "base-rounds"),
      runRounds: reqNum(args, "run-rounds"),
      newInfoThreshold: reqNum(args, "new-info-threshold"),
      declared: args.get("declared") ?? new Date().toISOString().slice(0, 10),
    });
    console.log(`ledger initialized at ${ledgerPath}`);
  } else if (cmd === "plan") {
    const loaded = loadLedger(ledgerPath);
    if (!loaded.exists) throw new Error(loaded.message);
    verifyCorpusUnchanged(dirname(ledgerPath), loaded.header); // item 8: refuse a stale/changed corpus file
    const round = reqNum(args, "round");
    validatePositiveInteger("--round", round);
    const seed = deriveSeed(loaded.header.corpusFile, round);
    const chunks = planChunksForRound(loaded, round);
    console.log(JSON.stringify({ round, seed, chunkSize: loaded.header.chunkSize, chunks }));
  } else if (cmd === "append") {
    {
      const loaded = loadLedger(ledgerPath);
      if (!loaded.exists) throw new Error(loaded.message);
      verifyCorpusUnchanged(dirname(ledgerPath), loaded.header); // item 8: refuse a stale/changed corpus file
    }
    appendEntry(ledgerPath, {
      round: reqNum(args, "round"),
      startRow: reqNum(args, "start-row"),
      rowCount: reqNum(args, "row-count"),
      firstId: args.get("first-id") ?? "",
      lastId: args.get("last-id") ?? "",
      readRef: args.get("read-ref") ?? "",
      newFindings: reqNum(args, "new-findings"),
      date: args.get("date"),
      gap: args.has("gap"),
    });
    console.log("entry appended");
  } else if (cmd === "status") {
    const loaded = loadLedger(ledgerPath);
    if (!loaded.exists) throw new Error(loaded.message);
    console.log(JSON.stringify(stoppingStatus(loaded)));
  } else {
    throw new Error(`unknown command "${cmd}". Use init|plan|append|status`);
  }
}

if (import.meta.main) {
  mainCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
