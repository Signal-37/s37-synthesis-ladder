import { describe, expect, test, afterAll } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync, appendFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  planChunks,
  planChunksForRound,
  initLedger,
  loadLedger,
  appendEntry,
  stoppingStatus,
  deriveSeed,
  fnv1a32,
  type Ledger,
  type LedgerEntry,
  type LedgerHeader,
} from "./SaturationLedger.ts";

const createdDirs: string[] = [];
// final-check item 8: init() now resolves --corpus-file on disk and hashes it, so every test
// directory gets a placeholder "corpus.md" for free -- matching header()'s default corpusFile.
// Tests that need real corpus content (none currently do in this file; AuditRound.test.ts's do)
// write their own file over this placeholder before calling initLedger.
function tmpDir(): string {
  const d = mkdtempSync(join(tmpdir(), "scp-ledger-"));
  createdDirs.push(d);
  writeFileSync(join(d, "corpus.md"), "placeholder corpus file for ledger tests\n", "utf8");
  return d;
}
afterAll(() => {
  for (const d of createdDirs) rmSync(d, { recursive: true, force: true });
});

function header(overrides: Partial<LedgerHeader> = {}): LedgerHeader {
  return {
    totalRows: 500,
    corpusFile: "corpus.md",
    corpusSha256: "0".repeat(64), // placeholder: only meaningful once loaded from a real init()'d file
    chunkSize: 10,
    roundChunks: 10,
    baseRounds: 2,
    runRounds: 1,
    newInfoThreshold: 0.1,
    declared: "2026-09-27",
    ...overrides,
  };
}

function entry(overrides: Partial<LedgerEntry> = {}): LedgerEntry {
  return {
    round: 1,
    startRow: 1,
    rowCount: 10,
    firstId: "r1",
    lastId: "r10",
    readRef: "read corpus.md @ lines 5-14",
    seed: 42,
    newFindings: 2,
    oversize: false,
    gap: false,
    date: "2026-09-27",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// planChunks
// ---------------------------------------------------------------------------

test("planChunks(100,10,10,[],seed) succeeds for every seed 1-50 when an exact fit exists", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const chunks = planChunks(100, 10, 10, [], seed);
    expect(chunks.length).toBe(10);
    const covered = new Set<number>();
    for (const c of chunks) {
      for (let r = c.start; r <= c.end; r++) {
        expect(covered.has(r)).toBe(false);
        covered.add(r);
      }
    }
    expect(covered.size).toBe(100);
  }
});

test("planChunks avoids rows already in coveredRanges", () => {
  const chunks = planChunks(100, 10, 5, [{ start: 1, end: 30 }], 7);
  for (const c of chunks) {
    expect(c.start).toBeGreaterThan(30);
  }
});

test("planChunks throws NO_FIT, naming the unread gaps, when the request can't be met but rows remain", () => {
  expect(() => planChunks(20, 10, 3, [], 1)).toThrow(/^NO_FIT: .*20 of 20 rows unread, in gaps 1-20/);
  expect(() => planChunks(14, 5, 1, [{ start: 1, end: 5 }, { start: 10, end: 14 }], 2)).toThrow(/^NO_FIT: .*4 of 14 rows unread, in gaps 6-9/);
});

test("planChunks throws COVERAGE_EXHAUSTED only when every row is ledgered", () => {
  expect(() => planChunks(10, 5, 1, [{ start: 1, end: 10 }], 1)).toThrow(/^COVERAGE_EXHAUSTED: all 10 rows/);
});

test("planChunks enforces the 5-15 chunkSize hard cap unless allowOversize is passed", () => {
  expect(() => planChunks(100, 20, 1, [], 1)).toThrow(/5-15 hard cap/);
  expect(() => planChunks(100, 20, 1, [], 1, { allowOversize: true })).not.toThrow();
});

test("planChunks reaches the tail of a corpus whose size is not a multiple of chunkSize", () => {
  const chunks = planChunks(23, 10, 1, [{ start: 1, end: 20 }], 3);
  expect(chunks[0].end).toBe(23);
});

test("ruling: no end-aligned extra candidate — the grid for a corpus not divisible by chunkSize has exactly one candidate block per position, deterministically, across every seed", () => {
  for (const seed of [1, 2, 3, 4, 5, 42, 99]) {
    const chunks = planChunks(25, 10, 3, [], seed);
    expect(chunks.map((c) => `${c.start}-${c.end}`)).toEqual(["1-10", "11-20", "21-25"]);
  }
});

// ---------------------------------------------------------------------------
// header init / load
// ---------------------------------------------------------------------------

test("initLedger writes the nine declared header lines (incl. corpus_sha256) and refuses to overwrite an existing ledger", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  const text = readFileSync(path, "utf8");
  expect(text).toContain("# total_rows: 500");
  expect(text).toContain("# corpus_file: corpus.md");
  expect(text).toContain("# chunk_size: 10");
  expect(text).toContain("# round_chunks: 10");
  expect(text).toContain("# base_rounds: 2");
  expect(text).toContain("# run_rounds: 1");
  expect(text).toContain("# new_info_threshold: 0.1");
  expect(text).toContain("# declared: 2026-09-27");
  // final-check item 8: init resolves --corpus-file on disk and records its hash
  expect(text).toMatch(/# corpus_sha256: [0-9a-f]{64}/);
  expect(() => initLedger(path, header())).toThrow(/already exists/);
});

test("initLedger validates chunk-size (5-15), round-chunks (>= 8), run-rounds (>= 1) and threshold (finite, in [0,1])", () => {
  const dir = tmpDir();
  expect(() => initLedger(join(dir, "a.txt"), header({ chunkSize: 3 }))).toThrow(/--chunk-size/);
  expect(() => initLedger(join(dir, "b.txt"), header({ chunkSize: 20 }))).toThrow(/--chunk-size/);
  expect(() => initLedger(join(dir, "c.txt"), header({ roundChunks: 7 }))).toThrow(/--round-chunks/);
  expect(() => initLedger(join(dir, "d.txt"), header({ runRounds: 0 }))).toThrow(/--run-rounds/);
  expect(() => initLedger(join(dir, "e.txt"), header({ newInfoThreshold: 1.5 }))).toThrow(/--new-info-threshold/);
  expect(() => initLedger(join(dir, "f.txt"), header({ newInfoThreshold: NaN }))).toThrow(/--new-info-threshold/);
  expect(() => initLedger(join(dir, "g.txt"), header({ totalRows: 0 }))).toThrow(/--total-rows/);
});

test("loadLedger on a missing file returns a clear 'no ledger yet' result, not a throw", () => {
  const result = loadLedger(join(tmpDir(), "does-not-exist.txt"));
  expect(result.exists).toBe(false);
  if (!result.exists) {
    expect(result.message).toMatch(/no ledger yet/);
  }
});

test("loadLedger throws naming the line number for a malformed entry line", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  appendEntry(path, { round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read corpus.md @ lines 5-14", newFindings: 3 });
  // append a malformed line directly (wrong field count)
  appendFileSync(path, "1|11|10|bad-line-too-few-fields\n", "utf8");
  expect(() => loadLedger(path)).toThrow(/malformed ledger entry at line 11/); // 9 header lines (incl. corpus_sha256) + 1 real entry
});

test("loadLedger rejects a non-finite header value, naming it", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  let text = readFileSync(path, "utf8");
  text = text.replace("# chunk_size: 10", "# chunk_size: NaN");
  require("node:fs").writeFileSync(path, text, "utf8");
  expect(() => loadLedger(path)).toThrow(/chunk_size.*not a finite number/);
});

test("loadLedger rejects a header missing a required field", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  let text = readFileSync(path, "utf8");
  text = text.split("\n").filter((l) => !l.startsWith("# run_rounds")).join("\n");
  require("node:fs").writeFileSync(path, text, "utf8");
  expect(() => loadLedger(path)).toThrow(/incomplete.*run_rounds/);
});

test("loadLedger rejects a header missing corpus_sha256 (final-check item 8: header validation requires the field)", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  let text = readFileSync(path, "utf8");
  text = text.split("\n").filter((l) => !l.startsWith("# corpus_sha256")).join("\n");
  require("node:fs").writeFileSync(path, text, "utf8");
  expect(() => loadLedger(path)).toThrow(/incomplete.*corpus_sha256/);
});

// ---------------------------------------------------------------------------
// final-check item 8: the ledger is bound to its corpus file
// ---------------------------------------------------------------------------

test("init resolves --corpus-file beside the ledger, or in a corpus/ subfolder next to it, and errors if neither exists", () => {
  const dir = tmpDir();
  // beside the ledger (the default placeholder tmpDir() writes)
  initLedger(join(dir, "beside.txt"), header({ corpusFile: "corpus.md" }));
  expect(loadLedger(join(dir, "beside.txt"))).toMatchObject({ exists: true });

  // in a corpus/ subfolder, when not present directly beside the ledger
  const { mkdirSync, writeFileSync: wfs } = require("node:fs");
  mkdirSync(join(dir, "corpus"));
  wfs(join(dir, "corpus", "nested.md"), "nested corpus content\n", "utf8");
  initLedger(join(dir, "nested.txt"), header({ corpusFile: "nested.md" }));
  const loadedNested = loadLedger(join(dir, "nested.txt"));
  expect(loadedNested.exists).toBe(true);

  // not found anywhere -> a clear error naming both places it looked
  expect(() => initLedger(join(dir, "missing.txt"), header({ corpusFile: "does-not-exist.md" }))).toThrow(
    /corpus file "does-not-exist\.md" not found at .*does-not-exist\.md or .*corpus.*does-not-exist\.md/
  );
});

test("init records the resolved corpus file's actual sha256", () => {
  const dir = tmpDir();
  const { writeFileSync: wfs, readFileSync: rfs } = require("node:fs");
  const { createHash } = require("node:crypto");
  wfs(join(dir, "known.md"), "known content for hashing\n", "utf8");
  const expected = createHash("sha256").update(rfs(join(dir, "known.md"))).digest("hex");

  const path = join(dir, "ledger.txt");
  initLedger(path, header({ corpusFile: "known.md" }));
  const loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  expect(loaded.header.corpusSha256).toBe(expected);
});

test("plan and append refuse once the corpus file has changed since the ledger was declared", () => {
  const dir = tmpDir();
  const { writeFileSync: wfs } = require("node:fs");
  wfs(join(dir, "corpus.md"), "original content\n", "utf8");
  const path = join(dir, "ledger.txt");
  initLedger(path, header({ corpusFile: "corpus.md" }));

  // the corpus file changes after the ledger was declared
  wfs(join(dir, "corpus.md"), "DIFFERENT content -- the export was re-run\n", "utf8");

  const plan = Bun.spawnSync(["bun", "SaturationLedger.ts", "plan", "--ledger", path, "--round", "1"], { cwd: import.meta.dir });
  expect(plan.exitCode).not.toBe(0);
  expect(plan.stderr.toString()).toMatch(/corpus file changed since the ledger was declared/);

  const append = Bun.spawnSync(
    ["bun", "SaturationLedger.ts", "append", "--ledger", path, "--round", "1", "--start-row", "1", "--row-count", "5", "--first-id", "r1", "--last-id", "r5", "--read-ref", "read corpus.md @ lines 1-5", "--new-findings", "0"],
    { cwd: import.meta.dir }
  );
  expect(append.exitCode).not.toBe(0);
  expect(append.stderr.toString()).toMatch(/corpus file changed since the ledger was declared/);
});

// ---------------------------------------------------------------------------
// appendEntry
// ---------------------------------------------------------------------------

test("appendEntry derives its seed from corpus_file + round (never passed in) and loadLedger reads it back", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  appendEntry(path, { round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read corpus.md @ lines 5-14", newFindings: 3 });
  // round 2's planned chunks depend on round 2's own seed, not round 1's rows; find its first
  // planned chunk rather than assuming it starts right after round 1's.
  const afterRound1 = loadLedger(path);
  if (!afterRound1.exists) throw new Error("expected ledger to exist");
  const round2Chunk = planChunksForRound(afterRound1, 2)[0];
  appendEntry(path, {
    round: 2,
    startRow: round2Chunk.start,
    rowCount: round2Chunk.end - round2Chunk.start + 1,
    firstId: `r${round2Chunk.start}`,
    lastId: `r${round2Chunk.end}`,
    readRef: `read corpus.md @ lines ${round2Chunk.start}-${round2Chunk.end}`,
    newFindings: 1,
  });
  const loaded = loadLedger(path);
  expect(loaded.exists).toBe(true);
  if (loaded.exists) {
    expect(loaded.entries.length).toBe(2);
    expect(loaded.entries[0].seed).toBe(deriveSeed("corpus.md", 1));
    expect(loaded.entries[1].seed).toBe(deriveSeed("corpus.md", 2));
    expect(loaded.entries[0].seed).not.toBe(loaded.entries[1].seed);
  }
});

test("appendEntry rejects a '|' or newline in read-ref or ID fields before writing (the ledger is never poisoned)", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  expect(() =>
    appendEntry(path, { round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a|b.md @ lines 1-10", newFindings: 1 })
  ).toThrow(/--read-ref/);
  expect(() =>
    appendEntry(path, { round: 1, startRow: 1, rowCount: 10, firstId: "r1\nr2", lastId: "r10", readRef: "read a.md @ lines 1-10", newFindings: 1 })
  ).toThrow(/--first-id/);
  // the ledger must still have zero entries: both rejected writes never touched the file
  const loaded = loadLedger(path);
  expect(loaded.exists && loaded.entries.length).toBe(0);
});

test("appendEntry rejects a non-integer or negative --new-findings", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  expect(() =>
    appendEntry(path, { round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", newFindings: NaN })
  ).toThrow(/--new-findings/);
  expect(() =>
    appendEntry(path, { round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", newFindings: -1 })
  ).toThrow(/--new-findings/);
});

test("appendEntry rejects a range outside 1..total_rows", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header({ totalRows: 20 }));
  expect(() =>
    appendEntry(path, { round: 1, startRow: 15, rowCount: 10, firstId: "r15", lastId: "r24", readRef: "read a.md @ lines 1-10", newFindings: 1 })
  ).toThrow(/falls outside 1\.\.20/);
});

test("appendEntry rejects a range that overlaps any already-ledgered range", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  appendEntry(path, { round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", newFindings: 1 });
  expect(() =>
    appendEntry(path, { round: 2, startRow: 5, rowCount: 10, firstId: "r5", lastId: "r14", readRef: "read a.md @ lines 5-14", newFindings: 1 })
  ).toThrow(/overlaps an already-ledgered range/);
});

// ---------------------------------------------------------------------------
// stoppingStatus
// ---------------------------------------------------------------------------

test("stoppingStatus reports 'insufficient' with fewer than base_rounds + run_rounds counted rounds", () => {
  const ledger: Ledger = {
    header: header({ chunkSize: 15, roundChunks: 1, baseRounds: 2, runRounds: 1 }),
    entries: [entry({ round: 1, startRow: 1, rowCount: 15, newFindings: 5 })],
  };
  const status = stoppingStatus(ledger);
  expect(status.state).toBe("insufficient");
  expect(status.countedRounds).toBe(1);
});

test("ruling 6b / arch B2: base and run are disjoint whole rounds — a repro that a raw-row-threshold rule would have counted twice", () => {
  // 15-row chunks; base_rounds=2, run_rounds=1, round_chunks=1 (one chunk per round here).
  // Round 1 and round 2 are the base; round 3 is the run. No row is ever double-counted.
  const ledger: Ledger = {
    header: header({ chunkSize: 15, roundChunks: 1, baseRounds: 2, runRounds: 1, newInfoThreshold: 0.1 }),
    entries: [
      entry({ round: 1, startRow: 1, rowCount: 15, newFindings: 10 }),
      entry({ round: 2, startRow: 16, rowCount: 15, newFindings: 0 }),
      entry({ round: 3, startRow: 31, rowCount: 15, newFindings: 0 }),
    ],
  };
  const status = stoppingStatus(ledger);
  expect(status.baseRows).toBe(30);
  expect(status.baseFindings).toBe(10);
  expect(status.runRows).toBe(15);
  expect(status.newInRun).toBe(0);
  expect(status.state).toBe("meets_rule");
});

test("'empty_base' when the base's counted rounds found zero new findings — never meets_rule", () => {
  const ledger: Ledger = {
    header: header({ chunkSize: 15, roundChunks: 1, baseRounds: 1, runRounds: 1, newInfoThreshold: 0.1 }),
    entries: [
      entry({ round: 1, startRow: 1, rowCount: 15, newFindings: 0 }),
      entry({ round: 2, startRow: 16, rowCount: 15, newFindings: 0 }),
    ],
  };
  const status = stoppingStatus(ledger);
  expect(status.state).toBe("empty_base");
  expect(status.baseFindings).toBe(0);
});

test("exact-threshold tie: newInRun == allowedNew meets the rule; one more does not", () => {
  const base = header({ chunkSize: 15, roundChunks: 1, baseRounds: 1, runRounds: 1, newInfoThreshold: 0.1 });
  const tie: Ledger = {
    header: base,
    entries: [entry({ round: 1, startRow: 1, rowCount: 15, newFindings: 20 }), entry({ round: 2, startRow: 16, rowCount: 15, newFindings: 2 })],
  };
  const tieStatus = stoppingStatus(tie);
  expect(tieStatus.allowedNew).toBe(2); // floor(0.1 * 20)
  expect(tieStatus.state).toBe("meets_rule");

  const over: Ledger = {
    header: base,
    entries: [entry({ round: 1, startRow: 1, rowCount: 15, newFindings: 20 }), entry({ round: 2, startRow: 16, rowCount: 15, newFindings: 3 })],
  };
  expect(stoppingStatus(over).state).toBe("above_threshold");
});

test("a short round (fewer than round_chunks entries) is excluded from the base/run rule but still counts toward coverage", () => {
  const ledger: Ledger = {
    header: header({ chunkSize: 10, roundChunks: 2, baseRounds: 1, runRounds: 1, newInfoThreshold: 0.5 }),
    entries: [
      entry({ round: 1, startRow: 1, rowCount: 10, newFindings: 4 }),
      entry({ round: 1, startRow: 11, rowCount: 10, newFindings: 2 }),
      entry({ round: 2, startRow: 21, rowCount: 10, newFindings: 99 }), // short: only 1 of 2 round_chunks
      entry({ round: 3, startRow: 31, rowCount: 10, newFindings: 1 }),
      entry({ round: 3, startRow: 41, rowCount: 10, newFindings: 0 }),
    ],
  };
  const status = stoppingStatus(ledger);
  expect(status.countedRounds).toBe(2); // rounds 1 and 3
  expect(status.shortRounds).toBe(1); // round 2
  expect(status.rowsRead).toBe(50); // all 5 entries' rows still count toward coverage
  expect(status.baseFindings).toBe(6); // round 1 only
  expect(status.newInRun).toBe(1); // round 3 only; round 2's 99 is excluded
});

test("stoppingStatus computes rowsRead from distinct covered rows, not summed entry counts, even if overlap slipped in", () => {
  const ledger: Ledger = {
    header: header({ chunkSize: 10, roundChunks: 1, baseRounds: 1, runRounds: 1 }),
    entries: [entry({ round: 1, startRow: 1, rowCount: 10 }), entry({ round: 2, startRow: 1, rowCount: 10 })],
  };
  const status = stoppingStatus(ledger);
  expect(status.rowsRead).toBe(10); // not 20
});

// ---------------------------------------------------------------------------
// end-to-end CLI smoke test
// ---------------------------------------------------------------------------

test("CLI: init, append, status and plan round-trip through the file", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  const init = Bun.spawnSync(
    ["bun", "SaturationLedger.ts", "init", "--ledger", path, "--corpus-file", "corpus.md", "--total-rows", "100", "--chunk-size", "10", "--round-chunks", "8", "--base-rounds", "2", "--run-rounds", "1", "--new-info-threshold", "0.1"],
    { cwd: import.meta.dir }
  );
  expect(init.exitCode).toBe(0);

  const plan = Bun.spawnSync(["bun", "SaturationLedger.ts", "plan", "--ledger", path, "--round", "1"], { cwd: import.meta.dir });
  expect(plan.exitCode).toBe(0);
  const planJson = JSON.parse(plan.stdout.toString());
  expect(planJson.chunks.length).toBe(8);
  expect(planJson.seed).toBe(deriveSeed("corpus.md", 1));

  // the append must match one of the chunks plan() returned for this round
  const firstChunk = planJson.chunks[0];
  const append = Bun.spawnSync(
    [
      "bun", "SaturationLedger.ts", "append", "--ledger", path, "--round", "1",
      "--start-row", String(firstChunk.start), "--row-count", String(firstChunk.end - firstChunk.start + 1),
      "--first-id", `r${firstChunk.start}`, "--last-id", `r${firstChunk.end}`,
      "--read-ref", `read corpus.md @ lines ${firstChunk.start}-${firstChunk.end}`, "--new-findings", "3",
    ],
    { cwd: import.meta.dir }
  );
  expect(append.exitCode).toBe(0);

  const status = Bun.spawnSync(["bun", "SaturationLedger.ts", "status", "--ledger", path], { cwd: import.meta.dir });
  expect(status.exitCode).toBe(0);
  const statusJson = JSON.parse(status.stdout.toString());
  expect(statusJson.state).toBe("insufficient");
});

test("arch M12: --help prints usage and exits 0", () => {
  const res = Bun.spawnSync(["bun", "SaturationLedger.ts", "--help"], { cwd: import.meta.dir });
  expect(res.exitCode).toBe(0);
  expect(res.stdout.toString()).toContain("Usage");
});

test("fnv1a32 / deriveSeed are deterministic and vary with round", () => {
  expect(fnv1a32("x")).toBe(fnv1a32("x"));
  expect(deriveSeed("corpus.md", 1)).toBe(deriveSeed("corpus.md", 1));
  expect(deriveSeed("corpus.md", 1)).not.toBe(deriveSeed("corpus.md", 2));
});

// ---------------------------------------------------------------------------
// item 7: append must match the plan; --gap for out-of-plan reads
// ---------------------------------------------------------------------------

test("item 7: a 1-row entry in a normal round is refused, naming the planned chunks", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header({ totalRows: 100, chunkSize: 10, roundChunks: 8 }));
  expect(() =>
    appendEntry(path, { round: 1, startRow: 2, rowCount: 1, firstId: "r2", lastId: "r2", readRef: "read corpus.md @ line 2", newFindings: 0 })
  ).toThrow(/does not match any chunk plan\(\) returns for round 1/);
});

test("item 7: appending chunk 1 of a round does not change what that round's other chunks are", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header({ totalRows: 100, chunkSize: 10, roundChunks: 8 }));
  const loadedBefore = loadLedger(path);
  if (!loadedBefore.exists) throw new Error("expected ledger");
  const chunksBefore = planChunksForRound(loadedBefore, 1);

  const first = chunksBefore[0];
  appendEntry(path, {
    round: 1,
    startRow: first.start,
    rowCount: first.end - first.start + 1,
    firstId: `r${first.start}`,
    lastId: `r${first.end}`,
    readRef: `read corpus.md @ lines ${first.start}-${first.end}`,
    newFindings: 1,
  });

  const loadedAfter = loadLedger(path);
  if (!loadedAfter.exists) throw new Error("expected ledger");
  const chunksAfter = planChunksForRound(loadedAfter, 1);
  // round 1's plan, recomputed after its own first chunk was appended, is unchanged (the
  // append's own entries are excluded from the coverage used to compute it)
  expect(chunksAfter).toEqual(chunksBefore);
});

test("item 7 / final-check item 6: --gap accepts a read of an unread gap once NO_FIT genuinely holds, and its round is never counted", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  // 88 rows / chunk size 10 -> 9 grid candidates (1,11,...,81). Round 1 takes 8 of them,
  // leaving exactly 1 free for round 2 -- fewer than round_chunks=8, so round 2's plan()
  // genuinely returns NO_FIT and --gap is the only way to read what's left.
  initLedger(path, header({ totalRows: 88, chunkSize: 10, roundChunks: 8, baseRounds: 1, runRounds: 1, newInfoThreshold: 0.5 }));

  let loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  for (const c of planChunksForRound(loaded, 1)) {
    appendEntry(path, {
      round: 1,
      startRow: c.start,
      rowCount: c.end - c.start + 1,
      firstId: `r${c.start}`,
      lastId: `r${c.end}`,
      readRef: `read corpus.md @ lines ${c.start}-${c.end}`,
      newFindings: 1,
    });
  }

  loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  expect(() => planChunksForRound(loaded, 2)).toThrow(/^NO_FIT:/);

  const gapRange = unreadGapFor(path);
  appendEntry(path, {
    round: 2,
    startRow: gapRange.start,
    rowCount: gapRange.end - gapRange.start + 1,
    firstId: `r${gapRange.start}`,
    lastId: `r${gapRange.end}`,
    readRef: `read corpus.md @ lines ${gapRange.start}-${gapRange.end}`,
    newFindings: 0,
    gap: true,
  });

  const final = loadLedger(path);
  if (!final.exists) throw new Error("expected ledger");
  const status = stoppingStatus(final);
  // round 2 has only 1 entry (< round_chunks) and it's a gap entry either way: not counted
  expect(status.countedRounds).toBe(1);
  expect(status.state).toBe("insufficient");
});

// ---------------------------------------------------------------------------
// final-check item 6: --gap precondition -- refused unless plan() would NO_FIT for that round,
// and a round may not mix planned (non-gap) and gap entries
// ---------------------------------------------------------------------------

test("--gap is refused when plan() still has room for a full chunk (no NO_FIT)", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header({ totalRows: 500, chunkSize: 10, roundChunks: 8 }));
  expect(() =>
    appendEntry(path, { round: 1, startRow: 1, rowCount: 5, firstId: "r1", lastId: "r5", readRef: "read corpus.md @ lines 1-5", newFindings: 0, gap: true })
  ).toThrow(/--gap is refused.*NO_FIT/s);
});

test("a gap entry is refused when its round already has a planned (non-gap) entry, even once that round later reaches NO_FIT", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  // 179 rows / chunk size 10 -> 18 grid candidates. Round 1 takes 8, leaving 10 -- plenty for
  // round 2's first (successful, non-gap) chunk. Round 3 then takes 8 of the remaining 9, so
  // when round 2 is re-planned (excluding its own 1 entry) only 2 candidates are left --
  // NO_FIT -- while one candidate (round 3's leftover) stays genuinely unread, giving the
  // refused append somewhere valid to aim at.
  initLedger(path, header({ totalRows: 179, chunkSize: 10, roundChunks: 8 }));

  let loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  for (const c of planChunksForRound(loaded, 1)) {
    appendEntry(path, { round: 1, startRow: c.start, rowCount: c.end - c.start + 1, firstId: `r${c.start}`, lastId: `r${c.end}`, readRef: `read corpus.md @ lines ${c.start}-${c.end}`, newFindings: 0 });
  }

  loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  const round2Plan = planChunksForRound(loaded, 2); // succeeds now -- capacity is plentiful
  const first = round2Plan[0];
  appendEntry(path, { round: 2, startRow: first.start, rowCount: first.end - first.start + 1, firstId: `r${first.start}`, lastId: `r${first.end}`, readRef: `read corpus.md @ lines ${first.start}-${first.end}`, newFindings: 0 });

  loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  for (const c of planChunksForRound(loaded, 3)) {
    appendEntry(path, { round: 3, startRow: c.start, rowCount: c.end - c.start + 1, firstId: `r${c.start}`, lastId: `r${c.end}`, readRef: `read corpus.md @ lines ${c.start}-${c.end}`, newFindings: 0 });
  }

  loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  expect(() => planChunksForRound(loaded, 2)).toThrow(/^NO_FIT:/); // confirms round 2 now genuinely NO_FITs

  const spare = unreadGapFor(path); // the one candidate nobody has touched
  expect(() =>
    appendEntry(path, {
      round: 2,
      startRow: spare.start,
      rowCount: spare.end - spare.start + 1,
      firstId: `r${spare.start}`,
      lastId: `r${spare.end}`,
      readRef: `read corpus.md @ lines ${spare.start}-${spare.end}`,
      newFindings: 0,
      gap: true,
    })
  ).toThrow(/round 2 already has a planned \(non-gap\) entry/);
});

test("a planned (non-gap) entry is refused when its round already has a gap entry", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  // 98 rows / chunk size 10 -> 10 grid candidates. Round 1 takes 8, leaving 2 -- fewer than
  // round_chunks=8, so round 2 NO_FITs immediately (0 entries yet). One --gap read leaves one
  // spare candidate untouched, so a second, non-gap append attempt has somewhere valid to aim
  // at and is refused purely by the mixing rule, not by an overlap or a plan mismatch.
  initLedger(path, header({ totalRows: 98, chunkSize: 10, roundChunks: 8 }));

  let loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  for (const c of planChunksForRound(loaded, 1)) {
    appendEntry(path, { round: 1, startRow: c.start, rowCount: c.end - c.start + 1, firstId: `r${c.start}`, lastId: `r${c.end}`, readRef: `read corpus.md @ lines ${c.start}-${c.end}`, newFindings: 0 });
  }

  loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  expect(() => planChunksForRound(loaded, 2)).toThrow(/^NO_FIT:/);

  const firstGap = unreadGapFor(path);
  appendEntry(path, { round: 2, startRow: firstGap.start, rowCount: firstGap.end - firstGap.start + 1, firstId: `r${firstGap.start}`, lastId: `r${firstGap.end}`, readRef: `read corpus.md @ lines ${firstGap.start}-${firstGap.end}`, newFindings: 0, gap: true });

  const secondFree = unreadGapFor(path);
  expect(() =>
    appendEntry(path, {
      round: 2,
      startRow: secondFree.start,
      rowCount: secondFree.end - secondFree.start + 1,
      firstId: `r${secondFree.start}`,
      lastId: `r${secondFree.end}`,
      readRef: `read corpus.md @ lines ${secondFree.start}-${secondFree.end}`,
      newFindings: 0,
    })
  ).toThrow(/round 2 already has a gap entry/);
});

function unreadGapFor(path: string) {
  const loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  const covered = loaded.entries.map((e) => ({ start: e.startRow, end: e.startRow + e.rowCount - 1 }));
  const sorted = [...covered].sort((a, b) => a.start - b.start);
  let cursor = 1;
  for (const r of sorted) {
    if (r.start > cursor) return { start: cursor, end: r.start - 1 };
    cursor = Math.max(cursor, r.end + 1);
  }
  return { start: cursor, end: loaded.header.totalRows };
}

// ---------------------------------------------------------------------------
// item 8 (NS1): new findings in an uncounted round after the base
// ---------------------------------------------------------------------------

test("item 8 / NS1: new findings in a short round after the base block meets_rule with new_in_uncounted_round", () => {
  const ledger: Ledger = {
    header: header({ chunkSize: 10, roundChunks: 2, baseRounds: 1, runRounds: 1, newInfoThreshold: 0.5 }),
    entries: [
      entry({ round: 1, startRow: 1, rowCount: 10, newFindings: 20 }),
      entry({ round: 1, startRow: 11, rowCount: 10, newFindings: 0 }), // round 1: full base round
      entry({ round: 2, startRow: 21, rowCount: 10, newFindings: 5 }), // round 2: short (1 of 2), has new findings
      entry({ round: 3, startRow: 31, rowCount: 10, newFindings: 0 }),
      entry({ round: 3, startRow: 41, rowCount: 10, newFindings: 0 }), // round 3: full run round, 0 new
    ],
  };
  const status = stoppingStatus(ledger);
  expect(status.baseFindings).toBe(20);
  expect(status.newInRun).toBe(0); // round 3 only
  expect(status.allowedNew).toBe(10); // floor(0.5 * 20)
  expect(status.uncountedNewFindings).toBe(5); // round 2's findings, otherwise invisible to the rule
  expect(status.state).toBe("new_in_uncounted_round"); // NOT meets_rule
});

test("item 8 / NS1: a gap round after the base with new findings also blocks meets_rule", () => {
  const ledger: Ledger = {
    header: header({ chunkSize: 10, roundChunks: 1, baseRounds: 1, runRounds: 1, newInfoThreshold: 0.5 }),
    entries: [
      entry({ round: 1, startRow: 1, rowCount: 10, newFindings: 10 }),
      entry({ round: 2, startRow: 11, rowCount: 3, newFindings: 2, gap: true }), // gap round, has new findings
      entry({ round: 3, startRow: 21, rowCount: 10, newFindings: 0 }),
    ],
  };
  const status = stoppingStatus(ledger);
  expect(status.uncountedNewFindings).toBe(2);
  expect(status.state).toBe("new_in_uncounted_round");
});

test("item 8 / NS1: an uncounted round's findings at or before the last base round do not block meets_rule", () => {
  // round 1 is short and comes BEFORE the (single) counted base round, so it must not count
  // here -- only uncounted rounds AFTER the last base round matter.
  const ledger: Ledger = {
    header: header({ chunkSize: 10, roundChunks: 2, baseRounds: 1, runRounds: 1, newInfoThreshold: 0.5 }),
    entries: [
      entry({ round: 1, startRow: 1, rowCount: 10, newFindings: 99 }), // short (1 of 2 chunks)
      entry({ round: 2, startRow: 11, rowCount: 10, newFindings: 10 }),
      entry({ round: 2, startRow: 21, rowCount: 10, newFindings: 0 }), // round 2: full base round
      entry({ round: 3, startRow: 31, rowCount: 10, newFindings: 0 }),
      entry({ round: 3, startRow: 41, rowCount: 10, newFindings: 0 }), // round 3: full run round
    ],
  };
  const status = stoppingStatus(ledger);
  expect(status.uncountedNewFindings).toBe(0);
  expect(status.state).toBe("meets_rule");
});

// ---------------------------------------------------------------------------
// item 9 (NS3): --date must be YYYY-MM-DD
// ---------------------------------------------------------------------------

test("item 9 / NS3: appendEntry rejects a --date that is not YYYY-MM-DD", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header({ totalRows: 100, chunkSize: 10, roundChunks: 8 }));
  const loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  const c = planChunksForRound(loaded, 1)[0];
  expect(() =>
    appendEntry(path, {
      round: 1,
      startRow: c.start,
      rowCount: c.end - c.start + 1,
      firstId: `r${c.start}`,
      lastId: `r${c.end}`,
      readRef: "read corpus.md @ lines 1-10",
      newFindings: 1,
      date: "2026|09",
    })
  ).toThrow(/--date must be a real YYYY-MM-DD calendar date/);
  // the ledger must still have zero entries: the rejected write never touched the file
  const after = loadLedger(path);
  expect(after.exists && after.entries.length).toBe(0);
});

test("final-check item 7: --date rejects a well-formed but nonexistent calendar date", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header({ totalRows: 100, chunkSize: 10, roundChunks: 8 }));
  const loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  const c = planChunksForRound(loaded, 1)[0];
  expect(() =>
    appendEntry(path, {
      round: 1,
      startRow: c.start,
      rowCount: c.end - c.start + 1,
      firstId: `r${c.start}`,
      lastId: `r${c.end}`,
      readRef: "read corpus.md @ lines 1-10",
      newFindings: 1,
      date: "2026-13-45", // shape-valid, calendar-invalid: month 13, day 45
    })
  ).toThrow(/--date must be a real YYYY-MM-DD calendar date/);
  const after = loadLedger(path);
  expect(after.exists && after.entries.length).toBe(0);
});

// ---------------------------------------------------------------------------
// item 10 (NS6): loadLedger re-validates the header; duplicate keys and newline injection
// ---------------------------------------------------------------------------

test("item 10 / NS6: loadLedger rejects a header that fails validateHeader's structural checks", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  let text = readFileSync(path, "utf8");
  text = text.replace("# round_chunks: 10", "# round_chunks: 3"); // below the 8-chunk floor
  require("node:fs").writeFileSync(path, text, "utf8");
  expect(() => loadLedger(path)).toThrow(/--round-chunks/);
});

test("item 10 / NS6: loadLedger rejects a duplicate header key", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header());
  const text = readFileSync(path, "utf8");
  // hand-edit in a second base_rounds line, as an injected --declared value with an embedded
  // newline would produce
  const poisoned = text + "# base_rounds: 0\n";
  require("node:fs").writeFileSync(path, poisoned, "utf8");
  expect(() => loadLedger(path)).toThrow(/duplicate ledger header key "base_rounds"/);
});

test("item 10 / NS6: initLedger rejects a newline or '|' in --corpus-file or --declared", () => {
  const dir = tmpDir();
  expect(() => initLedger(join(dir, "a.txt"), header({ declared: "2026-09-27\n# base_rounds: 0" }))).toThrow(/--declared/);
  expect(() => initLedger(join(dir, "b.txt"), header({ corpusFile: "corpus|evil.md" }))).toThrow(/--corpus-file/);
});

// ---------------------------------------------------------------------------
// item 11 (NM1): allowedNew floor with float-noise guard
// ---------------------------------------------------------------------------

test("item 11 / NM1: allowedNew = floor(T * baseFindings + 1e-9), not sensitive to float noise", () => {
  const ledgerA: Ledger = {
    header: header({ chunkSize: 10, roundChunks: 1, baseRounds: 1, runRounds: 1, newInfoThreshold: 0.29 }),
    entries: [
      entry({ round: 1, startRow: 1, rowCount: 10, newFindings: 100 }),
      entry({ round: 2, startRow: 11, rowCount: 10, newFindings: 0 }),
    ],
  };
  expect(stoppingStatus(ledgerA).allowedNew).toBe(29); // 0.29 * 100 = 28.999999999999996 in float

  const ledgerB: Ledger = {
    header: header({ chunkSize: 10, roundChunks: 1, baseRounds: 1, runRounds: 1, newInfoThreshold: 0.05 }),
    entries: [
      entry({ round: 1, startRow: 1, rowCount: 10, newFindings: 30 }),
      entry({ round: 2, startRow: 11, rowCount: 10, newFindings: 0 }),
    ],
  };
  expect(stoppingStatus(ledgerB).allowedNew).toBe(1); // kills the floor -> ceil mutant (0.05*30=1.5)
});

// ---------------------------------------------------------------------------
// item 12 (NM5): plan --round must be a positive integer
// ---------------------------------------------------------------------------

test("item 12 / NM5: CLI plan --round must be a positive integer", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  const init = Bun.spawnSync(
    ["bun", "SaturationLedger.ts", "init", "--ledger", path, "--corpus-file", "corpus.md", "--total-rows", "100", "--chunk-size", "10", "--round-chunks", "8", "--base-rounds", "1", "--run-rounds", "1", "--new-info-threshold", "0.1"],
    { cwd: import.meta.dir }
  );
  expect(init.exitCode).toBe(0);

  const badRound = Bun.spawnSync(["bun", "SaturationLedger.ts", "plan", "--ledger", path, "--round", "abc"], { cwd: import.meta.dir });
  expect(badRound.exitCode).not.toBe(0);
  expect(badRound.stderr.toString()).toMatch(/--round/);

  const fractional = Bun.spawnSync(["bun", "SaturationLedger.ts", "plan", "--ledger", path, "--round", "1.5"], { cwd: import.meta.dir });
  expect(fractional.exitCode).not.toBe(0);
});

// ---------------------------------------------------------------------------
// item 13 (mutant M5a): a hand-edited NaN entry field is rejected by loadLedger
// ---------------------------------------------------------------------------

test("item 13 / mutant M5a: loadLedger rejects a hand-edited entry with NaN in a numeric field", () => {
  const dir = tmpDir();
  const path = join(dir, "ledger.txt");
  initLedger(path, header({ totalRows: 100, chunkSize: 10, roundChunks: 8 }));
  const loaded = loadLedger(path);
  if (!loaded.exists) throw new Error("expected ledger");
  const c = planChunksForRound(loaded, 1)[0];
  appendEntry(path, {
    round: 1,
    startRow: c.start,
    rowCount: c.end - c.start + 1,
    firstId: `r${c.start}`,
    lastId: `r${c.end}`,
    readRef: `read corpus.md @ lines ${c.start}-${c.end}`,
    newFindings: 1,
  });
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n");
  const entryLineIdx = lines.findIndex((l) => l.includes("|") && !l.startsWith("#"));
  const fields = lines[entryLineIdx].split("|");
  fields[7] = "NaN"; // newFindings is field index 7: round|startRow|rowCount|firstId|lastId|readRef|seed|newFindings|oversize|gap|date
  lines[entryLineIdx] = fields.join("|");
  require("node:fs").writeFileSync(path, lines.join("\n"), "utf8");
  expect(() => loadLedger(path)).toThrow(/non-numeric newFindings/);
});
