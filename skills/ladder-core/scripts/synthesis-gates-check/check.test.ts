import { describe, expect, test, afterAll } from "bun:test";
import { runChecks, compareReports } from "./check";
import { join } from "path";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, utimesSync } from "fs";
import { tmpdir } from "os";

const CLEAN = join(import.meta.dir, "fixtures", "clean");
const FAILING = join(import.meta.dir, "fixtures", "failing");

const byKey = (rs: ReturnType<typeof runChecks>["results"], key: string) => rs.find(r => r.key === key)!;

describe("clean fixture", () => {
  const { results, exit } = runChecks(CLEAN);

  test("exits 0 with no halts or warns", () => {
    expect(exit).toBe(0);
    expect(results.flatMap(r => r.details).filter(d => d.severity !== "PASS")).toEqual([]);
  });

  test("all script-shaped gates PASS; gate 5 is an honest SKIP", () => {
    for (const key of ["attribution_gate", "volume_floor_l1", "domain_scope_confirmation", "theme_evidence_floor", "archetype_evidence_floor", "final_ladder_review_before_delivery"])
      expect(byKey(results, key).severity).toBe("PASS");
    expect(byKey(results, "insight_knowledge_provenance").severity).toBe("SKIP");
  });

  test("at-floor margin semantics: participants: 3 passes (floor is <3)", () => {
    expect(byKey(results, "theme_evidence_floor").summary).toContain("min participants+survey_rows 3");
  });

  test("gate 7 verifies the linked report file actually exists", () => {
    expect(byKey(results, "final_ladder_review_before_delivery").summary).toContain("(exists)");
  });

  test("--release changes nothing on a released project", () => {
    expect(runChecks(CLEAN, true).exit).toBe(0);
  });
});

describe("failing fixture", () => {
  const { results, exit } = runChecks(FAILING);
  const all = results.flatMap(r => r.details);

  test("exits 1 (halts present)", () => expect(exit).toBe(1));

  test("gate 1 halts on unresolved attribution", () => {
    expect(byKey(results, "attribution_gate").severity).toBe("HALT");
  });

  test("gate 2 warns on both under-floor and stated≠actual", () => {
    const g2 = byKey(results, "volume_floor_l1");
    expect(g2.severity).toBe("WARN");
    expect(g2.details.some(d => d.note.includes("< floor of 15"))).toBe(true);
    expect(g2.details.some(d => d.note.includes("≠ actual"))).toBe(true);
  });

  test("gate 3 halts on cross-artifact inconsistency and warns on missing field", () => {
    const g3 = byKey(results, "domain_scope_confirmation");
    expect(g3.severity).toBe("HALT");
    expect(g3.details.some(d => d.severity === "HALT" && d.note.includes("not consistent"))).toBe(true);
    expect(g3.details.some(d => d.severity === "WARN" && d.note.includes("no domain:"))).toBe(true);
  });

  test("gate 4 halts on a 2-participant theme", () => {
    const g4 = byKey(results, "theme_evidence_floor");
    expect(g4.severity).toBe("HALT");
    expect(g4.details.some(d => d.note.includes("participants: 2 < 3"))).toBe(true);
  });

  test("gate 6 halts on invalid status and warns on Proto without upgrade path", () => {
    const g6 = byKey(results, "archetype_evidence_floor");
    expect(g6.details.some(d => d.severity === "HALT" && d.note.includes("not Full|Proto"))).toBe(true);
    expect(g6.details.some(d => d.severity === "WARN" && d.note.includes("Upgrade path"))).toBe(true);
  });

  test("gate 7: pending is WARN by default, HALT at --release", () => {
    expect(byKey(results, "final_ladder_review_before_delivery").severity).toBe("WARN");
    expect(byKey(runChecks(FAILING, true).results, "final_ladder_review_before_delivery").severity).toBe("HALT");
  });

  test("every fixture defect is reported — nothing silently passes", () => {
    expect(all.filter(d => d.severity === "HALT").length).toBeGreaterThanOrEqual(4);
    expect(all.filter(d => d.severity === "WARN").length).toBeGreaterThanOrEqual(4);
  });
});

describe("where the gates config and the scanned trees come from (2026-09-20, portable ladder package)", () => {
  test("--gates wins; else the config two folders up from the checker; else $PAI_DIR/config", async () => {
    const { resolveGatesPath } = await import("./check");
    const self = "/pkg/skills/ladder-core/scripts/synthesis-gates-check";
    const beside = "/pkg/skills/ladder-core/config/synthesis-gates.yaml";
    expect(resolveGatesPath(["--source", "--gates", "/x/g.yaml"], self, "/home/.claude", () => true)).toBe("/x/g.yaml");
    expect(resolveGatesPath(["--source"], self, "/home/.claude", p => p === beside)).toBe(beside);
    expect(resolveGatesPath(["--source"], self, "/home/.claude", () => false)).toBe("/home/.claude/config/synthesis-gates.yaml");
  });
  test("a recipient's PAI_DIR never outranks the config the checker shipped with", async () => {
    const { resolveGatesPath } = await import("./check");
    const self = "/pkg/skills/ladder-core/scripts/synthesis-gates-check";
    expect(resolveGatesPath([], self, "/old-install", () => true)).toBe("/pkg/skills/ladder-core/config/synthesis-gates.yaml");
  });
  test("canonical layout resolves to the same file as before: tools/<checker>/ -> config/", async () => {
    const { resolveGatesPath } = await import("./check");
    expect(resolveGatesPath([], "/home/.claude/tools/synthesis-gates-check", "/home/.claude", () => true)).toBe("/home/.claude/config/synthesis-gates.yaml");
  });
  test("--root replaces the canonical skills/ + agents/ pair, and may repeat", async () => {
    const { sourceRoots } = await import("./check");
    expect(sourceRoots(["--source"], "/home/.claude")).toEqual(["/home/.claude/skills", "/home/.claude/agents"]);
    expect(sourceRoots(["--source", "--root", "/pkg/skills", "--root", "/pkg/extras"], "/home/.claude")).toEqual(["/pkg/skills", "/pkg/extras"]);
  });
});

describe("survey sources (2026-09-27)", () => {
  test("gate 2 does not apply the volume floor to a source_type: survey L1 file", () => {
    const g2 = byKey(runChecks(CLEAN).results, "volume_floor_l1");
    expect(g2.details.some(d => d.file.includes("L1_survey_findings") && d.note.includes("< floor"))).toBe(false);
  });

  test("gate 4 counts survey_rows toward the floor: 1 + 4 passes, 0 + 2 halts", () => {
    expect(byKey(runChecks(CLEAN).results, "theme_evidence_floor").details.some(d => d.file.includes("L2-03_survey"))).toBe(false);
    const g4 = byKey(runChecks(FAILING).results, "theme_evidence_floor");
    expect(g4.details.some(d => d.severity === "HALT" && d.note.includes("survey_rows: 2 = 2 < 3"))).toBe(true);
  });

  test("isSurvey strips a two-space '# comment' before comparing (ruling: two-space comments)", () => {
    const dir = mkdtempSync(join(tmpdir(), "scp-gates-"));
    try {
      writeFileSync(
        join(dir, "L1_two_space_comment.md"),
        [
          "---",
          "source_type: survey  # exported 2026-09-27",
          "synthesis_level: L1",
          "domain: brand/design",
          "---",
          "# L1",
          "**Findings count:** 1",
          "",
          "## Finding 1: S1",
          "",
          "## Row accounting",
          "Rows not carried: none",
          "",
        ].join("\n")
      );
      const g2 = runChecks(dir).results.find((r) => r.key === "volume_floor_l1")!;
      // if the two-space comment were not stripped, source_type would read as
      // 'survey  # exported 2026-09-27' (not "survey"), isSurvey would be false, and this
      // 1-finding file would be floor-warned as a non-survey file
      expect(g2.details.some((d) => d.note.includes("< floor"))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("gate 2 warns when a survey L1 file has no ## Row accounting heading or no Rows not carried line", () => {
    const g2 = byKey(runChecks(FAILING).results, "volume_floor_l1");
    expect(g2.details.some(d => d.file.includes("L1_survey_no_row_accounting") && d.note.includes("Row accounting"))).toBe(true);
  });

  test("the clean survey L1 fixture has the Row accounting section and is not warned", () => {
    const g2 = byKey(runChecks(CLEAN).results, "volume_floor_l1");
    expect(g2.details.some(d => d.file.includes("L1_survey_findings") && d.note.includes("Row accounting"))).toBe(false);
  });
});

describe("ruling 4 (re-review): surveys: distinct-survey-count field", () => {
  test("a survey-only theme (participants: 0) corroborated by 2+ surveys and labeled [SURVEY-ONLY] passes clean", () => {
    const g4 = byKey(runChecks(CLEAN).results, "theme_evidence_floor");
    expect(g4.details.some(d => d.file.includes("L2-04_survey_multi"))).toBe(false);
  });

  test("[SURVEY-ONLY] placement (final check item 3): the clean fixture carries the label after the title text", () => {
    const body = readFileSync(join(CLEAN, "L2-04_survey_multi.md"), "utf8");
    const heading = body.match(/^#\s+(.*)$/m)![1];
    expect(heading.endsWith("[SURVEY-ONLY]")).toBe(true);
  });

  test("a survey-only theme from fewer than 2 surveys HALTs even though its row floor is met", () => {
    const g4 = byKey(runChecks(FAILING).results, "theme_evidence_floor");
    const d = g4.details.find(d => d.file.includes("L2-04_survey_single"));
    expect(d?.severity).toBe("HALT");
    expect(d?.note).toContain("fewer than 2 surveys");
    expect(d?.note).toContain("[HYPOTHESIS — single-survey]");
  });

  test("survey_rows present without a surveys: field WARNs (existing thin fixture predates the field)", () => {
    const g4 = byKey(runChecks(FAILING).results, "theme_evidence_floor");
    expect(g4.details.some(d => d.file.includes("L2-03_survey_thin") && d.severity === "WARN" && d.note === "survey_rows without surveys: count")).toBe(true);
  });

  test("gate 4 bypass fix: omitting participants: with survey_rows present still HALTs (final check item 2)", () => {
    const dir = mkdtempSync(join(tmpdir(), "scp-gates-"));
    try {
      writeFileSync(
        join(dir, "L2-11.md"),
        [
          "---",
          "project: T",
          "theme_id: L2-11",
          "synthesis_level: L2",
          "survey_rows: 9",
          "surveys: 1",
          "synthesis_date: 2026-09-27",
          "domain: brand/design",
          "---",
          "# L2-11: no participants field, single survey",
          "",
        ].join("\n")
      );
      const g4 = runChecks(dir).results.find(r => r.key === "theme_evidence_floor")!;
      // the "not numeric" WARN still fires...
      expect(g4.details.some(d => d.severity === "WARN" && d.note.includes("is not numeric"))).toBe(true);
      // ...but no longer swallows the single-survey HALT
      expect(g4.details.some(d => d.severity === "HALT" && d.note.includes("fewer than 2 surveys"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("a survey-only theme with 2+ surveys but no [SURVEY-ONLY] label WARNs", () => {
    const dir = mkdtempSync(join(tmpdir(), "scp-gates-"));
    try {
      writeFileSync(
        join(dir, "L2-99_unlabeled.md"),
        [
          "---",
          "project: Test",
          "theme_id: L2-99",
          "synthesis_level: L2",
          "participants: 0",
          "survey_rows: 5",
          "surveys: 2",
          "synthesis_date: 2026-09-27",
          "domain: brand/design",
          "---",
          "# L2-99: Missing its survey-only label",
          "",
        ].join("\n")
      );
      const g4 = runChecks(dir).results.find(r => r.key === "theme_evidence_floor")!;
      expect(g4.details.some(d => d.severity === "WARN" && d.note === "survey-only theme missing [SURVEY-ONLY] label")).toBe(true);
      // and it must NOT also fire the fewer-than-2-surveys HALT, since surveys: 2 clears that bar
      expect(g4.details.some(d => d.note.includes("fewer than 2 surveys"))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ── Gate 8: level_audit_before_advance (2026-10-22) ──────────────────────────
describe("gate 8 level_audit_before_advance", () => {
  const theme = (id: string) => ["---", `theme_id: ${id}`, "synthesis_level: L2", "participants: 4", "domain: brand/design", "---", `# ${id}`, ""].join("\n");
  const insight = ["---", "insight_id: L3-01", "synthesis_level: L3", "domain: brand/design", "---", "# L3-01", ""].join("\n");
  const report = (gate: string, fm = "") => `${fm ? `---\n${fm}\n---\n` : ""}# L2 Theme Set Audit\n\n**Inputs read:** 1 file, 5 items (L1-findings)\n\n### Cleared for L3: ${gate}\n`;
  const project = (files: Record<string, string>, ageReportMs = 0) => {
    const dir = mkdtempSync(join(tmpdir(), "g8-"));
    for (const [rel, body] of Object.entries(files)) {
      mkdirSync(join(dir, rel, ".."), { recursive: true });
      writeFileSync(join(dir, rel), body);
    }
    if (ageReportMs) {
      const r = join(dir, "L2", "L2_ThemeSet_Audit_P.md");
      const t = (Date.now() - ageReportMs) / 1000;
      require("fs").utimesSync(r, t, t);
    }
    return dir;
  };
  const g8 = (dir: string, release = false) => byKey(runChecks(dir, release).results, "level_audit_before_advance");

  test("clean fixture: every set has a current, cleared report", () => {
    expect(g8(CLEAN).severity).toBe("PASS");
  });
  test("failing fixture: unaudited theme set with a later level present HALTs", () => {
    expect(g8(FAILING).details.some(d => d.severity === "HALT" && d.note.includes("advanced past unaudited"))).toBe(true);
  });
  test("set mid-flight with no report WARNs; --release HALTs", () => {
    const dir = project({ "L2/L2-01.md": theme("L2-01") });
    try {
      expect(g8(dir).severity).toBe("WARN");
      expect(g8(dir, true).severity).toBe("HALT");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("no report, and L3 already exists: HALT", () => {
    const dir = project({ "L2/L2-01.md": theme("L2-01"), "L3/L3-01.md": insight });
    try {
      const d = g8(dir).details.find(x => x.file === "L2")!;
      expect(d.severity).toBe("HALT");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("the current report is the latest by name, not the last written (2026-11-17)", () => {
    const dir = project({
      "L2/L2-01.md": theme("L2-01"),
      "L2/L2_ThemeSet_Audit_P.md": report("Yes"),                          // documented name: the first audit (v0)
      "L2/L2_ThemeSet_Audit_P_v2.md": report("Yes"),
      "L2/L2_ThemeSet_Audit_P_v3.md": report("No — one theme under floor"), // later by name, written earliest
    });
    try {
      const at = (rel: string, secAgo: number) => { const t = Date.now() / 1000 - secAgo; utimesSync(join(dir, rel), t, t); };
      at("L2/L2-01.md", 3600);
      at("L2/L2_ThemeSet_Audit_P_v3.md", 3000);
      at("L2/L2_ThemeSet_Audit_P_v2.md", 60);  // an old cleared report re-saved: newest mtime
      at("L2/L2_ThemeSet_Audit_P.md", 30);     // and the documented-name one, newer still
      const d = g8(dir).details;
      expect(d.length).toBe(1);
      expect(d[0].file).toBe("L2/L2_ThemeSet_Audit_P_v3.md");
      expect(d[0].note).toContain("gate not cleared");
    } finally { rmSync(dir, { recursive: true, force: true }); }
    expect(compareReports("L5_Framework_Audit_", { name: "L5_Framework_Audit_v3.1b-verification.md", mtime: 0 }, { name: "L5_Framework_Audit_v3.1.md", mtime: 9 })).toBeLessThan(0);
    expect(compareReports("L2_ThemeSet_Audit_", { name: "L2_ThemeSet_Audit_P_2026-02-01.md", mtime: 0 }, { name: "L2_ThemeSet_Audit_P_2026-01-15.md", mtime: 9 })).toBeLessThan(0);
    expect(compareReports("L2_ThemeSet_Audit_", { name: "L2_ThemeSet_Audit_P_v2-a.md", mtime: 0 }, { name: "L2_ThemeSet_Audit_P_v2-b.md", mtime: 9 })).toBeGreaterThan(0); // same version: mtime decides
  });
  test("report not cleared WARNs; advanced_with_open_flags clears it", () => {
    const no = project({ "L2/L2-01.md": theme("L2-01"), "L2/L2_ThemeSet_Audit_P.md": report("No — two themes under floor") });
    const over = project({ "L2/L2-01.md": theme("L2-01"), "L2/L2_ThemeSet_Audit_P.md": report("No", "advanced_with_open_flags: 2026-10-22 — client deadline") });
    try {
      expect(g8(no).details[0].note).toContain("not cleared");
      expect(g8(over).severity).toBe("PASS");
    } finally { rmSync(no, { recursive: true, force: true }); rmSync(over, { recursive: true, force: true }); }
  });
  test("a bolded verdict (## Cleared for L3: **Yes**) counts as cleared", () => {
    const dir = project({ "L2/L2-01.md": theme("L2-01"), "L2/L2_ThemeSet_Audit_P.md": "# Audit\n\n**Inputs read:** 1 file, 5 items (L1-findings)\n\n## Cleared for L3: **Yes**\n" });
    try {
      expect(g8(dir).severity).toBe("PASS");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("report older than the set (beyond the tolerance) is stale", () => {
    const dir = project({ "L2/L2-01.md": theme("L2-01"), "L2/L2_ThemeSet_Audit_P.md": report("Yes") }, 60_000);
    try {
      expect(g8(dir).details[0].note).toContain("newer than its audit report");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("report without a gate line WARNs as a missing anchor", () => {
    const dir = project({ "L2/L2-01.md": theme("L2-01"), "L2/L2_ThemeSet_Audit_P.md": "# L2 Theme Set Audit\n\nno verdict\n" });
    try {
      expect(g8(dir).details[0].note).toContain("no \"### Cleared for L3:\" gate line");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  // ── Inputs-read disclosure (2026-11-03) ────────────────────────────────────
  const l1 = (n: number) => ["---", "participant: P" + n, "synthesis_level: L1", "domain: brand/design", "---", "# L1", ""].join("\n");
  const rep = (inputs: string) => `# L2 Theme Set Audit\n\n${inputs}\n\n### Cleared for L3: Yes\n`;
  const withL1 = (inputs: string, extra: Record<string, string> = {}) => project({
    "L1/L1_a_findings.md": l1(1), "L1/L1_b_findings.md": l1(2), "L1/L1_c_findings.md": l1(3),
    "L2/L2-01.md": theme("L2-01"), "L2/L2_ThemeSet_Audit_P.md": rep(inputs), ...extra,
  });
  const discl = (dir: string, release = false) => g8(dir, release).details.filter(d => d.note.includes("Inputs read") || d.note.includes("on disk"));
  test("cleared report with no Inputs read line WARNs; --release HALTs", () => {
    const dir = withL1("(no disclosure)");
    try {
      expect(discl(dir)[0].severity).toBe("WARN");
      expect(discl(dir)[0].note).toContain("no \"**Inputs read:** N files, M items\" line");
      expect(discl(dir, true)[0].severity).toBe("HALT");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("claimed file count below the L1 files on disk WARNs; --release HALTs", () => {
    const dir = withL1("**Inputs read:** 2 files, 40 items (L1-findings)");
    try {
      expect(discl(dir)[0].severity).toBe("WARN");
      expect(discl(dir)[0].note).toContain("claims 2 L1 files read, but 3 are on disk");
      expect(discl(dir, true)[0].severity).toBe("HALT");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("claimed file count matching the L1 files on disk passes (singular 'file' and a higher count also pass)", () => {
    const ok = withL1("**Inputs read:** 3 files, 46 items (L1-findings)");
    const more = withL1("**Inputs read:** 4 files, 50 items (L1-findings)");
    try {
      expect(discl(ok)).toEqual([]);
      expect(g8(ok, true).severity).toBe("PASS");
      expect(discl(more)).toEqual([]);
    } finally { rmSync(ok, { recursive: true, force: true }); rmSync(more, { recursive: true, force: true }); }
  });
  test("L1 copies under archive/ are not counted as on disk", () => {
    const dir = withL1("**Inputs read:** 3 files, 46 items (L1-findings)", { "L1/archive/L1_old_findings.md": l1(9) });
    try {
      expect(discl(dir)).toEqual([]);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("a report under archive/ is exempt from the Inputs read line; the same set outside archive/ is not", () => {
    const noLine = "# L2 Theme Set Audit\n\n### Cleared for L3: Yes\n";
    const arch = project({ "L2/archive/v1/L2-01.md": theme("L2-01"), "L2/archive/v1/L2_ThemeSet_Audit_P.md": noLine });
    const cur = project({ "L2/L2-01.md": theme("L2-01"), "L2/L2_ThemeSet_Audit_P.md": noLine });
    try {
      expect(g8(arch, true).severity).toBe("PASS");
      expect(g8(cur).severity).toBe("WARN");
    } finally { rmSync(arch, { recursive: true, force: true }); rmSync(cur, { recursive: true, force: true }); }
  });
  test("archived sets keep the other gate 8 behavior: a report that is not cleared still WARNs", () => {
    const dir = project({ "L2/archive/v1/L2-01.md": theme("L2-01"), "L2/archive/v1/L2_ThemeSet_Audit_P.md": "# A\n\n### Cleared for L3: No\n" });
    try { expect(g8(dir).details[0].note).toContain("not cleared"); } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("below-level files out of scope: only the presence of the line is checked", () => {
    const dir = project({ "L2/L2-01.md": theme("L2-01"), "L2/L2_ThemeSet_Audit_P.md": rep("**Inputs read:** 1 file, 5 items (L1-findings)") });
    try {
      expect(g8(dir, true).severity).toBe("PASS");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("an audit report or FinalLadderReview file is never itself counted as a framework", () => {
    expect(g8(CLEAN).summary).toContain("3 set(s)");
  });
});

describe("nothing checked (2026-10-28)", () => {
  test("an empty folder exits 2, not 0: all gates skip and nothing was checked", () => {
    const dir = mkdtempSync(join(tmpdir(), "gates-empty-"));
    try {
      const { results, exit } = runChecks(dir);
      expect(results.every(r => r.severity === "SKIP")).toBe(true);
      expect(exit).toBe(2);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
