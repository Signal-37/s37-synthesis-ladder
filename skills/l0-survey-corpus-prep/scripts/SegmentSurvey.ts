// SegmentSurvey: reads a survey .xlsx export and writes citable corpus files, one
// markdown file per category at or above --min-count, plus _index.md and (when
// any category falls short) _below_floor.md.
//
// Zero third-party dependencies. Own ZIP reader and OOXML (spreadsheet XML) parser,
// using only node:zlib, node:crypto and node:fs.

import { inflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, basename as pathBasename } from "node:path";

// ---------------------------------------------------------------------------
// ZIP reader (stored + deflated entries; throws a clear error on ZIP64)
// ---------------------------------------------------------------------------

interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

function readU16(buf: Uint8Array, off: number): number {
  return buf[off] | (buf[off + 1] << 8);
}

function readU32(buf: Uint8Array, off: number): number {
  return (buf[off] | (buf[off + 1] << 8) | (buf[off + 2] << 16) | (buf[off + 3] << 24)) >>> 0;
}

function findEndOfCentralDirectory(buf: Uint8Array): number {
  const minLen = 22;
  const maxCommentLen = 65535;
  if (buf.length < minLen) {
    throw new Error("not a valid zip/xlsx file: too short");
  }
  const searchStart = Math.max(0, buf.length - minLen - maxCommentLen);
  for (let i = buf.length - minLen; i >= searchStart; i--) {
    if (readU32(buf, i) === 0x06054b50) return i;
  }
  throw new Error("not a valid zip/xlsx file: end of central directory record not found");
}

function parseZip(buf: Uint8Array): Map<string, ZipEntry> {
  const eocdOff = findEndOfCentralDirectory(buf);
  const totalEntries = readU16(buf, eocdOff + 10);
  const cdSize = readU32(buf, eocdOff + 12);
  const cdOffset = readU32(buf, eocdOff + 16);

  if (totalEntries === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) {
    throw new Error("ZIP64 archives are not supported");
  }
  if (eocdOff >= 20 && readU32(buf, eocdOff - 20) === 0x07064b50) {
    // zip64 end-of-central-directory locator signature immediately before the EOCD
    throw new Error("ZIP64 archives are not supported");
  }

  const entries = new Map<string, ZipEntry>();
  let off = cdOffset;
  for (let i = 0; i < totalEntries; i++) {
    if (readU32(buf, off) !== 0x02014b50) {
      throw new Error(`corrupt zip central directory: bad signature for entry ${i}`);
    }
    const method = readU16(buf, off + 10);
    const compressedSize = readU32(buf, off + 20);
    const uncompressedSize = readU32(buf, off + 24);
    const nameLen = readU16(buf, off + 28);
    const extraLen = readU16(buf, off + 30);
    const commentLen = readU16(buf, off + 32);
    const localHeaderOffset = readU32(buf, off + 42);
    const name = new TextDecoder().decode(buf.subarray(off + 46, off + 46 + nameLen));
    entries.set(name, { name, method, compressedSize, uncompressedSize, localHeaderOffset });
    off += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function readEntryData(buf: Uint8Array, entry: ZipEntry): Uint8Array {
  const off = entry.localHeaderOffset;
  if (readU32(buf, off) !== 0x04034b50) {
    throw new Error(`corrupt zip local header for ${entry.name}`);
  }
  const nameLen = readU16(buf, off + 26);
  const extraLen = readU16(buf, off + 28);
  const dataStart = off + 30 + nameLen + extraLen;
  const compressed = buf.subarray(dataStart, dataStart + entry.compressedSize);
  if (entry.method === 0) return compressed;
  if (entry.method === 8) return new Uint8Array(inflateRawSync(compressed));
  throw new Error(`unsupported zip compression method ${entry.method} for ${entry.name}`);
}

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

// Single-pass entity decode: every entity in the source string is matched once, against the
// ORIGINAL text, so a decoded entity's replacement is never re-scanned for further entities
// (e.g. "&#38;lt;" decodes to the two literal characters "&lt;", not to "<").
function decodeEntitiesOnce(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|lt|gt|quot|apos|amp);/g, (whole: string, body: string) => {
    if (body[0] === "#") {
      if (body[1] === "x" || body[1] === "X") return String.fromCodePoint(parseInt(body.slice(2), 16));
      return String.fromCodePoint(parseInt(body.slice(1), 10));
    }
    switch (body) {
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return '"';
      case "apos":
        return "'";
      case "amp":
        return "&";
      default:
        return whole;
    }
  });
}

// Excel writes control and other reserved characters in cell text as _xHHHH_ (a literal
// underscore is itself escaped as _x005F_, so that escape sequence is never confused with a
// real one). This must run AFTER entity decoding, since the escape sequence is plain text,
// not an XML construct.
function decodeXEscapes(s: string): string {
  return s.replace(/_x([0-9A-Fa-f]{4})_/g, (_whole: string, hex: string) => {
    if (hex.toUpperCase() === "005F") return "_";
    return String.fromCodePoint(parseInt(hex, 16));
  });
}

function decodeXmlEntities(s: string): string {
  return decodeXEscapes(decodeEntitiesOnce(s));
}

interface SheetRef {
  name: string;
  rId: string;
}

function parseWorkbookSheets(xml: string): SheetRef[] {
  const sheets: SheetRef[] = [];
  const re = /<sheet\b[^>]*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const tag = m[0];
    const name = /name="([^"]*)"/.exec(tag)?.[1] ?? "";
    const rId = /r:id="([^"]*)"/.exec(tag)?.[1] ?? "";
    sheets.push({ name: decodeXmlEntities(name), rId });
  }
  return sheets;
}

function parseDate1904(workbookXmlText: string): boolean {
  const m = /<workbookPr\b[^>]*\bdate1904="([^"]*)"/.exec(workbookXmlText);
  return !!m && (m[1] === "1" || m[1] === "true");
}

function parseRelationships(xml: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /<Relationship\b[^>]*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const tag = m[0];
    const id = /Id="([^"]*)"/.exec(tag)?.[1];
    const target = /Target="([^"]*)"/.exec(tag)?.[1];
    if (id && target) map.set(id, target);
  }
  return map;
}

// Shared by <si> (shared strings) and <is> (inline rich strings): concatenates every <t> run's
// text, skipping <rPh>...</rPh> phonetic runs entirely (Excel writes these for furigana-style
// input; they duplicate the real text in a second script and are never part of the verbatim).
function extractRichText(inner: string): string {
  const withoutPhonetic = inner.replace(/<rPh\b[^>]*\/>|<rPh\b[^>]*>[\s\S]*?<\/rPh>/g, "");
  const tRe = /<t\b[^>]*\/>|<t\b[^>]*>([\s\S]*?)<\/t>/g;
  let tm: RegExpExecArray | null;
  let raw = "";
  while ((tm = tRe.exec(withoutPhonetic))) {
    if (tm[1] !== undefined) raw += tm[1];
  }
  return decodeXmlEntities(raw);
}

function parseSharedStrings(xml: string): string[] {
  const strings: string[] = [];
  const siRe = /<si\b[^>]*\/>|<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml))) {
    if (m[1] === undefined) {
      strings.push(""); // self-closing <si/>: an empty shared string, not a shift in indexing
      continue;
    }
    strings.push(extractRichText(m[1]));
  }
  const uniqueCountMatch = /<sst\b[^>]*\buniqueCount="(\d+)"/.exec(xml);
  if (uniqueCountMatch) {
    const declared = parseInt(uniqueCountMatch[1], 10);
    if (declared !== strings.length) {
      throw new Error(
        `sharedStrings.xml declares uniqueCount="${declared}" but ${strings.length} <si> entries were parsed; refusing to guess which index a verbatim belongs to`
      );
    }
  }
  return strings;
}

interface ParsedCell {
  col: number; // 0-based
  type: string | null;
  value: string;
}

interface ParsedRow {
  rowNumber: number;
  cells: ParsedCell[];
}

function colLetterToIndex(letter: string): number {
  let n = 0;
  for (const ch of letter) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n - 1;
}

function indexToColLetter(i: number): string {
  let n = i + 1;
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function parseSheetRows(xml: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  const rowRe = /<row\b([^>]*)\/>|<row\b([^>]*)>([\s\S]*?)<\/row>/g;
  let m: RegExpExecArray | null;
  let fallbackRowNumber = 0;
  while ((m = rowRe.exec(xml))) {
    fallbackRowNumber++;
    const attrs = m[1] ?? m[2] ?? "";
    const inner = m[3] ?? "";
    const rNum = /(?:^|\s)r="(\d+)"/.exec(attrs);
    const rowNumber = rNum ? parseInt(rNum[1], 10) : fallbackRowNumber;
    const cells: ParsedCell[] = [];
    const cellRe = /<c\b([^>]*)\/>|<c\b([^>]*)>([\s\S]*?)<\/c>/g;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(inner))) {
      const cAttrs = cm[1] ?? cm[2] ?? "";
      const cInner = cm[3] ?? "";
      const ref = /r="([A-Z]+)\d*"/.exec(cAttrs);
      if (!ref) continue;
      const col = colLetterToIndex(ref[1]);
      const type = /t="([^"]*)"/.exec(cAttrs)?.[1] ?? null;
      let value = "";
      if (type === "inlineStr") {
        const isMatch = /<is\b[^>]*>([\s\S]*?)<\/is>/.exec(cInner);
        value = isMatch ? extractRichText(isMatch[1]) : "";
      } else {
        const vMatch = /<v>([\s\S]*?)<\/v>/.exec(cInner);
        value = vMatch ? decodeXmlEntities(vMatch[1]) : "";
      }
      cells.push({ col, type, value });
    }
    rows.push({ rowNumber, cells });
  }
  return rows;
}

function excelSerialToIso(serial: number, date1904: boolean): string {
  // 1900 system: day 0 is 1899-12-30 (absorbs the fictitious 1900 leap-day bug).
  // 1904 system (legacy Mac workbooks): day 0 is 1904-01-01, no such bug to absorb.
  const epoch = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30);
  const ms = Math.round(serial * 86400000);
  return new Date(epoch + ms).toISOString().slice(0, 10);
}

// Trims only float representation noise (e.g. 8.0999999999999996 -> 8.1). Integers and any
// value that already has 15 or fewer significant digits pass through with their numeric value
// unchanged; 15 significant digits is enough headroom that no such value is altered.
function normalizeNumericString(s: string): string {
  const n = Number(s);
  if (!Number.isFinite(n)) return s; // not numeric (e.g. a categorical score label); leave as-is
  return Number(n.toPrecision(15)).toString();
}

// Refuses only when "@" is followed, somewhere later in the string, by a ".": that shape is a
// domain ("a@b.co"), not a bare handle ("@janesmith", which has nothing after it but letters).
function isEmailLike(s: string): boolean {
  const at = s.indexOf("@");
  if (at === -1) return false;
  return s.slice(at + 1).includes(".");
}

// Two phone shapes are refused: (a) a leading "+" followed by nothing but digits (e.g.
// "+14155550100"), and (b) a value built only from digits, spaces, dots, dashes, parentheses
// and an optional leading "+", that has at least one such separator (so a plain digit string,
// with no separator, is never caught here) and 7-15 digits in total. A plain digit string of
// any length (no separators, no leading "+") is always accepted, per ruling 1.
function isPhoneFormatted(s: string): boolean {
  if (/^\+\d+$/.test(s)) return true;
  if (!/^\+?[\d\s.()-]+$/.test(s)) return false;
  if (!/[\s.()-]/.test(s)) return false; // pure digits: accepted, not this branch
  const digitCount = (s.match(/\d/g) ?? []).length;
  return digitCount >= 7 && digitCount <= 15;
}

function looksLikeRawPersonalData(s: string): boolean {
  return isEmailLike(s) || isPhoneFormatted(s);
}

// "(" and ")" are rejected independently of the personal-data check: either character in a
// respondent ID would be indistinguishable, once written, from the row line's own
// "(respondent: ...)" / "(date: ...)" / "(score: ...)" suffixes.
function hasRowSuffixLikeChars(s: string): boolean {
  return s.includes("(") || s.includes(")");
}

// ---------------------------------------------------------------------------
// seeded, reproducible sampling (seed is always 42; not a CLI flag)
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

function seededSample<T>(items: T[], n: number, seed: number): T[] {
  const arr = items.slice();
  const rng = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "category";
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function findColIndex(headers: string[], name: string, flagName: string): number {
  const matches: number[] = [];
  headers.forEach((h, i) => {
    if (h === name) matches.push(i);
  });
  if (matches.length === 0) {
    throw new Error(`column "${name}" (${flagName}) not found. Available columns: ${headers.join(", ")}`);
  }
  if (matches.length > 1) {
    throw new Error(
      `column "${name}" (${flagName}) appears more than once in the header row, at columns ${matches.map(indexToColLetter).join(", ")}`
    );
  }
  return matches[0];
}

// ---------------------------------------------------------------------------
// shared workbook loading (used by both segment() and inspectSurvey())
// ---------------------------------------------------------------------------

interface LoadedWorkbook {
  sheetList: Array<{ name: string; target: string }>;
  chosenSheet: { name: string; target: string };
  parsedRows: ParsedRow[]; // includes the header row at index 0
  headers: string[];
  cellText: (cell: ParsedCell | undefined) => string;
  date1904: boolean;
}

function loadWorkbook(input: string, sheetOpt: string | undefined): LoadedWorkbook {
  if (!existsSync(input)) {
    throw new Error(`STOP_ASK: input file not found: ${input}`);
  }
  const raw = readFileSync(input);
  const buf = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
  const entries = parseZip(buf);

  const workbookEntry = entries.get("xl/workbook.xml");
  if (!workbookEntry) throw new Error("not a valid xlsx file: xl/workbook.xml is missing");
  const workbookXmlText = new TextDecoder().decode(readEntryData(buf, workbookEntry));
  const sheetRefs = parseWorkbookSheets(workbookXmlText);
  const date1904 = parseDate1904(workbookXmlText);

  const relsEntry = entries.get("xl/_rels/workbook.xml.rels");
  const relsMap = relsEntry ? parseRelationships(new TextDecoder().decode(readEntryData(buf, relsEntry))) : new Map<string, string>();

  const sheetList = sheetRefs.map((s) => ({ name: s.name, target: "xl/" + (relsMap.get(s.rId) ?? "") }));
  if (sheetList.length === 0) throw new Error("workbook has no sheets");

  let chosenIndex = 0;
  if (sheetOpt !== undefined) {
    const asNum = Number(sheetOpt);
    const looksNumeric = sheetOpt.trim().length > 0 && Number.isInteger(asNum) && String(asNum) === sheetOpt.trim();
    if (looksNumeric) {
      chosenIndex = asNum - 1;
      if (chosenIndex < 0 || chosenIndex >= sheetList.length) {
        throw new Error(`sheet index out of range: ${sheetOpt}. Available sheets: ${sheetList.map((s) => s.name).join(", ")}`);
      }
    } else {
      const idx = sheetList.findIndex((s) => s.name === sheetOpt);
      if (idx === -1) {
        throw new Error(`sheet not found: "${sheetOpt}". Available sheets: ${sheetList.map((s) => s.name).join(", ")}`);
      }
      chosenIndex = idx;
    }
  }
  const chosenSheet = sheetList[chosenIndex];

  let sharedStrings: string[] = [];
  const sstEntry = entries.get("xl/sharedStrings.xml");
  if (sstEntry) {
    sharedStrings = parseSharedStrings(new TextDecoder().decode(readEntryData(buf, sstEntry)));
  }

  const sheetEntry = entries.get(chosenSheet.target);
  if (!sheetEntry) throw new Error(`sheet part not found in archive: ${chosenSheet.target}`);
  const sheetXmlText = new TextDecoder().decode(readEntryData(buf, sheetEntry));
  const parsedRows = parseSheetRows(sheetXmlText);
  if (parsedRows.length === 0) throw new Error("sheet has no rows");

  function cellText(cell: ParsedCell | undefined): string {
    if (!cell) return "";
    if (cell.type === "s") {
      const idx = parseInt(cell.value, 10);
      return sharedStrings[idx] ?? "";
    }
    return cell.value;
  }

  const headerRow = parsedRows[0];
  const maxCol = headerRow.cells.reduce((m, c) => Math.max(m, c.col), -1);
  const headers: string[] = [];
  for (let i = 0; i <= maxCol; i++) {
    headers[i] = cellText(headerRow.cells.find((c) => c.col === i)) || "";
  }

  return { sheetList, chosenSheet, parsedRows, headers, cellText, date1904 };
}

// ---------------------------------------------------------------------------
// public API: segment()
// ---------------------------------------------------------------------------

export interface SegmentOptions {
  input: string;
  sheet?: string; // name, or 1-based index as a string
  textCol: string;
  groupCol: string;
  parentCol?: string;
  idCol?: string;
  dateCol?: string;
  scoreCol?: string;
  respondentCol?: string;
  minCount?: number; // default 15
  sampleSize?: number; // no default; census unless given
  sampleReason?: string; // required when sampleSize is given
  codingProvenance: "platform-applied" | "researcher-imposed";
  question?: string;
  out: string;
  replace?: boolean; // clear previously generated files in --out before writing
  surveyId: string; // required — names the survey this export belongs to (ruling A, 2026-09-27 final check)
}

export interface SegmentResult {
  categoriesWritten: Array<{
    category: string;
    file: string;
    rowsInCategory: number;
    rowsInFile: number;
    sampled: boolean;
  }>;
  belowFloor: Array<{ category: string; rowsInCategory: number }>;
  indexFile: string;
  belowFloorFile: string | null;
  rowsScanned: number;
  rowsWritten: number;
  blankTextSkipped: number;
  belowFloorRows: number;
  blankCategoryRows: number;
}

interface Row {
  sheetRow: number;
  id: string;
  text: string;
  group: string;
  parent: string | null;
  date: string | null;
  score: string | null;
  respondent: string | null;
}

interface CategoryPlan {
  category: string;
  parent: string | null;
  rowsInCategory: number;
  rowsWritten: Row[];
  sampled: boolean;
  sampleN?: number;
  filename?: string;
}

function formatYamlScalar(v: string | number): string {
  if (typeof v === "number") return String(v);
  return JSON.stringify(v);
}

function buildFrontmatterLines(fields: Array<[string, string | number | null | undefined]>): string[] {
  const lines = ["---"];
  for (const [k, v] of fields) {
    if (v === undefined) continue;
    lines.push(`${k}: ${v === null ? "null" : formatYamlScalar(v)}`);
  }
  lines.push("---");
  lines.push("");
  return lines;
}

function rowLine(r: Row): string {
  let line = `[${r.id}] ${r.text}`;
  if (r.respondent) line += ` (respondent: ${r.respondent})`;
  if (r.date) line += ` (date: ${r.date})`;
  if (r.score) line += ` (score: ${r.score})`;
  return line;
}

function dateRangeOf(rows: Row[]): string | null {
  const dates = rows.map((r) => r.date).filter((d): d is string => !!d).sort();
  if (dates.length === 0) return null;
  const min = dates[0];
  const max = dates[dates.length - 1];
  return min === max ? min : `${min} to ${max}`;
}

function respondentStatus(rowsWritten: Row[], respondentColGiven: boolean): { status: "present" | "partial" | "absent"; missing: number } {
  if (!respondentColGiven) return { status: "absent", missing: 0 };
  const missing = rowsWritten.filter((r) => !r.respondent).length;
  if (missing === 0) return { status: "present", missing: 0 };
  return { status: "partial", missing };
}

function escapeTableCell(s: string): string {
  return s.replace(/\|/g, "\\|");
}

const PROTECTED_OUT_FILES = new Set(["_read_decision.md", "_consolidation_log.md"]);

// A category file this tool generated carries source_type: "survey-corpus" (quoted or
// unquoted) in its YAML frontmatter. Any other .md file — a hand-written findings file, a
// rounds file, notes, etc. — never has that frontmatter, so it is left alone.
function fileHasSurveyCorpusSourceType(path: string): boolean {
  let content: string;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    return false;
  }
  if (!content.startsWith("---")) return false;
  const end = content.indexOf("\n---", 3);
  if (end === -1) return false;
  const frontmatter = content.slice(0, end);
  return /^source_type:\s*"?survey-corpus"?\s*$/m.test(frontmatter);
}

// --replace clears exactly what this tool generates: _index.md, _below_floor.md, and any
// category file whose own frontmatter marks it as survey-corpus output. Everything else in
// --out (hand-written findings, rounds files, _read_decision.md, _consolidation_log.md,
// non-markdown files) is left untouched. Every removal and every .md file left in place is
// printed so a re-run's effect is never silent.
function clearGeneratedFiles(dir: string): void {
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) continue; // non-markdown files are never touched or reported
    const path = join(dir, name);
    if (name === "_index.md" || name === "_below_floor.md") {
      rmSync(path);
      console.log(`--replace removed: ${name}`);
      continue;
    }
    if (PROTECTED_OUT_FILES.has(name)) {
      console.log(`--replace left in place (protected): ${name}`);
      continue;
    }
    if (fileHasSurveyCorpusSourceType(path)) {
      rmSync(path);
      console.log(`--replace removed: ${name}`);
    } else {
      console.log(`--replace left in place (not survey-corpus generated): ${name}`);
    }
  }
}

export async function segment(opts: SegmentOptions): Promise<SegmentResult> {
  const minCount = opts.minCount ?? 15;
  if (!Number.isInteger(minCount) || minCount <= 0) {
    throw new Error(`--min-count must be a positive integer, got: ${opts.minCount}`);
  }
  if (opts.sampleSize !== undefined) {
    if (!Number.isInteger(opts.sampleSize) || opts.sampleSize <= 0) {
      throw new Error(`--sample-size must be a positive integer, got: ${opts.sampleSize}`);
    }
    if (!opts.sampleReason) {
      throw new Error("--sample-reason is required when --sample-size is given");
    }
  }
  if (opts.surveyId === undefined || opts.surveyId.length === 0) {
    throw new Error(
      "--survey-id is required: it names the survey this export belongs to; give re-exports of the same collection the same ID"
    );
  }
  if (opts.surveyId.startsWith("-")) {
    throw new Error(`--survey-id must not start with "-" (got ${JSON.stringify(opts.surveyId)}) — looks like a dropped flag`);
  }
  if (opts.surveyId.startsWith("sha-")) {
    throw new Error('--survey-id must not start with "sha-" — that prefix is reserved');
  }
  if (opts.surveyId.length > 64) {
    throw new Error(`--survey-id must be 64 characters or fewer, got ${opts.surveyId.length}`);
  }
  if (!/^[A-Za-z0-9._-]+$/.test(opts.surveyId)) {
    throw new Error('--survey-id may only contain letters, digits, ".", "_" and "-"');
  }

  if (!existsSync(opts.input)) {
    throw new Error(`STOP_ASK: input file not found: ${opts.input}`);
  }
  const raw = readFileSync(opts.input);
  const wb = loadWorkbook(opts.input, opts.sheet);
  const sourceSha256 = createHash("sha256").update(raw).digest("hex");
  // ruling A (final check, 2026-09-27): --survey-id is required, not defaulted from the export
  // hash — a hash default let an undeclared re-export of the same survey count as a second
  // survey and release the single-survey hold. The researcher names the survey; re-exports of
  // the same collection get the same ID, separate waves or channels get their own.
  const surveyId = opts.surveyId;

  const { headers, parsedRows, cellText, chosenSheet, date1904 } = wb;

  const textColIdx = findColIndex(headers, opts.textCol, "--text-col");
  const groupColIdx = findColIndex(headers, opts.groupCol, "--group-col");
  const parentColIdx = opts.parentCol ? findColIndex(headers, opts.parentCol, "--parent-col") : -1;
  const idColIdx = opts.idCol ? findColIndex(headers, opts.idCol, "--id-col") : -1;
  const dateColIdx = opts.dateCol ? findColIndex(headers, opts.dateCol, "--date-col") : -1;
  const scoreColIdx = opts.scoreCol ? findColIndex(headers, opts.scoreCol, "--score-col") : -1;
  const respondentColIdx = opts.respondentCol ? findColIndex(headers, opts.respondentCol, "--respondent-col") : -1;

  const rows: Row[] = [];
  const seenIds = new Map<string, number>();
  const rowsScanned = parsedRows.length - 1;

  for (let ri = 1; ri < parsedRows.length; ri++) {
    const pr = parsedRows[ri];
    const cellAt = (idx: number) => pr.cells.find((c) => c.col === idx);
    const rawText = cellText(cellAt(textColIdx));
    const hasText = rawText.trim().length > 0;

    // ID assignment happens for every row, before any grouping or sampling filter,
    // so an ID never depends on whether the row survives sampling.
    let idValue: string | null;
    if (idColIdx !== -1) {
      const idText = cellText(cellAt(idColIdx)).trim();
      if (idText.length === 0) {
        if (hasText) {
          throw new Error(`blank cell in --id-col at sheet row ${pr.rowNumber}`);
        }
        idValue = null;
      } else {
        if (/[\]|\n\r]/.test(idText)) {
          throw new Error(`--id-col value at sheet row ${pr.rowNumber} contains a disallowed character ("]", "|" or a newline): "${idText}"`);
        }
        if (seenIds.has(idText)) {
          throw new Error(`duplicate ID "${idText}" in --id-col at sheet rows ${seenIds.get(idText)} and ${pr.rowNumber}`);
        }
        seenIds.set(idText, pr.rowNumber);
        idValue = idText;
      }
    } else {
      idValue = `r${pr.rowNumber}`;
    }

    if (!hasText) continue; // blank-text rows are skipped and not counted

    const verbatim = rawText.replace(/\r\n|\r|\n/g, " ").trim();
    const group = cellText(cellAt(groupColIdx)).replace(/\s+/g, " ").trim();
    const parent = parentColIdx !== -1 ? cellText(cellAt(parentColIdx)).trim() : null;

    let date: string | null = null;
    if (dateColIdx !== -1) {
      const dCell = cellAt(dateColIdx);
      const dText = cellText(dCell);
      const isNumericCell = dCell !== undefined && dCell.type !== "s" && dCell.type !== "inlineStr";
      if (isNumericCell && dText.trim() !== "" && !Number.isNaN(Number(dText))) {
        date = excelSerialToIso(Number(dText), date1904);
      } else {
        date = dText.trim() || null;
      }
    }

    let score: string | null = null;
    if (scoreColIdx !== -1) {
      const sText = cellText(cellAt(scoreColIdx)).trim();
      score = sText.length ? normalizeNumericString(sText) : null;
    }

    let respondent: string | null = null;
    if (respondentColIdx !== -1) {
      const respRaw = cellText(cellAt(respondentColIdx)).trim();
      if (respRaw.length > 0) {
        if (looksLikeRawPersonalData(respRaw)) {
          throw new Error(`--respondent-col value at sheet row ${pr.rowNumber} looks like raw personal data (refused)`);
        }
        if (hasRowSuffixLikeChars(respRaw)) {
          throw new Error(`--respondent-col value at sheet row ${pr.rowNumber} contains "(" or ")", which would be indistinguishable from a row-line suffix once written (refused)`);
        }
        respondent = respRaw;
      }
    }

    rows.push({ sheetRow: pr.rowNumber, id: idValue!, text: verbatim, group, parent, date, score, respondent });
  }

  if (rows.length === 0) {
    throw new Error(`no rows have text in --text-col "${opts.textCol}"; refusing to write an empty corpus`);
  }

  const blankTextSkipped = rowsScanned - rows.length;

  // group rows by category, preserving first-appearance order (which follows sheet row order);
  // a blank category cell groups under the literal category name "(blank)", flagged with a count.
  const categories = new Map<string, Row[]>();
  let blankCategoryRows = 0;
  for (const r of rows) {
    const key = r.group === "" ? "(blank)" : r.group;
    if (r.group === "") blankCategoryRows++;
    if (!categories.has(key)) categories.set(key, []);
    categories.get(key)!.push(r);
  }
  if (blankCategoryRows > 0) {
    console.error(`Warning: ${blankCategoryRows} row(s) had a blank category; grouped under "(blank)".`);
  }

  const kept: CategoryPlan[] = [];
  const belowFloor: CategoryPlan[] = [];

  for (const [category, catRows] of categories) {
    const rowsInCategory = catRows.length;
    const parent = catRows[0]?.parent ?? null;
    if (rowsInCategory < minCount) {
      belowFloor.push({ category, parent, rowsInCategory, rowsWritten: catRows, sampled: false });
      continue;
    }
    let rowsWritten = catRows;
    let sampled = false;
    let sampleN: number | undefined;
    if (opts.sampleSize !== undefined && rowsInCategory > opts.sampleSize) {
      const sampledRows = seededSample(catRows, opts.sampleSize, 42);
      sampledRows.sort((a, b) => a.sheetRow - b.sheetRow);
      rowsWritten = sampledRows;
      sampled = true;
      sampleN = opts.sampleSize;
    }
    kept.push({ category, parent, rowsInCategory, rowsWritten, sampled, sampleN });
  }

  const generated = new Date().toISOString();
  mkdirSync(opts.out, { recursive: true });
  // Dotfiles (e.g. a stray .DS_Store) do not count as occupying the directory.
  const existingOutFiles = readdirSync(opts.out).filter((f) => !f.startsWith("."));
  if (existingOutFiles.length > 0) {
    if (!opts.replace) {
      throw new Error(
        `--out ${opts.out} is not empty; refusing to write into it. Pass --replace to delete only _index.md, ` +
          `_below_floor.md, and any .md file whose own frontmatter has source_type: "survey-corpus" (this tool's ` +
          `category files) — every other file, including _read_decision.md, _consolidation_log.md and any ` +
          `hand-written .md file, is left in place and named on the way out — or choose an empty directory.`
      );
    }
    clearGeneratedFiles(opts.out);
  }

  const usedFilenames = new Set<string>();
  function assignFilename(category: string): string {
    const base = slugify(category);
    let name = `${base}.md`;
    let n = 2;
    while (usedFilenames.has(name)) {
      name = `${base}-${n}.md`;
      n++;
    }
    usedFilenames.add(name);
    return name;
  }

  const categoriesWritten: SegmentResult["categoriesWritten"] = [];

  for (const plan of kept) {
    const filename = assignFilename(plan.category);
    plan.filename = filename;

    const respStatus = respondentStatus(plan.rowsWritten, respondentColIdx !== -1);

    const fieldsBase: Array<[string, string | number | null | undefined]> = [
      ["source_type", "survey-corpus"],
      ["source_file", pathBasename(opts.input)],
      ["source_sha256", sourceSha256],
      ["survey_id", surveyId],
      ["sheet", chosenSheet.name],
      ["text_col", opts.textCol],
      ["group_col", opts.groupCol],
      ["question_text", opts.question ?? null],
      ["category", plan.category],
    ];
    if (opts.parentCol) fieldsBase.push(["parent_category", plan.parent]);
    fieldsBase.push(["coding_provenance", opts.codingProvenance]);
    fieldsBase.push(["rows_in_category", plan.rowsInCategory]);
    fieldsBase.push(["rows_in_file", plan.rowsWritten.length]);
    if (plan.sampled) {
      fieldsBase.push(["sampling", "sampled"]);
      fieldsBase.push(["sample_n", plan.sampleN!]);
      fieldsBase.push(["seed", 42]);
      fieldsBase.push(["sampling_reason", opts.sampleReason!]);
    } else {
      fieldsBase.push(["sampling", "census"]);
    }
    fieldsBase.push(["id_scheme", opts.idCol ? "source-id" : "sheet-row"]);
    fieldsBase.push(["respondent_id", respStatus.status]);
    if (respStatus.status === "partial") fieldsBase.push(["respondent_ids_missing", respStatus.missing]);
    if (opts.scoreCol) fieldsBase.push(["score_col", opts.scoreCol]);
    fieldsBase.push(["date_range", opts.dateCol ? dateRangeOf(plan.rowsWritten) : null]);
    // rows_start_line is filled in below, once the surrounding line count is known;
    // the placeholder here does not change the line count once replaced.
    fieldsBase.push(["rows_start_line", 0]);
    fieldsBase.push(["generated", generated]);

    const placeholderLines = buildFrontmatterLines(fieldsBase);
    const rowsStartLine = placeholderLines.length + 1;
    const finalFields = fieldsBase.map(([k, v]) =>
      k === "rows_start_line" ? ([k, rowsStartLine] as [string, number]) : ([k, v] as [string, typeof v])
    );
    const frontmatterLines = buildFrontmatterLines(finalFields);

    const rowLines = plan.rowsWritten.map(rowLine);
    const content = [...frontmatterLines, ...rowLines].join("\n") + "\n";
    writeFileSync(join(opts.out, filename), content, "utf8");

    categoriesWritten.push({
      category: plan.category,
      file: filename,
      rowsInCategory: plan.rowsInCategory,
      rowsInFile: plan.rowsWritten.length,
      sampled: plan.sampled,
    });
  }

  // _below_floor.md: one shared file, one "### <category>" section per below-floor category.
  // rows_start_line cannot be a single frontmatter number here (there are many row-blocks in
  // one file), so each section instead carries its own start line as an HTML comment
  // immediately after its heading: "<!-- rows_start_line: N -->".
  let belowFloorFile: string | null = null;
  if (belowFloor.length > 0) {
    const allBFRows = belowFloor.flatMap((p) => p.rowsWritten);
    const bfRespStatus = respondentStatus(allBFRows, respondentColIdx !== -1);

    const fieldsBF: Array<[string, string | number | null | undefined]> = [
      ["source_type", "survey-corpus"],
      ["source_file", pathBasename(opts.input)],
      ["source_sha256", sourceSha256],
      ["survey_id", surveyId],
      ["sheet", chosenSheet.name],
      ["text_col", opts.textCol],
      ["group_col", opts.groupCol],
      ["question_text", opts.question ?? null],
      ["coding_provenance", opts.codingProvenance],
      ["id_scheme", opts.idCol ? "source-id" : "sheet-row"],
      ["respondent_id", bfRespStatus.status],
    ];
    if (bfRespStatus.status === "partial") fieldsBF.push(["respondent_ids_missing", bfRespStatus.missing]);
    if (opts.scoreCol) fieldsBF.push(["score_col", opts.scoreCol]);
    fieldsBF.push([
      "rows_start_line",
      "see-per-section: each ### heading is followed by an HTML comment <!-- rows_start_line: N --> giving that section's first row line number",
    ]);
    fieldsBF.push(["generated", generated]);

    const headerLines = buildFrontmatterLines(fieldsBF);
    const bodyLines: string[] = [];
    let cursor = headerLines.length; // number of lines used so far (0-based count)
    for (const plan of belowFloor) {
      bodyLines.push(`### ${plan.category}`);
      cursor += 1;
      const rowsStart = cursor + 2; // + comment line + first row line
      bodyLines.push(`<!-- rows_start_line: ${rowsStart} -->`);
      cursor += 1;
      for (const r of plan.rowsWritten) {
        bodyLines.push(rowLine(r));
        cursor += 1;
      }
      bodyLines.push("");
      cursor += 1;
    }
    const content = [...headerLines, ...bodyLines].join("\n") + "\n";
    belowFloorFile = "_below_floor.md";
    writeFileSync(join(opts.out, belowFloorFile), content, "utf8");
  }

  // _index.md
  const indexLines: string[] = [];
  indexLines.push("# Index");
  indexLines.push("");
  indexLines.push(`source_file: ${pathBasename(opts.input)}`);
  indexLines.push(`source_sha256: ${sourceSha256}`);
  indexLines.push(`survey_id: ${surveyId}`);
  indexLines.push(`generated: ${generated}`);
  indexLines.push("");
  indexLines.push(`Read decision: see _read_decision.md (the "sampling" column says only whether all rows were written).`);
  indexLines.push("");
  indexLines.push("| Category | Rows in category | Rows in file | Sampling | File |");
  indexLines.push("|---|---|---|---|---|");
  for (const plan of kept) {
    const sampling = plan.sampled ? `sampled (n=${plan.sampleN})` : "census";
    indexLines.push(
      `| ${escapeTableCell(plan.category)} | ${plan.rowsInCategory} | ${plan.rowsWritten.length} | ${sampling} | ${plan.filename} |`
    );
  }
  if (belowFloor.length > 0) {
    indexLines.push("");
    indexLines.push(`## Below floor (< ${minCount} rows) — see ${belowFloorFile}`);
    indexLines.push("");
    indexLines.push("| Category | Rows in category |");
    indexLines.push("|---|---|");
    for (const plan of belowFloor) {
      indexLines.push(`| ${escapeTableCell(plan.category)} | ${plan.rowsInCategory} |`);
    }
  }
  writeFileSync(join(opts.out, "_index.md"), indexLines.join("\n") + "\n", "utf8");

  const belowFloorRows = belowFloor.reduce((s, p) => s + p.rowsInCategory, 0);
  const rowsWritten = kept.reduce((s, p) => s + p.rowsWritten.length, 0);

  return {
    categoriesWritten,
    belowFloor: belowFloor.map((p) => ({ category: p.category, rowsInCategory: p.rowsInCategory })),
    indexFile: "_index.md",
    belowFloorFile,
    rowsScanned,
    rowsWritten,
    blankTextSkipped,
    belowFloorRows,
    blankCategoryRows,
  };
}

// ---------------------------------------------------------------------------
// public API: inspectSurvey() (--inspect: writes nothing)
// ---------------------------------------------------------------------------

export interface InspectOptions {
  input: string;
  sheet?: string;
  textCol?: string;
  groupCol?: string;
}

export interface HeaderInfo {
  letter: string;
  name: string;
  nonBlankCount: number;
}

export interface LongestRow {
  sheetRow: number;
  length: number;
  preview: string;
  flags: string[];
}

export interface InspectResult {
  sheetNames: string[];
  chosenSheet: string;
  rowCount: number;
  headers: HeaderInfo[];
  duplicateHeaderNames: string[];
  blankHeaderColumns: string[];
  likelyOpenTextColumns: string[];
  group: {
    categories: number;
    minRows: number;
    medianRows: number;
    maxRows: number;
    blankCategoryRows: number;
    textFiltered: boolean; // true when counts exclude blank-text rows (--text-col was also given)
  } | null;
  text: { meanChars: number; medianChars: number; longestRows: LongestRow[]; duplicateVerbatims: number } | null;
}

export function inspectSurvey(opts: InspectOptions): InspectResult {
  const wb = loadWorkbook(opts.input, opts.sheet);
  const dataRows = wb.parsedRows.slice(1);

  const headers: HeaderInfo[] = wb.headers.map((name, i) => {
    const nonBlankCount = dataRows.filter((r) => wb.cellText(r.cells.find((c) => c.col === i)).trim().length > 0).length;
    return { letter: indexToColLetter(i), name, nonBlankCount };
  });

  const nameCounts = new Map<string, number>();
  for (const h of headers) if (h.name) nameCounts.set(h.name, (nameCounts.get(h.name) ?? 0) + 1);
  const duplicateHeaderNames = [...nameCounts.entries()].filter(([, c]) => c > 1).map(([n]) => n);
  const blankHeaderColumns = headers.filter((h) => h.name === "").map((h) => h.letter);

  const likelyOpenTextColumns: string[] = [];
  for (let i = 0; i < wb.headers.length; i++) {
    const lens = dataRows
      .map((r) => wb.cellText(r.cells.find((c) => c.col === i)).trim())
      .filter((t) => t.length > 0)
      .map((t) => t.length);
    if (lens.length > 0 && median(lens) > 40) {
      likelyOpenTextColumns.push(wb.headers[i] || `column ${indexToColLetter(i)}`);
    }
  }

  let group: InspectResult["group"] = null;
  if (opts.groupCol !== undefined) {
    const groupIdx = findColIndex(wb.headers, opts.groupCol, "--group-col");
    // When --text-col is also given, category counts match segmentation: a row with no text
    // is skipped and never counted into any category (blank or otherwise).
    const textIdx = opts.textCol !== undefined ? findColIndex(wb.headers, opts.textCol, "--text-col") : -1;
    const counts = new Map<string, number>();
    let blankCategoryRows = 0;
    for (const r of dataRows) {
      if (textIdx !== -1) {
        const hasText = wb.cellText(r.cells.find((c) => c.col === textIdx)).trim().length > 0;
        if (!hasText) continue;
      }
      const val = wb.cellText(r.cells.find((c) => c.col === groupIdx)).replace(/\s+/g, " ").trim();
      if (val === "") {
        blankCategoryRows++;
        continue;
      }
      counts.set(val, (counts.get(val) ?? 0) + 1);
    }
    const sizes = [...counts.values()];
    group = {
      categories: counts.size,
      minRows: sizes.length ? Math.min(...sizes) : 0,
      medianRows: median(sizes),
      maxRows: sizes.length ? Math.max(...sizes) : 0,
      blankCategoryRows,
      textFiltered: textIdx !== -1,
    };
  }

  let text: InspectResult["text"] = null;
  if (opts.textCol !== undefined) {
    const textIdx = findColIndex(wb.headers, opts.textCol, "--text-col");
    const entries = dataRows
      .map((r) => ({ sheetRow: r.rowNumber, raw: wb.cellText(r.cells.find((c) => c.col === textIdx)).trim() }))
      .filter((e) => e.raw.length > 0);
    const lens = entries.map((e) => e.raw.length);
    const meanChars = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
    const medianChars = median(lens);
    const sorted = [...entries].sort((a, b) => b.raw.length - a.raw.length);
    const longestRows: LongestRow[] = sorted.slice(0, 10).map((e) => {
      const flags: string[] = [];
      if (e.raw.includes("[truncated]")) flags.push("contains [truncated]");
      const lastChar = e.raw.slice(-1);
      if (!/[.!?"'”)\]]/.test(lastChar)) flags.push("no terminal punctuation");
      return { sheetRow: e.sheetRow, length: e.raw.length, preview: e.raw.slice(0, 80), flags };
    });
    const textCounts = new Map<string, number>();
    for (const e of entries) textCounts.set(e.raw, (textCounts.get(e.raw) ?? 0) + 1);
    let duplicateVerbatims = 0;
    for (const c of textCounts.values()) if (c > 1) duplicateVerbatims += c - 1;
    text = { meanChars, medianChars, longestRows, duplicateVerbatims };
  }

  return {
    sheetNames: wb.sheetList.map((s) => s.name),
    chosenSheet: wb.chosenSheet.name,
    rowCount: dataRows.length,
    headers,
    duplicateHeaderNames,
    blankHeaderColumns,
    likelyOpenTextColumns,
    group,
    text,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const BOOLEAN_FLAGS = new Set(["replace", "inspect", "help"]);

function parseArgsCli(argv: string[]): SegmentOptions {
  let input: string | undefined;
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      if (BOOLEAN_FLAGS.has(key)) {
        args.set(key, "true");
        continue;
      }
      const val = argv[i + 1];
      if (val === undefined) throw new Error(`flag --${key} requires a value`);
      args.set(key, val);
      i++;
    } else if (input === undefined) {
      input = a;
    } else {
      throw new Error(`unexpected extra argument: ${a}`);
    }
  }
  if (input === undefined) throw new Error("STOP_ASK: missing input .xlsx path");

  function req(name: string): string {
    const v = args.get(name);
    if (v === undefined) throw new Error(`missing required flag --${name}`);
    return v;
  }

  const provenance = req("coding-provenance");
  if (provenance !== "platform-applied" && provenance !== "researcher-imposed") {
    throw new Error('--coding-provenance must be "platform-applied" or "researcher-imposed"');
  }

  return {
    input,
    sheet: args.get("sheet"),
    textCol: req("text-col"),
    groupCol: req("group-col"),
    parentCol: args.get("parent-col"),
    idCol: args.get("id-col"),
    dateCol: args.get("date-col"),
    scoreCol: args.get("score-col"),
    respondentCol: args.get("respondent-col"),
    minCount: args.has("min-count") ? Number(args.get("min-count")) : 15,
    sampleSize: args.has("sample-size") ? Number(args.get("sample-size")) : undefined,
    sampleReason: args.get("sample-reason"),
    codingProvenance: provenance,
    question: args.get("question"),
    out: req("out"),
    replace: args.has("replace"),
    surveyId: req("survey-id"),
  };
}

function printHelp(): void {
  console.log(`Usage:
  bun SegmentSurvey.ts EXPORT.xlsx --text-col C --group-col G --coding-provenance <platform-applied|researcher-imposed> --survey-id ID --out DIR [options]
  bun SegmentSurvey.ts EXPORT.xlsx --inspect [--sheet S] [--text-col C] [--group-col G]

Options:
  --sheet S            sheet name or 1-based index (default: first sheet)
  --parent-col C       optional parent-category column
  --id-col C           optional stable-ID column (default: sheet-row IDs)
  --date-col C         optional date column
  --score-col C        optional numeric score column
  --respondent-col C   optional respondent-ID column
  --min-count N        category floor, positive integer (default 15)
  --sample-size N      sample size per category, positive integer (default: census)
  --sample-reason R    required with --sample-size
  --question Q         question text recorded in frontmatter
  --survey-id ID       REQUIRED. Stable survey identifier written into every corpus file's
                        frontmatter — names the survey this export belongs to; give re-exports
                        of the same collection the same ID, and separate waves or channel
                        exports their own. May not start with "-" or "sha-" (reserved).
                        Not required with --inspect.
  --replace            clear previously generated files in --out before writing
  --inspect            print corpus diagnostics for --text-col / --group-col; writes nothing
  --help               print this message and exit 0`);
}

function printInspect(r: InspectResult): void {
  console.log(`Sheets: ${r.sheetNames.join(", ")}`);
  console.log(`Chosen sheet: ${r.chosenSheet}`);
  console.log(`Row count: ${r.rowCount}`);
  console.log("Headers:");
  for (const h of r.headers) console.log(`  ${h.letter}: ${h.name || "(blank)"} — ${h.nonBlankCount} non-blank`);
  if (r.duplicateHeaderNames.length) console.log(`Duplicate headers: ${r.duplicateHeaderNames.join(", ")}`);
  if (r.blankHeaderColumns.length) console.log(`Blank headers at columns: ${r.blankHeaderColumns.join(", ")}`);
  if (r.likelyOpenTextColumns.length) console.log(`Likely open-text columns: ${r.likelyOpenTextColumns.join(", ")}`);
  if (r.group) {
    const rowsLabel = r.group.textFiltered ? "non-blank-text rows per category" : "rows per category";
    console.log(`Categories: ${r.group.categories} (min ${r.group.minRows}, median ${r.group.medianRows}, max ${r.group.maxRows} ${rowsLabel})`);
    console.log(`Blank-category rows: ${r.group.blankCategoryRows}`);
  }
  if (r.text) {
    console.log(`Text length: mean ${r.text.meanChars.toFixed(1)}, median ${r.text.medianChars} characters per non-blank row`);
    console.log(`Duplicate exact verbatims: ${r.text.duplicateVerbatims}`);
    console.log("10 longest rows:");
    for (const row of r.text.longestRows) {
      const flagStr = row.flags.length ? ` [${row.flags.join("; ")}]` : "";
      console.log(`  sheet row ${row.sheetRow}, ${row.length} chars: "${row.preview}"${flagStr}`);
    }
  }
}

async function mainCli() {
  const argv = process.argv.slice(2);

  if (argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  if (argv.includes("--inspect")) {
    let input: string | undefined;
    const args = new Map<string, string>();
    for (let i = 0; i < argv.length; i++) {
      const a = argv[i];
      if (a === "--inspect") continue;
      if (a.startsWith("--")) {
        const key = a.slice(2);
        const val = argv[i + 1];
        if (val === undefined) throw new Error(`flag --${key} requires a value`);
        args.set(key, val);
        i++;
      } else if (input === undefined) {
        input = a;
      }
    }
    if (input === undefined) throw new Error("STOP_ASK: missing input .xlsx path");
    const result = inspectSurvey({ input, sheet: args.get("sheet"), textCol: args.get("text-col"), groupCol: args.get("group-col") });
    printInspect(result);
    return;
  }

  const opts = parseArgsCli(argv);
  const result = await segment(opts);
  console.log(`Rows scanned: ${result.rowsScanned}`);
  console.log(`Rows written: ${result.rowsWritten}`);
  console.log(`Blank-text rows skipped: ${result.blankTextSkipped}`);
  console.log(`Below-floor rows: ${result.belowFloorRows}`);
  console.log(`Blank-category rows: ${result.blankCategoryRows}`);
  const parts = [`${result.categoriesWritten.length} category file(s)`, "_index.md"];
  if (result.belowFloorFile) parts.push(result.belowFloorFile);
  console.log(`Wrote ${parts.join(" + ")} to ${opts.out}`);
}

if (import.meta.main) {
  mainCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
