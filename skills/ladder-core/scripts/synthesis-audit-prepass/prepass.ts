#!/usr/bin/env bun
/**
 * synthesis-audit-prepass — deterministic pre-pass for ladder level audits (L2–L5).
 *
 *   bun prepass.ts <set-dir> <below-dir> [--also <dir>]... [--out <file>]
 *
 * A level audit run by a fresh agent cannot read the whole level below it once the study passes
 * ~20 participants, and an agent that cannot read it all skims. This script does the mechanical
 * cross-checks so the agent only judges the candidates:
 *   - which items of the level below the set never cites,
 *   - which citations point at nothing,
 *   - which double-quoted fragments are not in the cited source text.
 * It is a REPORT, not a gate: exit 0 always, except exit 2 on bad arguments. The guard is against
 * an agent that skims, not an adversary, so it reports parse failures loudly and never says
 * "clean" about text it could not read. Read-only. `archive/` folders are ignored.
 *
 * Origin: engineer review 2026-10-28 sections 3 and 5, and the researcher's ruling that day ("a script pass
 * first, then the agent judges the candidates"); built 2026-11-03.
 */
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync } from "fs";
import { join, basename, resolve } from "path";

// ───────────────────────── text normalization ─────────────────────────
/** Curly quotes, dashes, ellipsis char, markdown emphasis, case and whitespace removed. */
export function norm(s: string): string {
  return s.normalize("NFKC")
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/[“”„«»]/g, '"')
    .replace(/[‐-―−]/g, "-")
    .replace(/…/g, "...")
    .replace(/[*`]/g, "")
    .replace(/(^|[^\w])_+|_+(?=[^\w]|$)/g, "$1")
    .toLowerCase().replace(/\s+/g, " ").trim();
}
/** Second tier: everything but letters and digits collapsed. A hit here only is "present, punctuation differs". */
export const alnum = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
/** Ellipsis-joined fragments are checked piece by piece. */
export function pieces(quoted: string): string[] {
  return norm(quoted).split(/\[?\s*\.{3,}\s*\]?/).map(p => p.trim()).filter(p => alnum(p).length >= 3);
}

// ───────────────────────── frontmatter ─────────────────────────
export interface Fm { map: Record<string, string>; lists: Record<string, string[]> }
export function parseFm(text: string): Fm {
  const out: Fm = { map: {}, lists: {} };
  if (!text.startsWith("---")) return out;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return out;
  let key = "";
  for (const line of text.slice(3, end).split("\n")) {
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      const v = kv[2].trim();
      out.map[key] = v;
      if (v.startsWith("[") && v.endsWith("]")) out.lists[key] = v.slice(1, -1).split(",").map(x => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      continue;
    }
    const li = line.match(/^\s+-\s+(.*)$/);
    if (li && key) (out.lists[key] ??= []).push(li[1].trim().replace(/^["']|["']$/g, ""));
  }
  return out;
}
/** Replace the frontmatter with blank lines so line numbers survive. */
export function blankFm(text: string): string {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return text;
  const close = text.indexOf("\n", end + 1);
  const cut = close === -1 ? text.length : close;
  return text.slice(0, cut).replace(/[^\n]/g, "") + text.slice(cut);
}

// ───────────────────────── kinds and files ─────────────────────────
export type Kind = "L1" | "L2" | "L3" | "ARCH" | "P" | "OA" | "VP" | "L5";
const UNIT_KINDS: Kind[] = ["L2", "L3", "ARCH", "P", "OA", "VP"];
const INDIVIDUAL = /^(L2|L3)-(\d{2})(?=[_.])|^(ARCH|P|OA|VP)-(\d{2}[A-Z]?)(?=[_.])/;
const MASTER: [RegExp, Kind][] = [
  [/^L2_Themes_/, "L2"], [/^L3_Insights_/, "L3"], [/^L4_Archetypes_/, "ARCH"], [/^L4_Principles_/, "P"],
  [/^L4_Opportunity_Areas_/, "OA"], [/^L4_Value_Propositions_/, "VP"],
];
const SKIP_NAME = /Summary|_Audit_|FinalLadderReview|_Visual|verification/i;
const LEVEL_OF: Record<Kind, string> = { L1: "L1", L2: "L2", L3: "L3", ARCH: "L4", P: "L4", OA: "L4", VP: "L4", L5: "L5" };
/** What each kind of set item cites from the level below. */
const CITES: Record<string, Kind[]> = { L2: ["L1"], L3: ["L2"], ARCH: ["L2", "L3"], P: ["L3"], OA: ["L3"], VP: ["L3"], L5: ["P", "OA", "VP", "ARCH"] };
const KIND_LABEL: Record<Kind, string> = { L1: "L1 findings", L2: "L2 themes", L3: "L3 insights", ARCH: "L4 archetypes", P: "L4 principles", OA: "L4 opportunity areas", VP: "L4 value propositions", L5: "L5 framework" };

/** Every .md under dir, skipping dot files and any `archive/` folder (old versions). */
export function* walkMd(dir: string): Generator<string> {
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name.toLowerCase() !== "archive") yield* walkMd(p); }
    else if (name.endsWith(".md")) yield p;
  }
}

export interface Unit {
  kind: Kind; id: string; file: string; title: string;
  text: string;        // raw text of the unit (frontmatter kept for individual files)
  line0: number;       // 1-based line number of text's first line within its file
  extra: string;       // master-document index-table rows for this unit (citations only)
}
export interface L1Finding { n: number; title: string; text: string }
export interface L1File { file: string; name: string; code: string; findings: Map<number, L1Finding> }
export interface Level {
  dir: string; files: string[]; units: Unit[]; l1: L1File[]; kinds: Kind[]; notes: string[];
  masters: { file: string; fm: Fm }[];
}

export function initials(name: string): string {
  const clean = name.normalize("NFD").replace(/\p{M}/gu, "").replace(/\(.*?\)/g, "").replace(/["'*]/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function parseL1(file: string, text: string): L1File {
  const fm = parseFm(text);
  const name = (fm.map.participant ?? "").replace(/^["']|["']$/g, "").trim();
  const findings = new Map<number, L1Finding>();
  let cur: { n: number; title: string; buf: string[] } | null = null;
  const flush = () => { if (cur) findings.set(cur.n, { n: cur.n, title: cur.title, text: cur.buf.join("\n") }); cur = null; };
  for (const line of text.split("\n")) {
    const h = line.match(/^## Finding (\d+)\b[:.]?\s*(.*)$/);
    if (h) { flush(); cur = { n: +h[1], title: h[2].trim(), buf: [] }; continue; }
    if (/^#{1,2} /.test(line)) { flush(); continue; }
    cur?.buf.push(line);
  }
  flush();
  return { file, name, code: name ? initials(name) : "", findings };
}

const ANY_ID = "((?:L2|L3)-\\d{2}|(?:ARCH|P|OA|VP)-\\d{2}[A-Z]?)";
function splitMaster(file: string, text: string, kind: Kind): Unit[] {
  const lines = text.split("\n");
  const heads: { i: number; id: string; title: string }[] = [];
  const prefix = kind === "L2" || kind === "L3" ? kind + "-" : kind + "-";
  lines.forEach((l, i) => {
    const h = l.match(new RegExp(`^##\\s+${ANY_ID}\\b[:.]?\\s*(.*)$`));
    if (h && h[1].startsWith(prefix)) heads.push({ i, id: h[1], title: h[2].trim() });
  });
  const rows = new Map<string, string[]>();
  for (const l of lines) {
    const r = l.match(new RegExp(`^\\|\\s*${ANY_ID}\\s*\\|`));
    if (r) (rows.get(r[1]) ?? rows.set(r[1], []).get(r[1])!).push(l);
  }
  return heads.map((h, k) => {
    const endLine = k + 1 < heads.length ? heads[k + 1].i : lines.length;
    return { kind, id: h.id, file, title: h.title, text: lines.slice(h.i, endLine).join("\n"), line0: h.i + 1, extra: (rows.get(h.id) ?? []).join("\n") };
  });
}

export function loadLevel(dir: string): Level {
  const lv: Level = { dir, files: [], units: [], l1: [], kinds: [], notes: [], masters: [] };
  const indiv: Partial<Record<Kind, Unit[]>> = {};
  const masters: Partial<Record<Kind, string[]>> = {};
  for (const p of walkMd(dir)) {
    const name = basename(p);
    if (SKIP_NAME.test(name)) continue;
    const text = readFileSync(p, "utf8");
    if (/^L1_.*_findings\.md$/.test(name)) { lv.l1.push(parseL1(name, text)); lv.files.push(name); continue; }
    const m = name.match(INDIVIDUAL);
    if (m) {
      const kind = (m[1] ?? m[3]) as Kind, id = `${kind}-${m[2] ?? m[4]}`;
      const h1 = text.match(/^# [A-Z0-9-]+\s*[:.]?\s*(.*)$/m);
      (indiv[kind] ??= []).push({ kind, id, file: name, title: h1 ? h1[1].trim() : "", text, line0: 1, extra: "" });
      lv.files.push(name);
      continue;
    }
    const mk = MASTER.find(([re]) => re.test(name));
    if (mk) { (masters[mk[1]] ??= []).push(p); lv.masters.push({ file: name, fm: parseFm(text) }); continue; }
    if (/^L5_Framework_/.test(name)) {
      lv.units.push({ kind: "L5", id: name.replace(/\.md$/, ""), file: name, title: (text.match(/^# (.*)$/m) ?? ["", ""])[1], text, line0: 1, extra: "" });
      lv.files.push(name);
    }
  }
  for (const kind of UNIT_KINDS) {
    const ind0 = indiv[kind] ?? [];
    // An item whose frontmatter status says it was absorbed, merged, retired or superseded is not part of the live set.
    const retired = ind0.filter(u => /^status:\s*(ABSORBED|MERGED|RETIRED|SUPERSEDED|WITHDRAWN)\b/im.test(u.text));
    for (const u of retired) lv.notes.push(`${u.file}: skipped, frontmatter status is ${(u.text.match(/^status:\s*(\S+)/im) ?? ["", "retired"])[1]} (not a live ${kind})`);
    const ind = ind0.filter(u => !retired.includes(u));
    if (ind.length) {
      lv.units.push(...ind);
      for (const mp of masters[kind] ?? []) lv.notes.push(`${basename(mp)}: master document ignored for ${kind} (${ind.length} individual ${kind} files are present and are the set)`);
    } else {
      for (const mp of masters[kind] ?? []) {
        const us = splitMaster(basename(mp), readFileSync(mp, "utf8"), kind);
        lv.units.push(...us);
        lv.files.push(basename(mp));
        lv.notes.push(`${basename(mp)}: master document only (no individual ${kind} files); ${us.length} ${kind} sections read from it`);
        if (us.length === 0) lv.notes.push(`${basename(mp)}: NO "## ${kind}-NN" sections found in the master document, so nothing was parsed from it`);
      }
    }
  }
  lv.kinds = [...new Set([...(lv.l1.length ? ["L1" as Kind] : []), ...lv.units.map(u => u.kind)])];
  const seen = new Map<string, string[]>();
  for (const u of lv.units) (seen.get(u.id) ?? seen.set(u.id, []).get(u.id)!).push(u.file);
  for (const [id, fs] of seen) if (fs.length > 1) lv.notes.push(`DUPLICATE ID ${id} in: ${fs.join(", ")}`);
  return lv;
}

// ───────────────────────── citations ─────────────────────────
export interface Ref { kind: Kind; id: string; raw: string; index: number }
export function idRefs(text: string): Ref[] {
  const out: Ref[] = [];
  for (const m of text.matchAll(/\b(L2|L3)-(?:T-)?(\d{2})\b/g)) out.push({ kind: m[1] as Kind, id: `${m[1]}-${m[2]}`, raw: m[0], index: m.index! });
  for (const m of text.matchAll(/\b(ARCH|VP|OA|P)-(\d{2}[A-Z]?)\b/g)) out.push({ kind: m[1] as Kind, id: `${m[1]}-${m[2]}`, raw: m[0], index: m.index! });
  return out;
}
export const lineAt = (text: string, idx: number, line0 = 1) => line0 + (text.slice(0, idx).match(/\n/g)?.length ?? 0);

export interface Bullet { section: "C" | "L" | "X" | "?"; label: string; code: string; refs: number[]; rest: string; line: number; raw: string }
export interface EvidenceParse { found: boolean; bullets: Bullet[]; unparsed: { line: number; text: string }[] }

/** Finding-number list after "Finding(s)": "14", "15, 22", "4 and 7", "3-5" (a range expands). */
export function parseRefList(s: string): number[] {
  const item = "\\d+(?:\\s*[-\\u2013]\\s*\\d+)?";
  const m = s.match(new RegExp(`^\\s*(${item}(?:\\s*(?:,|and|&)\\s*${item})*)`));
  if (!m) return [];
  const nums: number[] = [];
  for (const part of m[1].split(/\s*(?:,|and|&)\s*/)) {
    const r = part.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (r) { for (let n = +r[1]; n <= Math.min(+r[2], +r[1] + 60); n++) nums.push(n); }
    else if (/^\d+$/.test(part.trim())) nums.push(+part);
  }
  return nums;
}

/** Evidence bullets of a theme: `- **CODE (Finding N)** *(tag)*: "quote" — reading`. Anything bullet-shaped that does not parse is returned in `unparsed`. */
export function parseEvidence(text: string, line0 = 1): EvidenceParse {
  const lines = text.split("\n");
  const res: EvidenceParse = { found: false, bullets: [], unparsed: [] };
  let inEv = false, via: "h" | "b" = "h", section: Bullet["section"] = "?";
  let cur: { start: number; buf: string } | null = null;
  const flush = () => {
    if (!cur) return;
    const raw = cur.buf, line = line0 + cur.start;
    cur = null;
    const b = raw.match(/^\*\*([^*]+?)\*\*(.*)$/);
    const lm = b && b[1].match(/^(.+?)\s*\(\s*Findings?\s+([^)]*)\)\s*:?\s*$/i);
    const refs = lm ? parseRefList(lm[2]) : [];
    if (!b || !lm || refs.length === 0) { res.unparsed.push({ line, text: raw.slice(0, 160) }); return; }
    // Older theme format (an interim set, 2026-10-27): "**Counter-case — RN (Finding 10)**" marks the bullet itself as a counter-case.
    const cc = lm[1].match(/^\s*counter[- ]?cases?\s*[—–:-]\s*(.+)$/i);
    const code = (cc ? cc[1] : lm[1]).replace(/[*\s]+/g, " ").trim();
    res.bullets.push({ section: cc ? "X" : section, label: b[1].trim(), code, refs, rest: b[2].replace(/^\s*:?\s*/, ""), line, raw });
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!inEv) {
      if (/^##\s+Evidence\b/.test(l)) { inEv = true; via = "h"; res.found = true; }
      else if (/^\*\*Evidence:?\*\*/.test(l)) { inEv = true; via = "b"; res.found = true; }
      continue;
    }
    if (/^##\s/.test(l) || /^---\s*$/.test(l) || (via === "b" && /^\*\*(Implication|Behavioral pattern|Abductive connection):?\*\*/.test(l))) { flush(); inEv = false; continue; }
    const sec = l.match(/^\*{0,2}\s*(Counted|Listed|Counter)/i);
    if (sec && !/^\s*[-*+]\s/.test(l)) { flush(); section = /^counted/i.test(sec[1]) ? "C" : /^listed/i.test(sec[1]) ? "L" : "X"; continue; }
    const bm = l.match(/^\s*[-*+]\s+(.*)$/);
    if (bm) { flush(); cur = { start: i, buf: bm[1] }; continue; }
    if (cur && l.trim() !== "" && /^\s+/.test(l)) { cur.buf += " " + l.trim(); continue; }
    flush();
  }
  flush();
  return res;
}

// ───────────────────────── quotes ─────────────────────────
/** `lineText`: the source line(s) the quote itself sits on, so a citation on that line can be read (2026-11-17). */
export interface Quoted { text: string; line: number; field: string; section: string; lineText?: string }
/** Double-quoted fragments of a unit, paragraph by paragraph, outside code fences and frontmatter. */
export function quotedFragments(text: string, line0 = 1): { frags: Quoted[]; unbalanced: Quoted[]; paras: { field: string; section: string; text: string }[] } {
  // Key Indicators: ArchetypeFormat writes each signal as a quoted line ("[Signal]"), authored by the synthesist, not a participant quote.
  const skipField = /^(Source (themes|insights)|Evidence Trail|Key Indicators)$/i;
  const frags: Quoted[] = [], unbalanced: Quoted[] = [], paras: { field: string; section: string; text: string }[] = [];
  let fence = false, field = "", section = "", para: { start: number; buf: string[]; field: string; section: string } | null = null;
  const endPara = () => {
    if (!para) return;
    const s = para.buf.join(" ").replace(/[“”„]/g, '"').replace(/(\d'\d{1,2})"/g, "$1\u2033");
    const line = line0 + para.start;
    paras.push({ field: para.field, section: para.section, text: s });
    if ((s.match(/"/g) ?? []).length % 2 === 1) unbalanced.push({ text: s.slice(0, 140), line, field: para.field, section: para.section });
    else if (!skipField.test(para.field)) {
      // Line boundaries inside the joined paragraph (the replacements above keep string length).
      const starts: number[] = [];
      para.buf.reduce((at, l) => { starts.push(at); return at + l.length + 1; }, 0);
      const lineOf = (idx: number) => { let k = 0; while (k + 1 < starts.length && starts[k + 1] <= idx) k++; return k; };
      for (const m of s.matchAll(/"([^"]*)"/g)) {
        const a = lineOf(m.index!), z = lineOf(m.index! + m[0].length - 1);
        frags.push({ text: m[1], line, field: para.field, section: para.section, lineText: para.buf.slice(a, z + 1).join(" ") });
      }
    }
    para = null;
  };
  blankFm(text).split("\n").forEach((l, i) => {
    if (/^\s*```/.test(l)) { endPara(); fence = !fence; return; }
    if (fence) return;
    if (l.trim() === "") { endPara(); return; }
    const h = l.match(/^#{1,6}\s+(.*)$/);
    if (h) { endPara(); field = h[1].replace(/\s*[:(].*$/, "").trim(); if (/^##\s/.test(l)) section = field; return; }
    const b = l.match(/^\*\*([^*]{1,60}?)\*\*/);
    if (b && !para && !/^\s*[-*+]\s/.test(l)) field = b[1].replace(/\s*\(.*$/, "").replace(/[:.]\s*$/, "").trim();
    if (!para) para = { start: i, buf: [], field, section };
    para.buf.push(l.trim());
  });
  endPara();
  return { frags, unbalanced, paras };
}

/** Split an individual insight file into its text outside and inside the `## Trace` working record (line numbers kept by blanking). */
export function splitTrace(text: string): { body: string; trace: string } {
  let inTrace = false;
  const body: string[] = [], trace: string[] = [];
  for (const l of blankFm(text).split("\n")) {
    if (/^##\s/.test(l)) inTrace = /^##\s+Trace\b/.test(l);
    (inTrace ? trace : body).push(l); (inTrace ? body : trace).push("");
  }
  return { body: body.join("\n"), trace: trace.join("\n") };
}

export interface Corpus { label: string; n: string; a: string }
const mkCorpus = (label: string, text: string): Corpus => { const n = norm(text); return { label, n, a: alnum(n) }; };
export type QStatus = "present" | "present-punct" | "NOT FOUND" | "uncheckable";
/** Where a fragment that is not in its cited source ended up. */
export type NfClass = "deeper" | "self" | "draft" | "candidate";
export const DRAFT_FIELD = /^(Revised at the check|Near-miss discarded)\b/i;
export function checkPieces(fragment: string, source: Corpus): QStatus {
  const ps = pieces(fragment);
  if (ps.length === 0) return "present";
  let punct = false;
  for (const p of ps) {
    if (source.n.includes(p)) continue;
    if (source.a.includes(alnum(p))) { punct = true; continue; }
    return "NOT FOUND";
  }
  return punct ? "present-punct" : "present";
}
function hints(fragment: string, pool: Corpus[], exclude: Set<string>): string[] {
  const ps = pieces(fragment);
  if (!ps.length) return [];
  const out: string[] = [];
  for (const c of pool) {
    if (exclude.has(c.label)) continue;
    if (ps.every(p => c.n.includes(p) || c.a.includes(alnum(p)))) { out.push(c.label); if (out.length >= 3) break; }
  }
  return out;
}

// ───────────────────────── the pass ─────────────────────────
export interface Stats {
  setLevel: string; belowLevel: string; setFiles: number; setItems: number; belowFiles: number; belowItems: number;
  uncitedItems: number; uncitedFiles: number; citations: number; citationErrors: number; unparsed: number;
  fragments: number; present: number; presentPunct: number; deeper: number; selfQuote: number; draft: number; notFound: number; uncheckable: number; unbalanced: number;
  otherLevelRefs: number; tokenMisses: number; collisions: number;
  /** Quote not in the item(s) cited on its own line, but in another item of the level below (2026-11-17). */
  otherItem: number;
}
export interface Result { markdown: string; stats: Stats }
const pl = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const clip = (s: string, n = 110) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function run(setDir: string, belowDir: string, alsoDirs: string[] = []): Result {
  const set = loadLevel(setDir), below = loadLevel(belowDir);
  // deeper sources (--also): every finding and item text of each directory, one corpus per directory
  const also = alsoDirs.map(d => {
    const lv = loadLevel(d);
    const text = [...lv.l1.flatMap(f => [...f.findings.values()].map(x => x.text)), ...lv.units.map(u => blankFm(u.text))].join("\n");
    return { name: basename(d), n: lv.l1.reduce((a, f) => a + f.findings.size, 0) + lv.units.length, corpus: mkCorpus(basename(d), text) };
  });
  const setKinds = set.kinds.filter(k => k !== "L1");
  if (setKinds.length === 0) throw new Error(`no ladder files recognised in set-dir ${setDir} (expected L2-NN_*.md, L3-NN_*.md, ARCH-/P-/OA-/VP-NN_*.md, an L2_/L3_/L4_ master document, or L5_Framework_*.md)`);
  if (below.kinds.length === 0) throw new Error(`no ladder files recognised in below-dir ${belowDir}`);
  const rank = (k: Kind) => ["L2", "L3", "L4", "L5"].indexOf(LEVEL_OF[k]);
  const top = setKinds.slice().sort((a, b) => rank(b) - rank(a))[0];
  const setLevel = LEVEL_OF[top] + (LEVEL_OF[top] === "L4" ? ` (${[...new Set(setKinds.filter(k => LEVEL_OF[k] === "L4"))].join(", ")})` : "");
  const belowLevel = below.kinds.map(k => KIND_LABEL[k]).join(" + ");

  // ---------- below-level indexes ----------
  const byCode = new Map<string, L1File[]>();
  const byName = new Map<string, L1File[]>();
  for (const f of below.l1) {
    if (!f.code) continue;
    (byCode.get(f.code) ?? byCode.set(f.code, []).get(f.code)!).push(f);
    (byName.get(norm(f.name)) ?? byName.set(norm(f.name), []).get(norm(f.name))!).push(f);
  }
  const collisions = [...byCode].filter(([, fs]) => fs.length > 1);
  const noCode = below.l1.filter(f => !f.code);
  const belowUnits = new Map<string, Unit>(below.units.map(u => [u.id, u]));
  const belowKinds = new Set(below.kinds);

  // ---------- citations of the set ----------
  const errors: string[] = [];
  const unparsedList: string[] = [];
  const otherLevel = new Map<string, number>();
  const citedFindings = new Map<string, Set<number>>();   // L1 file -> findings cited
  const citedUnits = new Set<string>();                    // below unit ids cited
  const citedBy = new Map<Unit, Unit[]>();                 // set unit -> cited below units (quote source)
  const ambiguousFiles = new Set<string>();
  let citations = 0;
  interface L2Quote { u: Unit; b: Bullet; sources: { f: L1File; n: number }[] | null; reason: string }
  const l2Quotes: L2Quote[] = [];

  for (const u of set.units) {
    const expects = CITES[u.kind] ?? [];
    if (u.kind === "L2") {
      const ev = parseEvidence(u.text, u.line0);
      if (!ev.found) unparsedList.push(`- ${u.file} (${u.id}): no "## Evidence" section found, so no citations could be read from this theme`);
      else if (ev.bullets.length === 0 && ev.unparsed.length === 0) unparsedList.push(`- ${u.file} (${u.id}): Evidence section found but it holds no bullets, so there is nothing to check`);
      for (const x of ev.unparsed) unparsedList.push(`- ${u.file}:${x.line} — ${clip(x.text, 150)}`);
      for (const b of ev.bullets) {
        const files: L1File[] = byCode.get(b.code) ?? byName.get(norm(b.code)) ?? [];
        const cite = `${b.code} (Finding${b.refs.length > 1 ? "s" : ""} ${b.refs.join(", ")})`;
        if (files.length === 0) {
          const reason = `unknown code "${b.code}" (no L1 participant file has these initials or this name)`;
          errors.push(`- ${u.file}:${b.line} — ${cite}: ${reason}`);
          citations += b.refs.length; l2Quotes.push({ u, b, sources: null, reason }); continue;
        }
        if (files.length > 1) {
          const reason = `code "${b.code}" is ambiguous: ${files.map(f => f.file).join(" / ")}`;
          errors.push(`- ${u.file}:${b.line} — ${cite}: ${reason}; the citation cannot be attributed`);
          files.forEach(f => ambiguousFiles.add(f.file));
          citations += b.refs.length; l2Quotes.push({ u, b, sources: null, reason }); continue;
        }
        const f = files[0];
        const srcs: { f: L1File; n: number }[] = [];
        let reason = "";
        for (const n of b.refs) {
          citations++;
          if (!f.findings.has(n)) {
            const have = [...f.findings.keys()].sort((x, y) => x - y);
            errors.push(`- ${u.file}:${b.line} — ${b.code} (Finding ${n}): ${f.file} has no Finding ${n} (it has ${have.length ? `${have[0]} to ${have[have.length - 1]}` : "none"})`);
            reason = `Finding ${n} does not exist`;
            continue;
          }
          (citedFindings.get(f.file) ?? citedFindings.set(f.file, new Set()).get(f.file)!).add(n);
          srcs.push({ f, n });
        }
        l2Quotes.push({ u, b, sources: reason ? null : srcs, reason });
      }
    } else {
      const raw = u.text + "\n" + u.extra;
      const mine: Unit[] = [];
      const reported = new Set<string>();
      for (const r of idRefs(raw)) {
        if (!expects.includes(r.kind)) continue;
        if (!belowKinds.has(r.kind)) { otherLevel.set(r.kind, (otherLevel.get(r.kind) ?? 0) + 1); continue; }
        citations++;
        const hit = belowUnits.get(r.id);
        if (!hit || hit.kind !== r.kind) {
          if (!reported.has(r.id)) { reported.add(r.id); errors.push(`- ${u.file}:${lineAt(raw, r.index, u.line0)} — ${u.id} cites ${r.raw}: no such item in ${basename(belowDir)}`); }
          continue;
        }
        citedUnits.add(hit.id);
        if (!mine.includes(hit)) mine.push(hit);
      }
      citedBy.set(u, mine);
    }
  }

  // source_files: of a master theme document vs the L1 files on disk
  const srcNotes: string[] = [];
  for (const m of set.masters) {
    const sf = m.fm.lists.source_files;
    if (!sf || !below.l1.length) continue;
    const names = new Set(below.l1.map(f => f.file));
    for (const n of sf) if (!names.has(n)) srcNotes.push(`- ${m.file}: source_files lists ${n}, which is not in ${basename(belowDir)}`);
    for (const n of names) if (!sf.includes(n)) srcNotes.push(`- ${m.file}: ${n} is in ${basename(belowDir)} but not in source_files`);
  }

  // ---------- below-level items ----------
  const belowItems = below.l1.reduce((a, f) => a + f.findings.size, 0) + below.units.length;
  const belowFiles = below.files.length;

  // ---------- uncited ----------
  const uncited: string[] = [];
  let uncitedItems = 0, uncitedFiles = 0;
  const expectedKinds = new Set(setKinds.flatMap(k => CITES[k] ?? []));
  if (expectedKinds.has("L1")) {
    for (const f of below.l1) {
      const cited = citedFindings.get(f.file) ?? new Set<number>();
      const miss = [...f.findings.values()].filter(x => !cited.has(x.n)).sort((a, b) => a.n - b.n);
      if (miss.length === 0) continue;
      uncitedFiles++; uncitedItems += miss.length;
      const amb = ambiguousFiles.has(f.file) ? " (code collision: citations to this code could not be attributed, so some of these may be cited)" : "";
      uncited.push(`### ${f.file} (code ${f.code || "?"}): ${miss.length} of ${f.findings.size} uncited${amb}`);
      for (const x of miss) uncited.push(`- Finding ${x.n}: ${clip(x.title)}`);
      uncited.push("");
    }
  }
  for (const kind of UNIT_KINDS) {
    if (!expectedKinds.has(kind) || !belowKinds.has(kind)) continue;
    const byFile = new Map<string, Unit[]>();
    for (const u of below.units.filter(u => u.kind === kind && !citedUnits.has(u.id))) (byFile.get(u.file) ?? byFile.set(u.file, []).get(u.file)!).push(u);
    for (const [file, us] of byFile) {
      uncitedFiles++; uncitedItems += us.length;
      uncited.push(`### ${file}: ${us.length} uncited (${KIND_LABEL[kind]})`);
      for (const u of us) uncited.push(`- ${u.id}: ${clip(u.title)}`);
      uncited.push("");
    }
  }

  // ---------- quote check ----------
  interface QRow { file: string; frag: number; present: number; punct: number; deeper: number; self: number; draft: number; nf: number; unc: number; other: number }
  const perFile = new Map<string, QRow>();
  type Tally = QStatus | NfClass | "other-item";
  const tally = (file: string, st: Tally) => {
    const r = perFile.get(file) ?? perFile.set(file, { file, frag: 0, present: 0, punct: 0, deeper: 0, self: 0, draft: 0, nf: 0, unc: 0, other: 0 }).get(file)!;
    r.frag++;
    if (st === "present") r.present++; else if (st === "present-punct") r.punct++; else if (st === "deeper") r.deeper++; else if (st === "self") r.self++;
    else if (st === "draft") r.draft++; else if (st === "NOT FOUND" || st === "candidate") r.nf++; else if (st === "other-item") r.other++; else r.unc++;
  };
  const nfLines: string[] = [], uncheckLines: string[] = [], unbalLines: string[] = [], otherItemLines: string[] = [];
  // collapsed classes: item key -> { label, fragments }
  const collapsed: Record<"deeper" | "self" | "draft", Map<string, { label: string; frags: string[] }>> = { deeper: new Map(), self: new Map(), draft: new Map() };
  const collapse = (cls: "deeper" | "self" | "draft", key: string, label: string, line: number, frag: string, via = "") => {
    const m = collapsed[cls].get(key) ?? collapsed[cls].set(key, { label, frags: [] }).get(key)!;
    m.frags.push(`"${clip(frag, 60)}" (line ${line}${via})`);
  };
  /** Classify a fragment that is not in its cited source: deeper source, self-quote, draft wording, or a candidate. */
  const classify = (frag: string, o: { u: Unit; line: number; field: string; section: string; paras?: { field: string; text: string }[] }): { cls: NfClass; via: string } => {
    const ps = pieces(frag);
    const deep = also.filter(a => checkPieces(frag, a.corpus) !== "NOT FOUND").map(a => a.name);
    if (deep.length) return { cls: "deeper", via: deep.join(", ") + (ps.every(p => p.split(" ").length < 4) ? "; short fragment, may match by chance" : "") };
    if (o.paras) {
      const own = norm([o.u.title, ...o.paras.filter(p => /^(Insight|Observation)\b/i.test(p.field)).map(p => p.text.split(`"${frag}"`).join(" "))].join("\n"));
      if (ps.length > 0 && ps.every(p => own.includes(p))) return { cls: "self", via: "" };
      if (/^Trace$/i.test(o.section) && DRAFT_FIELD.test(o.field)) return { cls: "draft", via: "" };
    }
    // L4/L5 items have no Insight/Observation fields: an item quoting its own wording anywhere in its body
    // (e.g. a framework quoting its own domain statement) is a self-quote. Every identical quoted copy is removed first.
    if (LEVEL_OF[top] !== "L2" && LEVEL_OF[top] !== "L3") {
      const body = norm(blankFm(o.u.text).split(`"${frag}"`).join(" "));
      if (ps.length > 0 && ps.every(p => body.includes(p))) return { cls: "self", via: "" };
    }
    return { cls: "candidate", via: "" };
  };
  let unbalanced = 0;
  const l1Pool: Corpus[] = below.l1.flatMap(f => [...f.findings.values()].map(x => mkCorpus(`${f.code || f.file} Finding ${x.n}`, x.text)));
  const unitPool: Corpus[] = below.units.map(u => mkCorpus(u.id, blankFm(u.text)));

  for (const q of l2Quotes) {
    const { u, b } = q;
    const s = b.rest.replace(/[“”„]/g, '"');
    const where = `${u.file}:${b.line} — ${b.label}`;
    if ((s.match(/"/g) ?? []).length % 2 === 1) { unbalanced++; unbalLines.push(`- ${where}: odd number of double-quote marks; the fragments in this bullet were NOT checked — ${clip(s, 120)}`); continue; }
    for (const m of s.matchAll(/"([^"]*)"/g)) {
      if (pieces(m[1]).length === 0) continue;
      if (!q.sources) { tally(u.file, "uncheckable"); uncheckLines.push(`- ${where}: "${clip(m[1], 80)}" — cited source unavailable (${q.reason})`); continue; }
      const st = checkPieces(m[1], mkCorpus("cited", q.sources.map(x => blankFm(x.f.findings.get(x.n)!.text)).join("\n")));
      if (st !== "NOT FOUND") tally(u.file, st);
      if (st === "NOT FOUND") {
        const c = classify(m[1], { u, line: b.line, field: "", section: "" });
        if (c.cls === "deeper") { tally(u.file, "deeper"); collapse("deeper", u.file, u.file, b.line, m[1], `, in ${c.via}`); continue; }
        tally(u.file, "candidate");
        const h = hints(m[1], l1Pool, new Set(q.sources.map(x => `${x.f.code || x.f.file} Finding ${x.n}`)));
        nfLines.push(`- ${where}: "${clip(m[1], 160)}" — NOT FOUND in the cited finding${q.sources.length > 1 ? "s" : ""}${h.length ? `; the text does appear in ${h.join(", ")}` : "; not found anywhere in the L1 files either"}`);
      }
    }
  }

  const tokenMisses: string[] = [];
  const higher = set.units.filter(u => u.kind !== "L2");
  if (higher.length) {
    const tokensOf = (t: string) => {
      const s = new Set<string>();
      for (const m of t.matchAll(/\b([A-Z]{2})\*?(\d{1,2})(?:\/(\d{1,2}))?\b/g)) { s.add(`${m[1]}:${m[2]}`); if (m[3]) s.add(`${m[1]}:${m[3]}`); }
      return s;
    };
    const itemTokens = new Map<string, Set<string>>();
    const knownCodes = new Set<string>();
    for (const bu of below.units) {
      const toks = new Set<string>();
      if (bu.kind === "L2") for (const b of parseEvidence(bu.text, bu.line0).bullets) for (const n of b.refs) toks.add(`${b.code}:${n}`);
      else tokensOf(blankFm(bu.text)).forEach(t => toks.add(t));
      itemTokens.set(bu.id, toks);
      toks.forEach(t => knownCodes.add(t.split(":")[0]));
    }
    for (const u of higher) {
      const cited = citedBy.get(u) ?? [];
      const { frags, unbalanced: ub, paras } = quotedFragments(u.text, u.line0);
      for (const x of ub) { unbalanced++; unbalLines.push(`- ${u.file}:${x.line} (${u.id}, ${x.field || "body"}): odd number of double-quote marks; the fragments in this paragraph were NOT checked — ${clip(x.text, 120)}`); }
      const src = cited.length ? mkCorpus("cited", cited.map(c => blankFm(c.text)).join("\n")) : null;
      for (const f of frags) {
        if (pieces(f.text).length === 0) continue;
        const where = `${u.file}:${f.line} — ${u.id}${f.field ? ` (${f.field})` : ""}`;
        if (!src) { tally(u.file, "uncheckable"); uncheckLines.push(`- ${where}: "${clip(f.text, 80)}" — ${u.id} cites no item that exists in ${basename(belowDir)}`); continue; }
        // 2026-11-17: when the quote's own line cites items of the level below that exist, the quote is checked
        // against those items only. A line that cites none keeps the item-wide check (every item the unit cites).
        const onLine: Unit[] = [];
        for (const r of idRefs(f.lineText ?? "")) {
          const hit = (CITES[u.kind] ?? []).includes(r.kind) ? belowUnits.get(r.id) : undefined;
          if (hit && hit.kind === r.kind && !onLine.includes(hit)) onLine.push(hit);
        }
        const st = checkPieces(f.text, onLine.length ? mkCorpus("cited on the line", onLine.map(c => blankFm(c.text)).join("\n")) : src);
        if (st !== "NOT FOUND") { tally(u.file, st); continue; }
        if (onLine.length) {
          const elsewhere = unitPool.filter(c => !onLine.some(x => x.id === c.label) && checkPieces(f.text, c) !== "NOT FOUND").map(c => c.label);
          if (elsewhere.length) {
            tally(u.file, "other-item");
            otherItemLines.push(`- ${where}: "${clip(f.text, 160)}" — not in ${onLine.map(c => c.id).join(", ")}, cited on its line; found in ${elsewhere.slice(0, 3).join(", ")}${elsewhere.length > 3 ? ` and ${elsewhere.length - 3} more` : ""}`);
            continue;
          }
        }
        const c = classify(f.text, { u, line: f.line, field: f.field, section: f.section, paras });
        tally(u.file, c.cls);
        if (c.cls === "deeper") collapse("deeper", u.file + u.id, `${u.file} (${u.id})`, f.line, f.text, `, in ${c.via}`);
        else if (c.cls === "self") collapse("self", u.file + u.id, `${u.file} (${u.id})`, f.line, f.text);
        else if (c.cls === "draft") collapse("draft", u.file + u.id, `${u.file} (${u.id})`, f.line, f.text);
        else {
          const h = hints(f.text, unitPool, new Set(cited.map(c => c.id)));
          const inTrace = /^Trace$/i.test(f.section);
          nfLines.push(`- ${where}${inTrace ? " [Trace]" : ""}: "${clip(f.text, 160)}" — NOT FOUND in ${(onLine.length ? onLine : cited).map(c => c.id).join(", ")}${h.length ? `; the text does appear in ${h.join(", ")}, which ${u.id} does not cite` : "; not in any item of the level below"}${also.length ? `; not in ${also.map(a => a.name).join(", ")} either` : ""}`);
        }
      }
      if (cited.length && u.kind !== "L5") {
        const union = new Set<string>();
        cited.forEach(c => itemTokens.get(c.id)?.forEach(t => union.add(t)));
        const sp = splitTrace(u.text);
        for (const [where, txt] of [["", sp.body], [" (inside Trace)", sp.trace]] as const) {
          for (const t of tokensOf(txt)) {
            const [code, n] = t.split(":");
            if (!knownCodes.has(code) || union.has(t)) continue;
            const elsewhere = [...itemTokens].filter(([id, ts]) => ts.has(t) && !cited.some(c => c.id === id)).map(([id]) => id).slice(0, 3);
            tokenMisses.push(`- ${u.file} (${u.id})${where}: participant cite ${code}${n} is in none of the cited items (${cited.map(c => c.id).join(", ")})${elsewhere.length ? `; it appears in ${elsewhere.join(", ")}` : ""}`);
          }
        }
      }
    }
  }

  // ---------- stats ----------
  const rows = [...perFile.values()].sort((a, b) => a.file.localeCompare(b.file));
  const sum = (f: (r: QRow) => number) => rows.reduce((a, r) => a + f(r), 0);
  const stats: Stats = {
    setLevel, belowLevel, setFiles: set.files.length, setItems: set.units.length, belowFiles, belowItems,
    uncitedItems, uncitedFiles, citations, citationErrors: errors.length, unparsed: unparsedList.length,
    fragments: sum(r => r.frag), present: sum(r => r.present), presentPunct: sum(r => r.punct), deeper: sum(r => r.deeper), selfQuote: sum(r => r.self), draft: sum(r => r.draft), notFound: sum(r => r.nf), uncheckable: sum(r => r.unc),
    unbalanced, otherLevelRefs: [...otherLevel.values()].reduce((a, b) => a + b, 0), tokenMisses: tokenMisses.length, collisions: collisions.length, otherItem: sum(r => r.other),
  };

  // ---------- render ----------
  const o: string[] = [];
  o.push("# Synthesis audit pre-pass", "", `Set: \`${setDir}\``, `Below: \`${belowDir}\``, "",
    "A mechanical pass, not a verdict. It lists candidates for the auditor to judge; it does not clear or fail a set. `archive/` folders are ignored.", "");
  o.push("## Inputs", "", `Below-level files: ${belowFiles}; items: ${belowItems}`, "");
  o.push(`- Set: ${setLevel}, ${set.files.length} file${set.files.length === 1 ? "" : "s"}, ${set.units.length} item${set.units.length === 1 ? "" : "s"} (${[...new Set(set.units.map(u => KIND_LABEL[u.kind]))].join(", ")})`);
  o.push(`- Below: ${belowLevel}${below.l1.length ? " (items are findings)" : ""}`);
  for (const n of [...set.notes.map(x => `set: ${x}`), ...below.notes.map(x => `below: ${x}`)]) o.push(`- NOTE ${n}`);
  for (const [c, fs] of collisions) o.push(`- CODE COLLISION: initials "${c}" belong to ${fs.map(f => `${f.name} (${f.file})`).join(" and ")}. Citations to "${c}" are reported, not guessed.`);
  for (const f of noCode) o.push(`- L1 file with no participant: field, cannot be coded: ${f.file}`);
  if (set.units.some(u => u.kind === "L2")) o.push("- Participant code = first letter of the first and last name in `participant:` (diacritics stripped); a label that is not a code is matched against the full name.");
  for (const a of also) o.push(`- Deeper source (--also): ${a.name}, ${a.n} items${a.n === 0 ? " (NO ladder files recognised there, so it can explain nothing)" : ""}`);
  if (otherLevel.size) o.push(`- Citations to kinds absent from the level below, not checked: ${[...otherLevel].map(([k, n]) => `${k} x${n}`).join(", ")}`);
  o.push("");

  o.push("## Uncited below-level items", "");
  if (citations === 0) o.push("No citations could be read from the set, so this list cannot be built. See Citation check.", "");
  else if (uncited.length === 0) o.push("None: every item in the level below is cited by at least one file in the set.", "");
  else {
    o.push(`${pl(uncitedItems, "item")} in ${pl(uncitedFiles, "file")} ${uncitedItems === 1 ? "is" : "are"} cited by no file in the set. Each is a candidate for a missed pattern or counter-case, not a defect by itself.`, "");
    o.push(...uncited);
  }

  o.push("## Citation check", "");
  if (citations === 0) o.push("No citations were found in the set. That is a parse result, not a clean one: check that the set uses the cited format.", "");
  if (errors.length === 0 && unparsedList.length === 0 && tokenMisses.length === 0 && srcNotes.length === 0) { if (citations > 0) o.push(`All ${citations} citations resolve.`, ""); }
  else {
    o.push(`${citations} citations read; ${errors.length} point at nothing.`, "");
    if (errors.length) o.push("### Citations that do not resolve", "", ...errors, "");
    if (unparsedList.length) o.push(`### Unparsed evidence bullets (${unparsedList.length})`, "", "These bullets or sections could not be read as citations. Their quotes and references were NOT checked.", "", ...unparsedList, "");
    if (tokenMisses.length) o.push(`### Participant cites not found in the cited items (${tokenMisses.length})`, "", ...tokenMisses, "");
    if (srcNotes.length) o.push("### source_files: against the files on disk", "", ...srcNotes, "");
  }

  o.push("## Quote check", "");
  const noQuotes = stats.fragments === 0 && unbalanced === 0;
  if (noQuotes && LEVEL_OF[top] !== "L2" && LEVEL_OF[top] !== "L3") o.push("Not applicable at this level: no double-quoted fragments were found in the set.", "");
  else {
    if (noQuotes) o.push("WARNING: no double-quoted fragments were found in the set. At this level that usually means a parse failure, not a clean set.", "");
    const from = top === "L2" ? "the cited L1 finding(s)" : `the text of the ${[...new Set(higher.flatMap(u => CITES[u.kind] ?? []))].filter(k => belowKinds.has(k)).map(k => KIND_LABEL[k]).join(" / ")} each item cites`;
    const scope = top === "L2" ? "Each double-quoted fragment in an evidence bullet" : "Each double-quoted fragment";
    o.push(`${scope} is checked against ${from}, after normalizing curly quotes, dashes, case, whitespace and markdown emphasis. Fragments joined by an ellipsis are checked piece by piece.`);
    if (top === "L2") o.push("Quotes outside the evidence bullets (in the behavioral pattern or other prose) are not checked here: read those against the findings yourself.");
    o.push("Present means the words appear in the source. It does not mean the source quoted them: a paraphrase placed in quotation marks passes if its words occur there.");
    if (!also.length && LEVEL_OF[top] !== "L2") o.push("A quote may come from deeper than the level below (a Trace pastes L1 fragments; L4 may quote participants). Without --also, NOT FOUND means \"not in the cited items' text\"; give the deeper directory with --also <dir> to resolve those.");
    o.push("", `${stats.fragments} fragments checked: ${stats.present} present, ${stats.presentPunct} present only after dropping punctuation, ${stats.deeper} present in a deeper source, ${stats.selfQuote} self-quotes, ${stats.draft} draft wording, ${stats.notFound} NOT FOUND (candidates), ${stats.uncheckable} not checkable, ${stats.otherItem} found in the level below but not in the item cited.`, "");
    if (rows.length) {
      o.push("| File | Fragments | Present | Punctuation only | Deeper source | Self-quote | Draft wording | NOT FOUND | Not checkable | Not in the item cited |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
      for (const r of rows) o.push(`| ${r.file} | ${r.frag} | ${r.present} | ${r.punct} | ${r.deeper} | ${r.self} | ${r.draft} | ${r.nf} | ${r.unc} | ${r.other} |`);
      o.push("");
    }
    o.push(`### NOT FOUND: candidates (${stats.notFound})`, "");
    o.push(...(nfLines.length ? ["Not in the cited source, and not explained by a deeper source, a self-quote or draft wording. Judge these first.", "", ...nfLines] : ["None."]), "");
    if (otherItemLines.length) o.push(`### Found in the level below, but not in the item cited (${stats.otherItem})`, "", "The line carrying the quote cites a specific item, and the fragment is not in it, but it is in another item of the level below. Judge whether the citation or the quote is wrong.", "", ...otherItemLines, "");
    const sections: ["deeper" | "self" | "draft", string, string][] = [
      ["deeper", `Present in a deeper source (${stats.deeper})`, "Not in the cited items, but found in a directory given with --also. Counted as present; listed so nothing is dropped."],
      ["self", `Self-quotes (${stats.selfQuote})`, "Not in the cited items. The fragment occurs in the same item's title, Insight or Observation text, outside the quote itself (the insight quoting its own wording, or scare quotes)."],
      ["draft", `Draft wording in Trace (${stats.draft})`, "Inside a Trace \"Revised at the check\" or \"Near-miss discarded\" line: quotes of earlier drafts, not sources. Trace \"Verified\" lines are not in this class; they are checked above."],
    ];
    for (const [cls, head, why] of sections) {
      if (collapsed[cls].size === 0) continue;
      o.push(`### ${head}`, "", why, "");
      for (const m of collapsed[cls].values()) o.push(`- ${m.label}: ${m.frags.length} — ${m.frags.join("; ")}`);
      o.push("");
    }
    if (uncheckLines.length) o.push("### Not checkable (the cited source is missing)", "", ...uncheckLines, "");
    if (unbalLines.length) o.push("### Unbalanced quote marks (not checked)", "", ...unbalLines, "");
    if (!nfLines.length && !uncheckLines.length && !unbalLines.length && stats.fragments > 0 && stats.deeper + stats.selfQuote + stats.draft + stats.otherItem === 0) o.push("Every checked fragment is present in its cited source (as words; see the note above on what is checked).", "");
  }

  o.push("## Summary", "");
  o.push(`- Set: ${setLevel}; ${pl(stats.setFiles, "file")}, ${pl(stats.setItems, "item")}. Below: ${belowLevel}; ${pl(stats.belowFiles, "file")}, ${pl(stats.belowItems, "item")}.`);
  o.push(`- Uncited below-level items: ${stats.citations === 0 ? "not computed (no citations parsed)" : `${stats.uncitedItems} in ${pl(stats.uncitedFiles, "file")}`}`);
  o.push(`- Citations read: ${stats.citations}; do not resolve: ${stats.citationErrors}; unparsed evidence bullets: ${stats.unparsed}; participant cites not in cited items: ${stats.tokenMisses}`);
  o.push(`- Quote fragments: ${stats.fragments}; present ${stats.present}; punctuation only ${stats.presentPunct}; deeper source ${stats.deeper}; self-quote ${stats.selfQuote}; draft wording ${stats.draft}; NOT FOUND (candidates) ${stats.notFound}; not checkable ${stats.uncheckable}; unbalanced-quote paragraphs ${stats.unbalanced}; found in the level below but not in the item cited ${stats.otherItem}`);
  o.push(`- Participant-code collisions: ${stats.collisions}`);
  const flags: string[] = [];
  if (stats.unparsed) flags.push(`${stats.unparsed} unparsed evidence bullets`);
  if (stats.unbalanced) flags.push(`${stats.unbalanced} paragraphs with unbalanced quote marks`);
  if (stats.uncheckable) flags.push(`${stats.uncheckable} fragments not checkable`);
  if (stats.collisions) flags.push("code collisions");
  if (stats.citations === 0) flags.push("no citations parsed");
  o.push(`- Parse caveats: ${flags.length ? flags.join("; ") + ". Treat the counts above as incomplete." : "none."}`, "");
  return { markdown: o.join("\n"), stats };
}

// ───────────────────────── CLI ─────────────────────────
function main(): number {
  const args = process.argv.slice(2);
  const usage = "usage: bun prepass.ts <set-dir> <below-dir> [--also <dir>]... [--out <file>]\n  --also  optional deeper source (e.g. the L1 findings dir for an L3+ set); repeatable. A quote not in its cited source but found there is counted as present (deeper source).";
  const pos: string[] = [], alsoArgs: string[] = [];
  let out: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--out" || a === "--also") {
      const v = args[++i];
      if (!v || v.startsWith("--")) { console.error(usage); return 2; }
      if (a === "--out") out = v; else alsoArgs.push(v);
    } else if (a.startsWith("--")) { console.error(`unknown option ${a}\n${usage}`); return 2; }
    else pos.push(a);
  }
  if (pos.length !== 2) { console.error(usage); return 2; }
  const [s, b] = pos.map(p => resolve(p));
  const alsoDirs = alsoArgs.map(p => resolve(p));
  for (const d of [s, b, ...alsoDirs]) if (!existsSync(d) || !statSync(d).isDirectory()) { console.error(`not a directory: ${d}\n${usage}`); return 2; }
  try {
    const { markdown } = run(s, b, alsoDirs);
    if (out) { writeFileSync(resolve(out), markdown); console.error(`wrote ${resolve(out)}`); } else console.log(markdown);
    return 0;
  } catch (e) { console.error(`prepass: ${(e as Error).message}\n${usage}`); return 2; }
}
if (import.meta.main) process.exit(main());
