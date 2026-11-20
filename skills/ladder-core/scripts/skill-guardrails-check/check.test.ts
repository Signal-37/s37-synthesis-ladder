import { describe, expect, test } from "bun:test";
import { run, resolveDocPath } from "./check";
import { join } from "path";
import { mkdtempSync, mkdirSync, cpSync, writeFileSync } from "fs";
import { tmpdir } from "os";

const CLEAN = join(import.meta.dir, "fixtures", "clean");
const FAILING = join(import.meta.dir, "fixtures", "failing");
const out = (r: ReturnType<typeof run>) => r.lines.join("\n");

describe("clean fixture", () => {
  const r = run([CLEAN]);
  test("exits 0 — every base, bare and suffixed, conforms; both anchor forms pass", () => {
    expect(r.exit).toBe(0);
    expect(out(r)).toContain("0 nonconforming");
  });
  test("all 11 vocabulary rows are exercised and counted conforming", () => {
    const m = out(r).match(/(\d+) conforming tags/);
    expect(parseInt(m![1], 10)).toBeGreaterThanOrEqual(18); // 11 bare + 7 suffixed in the fixture
  });
  test("risk marker in a file WITH anchors is not a coverage candidate", () => {
    expect(out(r)).toContain("heuristic candidates: 0");
  });
});

describe("failing fixture", () => {
  const r = run([FAILING]);
  const text = out(r);
  test("exits 1 — deterministic vocabulary findings HALT (promoted 2026-07-10 after cycle-1 triage)", () => {
    expect(r.exit).toBe(1);
    expect(text).toMatch(/VOCABULARY {3}HALT/);
  });
  test("nested-bracket tag → nesting WARN", () => {
    expect(text).toMatch(/NestedBracket\.md:\d+ — .*nesting/);
  });
  test("compound tag → compound WARN", () => {
    expect(text).toMatch(/CompoundTag\.md:\d+ — .*compound of two bases/);
  });
  test("unregistered ALL-CAPS family → unregistered WARN", () => {
    expect(text).toMatch(/Unregistered\.md:\d+ — .*unregistered family/);
  });
  test("short-form illustrative → spelling-drift WARN naming the canonical form", () => {
    expect(text).toMatch(/SpellingDrift\.md:\d+ — .*illustrative framing/);
  });
  test("atomic base extended → nonconforming WARN", () => {
    expect(text).toMatch(/AtomicExtended\.md:\d+ — .*atomic/);
  });
  test("required-clause colon form → WARN", () => {
    expect(text).toMatch(/InferredColon\.md:\d+ — .*no leading colon/);
  });
  test("reordered family head (base tail buried mid-clause) → nonconforming HALT (blind spot closed 2026-07-11)", () => {
    expect(text).toMatch(/ReorderedFamily\.md:\d+ — .*reordered/);
  });
  test("lowercase unregistered family with dash clause → unregistered HALT (second blind spot closed 2026-07-11)", () => {
    expect(text).toMatch(/LowercaseUnregistered\.md:\d+ — .*unregistered family/);
  });
  test("unwrapped lowercase template placeholder with dash clause does NOT flag — backtick wrapping is the tag/placeholder discriminator", () => {
    expect(text).not.toMatch(/one clause/);
  });
  test("single-word ALL-CAPS family with dash clause → unregistered HALT (third blind spot closed 2026-07-11)", () => {
    expect(text).toMatch(/SingleCapsUnregistered\.md:\d+ — .*unregistered family, single-word/);
  });
  test("single-word negatives: registered [DRAFT]/[HYPOTHESIS] and clauseless placeholder do NOT flag", () => {
    expect(text).not.toMatch(/\[DRAFT …\]/);
    expect(text).not.toMatch(/\[WORKFLOW/);
  });
  test("backtick-wrapped unregistered paren family → HALT (fourth blind spot closed 2026-07-11)", () => {
    expect(text).toMatch(/ParenUnregistered\.md:\d+ — .*unregistered paren family/);
  });
  test("paren negatives: registered bases, unwrapped prose, and non-exact-span inline code do NOT flag", () => {
    const parenHits = text.split("\n").filter((l) => l.includes("ParenUnregistered.md"));
    expect(parenHits.length).toBe(1); // exactly the (requires …) line, nothing else in the fixture
  });
  test("risk markers with zero anchors → coverage candidate, labeled heuristic", () => {
    expect(text).toMatch(/CoverageCandidate\.md:\d+ — heuristic candidate/);
  });
});

describe("coverage posture and v2 imperative-opener heuristic", () => {
  const COVERAGE_ONLY = join(FAILING, "workflows");
  const r = run([COVERAGE_ONLY]);
  const text = out(r);
  test("coverage-only findings exit 2, never 1 — coverage is permanently WARN-tier", () => {
    expect(r.exit).toBe(2);
    expect(text).not.toContain("halt");
  });
  test("imperative verb on first line after a ##/### heading → v2 candidate", () => {
    expect(text).toMatch(/ImperativeOpener\.md:\d+ — heuristic candidate — 1 imperative step-opener\(s\) \[v2\]/);
  });
  test("guardrail prose (Never/must) after a heading is excluded — exactly one v2 hit in the fixture", () => {
    expect(text).not.toMatch(/2 imperative step-opener/);
  });
});

describe("coverage waivers (triage 2026-07-10)", () => {
  const fs = require("fs");
  const os = require("os");
  const dir = fs.mkdtempSync(join(require("os").tmpdir(), "sgc-waiver-"));
  const waiverFile = join(dir, "waivers.txt");
  // derive the waiver key with the same rule check.ts uses for rel — repo-relative
  // when the tree is under PAI_DIR, absolute otherwise (e.g. a staged package copy)
  const PAI = process.env.PAI_DIR ?? join(process.env.HOME ?? "", ".claude");
  const relOf = (p: string) => (p.startsWith(PAI) ? p.slice(PAI.length + 1) : p);
  const candidatePath = join(FAILING, "workflows", "CoverageCandidate.md");
  fs.writeFileSync(
    waiverFile,
    `# test waivers\n${relOf(candidatePath)} | 2026-07-10 | test dismissal\n`,
  );
  const COVERAGE_ONLY = join(FAILING, "workflows");
  test("waived file no longer flags; unwaived file in same run still does", () => {
    const r = run([COVERAGE_ONLY], undefined, waiverFile);
    const text = out(r);
    expect(text).not.toMatch(/WARN {2}.*CoverageCandidate\.md/);
    expect(text).toMatch(/ImperativeOpener\.md:\d+ — heuristic candidate/);
    expect(text).toContain("(1 waived — coverage-waivers.txt)");
  });
  test("waivers never suppress vocabulary findings — a waived file's tags still HALT", () => {
    fs.writeFileSync(
      join(dir, "waivers2.txt"),
      `${relOf(join(FAILING, "NestedBracket.md"))} | 2026-07-10 | attempted vocab waiver\n`,
    );
    const r = run([FAILING], undefined, join(dir, "waivers2.txt"));
    expect(r.exit).toBe(1);
    expect(out(r)).toMatch(/NestedBracket\.md:\d+ — .*nesting/);
  });
  test("missing waiver file is fine — zero waivers, all candidates flag", () => {
    const r = run([COVERAGE_ONLY], undefined, "/nonexistent/waivers.txt");
    expect(out(r)).toMatch(/CoverageCandidate\.md:\d+ — heuristic candidate/);
    expect(out(r)).not.toContain("waived");
  });
});

// Both-directions reconciliation of the waiver list. Live defect 2026-08-06: the
// Workflows/ -> workflows/ rename (6958290, 07-12) voided two of ten waivers, which
// then re-flagged as "new" on every guard-cadence run from the fleet's first day.
describe("waiver reconciliation — an inert waiver suppresses nothing (2026-08-06)", () => {
  const fs = require("fs");
  const os = require("os");
  const dir = fs.mkdtempSync(join(os.tmpdir(), "sgc-stale-"));
  const PAI = process.env.PAI_DIR ?? join(process.env.HOME ?? "", ".claude");
  const relOf = (p: string) => (p.startsWith(PAI) ? p.slice(PAI.length + 1) : p);
  const CLEAN_ONLY = CLEAN;
  const waiverAt = (name: string, body: string) => {
    const f = join(dir, name);
    fs.writeFileSync(f, body);
    return f;
  };

  test("waiver path with no file in the tree → HALT, exit 1", () => {
    const w = waiverAt("gone.txt", "skills/Research/workflows/DeletedByAnAudit.md | 2026-07-10 | ruled\n");
    const r = run([CLEAN_ONLY], undefined, w);
    expect(r.exit).toBe(1);
    expect(out(r)).toMatch(/WAIVERS {6}HALT/);
    expect(out(r)).toMatch(/DeletedByAnAudit\.md — no such file in the tree/);
  });

  // The control. macOS is case-insensitive: existsSync() returns TRUE for this path,
  // so a reconciler built on existsSync reports clean on the very defect it was
  // written to catch. Asserting BOTH halves — the check fails, and the cheap
  // instrument would not have — is what makes this a test rather than a hope.
  test("waiver path with drifted CASE → HALT naming the real on-disk path, where existsSync() would have passed", () => {
    const real = join(PAI, "skills", "SystemsThinking", "workflows", "FindArchetype.md");
    if (!fs.existsSync(real)) return; // live-tree anchored; skip if the file ever moves
    const wrongCase = "skills/SystemsThinking/Workflows/FindArchetype.md";
    expect(fs.existsSync(join(PAI, wrongCase))).toBe(true); // the blind instrument, demonstrated
    const w = waiverAt("case.txt", `${wrongCase} | 2026-07-10 | ruled\n`);
    const r = run([CLEAN_ONLY], undefined, w);
    expect(r.exit).toBe(1);
    expect(out(r)).toMatch(/case\/path drift — on disk: skills\/SystemsThinking\/workflows\/FindArchetype\.md/);
  });

  test("waivers that all resolve case-exactly → PASS, and a coverage-only run still exits 2 not 1", () => {
    const w = waiverAt("good.txt", `${relOf(join(FAILING, "workflows", "CoverageCandidate.md"))} | 2026-07-10 | ruled\n`);
    const r = run([join(FAILING, "workflows")], undefined, w);
    expect(out(r)).toMatch(/WAIVERS {6}PASS {2}1 coverage waivers, 0 inert/);
    expect(r.exit).toBe(2);
  });

  test("the live waiver file is fully reconciled — no inert lines in the real tree", () => {
    const r = run([CLEAN_ONLY]); // default waivers path = the real coverage-waivers.txt
    expect(out(r)).toMatch(/WAIVERS {6}PASS/);
    expect(out(r)).toContain("0 inert");
  });
});

// Vendored dependency markdown is outside skill-authoring scope, and a vocabulary
// finding there would be UNWAIVABLE by design — no legitimate remediation exists,
// so the exclusion is deliberate rather than incident-driven. Counted, not silent.
describe("vendor exclusion — node_modules is outside the authoring surface (2026-08-06)", () => {
  const fs = require("fs");
  const os = require("os");
  // the exact shape measured to HALT: ALL-CAPS lexeme, true em-dash INSIDE brackets
  const HALTING = "# dep\n\n[BREAKING — the parse() signature changed in 5.0]\n";

  test("a HALT-shaped defect inside node_modules/ does not fire, and the skip is REPORTED", () => {
    const dir = fs.mkdtempSync(join(os.tmpdir(), "sgc-vendor-"));
    fs.mkdirSync(join(dir, "node_modules", "handlebars"), { recursive: true });
    fs.writeFileSync(join(dir, "node_modules", "handlebars", "README.md"), HALTING);
    fs.writeFileSync(join(dir, "Real.md"), "# authored content\n");
    const r = run([dir]);
    expect(r.exit).toBe(0);
    expect(out(r)).not.toContain("BREAKING");
    expect(out(r)).toContain("(1 vendor skipped: node_modules)"); // never a silent suppression
  });

  // The control. Without this, the test above passes just as well against a scanner
  // that cannot detect the pattern at all — it would assert nothing.
  test("the SAME content outside node_modules/ still HALTs — the exclusion is what suppresses it, not a blind scanner", () => {
    const dir = fs.mkdtempSync(join(os.tmpdir(), "sgc-vendor-ctl-"));
    fs.writeFileSync(join(dir, "README.md"), HALTING);
    const r = run([dir]);
    expect(r.exit).toBe(1);
    expect(out(r)).toMatch(/`\[BREAKING …\]`.*unregistered family, single-word/);
    expect(out(r)).not.toContain("vendor skipped");
  });

  test("a vendor-only root reports the skip rather than reading as an empty scan", () => {
    const dir = fs.mkdtempSync(join(os.tmpdir(), "sgc-vendor-only-"));
    fs.mkdirSync(join(dir, "node_modules", "yaml"), { recursive: true });
    fs.writeFileSync(join(dir, "node_modules", "yaml", "README.md"), "# yaml\n");
    const r = run([dir]);
    expect(r.exit).toBe(1); // scanned 0 files is still not a pass
    expect(out(r)).toContain("may contain ONLY vendored content");
  });
});

describe("archive exclusion (ContributeBack adoption 2026-07-16)", () => {
  test("a HALT-shaped defect inside an _Archive dir (mixed case pins the /i flag) never surfaces", () => {
    const r = run([FAILING]);
    expect(out(r)).not.toContain("ArchivedGhost");
  });
});

describe("vocabulary-table integrity (the one HALT case)", () => {
  test("missing/unparseable doc → HALT, exit 1", () => {
    const r = run([CLEAN], "/nonexistent/SkillGuardrails.md");
    expect(r.exit).toBe(1);
    expect(out(r)).toContain("HALT");
  });
  // Was pinned at "(11 bases)" and had been failing since 2026-07-31, when the
  // observation channel added [observation] and [photo] — a hardcoded count is an
  // assertion that rots the moment the canon it tracks legitimately grows, and a
  // permanently-red test is read as noise exactly like a permanently-standing WARN.
  // Reconciled against the doc instead, with a floor so an emptied or unparseable
  // table can't pass by agreeing with zero. (2026-08-06)
  test("live doc parses to every base row in the vocabulary table, and no more", () => {
    const fs = require("fs");
    // the doctrine the checker itself resolves (beside it in the package, PAI layout here)
    const doc = fs.readFileSync(resolveDocPath(), "utf8");
    const block = doc.match(/<!-- vocab:begin[\s\S]*?-->([\s\S]*?)<!-- vocab:end -->/);
    const rows = [...block![1].matchAll(/^\|\s*`([^`]+)`\s*\|\s*([a-z-]+)\s*\|$/gm)].length;
    expect(rows).toBeGreaterThanOrEqual(11); // the cycle-1 floor — the canon only grows
    expect(out(run([CLEAN]))).toContain(`(${rows} bases)`);
  });
});

describe("anchor regex precision (near-miss exclusions)", () => {
  test("'Labeling strategy' and 'Labeling not summarizing' do NOT count as Labeling anchors", () => {
    const fs = require("fs");
    const os = require("os");
    const dir = fs.mkdtempSync(join(os.tmpdir(), "sgc-"));
    fs.writeFileSync(join(dir, "NearMiss.md"), "**Labeling strategy:** output shaping\n**Labeling not summarizing** is a heading\n**Citation discipline** without colon-bold-close\n");
    const r = run([dir]);
    expect(out(r)).toContain("Labeling 0");
    expect(out(r)).toContain("Citation discipline 0");
  });
});

describe("portable layout (2026-09-22)", () => {
  test("the doctrine beside the checker wins over the PAI path; the PAI path is the fallback", () => {
    const root = mkdtempSync(join(tmpdir(), "sgc-"));
    const here = join(root, "ladder-core", "scripts", "skill-guardrails-check");
    mkdirSync(here, { recursive: true });
    expect(resolveDocPath(here, "/nonexistent-pai")).toBe(join("/nonexistent-pai", "skills", "CORE", "SkillGuardrails.md"));
    writeFileSync(join(root, "ladder-core", "skill-guardrails.md"), "x");
    expect(resolveDocPath(here, "/nonexistent-pai")).toBe(join(root, "ladder-core", "skill-guardrails.md"));
  });
  test("a scan of ladder-core skips the doctrine in use and the checker's own failing fixtures", () => {
    const core = join(mkdtempSync(join(tmpdir(), "sgc-")), "ladder-core");
    cpSync(CLEAN, core, { recursive: true });
    const doc = join(core, "skill-guardrails.md");
    cpSync(resolveDocPath(), doc);
    cpSync(FAILING, join(core, "scripts", "skill-guardrails-check", "fixtures", "failing"), { recursive: true });
    const r = run([core], doc);
    expect(r.exit).not.toBe(1);
    expect(out(r)).not.toContain("fixtures/failing");
  });
});
