import { describe, expect, test, afterAll } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auditFindings, auditAgainstLedger, auditRowAccounting, rowsReadFromCorpus, rowsReadFromLedger, parseRowAccounting, type Transcript } from "./AuditRound.ts";
import type { Ledger, LedgerHeader } from "./SaturationLedger.ts";
import { initLedger } from "./SaturationLedger.ts";
import { appendFileSync, mkdirSync } from "node:fs";

const createdDirs: string[] = [];
function tmpDir(): string {
  const d = mkdtempSync(join(tmpdir(), "scp-audit-"));
  createdDirs.push(d);
  return d;
}
afterAll(() => {
  for (const d of createdDirs) rmSync(d, { recursive: true, force: true });
});

function verdictOf(md: string, transcript: Transcript, index = 0) {
  const { results } = auditFindings(md, transcript);
  return results[index]?.verdict;
}

function ledgerHeader(overrides: Partial<LedgerHeader> = {}): LedgerHeader {
  return {
    totalRows: 500,
    corpusFile: "corpus.md",
    corpusSha256: "0".repeat(64), // placeholder: these in-memory ledgers never touch disk hashing
    chunkSize: 10,
    roundChunks: 10,
    baseRounds: 2,
    runRounds: 1,
    newInfoThreshold: 0.1,
    declared: "2026-09-27",
    ...overrides,
  };
}

test("OK: a [researched] citation whose quote is found in the exact read call, on the exact row", () => {
  const md = `### F7 — Riders want more shelter at exposed stops\n- Citation: [r7 — read wait-times.md @ lines 10-12] [researched] "the wind at the Elm stop is brutal in winter"\n`;
  const transcript: Transcript = {
    calls: [{ ref: "read wait-times.md @ lines 10-12", file: "/x/wait-times.md", text: `10\t[r7] the wind at the Elm stop is brutal in winter\n11\t[r8] unrelated row\n` }],
  };
  expect(verdictOf(md, transcript)).toBe("OK");
});

test("UNCHECKED: a [model knowledge — verify] citation is never OK — it is not a finding backed by a read", () => {
  const md = `### F9 — General note on transit wait times\n- Citation: [r9 — read wait-times.md @ lines 1-1] [model knowledge — verify]\n`;
  const transcript: Transcript = { calls: [] };
  const { results, passed } = auditFindings(md, transcript);
  expect(results[0].verdict).toBe("UNCHECKED");
  expect(passed).toBe(false);
});

test("MALFORMED: a line that starts '- Citation:' but does not parse", () => {
  const md = `### F1 — Broken citation line\n- Citation: this is not in the required syntax\n`;
  expect(verdictOf(md, { calls: [] })).toBe("MALFORMED");
});

test("NO_CITATION: an F-heading finding block with no Citation line at all", () => {
  const md = `### F1 — A finding with no citation\nThis block never cites a row.\n`;
  expect(verdictOf(md, { calls: [] })).toBe("NO_CITATION");
});

test("NO_FINDINGS: a file with zero ### F<n> heading blocks fails, even if it has other headings", () => {
  const md = `### Stopping rule\nBase 60 rows, run 30 rows, threshold 0.1.\n\n### Notes\nJust prose.\n`;
  const { results, passed } = auditFindings(md, { calls: [] });
  expect(results).toEqual([{ heading: "(file)", line: "", verdict: "NO_FINDINGS" }]);
  expect(passed).toBe(false);
});

test("an empty file is NO_FINDINGS", () => {
  const { results, passed } = auditFindings("", { calls: [] });
  expect(results[0].verdict).toBe("NO_FINDINGS");
  expect(passed).toBe(false);
});

test("'### Stopping rule' text inside a file that also has F-headings is not itself audited as a finding", () => {
  const md = `### Stopping rule\nBase 60, run 30.\n\n### F1 — A real finding\n- Citation: [r1 — read a.md @ lines 1-1] [researched] "good quote"\n`;
  const transcript: Transcript = { calls: [{ ref: "read a.md @ lines 1-1", file: "/x/a.md", text: `1\t[r1] good quote here\n` }] };
  const { results } = auditFindings(md, transcript);
  expect(results.length).toBe(1);
  expect(results[0].heading).toBe("### F1 — A real finding");
});

test("MISSING_READ: the cited read-ref has no matching call in the transcript", () => {
  const md = `### F3 — A finding citing a read that never happened\n- Citation: [r3 — read nowhere.md @ lines 1-2] [researched] "some quote"\n`;
  expect(verdictOf(md, { calls: [] })).toBe("MISSING_READ");
});

test("S7: the row match is anchored to the line start — a different row's line that merely MENTIONS the cited id is not mistaken for it", () => {
  const md = `### F4 — A finding citing the wrong row id\n- Citation: [r4 — read wait-times.md @ lines 3-4] [researched] "the wind at the Elm stop is brutal"\n`;
  const transcript: Transcript = {
    calls: [
      {
        ref: "read wait-times.md @ lines 3-4",
        file: "/x/wait-times.md",
        text: `3\t[r3] the sign at the stop mentions [r4] the wind at the Elm stop is brutal\n4\t[r4] a completely different row\n`,
      },
    ],
  };
  // before the fix, "includes('[r4]')" would find line 3 (which merely mentions "[r4]") and
  // test the quote against that whole line, producing a false OK
  expect(verdictOf(md, transcript)).toBe("QUOTE_NOT_FOUND");
});

test("S7: the quote is tested against the text AFTER the id prefix, not the whole line", () => {
  const md = `### F5 — A finding whose quote tries to cross the id boundary\n- Citation: [r4 — read wait-times.md @ lines 4-4] [researched] "r4] a completely"\n`;
  const transcript: Transcript = {
    calls: [{ ref: "read wait-times.md @ lines 4-4", file: "/x/wait-times.md", text: `4\t[r4] a completely different row\n` }],
  };
  expect(verdictOf(md, transcript)).toBe("QUOTE_NOT_FOUND");
});

test("NO_QUOTE: a [researched] citation without a quote fails", () => {
  const md = `### F1 — A finding with no quote\n- Citation: [r1 — read wait-times.md @ lines 1-1] [researched]\n`;
  const transcript: Transcript = { calls: [{ ref: "read wait-times.md @ lines 1-1", file: "/x/wait-times.md", text: `1\t[r1] wind at the Elm stop\n` }] };
  const result = auditFindings(md, transcript);
  expect(result.results[0].verdict).toBe("NO_QUOTE");
  expect(result.passed).toBe(false);
});

test("QUOTE_NOT_FOUND: the quote is not a substring of that row's line in that call's text", () => {
  const md = `### F1 — A finding whose quote doesn't match\n- Citation: [r1 — read wait-times.md @ lines 1-1] [researched] "a quote that was never said"\n`;
  const transcript: Transcript = { calls: [{ ref: "read wait-times.md @ lines 1-1", file: "/x/wait-times.md", text: `1\t[r1] wind at the Elm stop\n` }] };
  expect(verdictOf(md, transcript)).toBe("QUOTE_NOT_FOUND");
});

test("LINE_TRUNCATED: a very long row line that doesn't contain the quote is reported distinctly from QUOTE_NOT_FOUND", () => {
  const longLine = "[r1] " + "word ".repeat(500); // well over 2000 characters, quote absent
  const md = `### F1 — A finding on a very long row\n- Citation: [r1 — read wait-times.md @ lines 1-1] [researched] "a phrase that got cut off"\n`;
  const transcript: Transcript = { calls: [{ ref: "read wait-times.md @ lines 1-1", file: "/x/wait-times.md", text: `1\t${longLine}\n` }] };
  expect(verdictOf(md, transcript)).toBe("LINE_TRUNCATED");
});

test("cat -n style line-number prefixes on transcript text are handled transparently", () => {
  const md = `### F4 — A finding read through a tool that prefixes line numbers\n- Citation: [r4 — read wait-times.md @ lines 40-41] [researched] "the shelter roof leaks"\n`;
  const transcript: Transcript = {
    calls: [{ ref: "read wait-times.md @ lines 40-41", file: "/x/wait-times.md", text: `    40\t[r4] the shelter roof leaks\n    41\t[r5] unrelated\n` }],
  };
  expect(verdictOf(md, transcript)).toBe("OK");
});

test("S9: a quote containing embedded quotation marks is captured to the LAST quote mark on the line", () => {
  const md = `### F1 — A finding whose quote embeds a quotation\n- Citation: [r1 — read a.md @ lines 1-1] [researched] "she said "hello" to the driver"\n`;
  const transcript: Transcript = { calls: [{ ref: "read a.md @ lines 1-1", file: "/x/a.md", text: `1\t[r1] she said "hello" to the driver\n` }] };
  expect(verdictOf(md, transcript)).toBe("OK");
});

test("S6: if the same read-ref appears in several calls, the citation passes if ANY of them satisfies it", () => {
  const md = `### F1 — A finding whose read-ref was called twice\n- Citation: [r1 — read a.md @ lines 1-1] [researched] "good quote"\n`;
  const transcript: Transcript = {
    calls: [
      { ref: "read a.md @ lines 1-1", file: "/x/a.md", text: `1\t[r1] nothing useful here\n` }, // first call: doesn't satisfy
      { ref: "read a.md @ lines 1-1", file: "/x/a.md", text: `1\t[r1] good quote appears here\n` }, // second call: satisfies
    ],
  };
  expect(verdictOf(md, transcript)).toBe("OK");
});

test("string tool_result content and a round with a mix of verdicts: the round fails if any citation is not OK", () => {
  const md = [
    `### F1 — First finding, good citation`,
    `- Citation: [r1 — read a.md @ lines 1-1] [researched] "good quote"`,
    ``,
    `### F2 — Second finding, bad citation`,
    `- Citation: [r2 — read a.md @ lines 1-1] [researched] "quote never said"`,
  ].join("\n");
  const transcript: Transcript = { calls: [{ ref: "read a.md @ lines 1-1", file: "/x/a.md", text: `1\t[r1] good quote here\n1\t[r2] something else entirely\n` }] };
  const { results, passed } = auditFindings(md, transcript);
  expect(results.map((r) => r.verdict)).toEqual(["OK", "QUOTE_NOT_FOUND"]);
  expect(passed).toBe(false);
});

test("citationsChecked counts only [researched] citations, not [model knowledge — verify] ones", () => {
  const md = [
    `### F1 — Researched`,
    `- Citation: [r1 — read a.md @ lines 1-1] [researched] "good quote"`,
    ``,
    `### F2 — Model knowledge`,
    `- Citation: [r2 — read a.md @ lines 1-1] [model knowledge — verify]`,
  ].join("\n");
  const transcript: Transcript = { calls: [{ ref: "read a.md @ lines 1-1", file: "/x/a.md", text: `1\t[r1] good quote here\n` }] };
  const { citationsChecked } = auditFindings(md, transcript);
  expect(citationsChecked).toBe(1);
});

test("CLI: exits 0 on an all-OK round and 1 on a failing round, printing the citation count", () => {
  const dir = tmpDir();
  const transcriptPath = join(dir, "transcript.json");
  const passFindingsPath = join(dir, "pass.md");
  const failFindingsPath = join(dir, "fail.md");

  writeFileSync(
    transcriptPath,
    JSON.stringify({ calls: [{ ref: "read a.md @ lines 1-1", file: "/x/a.md", text: "1\t[r1] good quote here\n" }] })
  );
  writeFileSync(passFindingsPath, `### F1 — Good\n- Citation: [r1 — read a.md @ lines 1-1] [researched] "good quote"\n`);
  writeFileSync(failFindingsPath, `### F1 — Bad\n- Citation: [r1 — read a.md @ lines 1-1] [researched] "wrong quote"\n`);

  const pass = Bun.spawnSync(["bun", "AuditRound.ts", "--transcript", transcriptPath, "--findings", passFindingsPath], {
    cwd: import.meta.dir,
  });
  expect(pass.exitCode).toBe(0);
  expect(pass.stdout.toString()).toContain("1 citation(s) checked: PASS");

  const fail = Bun.spawnSync(["bun", "AuditRound.ts", "--transcript", transcriptPath, "--findings", failFindingsPath], {
    cwd: import.meta.dir,
  });
  expect(fail.exitCode).toBe(1);
});

test("arch M12: --help prints usage and exits 0", () => {
  const res = Bun.spawnSync(["bun", "AuditRound.ts", "--help"], { cwd: import.meta.dir });
  expect(res.exitCode).toBe(0);
  expect(res.stdout.toString()).toContain("Usage");
});

// ---------------------------------------------------------------------------
// ruling 6a: --ledger / --round cross-check
// ---------------------------------------------------------------------------

test("ledger cross-check: LEDGER_READ_MISSING when a ledgered read-ref never appears in the transcript", () => {
  const ledger: Ledger = {
    header: ledgerHeader(),
    entries: [{ round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", seed: 1, newFindings: 1, oversize: false, gap: false, date: "2026-09-27" }],
  };
  const md = `### F1 — Something\nNew\n- Citation: [r1 — read a.md @ lines 1-10] [researched] "quote"\n`;
  const transcript: Transcript = { calls: [] }; // the read never happened, per the transcript
  const result = auditAgainstLedger(md, transcript, ledger, 1);
  expect(result.checks[0].verdict).toBe("LEDGER_READ_MISSING");
  expect(result.passed).toBe(false);
});

test("ledger cross-check: COUNT_MISMATCH when the ledger's new_findings disagrees with the New-status blocks citing that read", () => {
  const ledger: Ledger = {
    header: ledgerHeader(),
    entries: [{ round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", seed: 1, newFindings: 2, oversize: false, gap: false, date: "2026-09-27" }],
  };
  const md = `### F1 — Only one New finding\nNew\n- Citation: [r1 — read a.md @ lines 1-10] [researched] "quote"\n`;
  const transcript: Transcript = {
    calls: [{ ref: "read a.md @ lines 1-10", file: "/x/a.md", text: `1\t[r1] quote here\n10\t[r10] the last row of the read\n` }],
  };
  const result = auditAgainstLedger(md, transcript, ledger, 1);
  expect(result.checks[0].verdict).toBe("COUNT_MISMATCH");
  expect(result.checks[0].detail).toContain("new_findings=2");
  expect(result.checks[0].detail).toContain("1 \"New\"");
});

test("ledger cross-check: OK when the read-ref is in the transcript and the New-count matches", () => {
  const ledger: Ledger = {
    header: ledgerHeader(),
    entries: [{ round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", seed: 1, newFindings: 1, oversize: false, gap: false, date: "2026-09-27" }],
  };
  const md = [
    `### F1 — A new finding`,
    `New`,
    `- Citation: [r1 — read a.md @ lines 1-10] [researched] "quote"`,
    ``,
    `### F2 — Reinforced, not new`,
    `Reinforced`,
    `- Citation: [r2 — read a.md @ lines 1-10] [researched] "another quote"`,
  ].join("\n");
  const transcript: Transcript = {
    calls: [{ ref: "read a.md @ lines 1-10", file: "/x/a.md", text: `1\t[r1] quote here\n2\t[r2] another quote here\n10\t[r10] the last row of the read\n` }],
  };
  const result = auditAgainstLedger(md, transcript, ledger, 1);
  expect(result.checks[0].verdict).toBe("OK");
  expect(result.passed).toBe(true);
});

test("CLI: --ledger --round wires the cross-check into the exit code", () => {
  const dir = tmpDir();
  const transcriptPath = join(dir, "transcript.json");
  const findingsPath = join(dir, "round.md");
  const ledgerPath = join(dir, "ledger.txt");

  writeFileSync(
    transcriptPath,
    JSON.stringify({ calls: [{ ref: "read a.md @ lines 1-10", file: "/x/a.md", text: "1\t[r1] quote here\n10\t[r10] the last row\n" }] })
  );
  writeFileSync(findingsPath, `### F1 — A new finding\nNew\n- Citation: [r1 — read a.md @ lines 1-10] [researched] "quote here"\n`);
  writeFileSync(
    ledgerPath,
    [
      "# total_rows: 500",
      "# corpus_file: corpus.md",
      "# corpus_sha256: " + "0".repeat(64), // final-check item 8: required header field; not verified against a file on this (non --accounting) path
      "# chunk_size: 10",
      "# round_chunks: 10",
      "# base_rounds: 2",
      "# run_rounds: 1",
      "# new_info_threshold: 0.1",
      "# declared: 2026-09-27",
      "1|1|10|r1|r10|read a.md @ lines 1-10|1|1|false|false|2026-09-27",
    ].join("\n") + "\n"
  );

  const res = Bun.spawnSync(["bun", "AuditRound.ts", "--transcript", transcriptPath, "--findings", findingsPath, "--ledger", ledgerPath, "--round", "1"], {
    cwd: import.meta.dir,
  });
  expect(res.exitCode).toBe(0);
  expect(res.stdout.toString()).toContain("OK\tread a.md @ lines 1-10");
  expect(res.stdout.toString()).toContain("1 ledger entry checked");
});

// ---------------------------------------------------------------------------
// item 14: --ledger/--round parameter discipline, ROUND_NOT_IN_LEDGER
// ---------------------------------------------------------------------------

test("item 14 / NB2: a round with no ledger entries fails with ROUND_NOT_IN_LEDGER, not a vacuous PASS", () => {
  const ledger: Ledger = {
    header: ledgerHeader(),
    entries: [{ round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", seed: 1, newFindings: 1, oversize: false, gap: false, date: "2026-09-27" }],
  };
  const md = `### F1 — Something\nNew\n- Citation: [r1 — read a.md @ lines 1-10] [researched] "quote"\n`;
  const result = auditAgainstLedger(md, { calls: [] }, ledger, 7); // round 7 has no entries
  expect(result.checks[0].verdict).toBe("ROUND_NOT_IN_LEDGER");
  expect(result.passed).toBe(false);
  expect(result.ledgerEntriesChecked).toBe(0);
});

test("item 14: CLI requires --round when --ledger is given, and rejects a non-integer --round", () => {
  const dir = tmpDir();
  const transcriptPath = join(dir, "transcript.json");
  const findingsPath = join(dir, "round.md");
  const ledgerPath = join(dir, "ledger.txt");
  writeFileSync(transcriptPath, JSON.stringify({ calls: [] }));
  writeFileSync(findingsPath, `### F1 — X\n- Citation: [r1 — read a.md @ lines 1-1] [researched] "q"\n`);
  writeFileSync(
    ledgerPath,
    [
      "# total_rows: 500", "# corpus_file: corpus.md", "# corpus_sha256: " + "0".repeat(64), "# chunk_size: 10", "# round_chunks: 10",
      "# base_rounds: 2", "# run_rounds: 1", "# new_info_threshold: 0.1", "# declared: 2026-09-27",
    ].join("\n") + "\n"
  );

  const missingRound = Bun.spawnSync(["bun", "AuditRound.ts", "--transcript", transcriptPath, "--findings", findingsPath, "--ledger", ledgerPath], { cwd: import.meta.dir });
  expect(missingRound.exitCode).not.toBe(0);
  expect(missingRound.stderr.toString()).toMatch(/--round/);

  const badRound = Bun.spawnSync(["bun", "AuditRound.ts", "--transcript", transcriptPath, "--findings", findingsPath, "--ledger", ledgerPath, "--round", "0"], { cwd: import.meta.dir });
  expect(badRound.exitCode).not.toBe(0);
  expect(badRound.stderr.toString()).toMatch(/--round must be a positive integer/);
});

test("item 14: CLI rejects --round given without --ledger", () => {
  const dir = tmpDir();
  const transcriptPath = join(dir, "transcript.json");
  const findingsPath = join(dir, "round.md");
  writeFileSync(transcriptPath, JSON.stringify({ calls: [] }));
  writeFileSync(findingsPath, `### F1 — X\n- Citation: [r1 — read a.md @ lines 1-1] [researched] "q"\n`);

  const res = Bun.spawnSync(["bun", "AuditRound.ts", "--transcript", transcriptPath, "--findings", findingsPath, "--round", "1"], { cwd: import.meta.dir });
  expect(res.exitCode).not.toBe(0);
  expect(res.stderr.toString()).toMatch(/--round requires --ledger/);
});

// ---------------------------------------------------------------------------
// item 15 / NS4 / quant N1: reverse check — a New finding must cite a ledgered read
// ---------------------------------------------------------------------------

test("item 15 / NS4: UNLEDGERED_READ when a New finding's first Citation names a read the round never ledgered", () => {
  const ledger: Ledger = {
    header: ledgerHeader(),
    entries: [{ round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", seed: 1, newFindings: 0, oversize: false, gap: false, date: "2026-09-27" }],
  };
  const md = `### F2 — New but from an unledgered read\nNew\n- Citation: [r90 — read holds.md @ lines 90-99] [researched] "quote"\n`;
  const transcript: Transcript = { calls: [{ ref: "read holds.md @ lines 90-99", file: "/x/holds.md", text: `90\t[r90] quote here\n99\t[r99] last row\n` }] };
  const result = auditAgainstLedger(md, transcript, ledger, 1);
  expect(result.checks.some((c) => c.verdict === "UNLEDGERED_READ" && c.readRef === "read holds.md @ lines 90-99")).toBe(true);
  expect(result.passed).toBe(false);
});

// ---------------------------------------------------------------------------
// item 16 / NS4: ledger first_id/last_id must be found in the read they claim to bound
// ---------------------------------------------------------------------------

test("item 16 / NS4: LEDGER_IDS_MISMATCH when the read's text is missing the ledger's first_id or last_id row", () => {
  const ledger: Ledger = {
    header: ledgerHeader(),
    entries: [{ round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", seed: 1, newFindings: 0, oversize: false, gap: false, date: "2026-09-27" }],
  };
  const md = `### F1 — Nothing new\nReinforced\n- Citation: [r1 — read a.md @ lines 1-10] [researched] "quote"\n`;
  // the call's text has r1 but never r10 -- the ledger's stated range doesn't match what was read
  const transcript: Transcript = { calls: [{ ref: "read a.md @ lines 1-10", file: "/x/a.md", text: `1\t[r1] quote here\n` }] };
  const result = auditAgainstLedger(md, transcript, ledger, 1);
  expect(result.checks[0].verdict).toBe("LEDGER_IDS_MISMATCH");
  expect(result.passed).toBe(false);
});

test("item 16 / NS4: OK when both first_id and last_id row lines are present in the read", () => {
  const ledger: Ledger = {
    header: ledgerHeader(),
    entries: [{ round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", seed: 1, newFindings: 0, oversize: false, gap: false, date: "2026-09-27" }],
  };
  const md = `### F1 — Nothing new\nReinforced\n- Citation: [r1 — read a.md @ lines 1-10] [researched] "quote"\n`;
  const transcript: Transcript = { calls: [{ ref: "read a.md @ lines 1-10", file: "/x/a.md", text: `1\t[r1] quote here\n10\t[r10] last row here\n` }] };
  const result = auditAgainstLedger(md, transcript, ledger, 1);
  expect(result.checks[0].verdict).toBe("OK");
});

// ---------------------------------------------------------------------------
// final-check item 5: round-section scoping (kills reviewer mutant P4, the line that skips
// blocks under a different "## Round N" heading)
// ---------------------------------------------------------------------------

test("round-section scoping: a round-2 audit ignores round-1's New block; without headings, round-1's finding is UNLEDGERED_READ", () => {
  const ledger: Ledger = {
    header: ledgerHeader(),
    entries: [
      { round: 1, startRow: 1, rowCount: 10, firstId: "r1", lastId: "r10", readRef: "read a.md @ lines 1-10", seed: 1, newFindings: 1, oversize: false, gap: false, date: "2026-09-27" },
      { round: 2, startRow: 11, rowCount: 10, firstId: "r11", lastId: "r20", readRef: "read b.md @ lines 1-10", seed: 2, newFindings: 1, oversize: false, gap: false, date: "2026-09-27" },
    ],
  };
  const transcript: Transcript = {
    calls: [
      { ref: "read a.md @ lines 1-10", file: "/x/a.md", text: `1\t[r1] quote here\n10\t[r10] the last row\n` },
      { ref: "read b.md @ lines 1-10", file: "/x/b.md", text: `1\t[r11] quote two\n10\t[r20] the last row\n` },
    ],
  };

  const sectioned = [
    `## Round 1 — First`,
    `### F1 — A round-1 finding`,
    `New`,
    `- Citation: [r1 — read a.md @ lines 1-10] [researched] "quote here"`,
    ``,
    `## Round 2 — Second`,
    `### F2 — A round-2 finding`,
    `New`,
    `- Citation: [r11 — read b.md @ lines 1-10] [researched] "quote two"`,
  ].join("\n");
  const sectionedResult = auditAgainstLedger(sectioned, transcript, ledger, 2);
  expect(sectionedResult.passed).toBe(true);
  expect(sectionedResult.checks).toEqual([{ readRef: "read b.md @ lines 1-10", verdict: "OK" }]);

  // same findings text, but with the "## Round N" headings stripped: both blocks now have
  // round === null (unsectioned), so round 1's finding is no longer scoped away from the
  // round-2 audit -- it surfaces as UNLEDGERED_READ instead of silently passing.
  const unsectioned = sectioned.replace(/^## Round \d+ — .*$/gm, "").replace(/\n{2,}/g, "\n");
  const unsectionedResult = auditAgainstLedger(unsectioned, transcript, ledger, 2);
  expect(unsectionedResult.passed).toBe(false);
  expect(unsectionedResult.checks.some((c) => c.verdict === "UNLEDGERED_READ" && c.readRef === "read a.md @ lines 1-10")).toBe(true);
});

// ---------------------------------------------------------------------------
// ruling 6: --accounting
// ---------------------------------------------------------------------------

describe("ruling 6: --accounting", () => {
  function writeCorpusFixture(dir: string, filename: string, ids: string[]): void {
    const lines = [
      "---",
      'source_type: "survey-corpus"',
      "category: \"Test\"",
      "---",
      "",
      ...ids.map((id) => `[${id}] a neutral row of test text`),
      "",
    ];
    writeFileSync(join(dir, filename), lines.join("\n"), "utf8");
  }

  function writeL1Fixture(dir: string, filename: string, corpusFiles: string[], rowAccountingLines: string[]): string {
    const path = join(dir, filename);
    const lines = ["---", `corpus_files: [${corpusFiles.join(", ")}]`, "synthesis_level: L1", "---", "# L1 test file", "", "## Row accounting", ...rowAccountingLines, ""];
    writeFileSync(path, lines.join("\n"), "utf8");
    return path;
  }

  test("clean census case: every read row lands exactly once, nothing left over", () => {
    const dir = tmpDir();
    writeCorpusFixture(dir, "cat.md", ["S-1", "S-2", "S-3"]);
    const l1Path = writeL1Fixture(dir, "L1.md", ["cat.md"], ["**Finding 1:** supporting [S-1, S-2] · contrary none", "### Rows not carried", "- [S-3] no pattern, too thin"]);

    const l1Md = readFileSyncUtf8(l1Path);
    const rowsRead = rowsReadFromCorpus(l1Md, dir);
    const result = auditRowAccounting(l1Md, rowsRead.ids);

    expect(result.rowsRead).toBe(3);
    expect(result.idsAccounted).toBe(3);
    expect(result.problems).toEqual([]);
    expect(result.passed).toBe(true);
  });

  test("NOT_READ: an accounted ID that was never actually read", () => {
    const dir = tmpDir();
    writeCorpusFixture(dir, "cat.md", ["S-1", "S-2"]);
    // S-9 is cited in Row accounting but does not exist in the corpus file
    const l1Path = writeL1Fixture(dir, "L1.md", ["cat.md"], ["**Finding 1:** supporting [S-1, S-2, S-9] · contrary none"]);

    const l1Md = readFileSyncUtf8(l1Path);
    const rowsRead = rowsReadFromCorpus(l1Md, dir);
    const result = auditRowAccounting(l1Md, rowsRead.ids);

    expect(result.problems).toEqual([{ verdict: "NOT_READ", id: "S-9" }]);
    expect(result.passed).toBe(false);
  });

  test("NOT_ACCOUNTED: a read row that appears nowhere in Row accounting", () => {
    const dir = tmpDir();
    // S-3 was read (it's in the corpus file) but never placed anywhere below
    writeCorpusFixture(dir, "cat.md", ["S-1", "S-2", "S-3"]);
    const l1Path = writeL1Fixture(dir, "L1.md", ["cat.md"], ["**Finding 1:** supporting [S-1, S-2] · contrary none"]);

    const l1Md = readFileSyncUtf8(l1Path);
    const rowsRead = rowsReadFromCorpus(l1Md, dir);
    const result = auditRowAccounting(l1Md, rowsRead.ids);

    expect(result.problems).toEqual([{ verdict: "NOT_ACCOUNTED", id: "S-3" }]);
    expect(result.passed).toBe(false);
  });

  test("DUPLICATE: the same ID placed in the supporting list of two different findings", () => {
    const dir = tmpDir();
    writeCorpusFixture(dir, "cat.md", ["S-1", "S-2"]);
    // S-2 supports both Finding 1 and Finding 2 -- L2 would count it twice
    const l1Path = writeL1Fixture(dir, "L1.md", ["cat.md"], [
      "**Finding 1:** supporting [S-1, S-2] · contrary none",
      "**Finding 2:** supporting [S-2] · contrary none",
    ]);

    const l1Md = readFileSyncUtf8(l1Path);
    const rowsRead = rowsReadFromCorpus(l1Md, dir);
    const result = auditRowAccounting(l1Md, rowsRead.ids);

    expect(result.problems).toEqual([{ verdict: "DUPLICATE", id: "S-2" }]);
    expect(result.passed).toBe(false);
  });

  test("DUPLICATE: an ID placed in both 'Rows not carried' and a supporting list", () => {
    const dir = tmpDir();
    writeCorpusFixture(dir, "cat.md", ["S-1", "S-2"]);
    const l1Path = writeL1Fixture(dir, "L1.md", ["cat.md"], [
      "**Finding 1:** supporting [S-1, S-2] · contrary none",
      "### Rows not carried",
      "- [S-2] also listed here by mistake",
    ]);

    const l1Md = readFileSyncUtf8(l1Path);
    const rowsRead = rowsReadFromCorpus(l1Md, dir);
    const result = auditRowAccounting(l1Md, rowsRead.ids);

    expect(result.problems).toEqual([{ verdict: "DUPLICATE", id: "S-2" }]);
  });

  test("a supporting-in-one-finding + contrary-in-another placement is legitimate, not a DUPLICATE", () => {
    const dir = tmpDir();
    writeCorpusFixture(dir, "cat.md", ["S-1", "S-2"]);
    const l1Path = writeL1Fixture(dir, "L1.md", ["cat.md"], [
      "**Finding 1:** supporting [S-1] · contrary [S-2]",
      "**Finding 2:** supporting [S-2] · contrary none",
    ]);

    const l1Md = readFileSyncUtf8(l1Path);
    const rowsRead = rowsReadFromCorpus(l1Md, dir);
    const result = auditRowAccounting(l1Md, rowsRead.ids);

    expect(result.problems).toEqual([]);
    expect(result.passed).toBe(true);
  });

  test("a ledger case: rows read are derived from ledger entries mapped through the corpus file's rows_start_line", () => {
    const dir = tmpDir();
    // frontmatter is 5 lines (---, 3 fields, ---) with no blank line after the closing ---, so
    // data row 1 sits on line 6; row k sits on line 6 + k - 1.
    const corpusLines = [
      "---",
      'source_type: "survey-corpus"',
      "category: \"Test\"",
      "rows_start_line: 6",
      "---",
      "[S-1] first row",
      "[S-2] second row",
      "[S-3] third row",
      "[S-4] fourth row",
      "",
    ];
    writeFileSync(join(dir, "cat.md"), corpusLines.join("\n"), "utf8");

    const ledgerPath = join(dir, "ledger.txt");
    initLedger(ledgerPath, {
      totalRows: 4,
      corpusFile: "cat.md",
      chunkSize: 5,
      roundChunks: 8,
      baseRounds: 1,
      runRounds: 1,
      newInfoThreshold: 0.1,
      declared: "2026-09-27",
    });
    // round 1 reads rows 1-2 (S-1, S-2, at lines 6-7); round 2 reads rows 3-4 (S-3, S-4, at lines 8-9)
    appendFileSync(ledgerPath, "1|1|2|S-1|S-2|read cat.md @ lines 6-7|111|0|false|false|2026-09-27\n", "utf8");
    appendFileSync(ledgerPath, "2|3|2|S-3|S-4|read cat.md @ lines 8-9|222|0|false|false|2026-09-27\n", "utf8");

    const rowsRead = rowsReadFromLedger(ledgerPath);
    expect([...rowsRead.ids].sort()).toEqual(["S-1", "S-2", "S-3", "S-4"]);

    const l1Path = writeL1Fixture(dir, "L1.md", ["cat.md"], [
      "**Finding 1:** supporting [S-1, S-2, S-3] · contrary none",
      "### Rows not carried",
      "- [S-4] no pattern",
    ]);
    const l1Md = readFileSyncUtf8(l1Path);
    const result = auditRowAccounting(l1Md, rowsRead.ids);
    expect(result.rowsRead).toBe(4);
    expect(result.idsAccounted).toBe(4);
    expect(result.passed).toBe(true);
  });

  test("final-check item 8: rowsReadFromLedger refuses once the corpus file has changed since the ledger was declared", () => {
    const dir = tmpDir();
    const corpusPath = join(dir, "cat.md");
    writeFileSync(corpusPath, ["---", "rows_start_line: 2", "---", "[S-1] only row", ""].join("\n"), "utf8");

    const ledgerPath = join(dir, "ledger.txt");
    initLedger(ledgerPath, {
      totalRows: 1,
      corpusFile: "cat.md",
      chunkSize: 5,
      roundChunks: 8,
      baseRounds: 1,
      runRounds: 1,
      newInfoThreshold: 0.1,
      declared: "2026-09-27",
    });
    appendFileSync(ledgerPath, "1|1|1|S-1|S-1|read cat.md @ lines 2-2|111|0|false|false|2026-09-27\n", "utf8");

    // the corpus file is re-exported / edited after the ledger declared its hash
    writeFileSync(corpusPath, ["---", "rows_start_line: 2", "---", "[S-1] a DIFFERENT row entirely", ""].join("\n"), "utf8");

    expect(() => rowsReadFromLedger(ledgerPath)).toThrow(/--accounting --ledger:.*corpus file changed since the ledger was declared/s);
  });

  test("--ledger resolves the corpus file from a corpus/ subfolder next to the ledger, when it is not beside the ledger itself", () => {
    const dir = tmpDir();
    mkdirSync(join(dir, "corpus"));
    writeFileSync(
      join(dir, "corpus", "cat.md"),
      // 4 lines of frontmatter (---, one field, ---) precede the data row, which sits on line 5
      ["---", 'source_type: "survey-corpus"', "rows_start_line: 5", "---", "[S-1] only row"].join("\n"),
      "utf8"
    );
    const ledgerPath = join(dir, "ledger.txt");
    initLedger(ledgerPath, {
      totalRows: 1,
      corpusFile: "cat.md",
      chunkSize: 5,
      roundChunks: 8,
      baseRounds: 1,
      runRounds: 1,
      newInfoThreshold: 0.1,
      declared: "2026-09-27",
    });
    appendFileSync(ledgerPath, "1|1|1|S-1|S-1|read cat.md @ lines 5-5|111|0|false|false|2026-09-27\n", "utf8");

    const rowsRead = rowsReadFromLedger(ledgerPath);
    expect([...rowsRead.ids]).toEqual(["S-1"]);
  });

  test("parseRowAccounting takes the ID before the arrow in an ambiguous entry like 'S-2 -> F1 | F8'", () => {
    const md = "## Row accounting\n**Finding 1:** supporting [S-1] · contrary none · ambiguous [S-2 -> F1 | F8]\n";
    const occ = parseRowAccounting(md);
    expect(occ).toContainEqual({ id: "S-2", category: "ambiguous" });
  });

  // final-check item 4: a zero-checked PASS. With an empty ledger (or an L1 file with no
  // "## Row accounting" section at all), the old code's two comparison loops had nothing to
  // iterate and printed "0 row(s) read, 0 ID(s) accounted for / PASS" — silently. Both cases
  // now fail loudly with their own verdict.

  test("NO_ROWS_READ: a ledger with zero entries fails loudly instead of a false PASS", () => {
    const dir = tmpDir();
    writeCorpusFixture(dir, "cat.md", ["S-1", "S-2"]);
    const ledgerPath = join(dir, "ledger.txt");
    initLedger(ledgerPath, {
      totalRows: 2,
      corpusFile: "cat.md",
      chunkSize: 5,
      roundChunks: 8,
      baseRounds: 1,
      runRounds: 1,
      newInfoThreshold: 0.1,
      declared: "2026-09-27",
    });
    // no entries appended: the ledger declares itself but nothing was ever read from it
    const l1Path = writeL1Fixture(dir, "L1.md", ["cat.md"], ["### Rows not carried", "- none"]);
    const l1Md = readFileSyncUtf8(l1Path);
    const rowsRead = rowsReadFromLedger(ledgerPath);
    const result = auditRowAccounting(l1Md, rowsRead.ids);

    expect(result.rowsRead).toBe(0);
    expect(result.problems.some((p) => p.verdict === "NO_ROWS_READ")).toBe(true);
    expect(result.passed).toBe(false);
  });

  test("ACCOUNTING_MISSING: an L1 file with no ## Row accounting section fails loudly even when rows were read", () => {
    const dir = tmpDir();
    writeCorpusFixture(dir, "cat.md", ["S-1", "S-2"]);
    const l1Path = join(dir, "L1_no_section.md");
    writeFileSync(l1Path, ["---", "corpus_files: [cat.md]", "synthesis_level: L1", "---", "# L1 test file with no Row accounting section at all", ""].join("\n"), "utf8");

    const l1Md = readFileSyncUtf8(l1Path);
    const rowsRead = rowsReadFromCorpus(l1Md, dir);
    const result = auditRowAccounting(l1Md, rowsRead.ids);

    expect(result.rowsRead).toBe(2);
    expect(result.problems.some((p) => p.verdict === "ACCOUNTING_MISSING")).toBe(true);
    expect(result.passed).toBe(false);
  });
});

function readFileSyncUtf8(path: string): string {
  return readFileSync(path, "utf8");
}
