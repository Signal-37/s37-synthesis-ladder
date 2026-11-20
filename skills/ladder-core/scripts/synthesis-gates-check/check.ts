#!/usr/bin/env bun
/**
 * synthesis-gates-check — deterministic (zero-LLM) checker for the script-shaped
 * gates in config/synthesis-gates.yaml (reads gates_version from the yaml; header last synced 2026-08-22).
 *
 * Modes:
 *   bun check.ts <project-dir> [--release] [--verbose]
 *       Artifact mode: checks a ladder project directory (L0–L5 files) against
 *       gates 1, 2, 3, 4, 6, 7, 8. Gate 5 (insight_knowledge_provenance) is
 *       prose-shaped and reported SKIP — it stays LLM-audited (AuditInsightSet).
 *       --release escalates gate 7 `pending`, and every gate 8 finding (incl. the Inputs-read disclosure) from WARN
 *       to HALT (the gates halt DELIVERY; mid-flight is legitimate). Gate 8 also
 *       HALTs when a later level exists past an unaudited set.
 *   bun check.ts --source [--root <dir>]…
 *       Source-integrity mode: the gates.yaml parses, all 8 gates present,
 *       every `gates.<key>` pointer in skills/ + agents/ resolves to a real key.
 *       --root scans the given tree(s) instead (a packaged install has one skills folder).
 *   Either mode: --gates <yaml> names the config; otherwise see resolveGatesPath.
 *
 * Exit codes: 0 = clean, 1 = any HALT, 2 = warns only.
 * Read-only: never modifies any artifact.
 *
 * Origin: candidates.deterministic_checker (architect finding A1, 2026-07-07;
 * independently named by Karl 2026-07-08). Built 2026-07-10 after the wiring
 * pass; output contract ratified by the researcher (session 2026-07-10).
 */

import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import { join, dirname, basename, resolve } from "path";

const PAI_DIR = process.env.PAI_DIR ?? join(process.env.HOME ?? "", ".claude");

/** Flags that take a value, so the project-dir positional is never mistaken for one of them. */
const VALUE_FLAGS = ["--gates", "--root"];
const flagValues = (argv: string[], flag: string) =>
  argv.flatMap((a, i) => (a === flag && argv[i + 1] !== undefined ? [argv[i + 1]] : []));

/**
 * Where the gates config is (2026-09-20, for the portable ladder package). In order: `--gates <path>`;
 * then `../../config/synthesis-gates.yaml` from THIS FILE, which is the config in both layouts
 * (canonical `tools/<checker>/` -> `config/`; packaged `ladder-core/scripts/<checker>/` ->
 * `ladder-core/config/`); then `$PAI_DIR/config/`, the old rule. The file-relative step comes BEFORE
 * PAI_DIR on purpose: a recipient may have PAI_DIR set for an assistant home that still holds an
 * older package, and the checker must read the config it shipped with, not that one.
 */
export function resolveGatesPath(argv: string[], selfDir: string, paiDir: string, exists: (p: string) => boolean = existsSync): string {
  const given = flagValues(argv, "--gates")[0];
  if (given) return resolve(given);
  const beside = join(selfDir, "..", "..", "config", "synthesis-gates.yaml");
  return exists(beside) ? beside : join(paiDir, "config", "synthesis-gates.yaml");
}

/** Trees scanned for `gates.<key>` pointers: each `--root <dir>`, else canonical skills/ + agents/. */
export function sourceRoots(argv: string[], paiDir: string): string[] {
  const given = flagValues(argv, "--root").map(r => resolve(r));
  return given.length ? given : [join(paiDir, "skills"), join(paiDir, "agents")];
}

const GATES_PATH = resolveGatesPath(process.argv.slice(2), import.meta.dir, PAI_DIR);

const DOMAIN_ENUM = ["brand/design", "product/UX", "organizational", "policy/advocacy", "other"];

type Severity = "PASS" | "WARN" | "HALT" | "SKIP";
interface Detail { file: string; severity: Severity; note: string }
interface GateResult { gate: string; key: string; severity: Severity; summary: string; details: Detail[] }

// ── frontmatter: flat key:value parser (strips trailing `# comment`) ─────────
function frontmatter(text: string): Record<string, string> | null {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const out: Record<string, string> = {};
  for (const line of text.slice(3, end).split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    const hash = v.indexOf("   #");
    if (hash !== -1) v = v.slice(0, hash).trim();
    out[m[1]] = v;
  }
  return out;
}

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (name.endsWith(".md")) yield p;
  }
}

interface Artifact { path: string; rel: string; fm: Record<string, string>; body: string; level: string }

function loadArtifacts(root: string): Artifact[] {
  const arts: Artifact[] = [];
  for (const p of walk(root)) {
    const body = readFileSync(p, "utf8");
    const fm = frontmatter(body);
    if (!fm) continue;
    const level = (fm.synthesis_level ?? "").toUpperCase();
    if (!/^L[0-5]$/.test(level)) continue;
    arts.push({ path: p, rel: p.slice(root.length + 1), fm, body, level });
  }
  return arts;
}

function gatesVersion(): string {
  try {
    const m = readFileSync(GATES_PATH, "utf8").match(/^gates_version:\s*"([^"]+)"/m);
    return m ? m[1] : "UNKNOWN (gates_version not found)";
  } catch {
    return "UNKNOWN (config/synthesis-gates.yaml unreadable)";
  }
}

const worst = (ds: Detail[]): Severity =>
  ds.some(d => d.severity === "HALT") ? "HALT" : ds.some(d => d.severity === "WARN") ? "WARN" : "PASS";

// ── Gate 1: attribution_gate ─────────────────────────────────────────────────
function gate1(arts: Artifact[]): GateResult {
  const details: Detail[] = [];
  const l0 = arts.filter(a => a.level === "L0");
  for (const a of l0) {
    const s = a.fm.attribution_status;
    if (s === "unresolved")
      details.push({ file: a.rel, severity: "HALT", note: "attribution_status: unresolved — resolve speaker labels before L1 extraction" });
    else if (s && s !== "resolved")
      details.push({ file: a.rel, severity: "HALT", note: `attribution_status: "${s}" is not resolved|unresolved` });
    // absent = legacy manual file: admissible per the gate (field is Method D / conversation only)
  }
  for (const a of arts.filter(a => a.level === "L1" && a.fm.attribution_status)) {
    if (a.fm.attribution_status !== "resolved")
      details.push({ file: a.rel, severity: "HALT", note: `L1 carries attribution_status: "${a.fm.attribution_status}" — must be resolved to extract` });
  }
  const unresolved = details.filter(d => d.severity === "HALT").length;
  return { gate: "GATE 1 attribution", key: "attribution_gate", severity: l0.length === 0 && details.length === 0 ? "SKIP" : worst(details),
    summary: l0.length === 0 && details.length === 0 ? "no L0 files in scope" : `${l0.length} L0 files, ${unresolved} unresolved/invalid`, details };
}

// ── Gate 2: volume_floor_l1 (warn-shaped) ────────────────────────────────────
// strip anything from a "# " comment onward (frontmatter() only strips 3-space comments;
// this catches the tighter 2-space convention too) before comparing.
const isSurvey = (a: Artifact) => (a.fm.source_type ?? "").replace(/\s{2,}#.*$/, "").replace(/["']/g, "").trim() === "survey";
function gate2(arts: Artifact[]): GateResult {
  const details: Detail[] = [];
  const l1 = arts.filter(a => a.level === "L1");
  let min = Infinity, matches = 0, counted = 0;
  for (const a of l1) {
    const stated = a.body.match(/\*\*Findings count:\*\*\s*(\d+)/);
    // survey L1 files have no transcript duration; the floor is skipped, the stated==actual check still runs
    const actual = (a.body.match(/^## Finding \d+:/gm) ?? []).length;
    if (!stated) { details.push({ file: a.rel, severity: "WARN", note: "no **Findings count:** header line (mechanical anchor missing)" }); continue; }
    counted++;
    const n = parseInt(stated[1], 10);
    min = Math.min(min, n);
    if (n === actual) matches++;
    else details.push({ file: a.rel, severity: "WARN", note: `stated Findings count ${n} ≠ actual ${actual} finding headings` });
    if (n < 15 && !isSurvey(a)) details.push({ file: a.rel, severity: "WARN", note: `${n} findings < floor of 15 per 45-min transcript — under-extraction; human decides re-extract vs accept` });
    // ruling 3: row-level coverage for survey L1 files — every row read must land in a
    // supporting/contrary list or in "Rows not carried" with a reason
    if (isSurvey(a)) {
      if (!/^##\s+Row accounting\b/m.test(a.body)) details.push({ file: a.rel, severity: "WARN", note: "source_type: survey with no ## Row accounting heading — row-level coverage unaccounted for" });
      else if (!/Rows not carried/.test(a.body)) details.push({ file: a.rel, severity: "WARN", note: "## Row accounting present but no Rows not carried line — row-level coverage unaccounted for" });
    }
  }
  return { gate: "GATE 2 volume_floor_l1", key: "volume_floor_l1", severity: l1.length === 0 ? "SKIP" : worst(details),
    summary: l1.length === 0 ? "no L1 files in scope" : `${l1.length} L1 files, min ${min === Infinity ? "n/a" : min} findings; stated==actual in ${matches}/${counted}`, details };
}

// ── Gate 3: domain_scope_confirmation ────────────────────────────────────────
function gate3(arts: Artifact[]): GateResult {
  const details: Detail[] = [];
  const scoped = arts.filter(a => a.level !== "L0"); // domain: propagates L1→L5
  const seen = new Map<string, number>();
  for (const a of scoped) {
    const d = a.fm.domain;
    if (!d) { details.push({ file: a.rel, severity: "WARN", note: "no domain: field (predates domain parameterization?) — confirm explicitly per the skill's inherit step" }); continue; }
    if (!DOMAIN_ENUM.includes(d)) { details.push({ file: a.rel, severity: "HALT", note: `domain: "${d}" not in registry (${DOMAIN_ENUM.join(" | ")})` }); continue; }
    seen.set(d, (seen.get(d) ?? 0) + 1);
  }
  if (seen.size > 1) {
    const spread = [...seen.entries()].map(([d, n]) => `${d}×${n}`).join(", ");
    details.push({ file: "(project)", severity: "HALT", note: `domain not consistent across artifacts: ${spread} — wrong-register synthesis risk` });
  }
  const label = seen.size === 1 ? `all ${[...seen.keys()][0]}` : seen.size === 0 ? "no domain fields found" : "INCONSISTENT";
  return { gate: "GATE 3 domain_scope", key: "domain_scope_confirmation", severity: scoped.length === 0 ? "SKIP" : worst(details),
    summary: scoped.length === 0 ? "no L1–L5 files in scope" : `${scoped.length} files, ${label}`, details };
}

// ── Gate 4: theme_evidence_floor ─────────────────────────────────────────────
function gate4(arts: Artifact[]): GateResult {
  const details: Detail[] = [];
  const themes = arts.filter(a => a.level === "L2" && a.fm.theme_id);
  let min = Infinity;
  for (const a of themes) {
    const raw = a.fm.participants ?? "";
    const m = raw.match(/\d+/);
    // survey respondents count toward the floor through survey_rows: (Survey independence rule)
    const survey = (a.fm.survey_rows ?? "").match(/\d+/);
    const surveyRows = survey ? parseInt(survey[0], 10) : 0;
    if (!m) {
      details.push({ file: a.rel, severity: "WARN", note: `participants: "${raw}" is not numeric (mechanical anchor unreadable)` });
      // gate-4 bypass fix (final check item 2, 2026-09-27): a missing/non-numeric participants:
      // field used to `continue` here, which skipped the floor and single-survey checks below —
      // letting an absent field turn a HALT (survey-only theme, <2 surveys) into a bare WARN.
      // When survey_rows is present, treat participants as 0 and keep evaluating; only bail out
      // (as before) when there is no survey_rows to fall back on.
      if (!survey) continue;
    }
    const participants = m ? parseInt(m[0], 10) : 0;
    const n = participants + surveyRows;
    min = Math.min(min, n);
    if (n < 3) details.push({ file: a.rel, severity: "HALT", note: `exists as a theme with participants: ${survey ? `${participants} + survey_rows: ${surveyRows} = ${n}` : n} < 3 — must be labeled hypothesis, not theme (demote-label)` });

    // ruling 4 (re-review): surveys: N is the count of distinct survey IDs cited toward this
    // theme. participants: 0 means every supporting row came from survey_rows, so the theme's
    // corroboration lives entirely in how many DISTINCT surveys those rows came from.
    const surveysMatch = (a.fm.surveys ?? "").match(/\d+/);
    const surveys = surveysMatch ? parseInt(surveysMatch[0], 10) : 0;
    if (surveyRows > 0 && !surveysMatch) {
      details.push({ file: a.rel, severity: "WARN", note: "survey_rows without surveys: count" });
    }
    if (participants === 0 && surveys < 2 && surveyRows > 0) {
      details.push({ file: a.rel, severity: "HALT", note: "survey-only theme from fewer than 2 surveys — hold as [HYPOTHESIS — single-survey]" });
    } else if (participants === 0 && surveys >= 2) {
      const heading = a.body.match(/^#\s+(.*)$/m);
      if (!heading || !heading[1].includes("[SURVEY-ONLY]")) {
        details.push({ file: a.rel, severity: "WARN", note: "survey-only theme missing [SURVEY-ONLY] label" });
      }
    }
  }
  return { gate: "GATE 4 theme_floor", key: "theme_evidence_floor", severity: themes.length === 0 ? "SKIP" : worst(details),
    summary: themes.length === 0 ? "no L2 theme files in scope" : `${themes.length} themes, min participants+survey_rows ${min === Infinity ? "n/a" : min}`, details };
}

// ── Gate 5: prose-shaped — honest SKIP ───────────────────────────────────────
function gate5(): GateResult {
  return { gate: "GATE 5 provenance", key: "insight_knowledge_provenance", severity: "SKIP",
    summary: "prose-shaped — LLM-audited (AuditInsightSet)", details: [] };
}

// ── Gate 6: archetype_evidence_floor (partial — status labeling only) ────────
function gate6(arts: Artifact[]): GateResult {
  const details: Detail[] = [];
  const cards = arts.filter(a => a.level === "L4" && a.fm.archetype_id);
  let full = 0, proto = 0, protoWithPath = 0;
  for (const a of cards) {
    const s = a.fm.archetype_status;
    if (!s) { details.push({ file: a.rel, severity: "HALT", note: "no archetype_status: field — silent upgrade risk (AuditArchetypeSet Check 1.1)" }); continue; }
    if (s === "Full") full++;
    else if (s === "Proto") {
      proto++;
      if (/\*\*Upgrade path:\*\*/.test(a.body)) protoWithPath++;
      else details.push({ file: a.rel, severity: "WARN", note: "Proto card without an **Upgrade path:** section — upgrade path must be stated" });
    } else details.push({ file: a.rel, severity: "HALT", note: `archetype_status: "${s}" is not Full|Proto` });
  }
  const note = proto > 0 ? ` (${protoWithPath}/${proto} Proto have upgrade path)` : "";
  return { gate: "GATE 6 archetype_floor", key: "archetype_evidence_floor", severity: cards.length === 0 ? "SKIP" : worst(details),
    summary: cards.length === 0 ? "no L4 archetype cards in scope" : `${cards.length} cards: ${full} Full, ${proto} Proto${note}. Research-grade dominance stays LLM-audited`, details };
}

// ── Gate 7: final_ladder_review_before_delivery ──────────────────────────────
function gate7(arts: Artifact[], release: boolean): GateResult {
  const details: Detail[] = [];
  const l5 = arts.filter(a => a.level === "L5" && "final_ladder_review" in a.fm);
  const l5all = arts.filter(a => a.level === "L5");
  if (l5all.length === 0) return { gate: "GATE 7 release", key: "final_ladder_review_before_delivery", severity: "SKIP", summary: "no L5 files in scope (project not at L5)", details };
  if (l5.length === 0) {
    details.push({ file: l5all[0].rel, severity: release ? "HALT" : "WARN", note: "no final_ladder_review: frontmatter field (predates the 2026-07-10 convention, or field dropped) — add it; pending/absent halts delivery" });
    return { gate: "GATE 7 release", key: "final_ladder_review_before_delivery", severity: worst(details), summary: "field absent on L5 master", details };
  }
  let summary = "";
  for (const a of l5) {
    const v = a.fm.final_ladder_review;
    if (v === "pending" || v === "") {
      details.push({ file: a.rel, severity: release ? "HALT" : "WARN", note: release ? "final_ladder_review: pending — delivery HALTS until the review runs and links its report" : "final_ladder_review: pending — not yet released (informational; HALT at --release)" });
      summary = "pending";
    } else {
      const report = join(dirname(a.path), v);
      if (existsSync(report)) summary = `final_ladder_review -> ${v} (exists)`;
      else { details.push({ file: a.rel, severity: "HALT", note: `final_ladder_review names "${v}" but no such file exists beside the L5 framework` }); summary = `${v} MISSING`; }
    }
  }
  return { gate: "GATE 7 release", key: "final_ladder_review_before_delivery", severity: worst(details), summary, details };
}

// ── Gate 8: level_audit_before_advance (2026-10-22) ──────────────────────────
// Each L2–L5 set's audit report must sit beside the set, with its gate line cleared (or an
// advanced_with_open_flags: line in its frontmatter), and be no older than the set. A set still
// being written legitimately has no report yet, so a problem is a WARN — it becomes a HALT when
// the project already holds a later level (the set was advanced past unaudited) or at --release.
// Report filenames and gate lines are the ones each audit's "Save the Audit Report" step names.
interface AuditedSet { kind: string; level: number; isMember: (a: Artifact) => boolean; reportPrefix: string; gateLine: RegExp; below: (a: Artifact) => boolean; belowLabel: string }
const AUDITED_SETS: AuditedSet[] = [
  { kind: "theme set", level: 2, isMember: a => a.level === "L2" && !!a.fm.theme_id, reportPrefix: "L2_ThemeSet_Audit_", gateLine: /^#+\s*Cleared for L3:\s*(.*)$/im, below: a => a.level === "L1", belowLabel: "L1 files" },
  { kind: "insight set", level: 3, isMember: a => a.level === "L3" && !!a.fm.insight_id, reportPrefix: "L3_InsightSet_Audit_", gateLine: /^#+\s*Cleared for L4:\s*(.*)$/im, below: a => a.level === "L2" && !!a.fm.theme_id, belowLabel: "L2 theme files" },
  { kind: "opportunity area set", level: 4, isMember: a => a.level === "L4" && !!a.fm.opportunity_area_id, reportPrefix: "L4_OpportunityAreaSet_Audit_", gateLine: /^#+\s*Cleared for L5:\s*(.*)$/im, below: a => a.level === "L3" && !!a.fm.insight_id, belowLabel: "L3 insight files" },
  { kind: "principle set", level: 4, isMember: a => a.level === "L4" && !!a.fm.principle_id, reportPrefix: "L4_PrincipleSet_Audit_", gateLine: /^#+\s*Cleared for L5:\s*(.*)$/im, below: a => a.level === "L3" && !!a.fm.insight_id, belowLabel: "L3 insight files" },
  { kind: "value proposition set", level: 4, isMember: a => a.level === "L4" && !!a.fm.value_proposition_id, reportPrefix: "L4_VP_Set_Audit_", gateLine: /^#+\s*Cleared for L5:\s*(.*)$/im, below: a => a.level === "L3" && !!a.fm.insight_id, belowLabel: "L3 insight files" },
  { kind: "archetype set", level: 4, isMember: a => a.level === "L4" && !!a.fm.archetype_id, reportPrefix: "L4_Archetype_Set_Audit_", gateLine: /^#+\s*Cleared for L5:\s*(.*)$/im, below: a => a.level === "L2" && !!a.fm.theme_id, belowLabel: "L2 theme files" },
  { kind: "framework", level: 5, isMember: a => a.level === "L5" && !/_Audit_|FinalLadderReview/i.test(basename(a.path)), reportPrefix: "L5_Framework_Audit_", gateLine: /^#+\s*Synthesis complete:\s*(.*)$/im, below: a => a.level === "L4" && !!(a.fm.principle_id || a.fm.opportunity_area_id), belowLabel: "L4 principle and opportunity area files" },
];
/** Copying or cloning resets modification times to within a moment of each other; only a clear gap counts as stale. */
const STALE_TOLERANCE_MS = 5000;

/**
 * Inputs-read disclosure (2026-11-03). A level-audit report must say how much of the level below it
 * read: `**Inputs read:** 25 files, 586 items (L1-findings)`. The guard is against an audit that
 * skims, not an adversary: the line cannot prove the read happened, it makes a partial read visible.
 * Counting an `archive/` copy of an old version would overstate what is on disk, so those are skipped.
 */
export const INPUTS_READ_LINE = /^\*\*Inputs read:\*\*\s*(\d+)\s+files?,\s*(\d+)\s+items?/im;
const inArchive = (rel: string) => rel.split("/").slice(0, -1).some(seg => seg.toLowerCase() === "archive");

/**
 * Which audit report is the current one (2026-11-17): chosen by what the NAME says, so re-saving an old
 * report cannot make it current. The workflows name L2–L4 reports `<prefix>[ProjectName].md` (no date or
 * version) and L5 reports `<prefix>[version].md` (e.g. `L5_Framework_Audit_v1.md`); re-audits in use add a
 * version token such as `_v2`, `_v3.1b`, `_v4-verification`. Order: a YYYY-MM-DD date in the name (later
 * wins; a dated name outranks an undated one), then a `v<N>[.<N>...][letter]` token (higher wins; a name
 * with no token counts as v0, the first audit under the documented name), then modification time as the
 * tiebreak when the names do not distinguish (e.g. two names with the same version and different labels).
 */
export function reportNameKey(name: string, prefix: string): { date: string; version: number[]; letter: string } {
  const rest = name.slice(prefix.length).replace(/\.md$/i, "");
  const date = (rest.match(/(?:^|[^\d])(\d{4}-\d{2}-\d{2})(?!\d)/) ?? ["", ""])[1];
  const v = rest.match(/(?:^|[_\-.\s])v(\d+(?:\.\d+)*)([a-z]?)(?=$|[_\-.\s])/i);
  return { date, version: v ? v[1].split(".").map(Number) : [0], letter: v ? v[2].toLowerCase() : "" };
}
/** Negative when report x is newer (current) than y. */
export function compareReports(prefix: string, x: { name: string; mtime: number }, y: { name: string; mtime: number }): number {
  const a = reportNameKey(x.name, prefix), b = reportNameKey(y.name, prefix);
  if (a.date !== b.date) return a.date > b.date ? -1 : 1;
  for (let i = 0; i < Math.max(a.version.length, b.version.length); i++) {
    const d = (b.version[i] ?? 0) - (a.version[i] ?? 0);
    if (d) return d;
  }
  if (a.letter !== b.letter) return a.letter > b.letter ? -1 : 1;
  return y.mtime - x.mtime;
}

function gate8(arts: Artifact[], release: boolean): GateResult {
  const details: Detail[] = [];
  const maxLevel = Math.max(-1, ...arts.map(a => parseInt(a.level.slice(1), 10)));
  let sets = 0, cleared = 0;
  for (const spec of AUDITED_SETS) {
    const byDir = new Map<string, Artifact[]>();
    for (const a of arts.filter(spec.isMember)) {
      const d = dirname(a.path);
      if (!byDir.has(d)) byDir.set(d, []);
      byDir.get(d)!.push(a);
    }
    for (const [dir, members] of byDir) {
      sets++;
      const advanced = maxLevel > spec.level;
      const severity: Severity = advanced || release ? "HALT" : "WARN";
      const why = advanced ? " — and a later level already exists" : release ? " (--release)" : "";
      const relDir = members[0].rel.includes("/") ? dirname(members[0].rel) : ".";
      const reports = readdirSync(dir).filter(n => n.startsWith(spec.reportPrefix) && n.endsWith(".md"))
        .map(n => ({ name: n, path: join(dir, n), mtime: statSync(join(dir, n)).mtimeMs }))
        .sort((x, y) => compareReports(spec.reportPrefix, x, y));
      if (reports.length === 0) {
        details.push({ file: relDir, severity, note: `${spec.kind} (${members.length} files) has no ${spec.reportPrefix}*.md audit report beside it${advanced ? " — a later level already exists, so the set was advanced past unaudited" : why}` });
        continue;
      }
      const report = reports[0];
      const text = readFileSync(report.path, "utf8");
      const line = text.match(spec.gateLine);
      const overridden = !!frontmatter(text)?.advanced_with_open_flags;
      const newest = members.reduce((m, a) => Math.max(m, statSync(a.path).mtimeMs), 0);
      if (newest - report.mtime > STALE_TOLERANCE_MS) {
        details.push({ file: `${relDir}/${report.name}`, severity, note: `${spec.kind} has files newer than its audit report — re-audit, or record the post-audit edits in an addendum to the report${why}` });
      } else if (!line) {
        details.push({ file: `${relDir}/${report.name}`, severity: "WARN", note: `audit report has no "### ${spec.level === 5 ? "Synthesis complete" : `Cleared for L${spec.level + 1}`}:" gate line — mechanical anchor missing` });
      } else if (!/^yes\b/i.test(line[1].replace(/[*_`]/g, "").trim()) && !overridden) {
        details.push({ file: `${relDir}/${report.name}`, severity, note: `gate not cleared ("${line[1].trim()}") and no advanced_with_open_flags: line${why}` });
      } else {
        cleared++;
        // disclosure of inputs read (WARN; HALT only at --release, like gate 7); reports under archive/ are exempt
        const dsev: Severity = release ? "HALT" : "WARN";
        const where = `${relDir}/${report.name}`;
        const claim = text.match(INPUTS_READ_LINE);
        if (inArchive(where)) {
          // the researcher's ruling 2026-11-03: only current reports are held to the disclosure line; an archived version is exempt.
        } else if (!claim) {
          details.push({ file: where, severity: dsev, note: `audit report has no "**Inputs read:** N files, M items" line — what the audit read of the level below is not disclosed${release ? " (--release)" : ""}` });
        } else {
          const claimed = parseInt(claim[1], 10);
          const onDisk = arts.filter(a => spec.below(a) && !inArchive(a.rel)).length;
          if (onDisk > 0 && claimed < onDisk)
            details.push({ file: where, severity: dsev, note: `audit report claims ${claimed} ${spec.belowLabel} read, but ${onDisk} are on disk — a partial read is stated, not cleared${release ? " (--release)" : ""}` });
        }
      }
    }
  }
  return { gate: "GATE 8 level_audit", key: "level_audit_before_advance", severity: sets === 0 ? "SKIP" : worst(details),
    summary: sets === 0 ? "no L2–L5 sets in scope" : `${sets} set(s), ${cleared} with a current, cleared audit report`, details };
}

// ── source-integrity mode ────────────────────────────────────────────────────
function sourceMode(): number {
  const lines: string[] = [`synthesis-gates-check --source | ${GATES_PATH}`];
  let halts = 0;
  let text = "";
  try { text = readFileSync(GATES_PATH, "utf8"); } catch { console.log("HALT  config/synthesis-gates.yaml unreadable"); return 1; }

  const version = text.match(/^gates_version:\s*"([^"]+)"/m);
  if (!version) { lines.push("HALT  gates_version missing"); halts++; }
  else lines.push(`gates_version: ${version[1]}`);

  // gate keys = 2-space-indented keys between `gates:` and the next top-level key
  const gatesBlock = text.match(/^gates:\n([\s\S]*?)(?=^\S)/m);
  const keys = new Set<string>();
  if (!gatesBlock) { lines.push("HALT  gates: block not found"); halts++; }
  else for (const m of gatesBlock[1].matchAll(/^  ([a-z0-9_]+):/gm)) keys.add(m[1]);
  lines.push(`gates defined: ${keys.size} — ${[...keys].join(", ")}`);
  if (keys.size !== 8) { lines.push(`HALT  expected 8 gates, found ${keys.size}`); halts++; }

  // every gates.<key> pointer in skills/ + agents/ must resolve
  const refs = new Map<string, string[]>();
  for (const root of sourceRoots(process.argv.slice(2), PAI_DIR)) {
    if (!existsSync(root)) continue;
    for (const p of walk(root)) {
      const body = readFileSync(p, "utf8");
      // lookbehind excludes the literal filename "synthesis-gates.yaml"
      for (const m of body.matchAll(/(?<!synthesis-)gates\.([a-z0-9_]+)/g)) {
        const k = m[1];
        if (!refs.has(k)) refs.set(k, []);
        refs.get(k)!.push(p.slice(dirname(root).length + 1));  // "skills/…" in canonical, as before
      }
    }
  }
  let refCount = 0, badRefs = 0;
  for (const [k, files] of refs) {
    refCount += files.length;
    if (!keys.has(k)) { lines.push(`HALT  pointer gates.${k} (${files.length}× e.g. ${files[0]}) resolves to no defined gate`); halts++; badRefs++; }
  }
  lines.push(`pointers: ${refCount} gates.<key> references across skills/+agents/, ${badRefs} unresolved`);
  const unpointed = [...keys].filter(k => !refs.has(k));
  if (unpointed.length) lines.push(`WARN  gates never pointed at from any skill: ${unpointed.join(", ")} (inert-centralization risk)`);

  lines.push(halts ? `RESULT: HALT (${halts}) -> exit 1` : unpointed.length ? "RESULT: warns only -> exit 2" : "RESULT: clean -> exit 0");
  console.log(lines.join("\n"));
  return halts ? 1 : unpointed.length ? 2 : 0;
}

// ── artifact mode ────────────────────────────────────────────────────────────
export function runChecks(root: string, release = false): { results: GateResult[]; exit: number } {
  const arts = loadArtifacts(root);
  const results = [gate1(arts), gate2(arts), gate3(arts), gate4(arts), gate5(), gate6(arts), gate7(arts, release), gate8(arts, release)];
  const halts = results.flatMap(r => r.details).filter(d => d.severity === "HALT").length;
  const warns = results.flatMap(r => r.details).filter(d => d.severity === "WARN").length;
  // Every gate skipped means nothing was checked (an empty or mistyped path), which
  // must not read as a clean pass in a script or CI: exit 2 (reported by an independent
  // tester against v1.0.1 and v1.1, 2026-10-28).
  const nothingChecked = results.every(r => r.severity === "SKIP");
  return { results, exit: halts ? 1 : warns || nothingChecked ? 2 : 0 };
}

function main(): number {
  const args = process.argv.slice(2);
  if (args.includes("--source")) return sourceMode();
  const release = args.includes("--release");
  const verbose = args.includes("--verbose");
  const dir = args.find((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(args[i - 1]));
  if (!dir) { console.error("usage: bun check.ts <project-dir> [--release] [--verbose] [--gates <yaml>] | bun check.ts --source [--gates <yaml>] [--root <dir>]…"); return 1; }
  const root = resolve(dir);
  if (!existsSync(root)) { console.error(`HALT  no such directory: ${root}`); return 1; }

  const { results, exit } = runChecks(root, release);
  const pad = (s: string) => s.padEnd(23);
  console.log(`synthesis-gates-check | gates_version ${gatesVersion()} | ${basename(root)}${release ? " | --release" : ""}\n`);
  for (const r of results) {
    console.log(`${pad(r.gate)} ${r.severity.padEnd(5)} ${r.summary}`);
    const shown = verbose ? r.details : r.details.filter(d => d.severity !== "PASS");
    for (const d of shown) console.log(`    ${d.severity}  ${d.file} — ${d.note}`);
  }
  const halts = results.flatMap(r => r.details).filter(d => d.severity === "HALT").length;
  const warns = results.flatMap(r => r.details).filter(d => d.severity === "WARN").length;
  const checked = results.filter(r => r.severity !== "SKIP").length;
  const skipped = results.length - checked;
  if (checked === 0) console.log(`\nWARN  nothing checked: no ladder artifacts found under ${root} (wrong path?)`);
  console.log(`\n${results.length} gates: ${checked} checked, ${skipped} skip | ${halts} halt, ${warns} warn -> exit ${exit}`);
  return exit;
}

if (import.meta.main) process.exit(main());
