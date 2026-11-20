import { describe, expect, test, afterAll } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { segment, inspectSurvey } from "./SegmentSurvey.ts";
import { buildXlsx, buildXlsxRaw, buildSheetXml, contentTypesXml, rootRelsXml, workbookXml, workbookRelsXml, sharedStringsXml } from "./fixtures/xlsx.ts";

const createdDirs: string[] = [];
function tmpDir(): string {
  const d = mkdtempSync(join(tmpdir(), "scp-"));
  createdDirs.push(d);
  return d;
}
afterAll(() => {
  for (const d of createdDirs) rmSync(d, { recursive: true, force: true });
});

function writeFixture(bytes: Uint8Array): string {
  const dir = tmpDir();
  const path = join(dir, "export.xlsx");
  writeFileSync(path, bytes);
  return path;
}

// A small, neutral transit-survey fixture: a library-app-adjacent public-transit theme.
// 20 rows across two categories that clear the default min-count-15 floor is too many to
// hand-write, so most tests use --min-count 1 or 2 to keep fixtures small and readable.
const HEADER = ["Response ID", "Comment", "Topic", "Submitted", "Score"];
function basicRows(): (string | number | null)[][] {
  return [
    HEADER,
    ["r1", "The new bus shelter at Elm stop is a big improvement", "Wait Times", 46023, 9],
    ["r2", "Buses on route 4 are late almost every morning", "Wait Times", 46024, 3],
    ["r3", "", "Wait Times", 46025, 5], // blank text: skipped, not counted
    ["r4", "The transit card reader at the depot froze twice this week", "Card Readers", 46026, 4],
  ];
}

test("segment() reads inline-string cells and writes one file per category at/above min-count", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }], sharedStrings: false });
  const input = writeFixture(bytes);
  const out = tmpDir();
  const result = await segment({
    input,
    textCol: "Comment",
    groupCol: "Topic",
    idCol: "Response ID",
    dateCol: "Submitted",
    scoreCol: "Score",
    minCount: 1,
    surveyId: "test-survey", codingProvenance: "platform-applied",
    out,
  });
  expect(result.categoriesWritten.map((c) => c.category).sort()).toEqual(["Card Readers", "Wait Times"]);
  const waitTimes = readFileSync(join(out, "wait-times.md"), "utf8");
  expect(waitTimes).toContain("[r1] The new bus shelter at Elm stop is a big improvement (date: 2026-01-01) (score: 9)");
  expect(waitTimes).toContain("[r2] Buses on route 4 are late almost every morning (date: 2026-01-02) (score: 3)");
  // the blank-text row (r3) must not appear anywhere
  expect(waitTimes).not.toContain("[r3]");
});

test("segment() reads shared-string cells identically to inline-string cells", async () => {
  const bytesShared = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }], sharedStrings: true });
  const bytesInline = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }], sharedStrings: false });
  const outShared = tmpDir();
  const outInline = tmpDir();
  await segment({ input: writeFixture(bytesShared), textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: outShared });
  await segment({ input: writeFixture(bytesInline), textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: outInline });
  const shared = readFileSync(join(outShared, "wait-times.md"), "utf8").split("\n").filter((l) => l.startsWith("[r"));
  const inline = readFileSync(join(outInline, "wait-times.md"), "utf8").split("\n").filter((l) => l.startsWith("[r"));
  expect(shared).toEqual(inline);
});

test("--sheet by name selects a non-default sheet; data lives on the second sheet", async () => {
  const bytes = buildXlsx({
    sheets: [
      { name: "Cover", rows: [["Notes"], ["see data tab"]] },
      { name: "Data", rows: basicRows() },
    ],
  });
  const input = writeFixture(bytes);
  const out = tmpDir();
  const result = await segment({ input, sheet: "Data", textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  expect(result.categoriesWritten.length).toBe(2);
});

test("default sheet selection (no --sheet) uses the first sheet in workbook order", async () => {
  const bytes = buildXlsx({
    sheets: [
      { name: "Data", rows: basicRows() },
      { name: "Extra", rows: [["Notes"], ["unrelated"]] },
    ],
  });
  const input = writeFixture(bytes);
  const out = tmpDir();
  const result = await segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  expect(result.categoriesWritten.length).toBe(2);
});

test("an unknown --sheet name throws, listing the real available sheets", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Data", rows: basicRows() }] });
  const input = writeFixture(bytes);
  await expect(
    segment({ input, sheet: "Nope", textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/Data/);
});

test("a missing input file throws STOP_ASK:", async () => {
  await expect(
    segment({
      input: "/nonexistent/path/does-not-exist.xlsx",
      textCol: "Comment",
      groupCol: "Topic",
      surveyId: "test-survey", codingProvenance: "platform-applied",
      out: tmpDir(),
    })
  ).rejects.toThrow(/^STOP_ASK:/);
});

test("a named column not present in the real headers throws, listing the real headers", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  const input = writeFixture(bytes);
  await expect(
    segment({ input, textCol: "Not A Real Column", groupCol: "Topic", surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/Response ID.*Comment.*Topic/s);
});

test("a non-positive --min-count throws", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  const input = writeFixture(bytes);
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 0, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/--min-count/);
});

test("a non-numeric --sample-size throws", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  const input = writeFixture(bytes);
  await expect(
    segment({
      input,
      textCol: "Comment",
      groupCol: "Topic",
      minCount: 1,
      sampleSize: NaN,
      sampleReason: "test",
      surveyId: "test-survey", codingProvenance: "platform-applied",
      out: tmpDir(),
    })
  ).rejects.toThrow(/--sample-size/);
});

test("a blank cell in the declared --id-col on a row that has text throws", async () => {
  const rows = [
    HEADER,
    ["", "Has text but no id", "Wait Times", 46023, 5],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/blank cell in --id-col/);
});

test("duplicate IDs in --id-col throws", async () => {
  const rows = [
    HEADER,
    ["dup1", "First comment about wait times", "Wait Times", 46023, 5],
    ["dup1", "Second comment, same id by mistake", "Wait Times", 46024, 5],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/duplicate ID/);
});

test("without --id-col, IDs are sheet-row references (r<N>), never sequential", async () => {
  // row r1 in the fixture sits at sheet row 4 (header=1, then 3 rows before it are skipped
  // because they are placed after it -- here we simply skip a category so IDs are non-sequential)
  const rows = [
    HEADER,
    ["ignored", "Skateboarders keep using the fountain plaza at dusk", "Park Rules", 46023, 6],
    ["ignored", "", "Park Rules", 46024, 6], // blank text row still consumes a sheet row
    ["ignored", "The new picnic shelter is well used on weekends", "Park Rules", 46025, 8],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "park-rules.md"), "utf8");
  // sheet row 2 -> r2, sheet row 4 -> r4 (row 3 was blank and skipped, but still occupied a sheet row)
  expect(content).toContain("[r2] Skateboarders keep using the fountain plaza at dusk");
  expect(content).toContain("[r4] The new picnic shelter is well used on weekends");
  expect(content).not.toMatch(/^\[\d{3}\]/m);
});

test("categories below --min-count are written to _below_floor.md with a heading and a rows_start_line comment per category", async () => {
  const rows = [
    HEADER,
    ["a1", "Only one comment about signage", "Signage", 46023, 5],
    ["a2", "Plenty of comments about wait times, one", "Wait Times", 46023, 5],
    ["a3", "Plenty of comments about wait times, two", "Wait Times", 46024, 5],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  const result = await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 2, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  expect(result.categoriesWritten.map((c) => c.category)).toEqual(["Wait Times"]);
  expect(result.belowFloor.map((c) => c.category)).toEqual(["Signage"]);
  expect(existsSync(join(out, "_below_floor.md"))).toBe(true);
  const bf = readFileSync(join(out, "_below_floor.md"), "utf8");
  expect(bf).toContain("### Signage");
  expect(bf).toMatch(/<!-- rows_start_line: \d+ -->/);
  const lines = bf.split("\n");
  const commentLineIdx = lines.findIndex((l) => l.startsWith("<!-- rows_start_line:"));
  const declaredStart = Number(/rows_start_line: (\d+)/.exec(lines[commentLineIdx])![1]);
  expect(lines[declaredStart - 1]).toContain("[a1] Only one comment about signage");
});

test("_index.md lists every category with total rows, rows in file, sampling status and filename, and points to _below_floor.md", async () => {
  const rows = [
    HEADER,
    ["a1", "Only one comment about signage", "Signage", 46023, 5],
    ["a2", "Plenty of comments about wait times, one", "Wait Times", 46023, 5],
    ["a3", "Plenty of comments about wait times, two", "Wait Times", 46024, 5],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 2, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const index = readFileSync(join(out, "_index.md"), "utf8");
  expect(index).toContain("Wait Times");
  expect(index).toContain("wait-times.md");
  expect(index).toContain("census");
  expect(index).toContain("Signage");
  expect(index).toContain("_below_floor.md");
});

test("two categories that slugify to the same string get distinct filenames, and the index shows both", async () => {
  const rows = [
    HEADER,
    ["a1", "First comment, hyphen variant", "Card Readers", 46023, 5],
    ["a2", "Second comment, hyphen variant", "Card-Readers", 46024, 5],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  const result = await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const files = result.categoriesWritten.map((c) => c.file).sort();
  expect(files).toEqual(["card-readers-2.md", "card-readers.md"]);
  const index = readFileSync(join(out, "_index.md"), "utf8");
  expect(index).toContain("card-readers.md");
  expect(index).toContain("card-readers-2.md");
});

test("census by default: every row in a category is written, and sampling: census is recorded", async () => {
  const rows = [
    HEADER,
    ...Array.from({ length: 20 }, (_, i) => [`a${i}`, `Wait time comment number ${i}`, "Wait Times", 46023 + i, 5] as (string | number)[]),
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "wait-times.md"), "utf8");
  expect(content).toContain("sampling: \"census\"");
  expect(content).toContain("rows_in_file: 20");
  const rowLineCount = content.split("\n").filter((l) => l.startsWith("[a")).length;
  expect(rowLineCount).toBe(20);
});

test("--sample-size below the category count produces a seeded, reproducible sample", async () => {
  const rows = [
    HEADER,
    ...Array.from({ length: 20 }, (_, i) => [`a${i}`, `Wait time comment number ${i}`, "Wait Times", 46023 + i, 5] as (string | number)[]),
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const runOnce = async () => {
    const out = tmpDir();
    await segment({
      input,
      textCol: "Comment",
      groupCol: "Topic",
      idCol: "Response ID",
      minCount: 1,
      sampleSize: 5,
      sampleReason: "keep the test corpus small",
      surveyId: "test-survey", codingProvenance: "platform-applied",
      out,
    });
    return readFileSync(join(out, "wait-times.md"), "utf8");
  };
  const stripGenerated = (s: string) => s.replace(/^generated: .*$/m, "generated: <ts>");
  const a = await runOnce();
  const b = await runOnce();
  expect(stripGenerated(a)).toBe(stripGenerated(b));
  expect(a).toContain("sampling: \"sampled\"");
  expect(a).toContain("sample_n: 5");
  expect(a).toContain('sampling_reason: "keep the test corpus small"');
  const rowLineCount = a.split("\n").filter((l) => l.startsWith("[a")).length;
  expect(rowLineCount).toBe(5);
});

test("item 6 / mutant M7: sampled rows are written back out in sheet-row order, not pick order", async () => {
  const rows = [
    HEADER,
    ...Array.from({ length: 20 }, (_, i) => [`a${i}`, `Wait time comment number ${i}`, "Wait Times", 46023 + i, 5] as (string | number)[]),
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({
    input,
    textCol: "Comment",
    groupCol: "Topic",
    idCol: "Response ID",
    minCount: 1,
    sampleSize: 5,
    sampleReason: "check ordering",
    surveyId: "test-survey", codingProvenance: "platform-applied",
    out,
  });
  const content = readFileSync(join(out, "wait-times.md"), "utf8");
  const ids = [...content.matchAll(/\[a(\d+)\]/g)].map((m) => Number(m[1]));
  expect(ids.length).toBe(5);
  const sorted = [...ids].sort((x, y) => x - y);
  expect(ids).toEqual(sorted); // sheet-row order, regardless of the seeded shuffle's pick order
});

test("--sample-size requires --sample-reason", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  const input = writeFixture(bytes);
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 1, sampleSize: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/--sample-reason/);
});

test("Excel date serials in the date column convert to ISO dates, and date_range is recorded", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", dateCol: "Submitted", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "wait-times.md"), "utf8");
  expect(content).toContain("(date: 2026-01-01)");
  expect(content).toContain("(date: 2026-01-02)");
  expect(content).toMatch(/date_range: "2026-01-01 to 2026-01-02"/);
});

test("score column values appear in the body as (score: X)", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", scoreCol: "Score", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "wait-times.md"), "utf8");
  expect(content).toContain("(score: 9)");
  expect(content).toContain("(score: 3)");
});

test("rows_start_line in the frontmatter correctly locates the first row line; row k sits at rows_start_line + k - 1", async () => {
  const rows = [
    HEADER,
    ["a1", "First wait times comment", "Wait Times", 46023, 5],
    ["a2", "Second wait times comment", "Wait Times", 46024, 5],
    ["a3", "Third wait times comment", "Wait Times", 46025, 5],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "wait-times.md"), "utf8");
  const lines = content.split("\n");
  const m = /rows_start_line: (\d+)/.exec(content);
  expect(m).not.toBeNull();
  const start = Number(m![1]);
  expect(lines[start - 1]).toContain("[a1] First wait times comment");
  expect(lines[start - 1 + 1]).toContain("[a2] Second wait times comment");
  expect(lines[start - 1 + 2]).toContain("[a3] Third wait times comment");
});

test("rows_in_file equals the number of row lines actually written", async () => {
  const rows = [
    HEADER,
    ["a1", "First wait times comment", "Wait Times", 46023, 5],
    ["a2", "", "Wait Times", 46024, 5], // blank, not counted
    ["a3", "Second wait times comment", "Wait Times", 46025, 5],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "wait-times.md"), "utf8");
  const rowLineCount = content.split("\n").filter((l) => l.startsWith("[a")).length;
  const m = /rows_in_file: (\d+)/.exec(content);
  expect(Number(m![1])).toBe(rowLineCount);
  expect(rowLineCount).toBe(2);
});

test("respondent_id is present only when --respondent-col is given", async () => {
  const rows = [HEADER.concat("Respondent"), ["a1", "A comment about wait times", "Wait Times", 46023, 5, "resp-1"]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const outWith = tmpDir();
  const outWithout = tmpDir();
  await segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", respondentCol: "Respondent", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: outWith });
  await segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: outWithout });
  expect(readFileSync(join(outWith, "wait-times.md"), "utf8")).toContain('respondent_id: "present"');
  expect(readFileSync(join(outWithout, "wait-times.md"), "utf8")).toContain('respondent_id: "absent"');
});

test("numeric XML entities in a cell decode correctly (e.g. an apostrophe written as &#39;)", async () => {
  // hand-build the sheet XML with a raw numeric entity, bypassing the fixture's escapeXml helper
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Response ID</t></is></c><c r="B1" t="inlineStr"><is><t>Comment</t></is></c><c r="C1" t="inlineStr"><is><t>Topic</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>a1</t></is></c><c r="B2" t="inlineStr"><is><t>The station&#39;s new sign uses &amp; instead of &quot;and&quot;</t></is></c><c r="C2" t="inlineStr"><is><t>Signage</t></is></c></row></sheetData></worksheet>`;
  const bytes = buildXlsxRaw([
    { path: "[Content_Types].xml", data: contentTypesXml(1, false) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(["Sheet1"]) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(1, false) },
    { path: "xl/worksheets/sheet1.xml", data: sheetXml },
  ]);
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "signage.md"), "utf8");
  expect(content).toContain(`The station's new sign uses & instead of "and"`);
});

test("internal newlines in a verbatim are collapsed to spaces", async () => {
  const rows = [HEADER, ["a1", "Line one\nLine two\r\nLine three", "Wait Times", 46023, 5]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "wait-times.md"), "utf8");
  expect(content).toContain("[a1] Line one Line two Line three");
});

test("ZIP64 archives throw a clear, distinguishable error", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  // graft a zip64 end-of-central-directory locator (signature 0x07064b50) onto a real,
  // otherwise-valid archive, immediately before its EOCD record, the way parseZip checks for it
  const eocdSig = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  const idx = Buffer.from(bytes).lastIndexOf(eocdSig);
  expect(idx).toBeGreaterThan(-1);
  const locator = Buffer.alloc(20);
  locator.writeUInt32LE(0x07064b50, 0);
  const patched = Buffer.concat([Buffer.from(bytes.subarray(0, idx)), locator, Buffer.from(bytes.subarray(idx))]);
  const input = writeFixture(new Uint8Array(patched));
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/ZIP64/);
});

test("an unsupported zip compression method throws a clear error naming the entry", async () => {
  const sheetXml = buildSheetXml([HEADER, ["a1", "A comment", "Wait Times", 46023, 5]]);
  // method 99 is not a real zip compression method; the low-level RawPart type only allows
  // 0 | 8, so this deliberately bypasses that to exercise the reader's error path
  const bytes = buildXlsxRaw([
    { path: "[Content_Types].xml", data: contentTypesXml(1, false) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(["Sheet1"]) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(1, false) },
    { path: "xl/worksheets/sheet1.xml", data: sheetXml, method: 99 as unknown as 0 | 8 },
  ]);
  const input = writeFixture(bytes);
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/unsupported zip compression method 99/);
});

// ---------------------------------------------------------------------------
// Fix-pass tests (2026-09-27 audit rulings)
// ---------------------------------------------------------------------------

test("B1: categories that slugify to the same base each get a distinct filename, and no rows are lost", async () => {
  const rows = [
    HEADER,
    ["a1", "comment for Foo", "Foo", 46023, 5],
    ["a2", "comment for foo", "foo", 46024, 5],
    ["a3", "comment for Foo 2", "Foo 2", 46025, 5],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  const result = await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const files = result.categoriesWritten.map((c) => c.file);
  expect(new Set(files).size).toBe(3);
  const allText = files.map((f) => readFileSync(join(out, f), "utf8")).join("\n");
  expect(allText).toContain("[a1]");
  expect(allText).toContain("[a2]");
  expect(allText).toContain("[a3]");
});

test("B5: a self-closing <si/> shared-string entry parses as empty and does not shift later indices", async () => {
  const sheetXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>` +
    `<row r="1"><c r="A1" t="inlineStr"><is><t>Response ID</t></is></c><c r="B1" t="inlineStr"><is><t>Comment</t></is></c><c r="C1" t="inlineStr"><is><t>Topic</t></is></c></row>` +
    `<row r="2"><c r="A2" t="inlineStr"><is><t>r1</t></is></c><c r="B2" t="s"><v>0</v></c><c r="C2" t="inlineStr"><is><t>Cat</t></is></c></row>` +
    `<row r="3"><c r="A3" t="inlineStr"><is><t>r2</t></is></c><c r="B3" t="s"><v>1</v></c><c r="C3" t="inlineStr"><is><t>Cat</t></is></c></row>` +
    `<row r="4"><c r="A4" t="inlineStr"><is><t>r3</t></is></c><c r="B4" t="s"><v>2</v></c><c r="C4" t="inlineStr"><is><t>Cat</t></is></c></row>` +
    `</sheetData></worksheet>`;
  const sharedXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="3" uniqueCount="3"><si/><si><t>answer-A</t></si><si><t>answer-B</t></si></sst>`;
  const bytes = buildXlsxRaw([
    { path: "[Content_Types].xml", data: contentTypesXml(1, true) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(["Sheet1"]) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(1, true) },
    { path: "xl/worksheets/sheet1.xml", data: sheetXml },
    { path: "xl/sharedStrings.xml", data: sharedXml },
  ]);
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  expect(content).not.toContain("[r1]"); // the blank <si/> row has no text and is skipped
  expect(content).toContain("[r2] answer-A");
  expect(content).toContain("[r3] answer-B");
});

test("B5: sharedStrings.xml's uniqueCount is asserted against the parsed <si> count", async () => {
  const sheetXml = buildSheetXml([HEADER, ["a1", "A comment", "Cat", 46023, 5]], { sharedStringIndex: new Map() });
  const sharedXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="5" uniqueCount="5"><si><t>only-one</t></si></sst>`;
  const bytes = buildXlsxRaw([
    { path: "[Content_Types].xml", data: contentTypesXml(1, true) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(["Sheet1"]) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(1, true) },
    { path: "xl/worksheets/sheet1.xml", data: sheetXml },
    { path: "xl/sharedStrings.xml", data: sharedXml },
  ]);
  const input = writeFixture(bytes);
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/uniqueCount="5"/);
});

test("S2: inline rich strings concatenate every <t> run, and <rPh> phonetic runs are stripped", async () => {
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Response ID</t></is></c><c r="B1" t="inlineStr"><is><t>Comment</t></is></c><c r="C1" t="inlineStr"><is><t>Topic</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>a1</t></is></c><c r="B2" t="inlineStr"><is><r><t>The first run. </t></r><r><t>The second run.</t></r><rPh sb="0" eb="1"><t>ignored phonetic text</t></rPh></is></c><c r="C2" t="inlineStr"><is><t>Cat</t></is></c></row></sheetData></worksheet>`;
  const bytes = buildXlsxRaw([
    { path: "[Content_Types].xml", data: contentTypesXml(1, false) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(["Sheet1"]) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(1, false) },
    { path: "xl/worksheets/sheet1.xml", data: sheetXml },
  ]);
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  expect(content).toContain("The first run. The second run.");
  expect(content).not.toContain("ignored phonetic text");
});

test("S1: _xHHHH_ escapes decode after entity decoding, and _x005F_ decodes to a literal underscore", async () => {
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Response ID</t></is></c><c r="B1" t="inlineStr"><is><t>Comment</t></is></c><c r="C1" t="inlineStr"><is><t>Topic</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>a1</t></is></c><c r="B2" t="inlineStr"><is><t>line one_x000D_line two, under_x005F_score</t></is></c><c r="C2" t="inlineStr"><is><t>Cat</t></is></c></row></sheetData></worksheet>`;
  const bytes = buildXlsxRaw([
    { path: "[Content_Types].xml", data: contentTypesXml(1, false) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(["Sheet1"]) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(1, false) },
    { path: "xl/worksheets/sheet1.xml", data: sheetXml },
  ]);
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  // the internal-newline collapse (CR -> space) proves the _x000D_ escape decoded to an actual
  // carriage return rather than surviving as the literal 8-character escape text
  expect(content).toContain("line one line two, under_score");
  expect(content).not.toContain("_x000D_");
  expect(content).not.toContain("_x005F_");
});

test("minor: entities decode in a single pass, so a numeric-entity-encoded ampersand does not chain into a second decode", async () => {
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Response ID</t></is></c><c r="B1" t="inlineStr"><is><t>Comment</t></is></c><c r="C1" t="inlineStr"><is><t>Topic</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>a1</t></is></c><c r="B2" t="inlineStr"><is><t>literal text: &#38;lt;</t></is></c><c r="C2" t="inlineStr"><is><t>Cat</t></is></c></row></sheetData></worksheet>`;
  const bytes = buildXlsxRaw([
    { path: "[Content_Types].xml", data: contentTypesXml(1, false) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(["Sheet1"]) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(1, false) },
    { path: "xl/worksheets/sheet1.xml", data: sheetXml },
  ]);
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  expect(content).toContain("literal text: &lt;");
  expect(content).not.toContain("literal text: <");
});

test("S3: a header name occurring more than once throws, listing the column letters", async () => {
  const rows = [
    ["Response ID", "Comment", "Comment", "Topic"],
    ["a1", "short answer", "a much longer answer that should not silently win", "Cat"],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/appears more than once.*columns B, C/s);
});

test("S4: a non-empty --out is refused unless --replace, which clears only generated files and preserves _read_decision.md / _consolidation_log.md", async () => {
  const bytes1 = buildXlsx({ sheets: [{ name: "Sheet1", rows: [HEADER, ["a1", "Alpha comment", "Alpha", 46023, 5]] }] });
  const out = tmpDir();
  await segment({ input: writeFixture(bytes1), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  writeFileSync(join(out, "_read_decision.md"), "kept for the agent\n");
  writeFileSync(join(out, "_consolidation_log.md"), "log\n");

  const bytes2 = buildXlsx({ sheets: [{ name: "Sheet1", rows: [HEADER, ["b1", "Beta comment", "Beta", 46023, 5]] }] });

  await expect(
    segment({ input: writeFixture(bytes2), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out })
  ).rejects.toThrow(/not empty/);

  await segment({ input: writeFixture(bytes2), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out, replace: true });
  expect(existsSync(join(out, "alpha.md"))).toBe(false);
  expect(existsSync(join(out, "beta.md"))).toBe(true);
  expect(readFileSync(join(out, "_read_decision.md"), "utf8")).toContain("kept for the agent");
  expect(readFileSync(join(out, "_consolidation_log.md"), "utf8")).toContain("log");
});

test("NB1 / item 1: --replace never deletes a hand-written .md file that lacks survey-corpus frontmatter", async () => {
  const bytes1 = buildXlsx({ sheets: [{ name: "Sheet1", rows: [HEADER, ["a1", "Alpha comment", "Alpha", 46023, 5]] }] });
  const out = tmpDir();
  await segment({ input: writeFixture(bytes1), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  // a rounds file and an L1 findings file, neither generated by this tool
  writeFileSync(join(out, "transit-card_rounds.md"), "# Rounds\n\n### F1 — something\n");
  writeFileSync(join(out, "L1_Survey_B01_2026-09-27_findings.md"), "---\nsomekey: value\n---\n\n## Finding 1:\n");
  writeFileSync(join(out, "notes.txt"), "plain notes, not markdown\n");

  const bytes2 = buildXlsx({ sheets: [{ name: "Sheet1", rows: [HEADER, ["b1", "Beta comment", "Beta", 46023, 5]] }] });
  const messages: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    messages.push(args.map(String).join(" "));
  };
  try {
    await segment({ input: writeFixture(bytes2), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out, replace: true });
  } finally {
    console.log = originalLog;
  }

  // the tool's own generated files are cleared
  expect(existsSync(join(out, "alpha.md"))).toBe(false);
  expect(existsSync(join(out, "beta.md"))).toBe(true);
  // everything else survives
  expect(existsSync(join(out, "transit-card_rounds.md"))).toBe(true);
  expect(existsSync(join(out, "L1_Survey_B01_2026-09-27_findings.md"))).toBe(true);
  expect(existsSync(join(out, "notes.txt"))).toBe(true);
  // the survivors are named on the way out
  expect(messages.some((m) => m.includes("transit-card_rounds.md"))).toBe(true);
  expect(messages.some((m) => m.includes("L1_Survey_B01_2026-09-27_findings.md"))).toBe(true);
});

test("NB1 / item 1: the non-empty---out error message names exactly what --replace clears", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: [HEADER, ["a1", "A comment", "Cat", 46023, 5]] }] });
  const out = tmpDir();
  writeFileSync(join(out, "unrelated.md"), "not generated by this tool\n");
  await expect(
    segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out })
  ).rejects.toThrow(/source_type: "survey-corpus"/);
});

test("NM4 / item 2: an --out directory holding only dotfiles counts as empty", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: [HEADER, ["a1", "A comment", "Cat", 46023, 5]] }] });
  const out = tmpDir();
  writeFileSync(join(out, ".DS_Store"), "binary junk");
  // must NOT throw "not empty"
  await segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  expect(existsSync(join(out, "cat.md"))).toBe(true);
});

test("S5: segment() returns rows scanned/written/blank-text-skipped/below-floor/blank-category counts", async () => {
  const rows = [HEADER, ["a1", "First", "Cat", 46023, 5], ["a2", "", "Cat", 46023, 5], ["a3", "Second", "", 46023, 5]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const result = await segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() });
  expect(result.rowsScanned).toBe(3);
  expect(result.blankTextSkipped).toBe(1);
  expect(result.blankCategoryRows).toBe(1);
  expect(result.rowsWritten).toBe(2); // a1 in Cat, a3 in (blank)
  expect(result.belowFloorRows).toBe(0);
});

test("S5: a sheet whose text column is entirely blank throws instead of silently succeeding", async () => {
  const rows = [HEADER, ["a1", "", "Cat", 46023, 5]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  await expect(
    segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/no rows have text/);
});

test("arch S3: source_file records only the input's basename, never the full path", async () => {
  const rows = [HEADER, ["a1", "A comment about wait times", "Cat", 46023, 5]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes); // absolute path under a mkdtemp dir
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  expect(content).toContain('source_file: "export.xlsx"');
  expect(content).not.toContain(dirname(input));
  const index = readFileSync(join(out, "_index.md"), "utf8");
  expect(index).toContain("source_file: export.xlsx");
  expect(index).not.toContain(dirname(input));
});

test("arch M2: rows with a blank category group under \"(blank)\" and a count is printed and returned", async () => {
  const rows = [HEADER, ["a1", "Comment one", "", 46023, 5], ["a2", "Comment two", "", 46024, 5]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const out = tmpDir();
  const messages: string[] = [];
  const originalError = console.error;
  console.error = (...args: any[]) => {
    messages.push(args.map(String).join(" "));
  };
  let result;
  try {
    result = await segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  } finally {
    console.error = originalError;
  }
  expect(result.blankCategoryRows).toBe(2);
  expect(messages.some((m) => m.includes("blank category"))).toBe(true);
  const content = readFileSync(join(out, "blank.md"), "utf8");
  expect(content).toContain('category: "(blank)"');
});

test("ruling 11: category names collapse internal whitespace/newlines and escape | in the index table", async () => {
  const rows = [HEADER, ["a1", "Comment about wait times", "Wait   \n Times | Extra", 46023, 5]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const out = tmpDir();
  const result = await segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  expect(result.categoriesWritten[0].category).toBe("Wait Times | Extra");
  const index = readFileSync(join(out, "_index.md"), "utf8");
  expect(index).toContain("Wait Times \\| Extra");
});

test("ruling 12: --id-col values containing ']', '|' or a newline are rejected, naming the sheet row", async () => {
  const rows = [HEADER, ["a]1", "A comment", "Cat", 46023, 5]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  await expect(
    segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/sheet row 2/);
});

test("ruling 13: --min-count and --sample-size must be positive integers, not fractional", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  const input = writeFixture(bytes);
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 1.5, surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/--min-count/);
  await expect(
    segment({ input, textCol: "Comment", groupCol: "Topic", minCount: 1, sampleSize: 2.5, sampleReason: "x", surveyId: "test-survey", codingProvenance: "platform-applied", out: tmpDir() })
  ).rejects.toThrow(/--sample-size/);
});

test("ruling 14: scores print without floating-point noise", async () => {
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Response ID</t></is></c><c r="B1" t="inlineStr"><is><t>Comment</t></is></c><c r="C1" t="inlineStr"><is><t>Topic</t></is></c><c r="D1" t="inlineStr"><is><t>Score</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>a1</t></is></c><c r="B2" t="inlineStr"><is><t>A comment</t></is></c><c r="C2" t="inlineStr"><is><t>Cat</t></is></c><c r="D2"><v>8.0999999999999996</v></c></row></sheetData></worksheet>`;
  const bytes = buildXlsxRaw([
    { path: "[Content_Types].xml", data: contentTypesXml(1, false) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(["Sheet1"]) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(1, false) },
    { path: "xl/worksheets/sheet1.xml", data: sheetXml },
  ]);
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", scoreCol: "Score", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  expect(content).toContain("(score: 8.1)");
  expect(content).not.toContain("8.0999999999999996");
});

test("ruling 15: the 1904 date system is read from workbookPr and applied to serial dates", async () => {
  const rows = [HEADER, ["a1", "A comment", "Cat", 0, 5]]; // serial 0 under the 1904 system
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }], date1904: true });
  const out = tmpDir();
  await segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", dateCol: "Submitted", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  expect(content).toContain("(date: 1904-01-01)");
});

test("ruling 16: respondent IDs are written per row, blank cells omit the field and mark the header partial", async () => {
  const rows = [
    HEADER.concat("Respondent"),
    ["a1", "Comment one", "Cat", 46023, 5, "h7f2"],
    ["a2", "Comment two", "Cat", 46024, 5, ""],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const out = tmpDir();
  await segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", respondentCol: "Respondent", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  expect(content).toContain("[a1] Comment one (respondent: h7f2)");
  expect(content).not.toMatch(/\[a2\] Comment two \(respondent:/);
  expect(content).toContain('respondent_id: "partial"');
  expect(content).toContain("respondent_ids_missing: 1");
});

test("ruling 16: respondent values that look like an email or a phone number are refused", async () => {
  const rowsEmail = [HEADER.concat("Respondent"), ["a1", "A comment", "Cat", 46023, 5, "person@example.com"]];
  await expect(
    segment({
      input: writeFixture(buildXlsx({ sheets: [{ name: "Sheet1", rows: rowsEmail }] })),
      textCol: "Comment",
      groupCol: "Topic",
      idCol: "Response ID",
      respondentCol: "Respondent",
      minCount: 1,
      surveyId: "test-survey", codingProvenance: "platform-applied",
      out: tmpDir(),
    })
  ).rejects.toThrow(/raw personal data/);

  const rowsPhone = [HEADER.concat("Respondent"), ["a1", "A comment", "Cat", 46023, 5, "(555) 123-4567"]];
  await expect(
    segment({
      input: writeFixture(buildXlsx({ sheets: [{ name: "Sheet1", rows: rowsPhone }] })),
      textCol: "Comment",
      groupCol: "Topic",
      idCol: "Response ID",
      respondentCol: "Respondent",
      minCount: 1,
      surveyId: "test-survey", codingProvenance: "platform-applied",
      out: tmpDir(),
    })
  ).rejects.toThrow(/raw personal data/);
});

test("ruling 16: distinct respondent IDs can be read back from a corpus file", async () => {
  const rows = [
    HEADER.concat("Respondent"),
    ["a1", "Comment one", "Cat", 46023, 5, "resp-1"],
    ["a2", "Comment two", "Cat", 46024, 5, "resp-2"],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const out = tmpDir();
  await segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", respondentCol: "Respondent", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  const ids = [...content.matchAll(/\(respondent: ([^)]+)\)/g)].map((m) => m[1]);
  expect(ids.sort()).toEqual(["resp-1", "resp-2"]);
  expect(content).toContain('respondent_id: "present"');
});

test("item 4 / NM3: a respondent value containing '(' or ')' is refused, naming only the sheet row", async () => {
  const rows = [HEADER.concat("Respondent"), ["a1", "A comment", "Cat", 46023, 5, "P-7) (score: 10"]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  await expect(
    segment({
      input: writeFixture(bytes),
      textCol: "Comment",
      groupCol: "Topic",
      idCol: "Response ID",
      respondentCol: "Respondent",
      minCount: 1,
      surveyId: "test-survey", codingProvenance: "platform-applied",
      out: tmpDir(),
    })
  ).rejects.toThrow(/sheet row 2/);
  // the error must never echo the refused value
  try {
    await segment({
      input: writeFixture(bytes),
      textCol: "Comment",
      groupCol: "Topic",
      idCol: "Response ID",
      respondentCol: "Respondent",
      minCount: 1,
      surveyId: "test-survey", codingProvenance: "platform-applied",
      out: tmpDir(),
    });
    throw new Error("expected segment() to throw");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    expect(msg).not.toContain("P-7) (score: 10");
    expect(msg).not.toContain("score: 10");
  }
});

test("item 4: the raw-personal-data refusal also never echoes the refused value", async () => {
  const rows = [HEADER.concat("Respondent"), ["a1", "A comment", "Cat", 46023, 5, "person@example.com"]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  try {
    await segment({
      input: writeFixture(bytes),
      textCol: "Comment",
      groupCol: "Topic",
      idCol: "Response ID",
      respondentCol: "Respondent",
      minCount: 1,
      surveyId: "test-survey", codingProvenance: "platform-applied",
      out: tmpDir(),
    });
    throw new Error("expected segment() to throw");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    expect(msg).toContain("raw personal data");
    expect(msg).toContain("sheet row 2");
    expect(msg).not.toContain("person@example.com");
  }
});

// Ruling 1 (re-review): plain digit strings of any length are accepted; refusal is limited to
// email-like values and phone-formatted values (leading "+digits", or a separator-formatted
// phone shape). Each case below is exercised through the same respondent-value path.
async function respondentAccepted(value: string): Promise<boolean> {
  const rows = [HEADER.concat("Respondent"), ["a1", "A comment", "Cat", 46023, 5, value]];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  try {
    await segment({
      input: writeFixture(bytes),
      textCol: "Comment",
      groupCol: "Topic",
      idCol: "Response ID",
      respondentCol: "Respondent",
      minCount: 1,
      surveyId: "test-survey", codingProvenance: "platform-applied",
      out: tmpDir(),
    });
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/raw personal data/.test(msg)) return false;
    throw err; // an unrelated failure must not be swallowed as "refused"
  }
}

test("ruling 1: a plain digit string of any length is accepted, not treated as phone-like", async () => {
  expect(await respondentAccepted("10012345")).toBe(true);
  expect(await respondentAccepted("4471229011800")).toBe(true);
});

test("ruling 1: a leading '+' followed only by digits is refused as phone-formatted", async () => {
  expect(await respondentAccepted("+14155550100")).toBe(false);
});

test("ruling 1: separator-formatted phone shapes are refused", async () => {
  expect(await respondentAccepted("(555) 123-4567")).toBe(false);
  expect(await respondentAccepted("555-123-4567")).toBe(false);
});

test("ruling 1: an email-like value ('@' followed later by a '.') is refused", async () => {
  expect(await respondentAccepted("a@b.co")).toBe(false);
});

test("ruling 1: a bare '@handle' with no dot after it is accepted", async () => {
  expect(await respondentAccepted("@janesmith")).toBe(true);
});

// Ruling A (final check, 2026-09-27): --survey-id is required — the earlier hash-derived
// default let an undeclared re-export of the same survey count as a second survey and release
// the single-survey hold. It names the survey this export belongs to; re-exports of the same
// collection get the same ID. Values starting with "-" (a dropped flag, e.g. a bare
// `--survey-id --replace` swallowing the next flag) or "sha-" (the old reserved default
// namespace) are refused.
test("missing --survey-id throws a clear error naming the flag and why", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  await expect(
    segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, codingProvenance: "platform-applied", out: tmpDir() } as any)
  ).rejects.toThrow(/--survey-id is required.*names the survey this export belongs to.*same ID/s);
});

test("a --survey-id value starting with '-' is refused (catches --survey-id --replace)", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  await expect(
    segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, codingProvenance: "platform-applied", out: tmpDir(), surveyId: "-x" })
  ).rejects.toThrow(/--survey-id/);
});

test("a --survey-id value starting with 'sha-' is refused (reserved)", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  await expect(
    segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, codingProvenance: "platform-applied", out: tmpDir(), surveyId: "sha-abc" })
  ).rejects.toThrow(/--survey-id/);
});

test("other invalid --survey-id values are refused: spaces, empty, over 64 chars", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  await expect(
    segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, codingProvenance: "platform-applied", out: tmpDir(), surveyId: "bad id with spaces" })
  ).rejects.toThrow(/--survey-id/);
  await expect(
    segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, codingProvenance: "platform-applied", out: tmpDir(), surveyId: "" })
  ).rejects.toThrow(/--survey-id/);
  await expect(
    segment({ input: writeFixture(bytes), textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, codingProvenance: "platform-applied", out: tmpDir(), surveyId: "x".repeat(65) })
  ).rejects.toThrow(/--survey-id/);
});

test("a valid --survey-id is written into every corpus file, _below_floor.md, and _index.md", async () => {
  const rows = [
    HEADER,
    ["r1", "The new bus shelter at Elm stop is a big improvement", "Wait Times", 46023, 9],
    ["r2", "Card reader broke again today", "Card Readers", 46024, 4],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({
    input,
    textCol: "Comment",
    groupCol: "Topic",
    idCol: "Response ID",
    minCount: 2, // both categories land below the floor, exercising _below_floor.md too
    codingProvenance: "platform-applied",
    out,
    surveyId: "wave-2026-09",
  });
  const bf = readFileSync(join(out, "_below_floor.md"), "utf8");
  expect(bf).toContain('survey_id: "wave-2026-09"');
  const index = readFileSync(join(out, "_index.md"), "utf8");
  expect(index).toContain("survey_id: wave-2026-09");
});

test("_index.md carries a Read decision pointer to _read_decision.md near the top", async () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", minCount: 1, codingProvenance: "platform-applied", out, surveyId: "test-survey" });
  const index = readFileSync(join(out, "_index.md"), "utf8");
  expect(index).toContain('Read decision: see _read_decision.md (the "sampling" column says only whether all rows were written).');
  // "near the top": before the category table
  expect(index.indexOf("Read decision:")).toBeLessThan(index.indexOf("| Category |"));
});

test("item 5: score normalisation preserves integers and values with <=15 significant digits, trims only float noise", async () => {
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Response ID</t></is></c><c r="B1" t="inlineStr"><is><t>Comment</t></is></c><c r="C1" t="inlineStr"><is><t>Topic</t></is></c><c r="D1" t="inlineStr"><is><t>Score</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>a1</t></is></c><c r="B2" t="inlineStr"><is><t>A comment</t></is></c><c r="C2" t="inlineStr"><is><t>Cat</t></is></c><c r="D2" t="inlineStr"><is><t>1234567890123</t></is></c></row></sheetData></worksheet>`;
  const bytes = buildXlsxRaw([
    { path: "[Content_Types].xml", data: contentTypesXml(1, false) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "xl/workbook.xml", data: workbookXml(["Sheet1"]) },
    { path: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(1, false) },
    { path: "xl/worksheets/sheet1.xml", data: sheetXml },
  ]);
  const input = writeFixture(bytes);
  const out = tmpDir();
  await segment({ input, textCol: "Comment", groupCol: "Topic", idCol: "Response ID", scoreCol: "Score", minCount: 1, surveyId: "test-survey", codingProvenance: "platform-applied", out });
  const content = readFileSync(join(out, "cat.md"), "utf8");
  expect(content).toContain("(score: 1234567890123)");
});

test("ruling 9: --inspect reports header, category and text diagnostics", () => {
  const rows = [
    HEADER,
    ["a1", "A fairly detailed comment about the wait at the depot this week, longer than most", "Wait Times", 46023, 5],
    ["a2", "Short", "Wait Times", 46024, 5],
    ["a3", "", "Card Readers", 46025, 5], // blank text: not counted into its category
    ["a4", "The reader at the depot froze twice", "Card Readers", 46026, 5],
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const result = inspectSurvey({ input, textCol: "Comment", groupCol: "Topic" });
  expect(result.sheetNames).toEqual(["Sheet1"]);
  expect(result.chosenSheet).toBe("Sheet1");
  expect(result.rowCount).toBe(4);
  expect(result.headers.map((h) => h.name)).toEqual(HEADER);
  expect(result.group?.categories).toBe(2);
  expect(result.text?.longestRows.length).toBeGreaterThan(0);
  expect(result.duplicateHeaderNames).toEqual([]);
});

test("NM4 / item 3: --inspect category counts exclude blank-text rows", () => {
  const rows = [
    HEADER,
    ["a1", "First comment about wait times", "Wait Times", 46023, 5],
    ["a2", "", "Wait Times", 46024, 5], // blank text: must not count toward Wait Times
  ];
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows }] });
  const input = writeFixture(bytes);
  const result = inspectSurvey({ input, textCol: "Comment", groupCol: "Topic" });
  expect(result.group?.categories).toBe(1);
  expect(result.group?.maxRows).toBe(1); // only a1 counted, not a2
});

test("ruling 9: --inspect writes nothing to disk", () => {
  const bytes = buildXlsx({ sheets: [{ name: "Sheet1", rows: basicRows() }] });
  const input = writeFixture(bytes);
  const dir = dirname(input);
  const before = readdirSync(dir).sort();
  inspectSurvey({ input, textCol: "Comment", groupCol: "Topic" });
  const after = readdirSync(dir).sort();
  expect(after).toEqual(before);
});

test("arch M12: --help prints usage and exits 0", () => {
  const res = Bun.spawnSync(["bun", "SegmentSurvey.ts", "--help"], { cwd: import.meta.dir });
  expect(res.exitCode).toBe(0);
  expect(res.stdout.toString()).toContain("Usage");
});
