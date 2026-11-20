// Test-only helper: builds a minimal valid .xlsx file (a ZIP archive of OOXML parts)
// entirely in memory from text, so tests never depend on committed binary files.
//
// Supports:
//   - stored (method 0) and deflated (method 8, node:zlib deflateRawSync) ZIP entries
//   - CRC32 via Bun.hash.crc32
//   - inline-string cells (t="inlineStr") and shared-string cells (t="s", with sharedStrings.xml)
//   - multiple sheets in a chosen order
//   - a low-level "raw parts" builder for tests that need hand-crafted XML
//     (e.g. numeric XML entities, malformed rows, unsupported compression methods)

import { deflateRawSync } from "node:zlib";

export type XlsxCell = string | number | null;

export interface XlsxSheetSpec {
  name: string;
  // rows[i] is an array of cell values for the row; column A is index 0
  rows: XlsxCell[][];
  // optional explicit sheet row numbers (1-based) for each entry in rows;
  // defaults to 1, 2, 3, ... in order
  rowNumbers?: number[];
}

export interface BuildXlsxOptions {
  sheets: XlsxSheetSpec[];
  // shared-string mode (t="s") vs inline strings (t="inlineStr"); default true
  sharedStrings?: boolean;
  // ZIP compression method applied to every entry; default deflate (8)
  method?: 0 | 8;
  // legacy Mac 1904 date system (<workbookPr date1904="1"/>); default false
  date1904?: boolean;
}

export interface RawPart {
  path: string;
  data: string | Uint8Array;
  method?: 0 | 8;
}

export interface ZipEntryInput {
  name: string;
  data: Uint8Array;
  method: 0 | 8;
}

// ---------------------------------------------------------------------------
// low-level ZIP writer
// ---------------------------------------------------------------------------

function u16(n: number): Uint8Array {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n >>> 0, true);
  return b;
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

// arbitrary fixed DOS date/time (2026-01-01 00:00:00); readers must not depend on it
const DOS_TIME = 0;
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;

export function crc32(data: Uint8Array): number {
  return Bun.hash.crc32(data) >>> 0;
}

export function buildZip(entries: ZipEntryInput[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name);
    const uncompressedSize = entry.data.length;
    const compressed = entry.method === 8 ? new Uint8Array(deflateRawSync(entry.data)) : entry.data;
    const crc = crc32(entry.data);

    const localHeader = concatBytes([
      u32(0x04034b50),
      u16(20), // version needed to extract
      u16(0), // flags
      u16(entry.method),
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(crc),
      u32(compressed.length),
      u32(uncompressedSize),
      u16(nameBytes.length),
      u16(0), // extra field length
      nameBytes,
    ]);
    const localOffset = offset;
    localParts.push(localHeader, compressed);
    offset += localHeader.length + compressed.length;

    const centralHeader = concatBytes([
      u32(0x02014b50),
      u16(20), // version made by
      u16(20), // version needed to extract
      u16(0), // flags
      u16(entry.method),
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(crc),
      u32(compressed.length),
      u32(uncompressedSize),
      u16(nameBytes.length),
      u16(0), // extra field length
      u16(0), // comment length
      u16(0), // disk number start
      u16(0), // internal attrs
      u32(0), // external attrs
      u32(localOffset),
      nameBytes,
    ]);
    centralParts.push(centralHeader);
  }

  const centralDir = concatBytes(centralParts);
  const cdOffset = offset;
  const eocd = concatBytes([
    u32(0x06054b50),
    u16(0), // disk number
    u16(0), // disk with central dir start
    u16(entries.length),
    u16(entries.length),
    u32(centralDir.length),
    u32(cdOffset),
    u16(0), // comment length
  ]);

  return concatBytes([...localParts, centralDir, eocd]);
}

export function buildXlsxRaw(parts: RawPart[], defaultMethod: 0 | 8 = 8): Uint8Array {
  const entries: ZipEntryInput[] = parts.map((p) => ({
    name: p.path,
    data: typeof p.data === "string" ? new TextEncoder().encode(p.data) : p.data,
    method: p.method ?? defaultMethod,
  }));
  return buildZip(entries);
}

// ---------------------------------------------------------------------------
// OOXML part builders
// ---------------------------------------------------------------------------

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function colLetter(n: number): string {
  // n is a 1-based column index
  let s = "";
  let x = n;
  while (x > 0) {
    const rem = (x - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

export function contentTypesXml(sheetCount: number, sharedStrings: boolean): string {
  const overrides: string[] = [
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>`,
  ];
  for (let i = 1; i <= sheetCount; i++) {
    overrides.push(
      `<Override PartName="/xl/worksheets/sheet${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    );
  }
  if (sharedStrings) {
    overrides.push(
      `<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>`
    );
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${overrides.join("")}</Types>`;
}

export function rootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
}

export function workbookXml(sheetNames: string[], opts: { date1904?: boolean } = {}): string {
  const sheets = sheetNames
    .map((name, i) => `<sheet name="${escapeXml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
    .join("");
  const workbookPr = opts.date1904 ? `<workbookPr date1904="1"/>` : "";
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${workbookPr}<sheets>${sheets}</sheets></workbook>`;
}

export function workbookRelsXml(sheetCount: number, sharedStrings: boolean): string {
  const rels: string[] = [];
  for (let i = 1; i <= sheetCount; i++) {
    rels.push(
      `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i}.xml"/>`
    );
  }
  if (sharedStrings) {
    rels.push(
      `<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>`
    );
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join("")}</Relationships>`;
}

export function sharedStringsXml(strings: string[]): string {
  const items = strings.map((s) => `<si><t xml:space="preserve">${escapeXml(s)}</t></si>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">${items}</sst>`;
}

export function buildSheetXml(
  rows: XlsxCell[][],
  opts: { rowNumbers?: number[]; sharedStringIndex?: Map<string, number> | null } = {}
): string {
  const rowNumbers = opts.rowNumbers ?? rows.map((_, i) => i + 1);
  const shared = opts.sharedStringIndex ?? null;
  const rowXml = rows
    .map((row, rIdx) => {
      const rn = rowNumbers[rIdx];
      const cells = row
        .map((cell, cIdx) => {
          if (cell === null || cell === undefined) return "";
          const ref = `${colLetter(cIdx + 1)}${rn}`;
          if (typeof cell === "number") {
            return `<c r="${ref}"><v>${cell}</v></c>`;
          }
          if (shared) {
            let idx = shared.get(cell);
            if (idx === undefined) {
              idx = shared.size;
              shared.set(cell, idx);
            }
            return `<c r="${ref}" t="s"><v>${idx}</v></c>`;
          }
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rn}">${cells}</row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`;
}

// ---------------------------------------------------------------------------
// top-level convenience builder
// ---------------------------------------------------------------------------

export function buildXlsx(opts: BuildXlsxOptions): Uint8Array {
  const sharedStrings = opts.sharedStrings ?? true;
  const method = opts.method ?? 8;
  const sharedIndex = sharedStrings ? new Map<string, number>() : null;

  // sheet XML is built first; this populates sharedIndex, in first-appearance order,
  // across sheets in the order given
  const sheetXmls = opts.sheets.map((s) =>
    buildSheetXml(s.rows, { rowNumbers: s.rowNumbers, sharedStringIndex: sharedIndex })
  );

  const parts: RawPart[] = [
    { path: "[Content_Types].xml", data: contentTypesXml(opts.sheets.length, sharedStrings) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(opts.sheets.map((s) => s.name), { date1904: opts.date1904 }) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(opts.sheets.length, sharedStrings) },
  ];
  opts.sheets.forEach((_, i) => {
    parts.push({ path: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXmls[i] });
  });
  if (sharedIndex) {
    const strings = Array.from(sharedIndex.keys());
    parts.push({ path: "xl/sharedStrings.xml", data: sharedStringsXml(strings) });
  }

  return buildXlsxRaw(parts, method);
}
