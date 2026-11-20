#!/usr/bin/env bun
/**
 * skill-guardrails-check — deterministic scanner for the skill-authoring
 * anti-hallucination guardrails canonicalized in ../ladder-core/skill-guardrails.md.
 *
 *   bun check.ts [rootDir]     Scan skills/ + agents/ (or a fixture root):
 *     VOCABULARY  (deterministic) every attested-family tag conforms to the frozen
 *                 base vocabulary + suffix grammar; nesting/compound/spelling drift → HALT
 *     ANCHORS     (informational) count the five bold-label guardrail anchors
 *     COVERAGE    (heuristic, WARN-tier only — this checker's "Gate 5") files with
 *                 fabrication-risk markers or imperative step-openers and zero guardrail
 *                 anchors → candidate for human review. Human-ruled dismissals live in
 *                 coverage-waivers.txt (per-file, dated, reasoned — triage 2026-07-10);
 *                 waivers apply to coverage ONLY, never to vocabulary findings.
 *     WAIVERS     (deterministic) every waiver path resolves case-exactly in the real
 *                 tree; a waiver that suppresses nothing → HALT (added 2026-08-06)
 *
 * Exit codes: 0 clean, 1 HALT-class (nonconforming/unregistered tag; the vocabulary
 * table in SkillGuardrails.md missing/unparseable; a scan that opened zero files;
 * or an inert waiver), 2 coverage warns only.
 * HALT promotion for deterministic vocabulary findings ruled by the researcher 2026-07-10
 * after the cycle-1 backlog triage (all 6 nonconforming instances remediated same
 * day — the tree was vocabulary-clean at promotion). Coverage stays WARN-tier
 * permanently: prose-shaped, never a verdict.
 *
 * Distinct from hooks/lib/guardrails.ts (INFRASTRUCTURE guardrails — symlinks,
 * carry-forward, sync). This tool scans skill-authoring content risk only.
 *
 * Origin: 2026-07-10 guardrails-centralization plan (dual-chair design;
 * The researcher's four rulings). Sibling in conventions to ../synthesis-gates-check.
 */

import { readdirSync, readFileSync, statSync, existsSync, realpathSync } from "fs";
import { join, resolve } from "path";

const PAI_DIR = process.env.PAI_DIR ?? join(process.env.HOME ?? "", ".claude");
// The doctrine beside the checker first (the portable ladder package keeps it at
// ladder-core/skill-guardrails.md, two levels up), then the PAI layout. File-relative
// first so a PAI_DIR left over from an older install cannot supply the wrong doctrine
// (2026-09-22; the same order as synthesis-gates-check's config lookup).
export function resolveDocPath(here = import.meta.dir, pai = PAI_DIR): string {
  const beside = join(here, "..", "..", "skill-guardrails.md");
  return existsSync(beside) ? beside : join(pai, "skills", "CORE", "SkillGuardrails.md");
}
const DOC_PATH = resolveDocPath();
// per-file coverage-candidate dismissals ruled by a human (triage 2026-07-10).
// Applies to the COVERAGE scan only — vocabulary findings can never be waived.
const WAIVERS_PATH = join(import.meta.dir, "coverage-waivers.txt");

// paths never scanned: archived copies (preserve history; scanning them reports
// ghosts — case-insensitive because archive dirs accumulate case variants;
// adopted from a collaborator's ContributeBack 2026-07-10, twice-earned in one day),
// the canonical doc itself (carries worked NON-conforming examples by design),
// the audit log (historical descriptions, not live tags),
// and third-party Fabric pattern files (outside skill-authoring scope)
const EXCLUDE = [/_archive/i, /CORE\/SkillGuardrails\.md$/, /CHANGELOG\.md$/, /Fabric\/tools\//, /Fabric\/pattern_explanations\.md$/];

// Vendored dependency trees — machine-generated third-party content, categorically
// outside "skill-authoring content risk"; same rationale as the Fabric entries above.
//
// The decisive argument is not likelihood, it is REMEDIABILITY. Vocabulary findings
// are unwaivable by design (coverage-waivers.txt applies to coverage only), so a
// vendor README that tripped the scan would have no legitimate fix: you cannot edit
// node_modules (the next `bun install` reverts it), and the only move left would be
// adding this exact line under a red fleet. A guard whose finding has no remediation
// path gets silenced in a hurry; doing this deliberately, now, is strictly better.
// Measured, not assumed (2026-08-06): the trigger needs an ALL-CAPS lexeme with a
// true em-dash INSIDE the brackets — `[BREAKING — …]` HALTs, `[BREAKING - …]` and
// `[BREAKING] — …` do not. Low probability, non-zero, unfixable when it lands.
//
// Kept SEPARATE from EXCLUDE and COUNTED rather than silently dropped. EXCLUDE is a
// blanket regex with no date, reason, or reconciliation — structurally the thing that
// failed this morning, when two coverage waivers went inert on a rename and nothing
// noticed for three weeks. A suppression that reports itself on every run cannot rot
// the same way, so this one announces its own size. (2026-08-06)
const VENDOR = [/node_modules\//];

type Rule = "none" | "dash-clause" | "verify-tail" | "required-clause";
interface Base { tag: string; open: string; close: string; prefix: string; rule: Rule }
interface Finding { severity: "WARN" | "HALT"; file: string; note: string }

const EM = "—"; // —

function loadVocabulary(docPath: string): Base[] | null {
  let text: string;
  try { text = readFileSync(docPath, "utf8"); } catch { return null; }
  const block = text.match(/<!-- vocab:begin[\s\S]*?-->([\s\S]*?)<!-- vocab:end -->/);
  if (!block) return null;
  const bases: Base[] = [];
  for (const m of block[1].matchAll(/^\|\s*`([^`]+)`\s*\|\s*([a-z-]+)\s*\|$/gm)) {
    const tag = m[1], rule = m[2] as Rule;
    if (!["none", "dash-clause", "verify-tail", "required-clause"].includes(rule)) return null;
    bases.push({ tag, open: tag[0], close: tag[0] === "[" ? "]" : ")", prefix: tag.slice(0, -1), rule });
  }
  return bases.length ? bases : null;
}

function* walk(dir: string, skipped: { vendor: number }): Generator<string> {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p, skipped);
    else if (name.endsWith(".md") && !EXCLUDE.some(rx => rx.test(p))) {
      if (VENDOR.some(rx => rx.test(p))) { skipped.vendor++; continue; }
      yield p;
    }
  }
}

// ── vocabulary scan ──────────────────────────────────────────────────────────
function scanTags(body: string, rel: string, bases: Base[], findings: Finding[]): { conforming: number } {
  let conforming = 0;
  const seen = new Set<number>(); // start indices already claimed by a longer base
  // longest prefix first so [SINGLE-SESSION HYPOTHESIS] wins over [HYPOTHESIS]… (it doesn't prefix-collide, but e.g. future bases might)
  const ordered = [...bases].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const b of ordered) {
    let from = 0;
    while (true) {
      const i = body.indexOf(b.prefix, from);
      if (i === -1) break;
      from = i + 1;
      if (seen.has(i)) continue;
      const closeIdx = body.indexOf(b.close, i + b.prefix.length);
      if (closeIdx === -1 || closeIdx - i > 400) continue; // no close on a sane horizon — not a tag
      const rest = body.slice(i + b.prefix.length, closeIdx);
      if (rest.includes("\n")) continue; // tags are single-line
      seen.add(i);
      const line = body.slice(0, i).split("\n").length;
      const where = `${rel}:${line}`;
      if (rest.includes(b.open)) { findings.push({ severity: "HALT", file: where, note: `\`${b.tag}\` family tag with same-delimiter nesting — no nesting (grammar); split into separate tags` }); continue; }
      if (rest === "") { conforming++; continue; }
      switch (b.rule) {
        case "none":
          findings.push({ severity: "HALT", file: where, note: `\`${b.tag}\` is atomic — extension "${rest.slice(0, 40)}" is nonconforming` }); break;
        case "dash-clause":
          if (rest.startsWith(` ${EM} `)) conforming++;
          else findings.push({ severity: "HALT", file: where, note: `\`${b.tag}\` extension must start with " ${EM} " — got "${rest.slice(0, 40)}"${rest.startsWith(" /") ? " (compound of two bases — pick one per claim)" : ""}` });
          break;
        case "verify-tail":
          if (rest.startsWith(" ")) conforming++;
          else findings.push({ severity: "HALT", file: where, note: `\`${b.tag}\` tail must continue after "verify" with a space — got "${rest.slice(0, 40)}"` });
          break;
        case "required-clause":
          if (rest.startsWith(" ") && rest.trim().length > 0 && !rest.trimStart().startsWith(":")) conforming++;
          else findings.push({ severity: "HALT", file: where, note: `\`${b.tag}\` requires a plain clause (no leading colon) — got "${rest.slice(0, 40)}"` });
          break;
      }
    }
  }
  // spelling drift: short-form "(illustrative — …)" when the canonical base is "(illustrative framing)"
  for (const m of body.matchAll(/\(illustrative(?! framing)[^)]*\)/g)) {
    const line = body.slice(0, m.index).split("\n").length;
    findings.push({ severity: "HALT", file: `${rel}:${line}`, note: `\`(illustrative …)\` drops "framing" — canonical spelling is \`(illustrative framing)\` (ruled 2026-07-10)` });
  }
  // unregistered families: ALL-CAPS bracket tags WITH a dash clause, not matching any
  // base. The clause is REQUIRED here by design: bare ALL-CAPS brackets ([YOUR PROMPT],
  // [COMFORT ZONE], [AGENT ID]) are template placeholders, not guardrail tags — the
  // baseline run proved a clause-optional detector floods on them (69 false hits).
  for (const m of body.matchAll(/\[([A-Z][A-Z]+(?: [A-Z][A-Z]+)+) — [^\][]*\]/g)) {
    if (bases.some(b => m[0].startsWith(b.prefix))) continue;
    const line = body.slice(0, m.index).split("\n").length;
    findings.push({ severity: "HALT", file: `${rel}:${line}`, note: `\`[${m[1]} …]\` matches no base in the frozen vocabulary — unregistered family (register it or rewrite; see SkillGuardrails.md)` });
  }
  // lowercase unregistered families: same shape, lowercase lexeme — invisible to the
  // ALL-CAPS detector above by construction. Requires the em-dash clause AND inline
  // backtick wrapping: lowercase descriptive placeholders in output templates carry
  // dash clauses too (`[one clause — what it organizes]`, 16 live false hits on the
  // first unwrapped run), but they are never inline-backticked, while tag
  // PRESCRIPTIONS in skill prose always are. Skip anything opening with a registered
  // base prefix (main loop's jurisdiction) or a base's dash-head (reordered detector's).
  // Class found live in DesignDiagrams/FlowDiagramming.md (`[assumed — verify]`) by the
  // 2026-07-11 tri-chair DEEP pass.
  {
    const dashHeads = bases.filter(b => b.tag.includes(` ${EM} `)).map(b => b.tag.slice(0, b.tag.indexOf(` ${EM} `) + 3));
    for (const m of body.matchAll(/`(\[([a-z][a-z-]*(?: [a-z-]+)*) — [^\][`]*\])`/g)) {
      if (bases.some(b => m[1].startsWith(b.prefix))) continue;
      if (dashHeads.some(h => m[1].startsWith(h))) continue;
      const line = body.slice(0, m.index).split("\n").length;
      findings.push({ severity: "HALT", file: `${rel}:${line}`, note: `\`[${m[2]} …]\` matches no base in the frozen vocabulary — unregistered family, lowercase (register it or rewrite; see SkillGuardrails.md)` });
    }
  }
  // single-word ALL-CAPS unregistered families: `[PROVISIONAL — requires sign-off]`.
  // The multi-word detector above requires 2+ ALL-CAPS words BY DESIGN (bare
  // multi-word brackets are placeholders and flood without a clause) — which
  // left single-word lexemes invisible. A single ALL-CAPS word WITH an em-dash
  // clause is tag-shaped, not placeholder-shaped: one-word placeholders
  // ([DATE], [WORKFLOW]) carry no clause. Registered single-word bases
  // ([HYPOTHESIS], [DRAFT]) are skipped by prefix. Class found live in
  // BrandDesign/RunPurposeWorkshop.md by the 2026-07-11 quad-chair audit.
  for (const m of body.matchAll(/\[([A-Z][A-Z]+) — [^\][]*\]/g)) {
    if (bases.some(b => m[0].startsWith(b.prefix))) continue;
    const line = body.slice(0, m.index).split("\n").length;
    findings.push({ severity: "HALT", file: `${rel}:${line}`, note: `\`[${m[1]} …]\` matches no base in the frozen vocabulary — unregistered family, single-word (register it or rewrite; see SkillGuardrails.md)` });
  }
  // unregistered paren families: the main loop only validates parens that OPEN
  // with a registered base prefix — every other `(lowercase …)` labeling tag was
  // silently invisible (no unregistered-paren detector existed at all). Same
  // discriminator as the lowercase bracket detector: the span must be an ENTIRE
  // inline-backtick run (tag prescriptions are backticked; prose parentheticals
  // and inline code are not exact-span) and must be ≥2 words. `(illustrative …)`
  // short forms are left to the spelling-drift detector above. Class found live
  // in BrandDesign/AuditBrandSystem.md (`(requires brand-tracking data)`) by the
  // 2026-07-11 quad-chair audit.
  {
    const parenPrefixes = bases.filter(b => b.open === "(").map(b => b.prefix);
    for (const m of body.matchAll(/`(\(([a-z][a-z-]*) [^)`]+\))`/g)) {
      if (parenPrefixes.some(p => m[1].startsWith(p))) continue;
      if (m[1].startsWith("(illustrative")) continue; // spelling-drift detector's jurisdiction
      const line = body.slice(0, m.index).split("\n").length;
      findings.push({ severity: "HALT", file: `${rel}:${line}`, note: `\`(${m[2]} …)\` matches no base in the frozen vocabulary — unregistered paren family (fold into a registered base, e.g. \`(hypothetical — …)\`, or register it; see SkillGuardrails.md)` });
    }
  }
  // reordered-family drift: the head of an em-dash base appears but the tag does not
  // continue with the base's own tail — e.g. `[model knowledge — drawn from …; verify …]`.
  // Nonconforming AND invisible to the prefix matcher above (the literal base string is
  // absent, so its indexOf never fires). Class found live in MapTrustEcosystem.md by the
  // 2026-07-11 tri-chair DEEP pass; this detector closes it.
  for (const b of bases) {
    const dashAt = b.tag.indexOf(` ${EM} `);
    if (dashAt === -1) continue;
    const head = b.tag.slice(0, dashAt + 3); // includes " — "
    const tail = b.tag.slice(dashAt + 3, -1); // e.g. "verify", "no direct quote"
    let from = 0;
    while (true) {
      const i = body.indexOf(head, from);
      if (i === -1) break;
      from = i + 1;
      if (body.slice(i + head.length).startsWith(tail)) continue; // the base itself — handled above
      const closeIdx = body.indexOf(b.close, i + head.length);
      if (closeIdx === -1 || closeIdx - i > 400) continue; // no close on a sane horizon — not a tag
      if (body.slice(i + 1, closeIdx).includes("\n")) continue; // tags are single-line
      const line = body.slice(0, i).split("\n").length;
      findings.push({ severity: "HALT", file: `${rel}:${line}`, note: `\`${body.slice(i, closeIdx + 1).slice(0, 60)}…\` opens the \`${b.tag}\` family head but is reordered — the base must appear verbatim ("…${tail}") with any clause after it, never buried mid-clause` });
    }
  }
  return { conforming };
}

// ── anchor scan (informational) ──────────────────────────────────────────────
const ANCHORS: Array<[string, RegExp]> = [
  ["Data gate", /^>?\s*\*\*Data gate\b/im],
  ["Source discipline", /^>?\s*\*\*Source discipline\b/im],
  ["Anti-fabrication", /^>?\s*\*\*Anti-fabrication\b/im],
  ["Citation discipline", /^>?\s*\*\*Citation discipline:\*\*/im],
  ["Labeling", /^>?\s*\*\*Labeling requirement\b/im],
];
const ANCHOR_GLOBAL: Array<[string, RegExp]> = ANCHORS.map(([n, rx]) => [n, new RegExp(rx.source, "gim")]);

// ── coverage scan (heuristic, WARN-tier only — the checker's Gate 5) ─────────
const RISK_MARKERS = /(invoke the research skill|research skill before|generate (a |the )?(narrative|scenario|story)|recall (prior|past)|training knowledge|training data|industry examples?|case stud|flesh out)/i;
const PROHIBITION = /\b(do not|don't|never|must not|cannot|prohibit)\b/i;
// v2 (Engineer design 2026-07-10, built after cycle-1 triage): imperative step-opening
// verbs on the first non-empty line after a ##/### heading mark "the step that does
// the risky thing"; the exclusion strips guardrail prose ("Do not generate…", "must
// verify…"), which is what v1's vocabulary-keyed markers kept rediscovering instead
// of finding gaps. Editable constant, same placement convention as RISK_MARKERS.
// "Compose" was in the Engineer spec but measured 6/6 false positives on the first
// live run (2026-07-10): in this corpus it means orchestration/assembly (compose
// agents, compose a prompt, compose the L0 file), never content generation — removed.
const IMPERATIVE_OPENERS = /^(?:>?\s*)(?:\*\*)?(Generate|Draft|Recall|Cite|List examples of)\b/;
const V2_EXCLUSION = /\b(do not|don't|never|must)\b/i;

function loadWaivers(path: string): Map<string, string> {
  const waivers = new Map<string, string>();
  let text: string;
  try { text = readFileSync(path, "utf8"); } catch { return waivers; }
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const [p, date] = line.split("|").map(s => s.trim());
    if (p && date) waivers.set(p, date);
  }
  return waivers;
}

// Both-directions reconciliation for the waiver list, mirroring the guard-cadence
// runner's registry rule (a map entry with no file = FAIL, never a warn). A waiver
// pointing at nothing suppresses nothing: the run reports "N waived" for a file it
// never waived, and any real candidate in that file arrives as "new" against a line
// already trained to read as noise. Same species as this file's "a scan that looked
// at nothing is not a pass" — the scanner believing it did work it did not do.
//
// CASE-EXACT BY CONSTRUCTION, and that is the load-bearing part: macOS is
// case-INSENSITIVE, so existsSync() returns TRUE for a stale-case waiver and the
// obvious implementation of this function would report clean on the exact defect
// that motivated it (verified against the live tree 2026-08-06 —
// skills/SystemsThinking/Workflows/… existsSync -> true). realpathSync.native()
// returns the tree's real casing, which is what makes this check able to fail.
//
// Found live 2026-08-06: the Workflows/ -> workflows/ rename in 6958290 (07-12)
// silently voided two of ten waivers; the resulting WARN had stood on every
// guard-cadence run since the fleet shipped 07-23 — 100% of its lifetime.
function staleWaivers(waivers: Map<string, string>): { path: string; reason: string }[] {
  const stale: { path: string; reason: string }[] = [];
  // canonicalize the root first, so a symlinked PAI_DIR can't read as case drift
  let root = PAI_DIR;
  try { root = realpathSync.native(PAI_DIR); } catch { /* keep as-is */ }
  for (const p of waivers.keys()) {
    const abs = p.startsWith("/") ? p : join(root, p);
    let real: string;
    try { real = realpathSync.native(abs); } catch { stale.push({ path: p, reason: "no such file in the tree" }); continue; }
    if (real !== abs) {
      const onDisk = real.startsWith(root + "/") ? real.slice(root.length + 1) : real;
      stale.push({ path: p, reason: `case/path drift — on disk: ${onDisk}` });
    }
  }
  return stale;
}

function coverageCandidates(body: string, rel: string, findings: Finding[], waived: Finding[], waivers: Map<string, string>): void {
  // coverage applies where guardrails live: workflow files + SKILL.md (the 2026-05-13
  // audit scope) — not book notes, aesthetics references, or format reference docs
  if (!/workflows?\//i.test(rel) && !rel.endsWith("SKILL.md")) return;
  // Createskill is meta: its workflows DESCRIBE the risk markers while instructing
  // guardrail authorship — self-referential hits, not fabrication risk
  if (rel.startsWith("skills/Createskill/")) return;
  if (ANCHORS.some(([, rx]) => rx.test(body))) return; // file carries at least one guardrail anchor
  const lines = body.split("\n");
  const markerHits: number[] = [];
  lines.forEach((lineTxt, idx) => {
    if (RISK_MARKERS.test(lineTxt) && !PROHIBITION.test(lineTxt)) markerHits.push(idx + 1);
  });
  const openerHits: number[] = [];
  lines.forEach((lineTxt, idx) => {
    if (!/^#{2,3}\s/.test(lineTxt)) return;
    let j = idx + 1;
    while (j < lines.length && lines[j].trim() === "") j++;
    if (j < lines.length && IMPERATIVE_OPENERS.test(lines[j]) && !V2_EXCLUSION.test(lines[j])) openerHits.push(j + 1);
  });
  if (markerHits.length || openerHits.length) {
    const parts = [
      markerHits.length ? `${markerHits.length} fabrication-risk marker(s)` : "",
      openerHits.length ? `${openerHits.length} imperative step-opener(s) [v2]` : "",
    ].filter(Boolean).join(" + ");
    const firstLine = Math.min(...[...markerHits, ...openerHits]);
    const finding: Finding = { severity: "WARN", file: `${rel}:${firstLine}`, note: `heuristic candidate — ${parts}, zero guardrail anchors in file; human review (never a verdict)` };
    if (waivers.has(rel)) waived.push({ ...finding, note: `${finding.note} — WAIVED ${waivers.get(rel)}` });
    else findings.push(finding);
  }
}

// ── main ─────────────────────────────────────────────────────────────────────
export function run(rootDirs: string[], docPath = DOC_PATH, waiversPath = WAIVERS_PATH): { lines: string[]; exit: number } {
  const lines: string[] = [];
  const bases = loadVocabulary(docPath);
  if (!bases) {
    lines.push(`HALT  vocabulary table missing or unparseable: ${docPath}`);
    return { lines, exit: 1 };
  }
  lines.push(`skill-guardrails-check | ${docPath.includes("CORE") ? "CORE/SkillGuardrails.md" : docPath} (${bases.length} bases)`);

  const vocab: Finding[] = [], coverage: Finding[] = [], waivedCov: Finding[] = [];
  const waivers = loadWaivers(waiversPath);
  let conforming = 0, files = 0;
  const anchorCounts = new Map<string, number>(ANCHORS.map(([n]) => [n, 0]));
  const missingRoots: string[] = [];
  const skipped = { vendor: 0 };
  for (const root of rootDirs) {
    if (!existsSync(root)) { missingRoots.push(root); continue; }
    for (const p of walk(root, skipped)) {
      // Not skill content, wherever the layout puts them (2026-09-22, portable edition):
      // the doctrine file in use (its counter-examples are deliberate), and a checker's
      // own test fixtures found BELOW the scanned root. A root that IS a fixtures folder
      // (the test suites) is still scanned in full.
      if (resolve(p) === resolve(docPath) || /(^|\/)(scripts|tools)\/[^/]+\/fixtures\//.test(p.slice(root.length + 1))) continue;
      files++;
      const body = readFileSync(p, "utf8");
      const rel = p.startsWith(PAI_DIR) ? p.slice(PAI_DIR.length + 1) : p;
      conforming += scanTags(body, rel, bases, vocab).conforming;
      for (const [n, rx] of ANCHOR_GLOBAL) anchorCounts.set(n, (anchorCounts.get(n) ?? 0) + (body.match(rx)?.length ?? 0));
      coverageCandidates(body, rel, coverage, waivedCov, waivers);
    }
  }

  lines.push("");

  // A scan that looked at nothing is not a pass. Reporting "clean -> exit 0" for a
  // target the scanner never opened is the exact false-negative this guard exists to
  // catch (a mistyped or non-path argument resolves to a directory that isn't there).
  // Missing roots are named even when other roots did yield files, so a partial scan
  // can never read as a full one. (2026-08-01)
  if (files === 0) {
    lines.push(`HALT  scanned 0 files — nothing was examined, so this is not a pass.`);
    for (const r of missingRoots) lines.push(`    root does not exist: ${r}`);
    if (!missingRoots.length) lines.push(`    roots exist but contain no scannable files: ${rootDirs.join(", ")}`);
    // never let a vendor-only root read as an empty one — that would be the same
    // "nothing was examined" ambiguity this HALT exists to prevent
    if (skipped.vendor) lines.push(`    note: ${skipped.vendor} vendor file(s) were skipped (node_modules) — the root may contain ONLY vendored content`);
    lines.push(`    (pass a resolvable path, e.g. ~/.claude/skills/<SkillName>, or no argument for the default roots)`);
    lines.push("");
    lines.push(`RESULT: 1 halt -> exit 1`);
    return { lines, exit: 1 };
  }
  for (const r of missingRoots) lines.push(`NOTE  root skipped, does not exist: ${r}`);

  // the vendor count rides on the file count so the suppression is visible on every
  // run — an invisible exclusion is how coverage-waivers.txt rotted for three weeks
  const vendorNote = skipped.vendor ? ` (${skipped.vendor} vendor skipped: node_modules)` : "";
  lines.push(`VOCABULARY   ${vocab.length ? "HALT" : "PASS"}  ${files} files${vendorNote}: ${conforming} conforming tags, ${vocab.length} nonconforming/unregistered`);
  for (const f of vocab) lines.push(`    ${f.severity}  ${f.file} — ${f.note}`);
  const anchorTotal = [...anchorCounts.values()].reduce((a, b) => a + b, 0);
  lines.push(`ANCHORS      INFO  ${anchorTotal} anchors (${[...anchorCounts.entries()].map(([n, c]) => `${n} ${c}`).join(", ")})`);
  // Deterministic, so HALT-tier — same reasoning that promoted vocabulary findings
  // (2026-07-10): a path either resolves case-exactly or it does not. An inert
  // waiver must be loud and short-lived; the fix is a one-line edit. Promoted with
  // the tree already reconciled clean (2026-08-06), matching the vocabulary
  // precedent of never promoting a HALT onto a standing backlog.
  const stale = staleWaivers(waivers);
  lines.push(`WAIVERS      ${stale.length ? "HALT" : "PASS"}  ${waivers.size} coverage waivers, ${stale.length} inert (path resolves to nothing / different case — suppresses nothing)`);
  for (const s of stale) lines.push(`    HALT  ${s.path} — ${s.reason}`);
  lines.push(`COVERAGE     ${coverage.length ? "WARN" : "PASS"}  heuristic candidates: ${coverage.length} new${waivedCov.length ? ` (${waivedCov.length} waived — coverage-waivers.txt)` : ""} (WARN-tier only — prose-shaped, never a verdict)`);
  for (const f of coverage) lines.push(`    ${f.severity}  ${f.file} — ${f.note}`);

  const halts = vocab.length + stale.length, warns = coverage.length;
  const exit = halts ? 1 : warns ? 2 : 0;
  lines.push("");
  lines.push(`RESULT: ${halts || warns ? [halts ? `${halts} halt` : "", warns ? `${warns} warn` : ""].filter(Boolean).join(" + ") + ` -> exit ${exit}` : "clean -> exit 0"}`);
  return { lines, exit };
}

if (import.meta.main) {
  const arg = process.argv[2];
  const roots = arg ? [resolve(arg)] : [join(PAI_DIR, "skills"), join(PAI_DIR, "agents")];
  const docOverride = process.argv[3]; // fixtures pass their own doc for isolation
  const { lines, exit } = run(roots, docOverride ? resolve(docOverride) : DOC_PATH);
  console.log(lines.join("\n"));
  process.exit(exit);
}
