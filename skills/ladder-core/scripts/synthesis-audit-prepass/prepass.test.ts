import { describe, expect, test } from "bun:test";
import { join } from "path";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync } from "fs";
import { tmpdir } from "os";
import { spawnSync } from "child_process";
import { norm, pieces, parseRefList, parseEvidence, initials, idRefs, quotedFragments, checkPieces, run } from "./prepass";

const FX = (n: string) => join(import.meta.dir, "fixtures", n);
const PREPASS = join(import.meta.dir, "prepass.ts");
const cli = (...args: string[]) => spawnSync("bun", [PREPASS, ...args], { encoding: "utf8" });

describe("normalization", () => {
  test("curly quotes, dashes, case, whitespace and emphasis are removed", () => {
    expect(norm("It’s  “Money *Well*  Spent” — really")).toBe('it\'s "money well spent" - really');
    expect(norm("a–b")).toBe("a-b");
    expect(norm("_emphasis_ stays_inside")).toBe("emphasis stays_inside");
  });
  test("ellipsis-joined fragments are split into pieces; tiny pieces drop", () => {
    expect(pieces("I already know my size … not worry")).toEqual(["i already know my size", "not worry"]);
    expect(pieces("alpha ... beta [...] gamma")).toEqual(["alpha", "beta", "gamma"]);
    expect(pieces("…")).toEqual([]);
  });
  test("checkPieces: present, punctuation-only, NOT FOUND", () => {
    const src = { label: "s", n: norm('She said "the upper limit is 80 to 90" and left.'), a: "" };
    src.a = src.n.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    expect(checkPieces("the upper limit is 80 to 90", src)).toBe("present");
    expect(checkPieces("the upper limit is 80 to 90.", src)).toBe("present-punct");
    expect(checkPieces("the lower limit is 80 to 90", src)).toBe("NOT FOUND");
  });
});

describe("parsers", () => {
  test("parseRefList", () => {
    expect(parseRefList("14")).toEqual([14]);
    expect(parseRefList("15, 22")).toEqual([15, 22]);
    expect(parseRefList("4 and 7")).toEqual([4, 7]);
    expect(parseRefList("3-5")).toEqual([3, 4, 5]);
    expect(parseRefList("4, session-x")).toEqual([4]);
    expect(parseRefList("none")).toEqual([]);
  });
  test("initials: first letter of first and last name, diacritics stripped", () => {
    expect(initials("Léa Moreau")).toBe("LM");
    expect(initials("Jean-Luc  Picard (pseud.)")).toBe("JP");
    expect(initials("P07")).toBe("P07");
  });
  test("idRefs reads L2-T-NN and suffixed ids, and does not read P- inside VP-", () => {
    expect(idRefs("see L2-T-07, L3-04, VP-01B, OA-02 and P-03").map(r => r.id)).toEqual(["L2-07", "L3-04", "VP-01B", "OA-02", "P-03"]);
  });
  test("parseEvidence: v3.3 form, colon inside bold, sections, continuation, unparsed", () => {
    const t = [
      "## Evidence", "", "**Strength:** Strong. Counted: 2 (AB, CD).", "",
      "*Counted — enacted:*",
      "- **AB (Finding 1)** *(stated price)*: \"q one\" — r",
      "- **CD (Findings 2, 3):** \"q two\"",
      "  continues here",
      "*Listed, not counted — x:*",
      "- **AB (Finding 4)**: \"q three\"",
      "*Counter-cases and bounds:*",
      "- **EF (Finding 5)**: \"q four\"",
      "- a bullet with no bold label",
      "", "## Implication", "- **ZZ (Finding 9)**: outside the section",
    ].join("\n");
    const ev = parseEvidence(t);
    expect(ev.found).toBe(true);
    expect(ev.bullets.map(b => [b.code, b.refs.join("+"), b.section])).toEqual([["AB", "1", "C"], ["CD", "2+3", "C"], ["AB", "4", "L"], ["EF", "5", "X"]]);
    expect(ev.bullets[1].rest).toContain("continues here");
    expect(ev.unparsed.length).toBe(1);
  });
  test("quotedFragments skips code fences and frontmatter and flags unbalanced paragraphs", () => {
    const t = "---\na: \"x\"\n---\n\n## Observation\n\nHe said \"one\" and “two”.\n\n```\n\"fenced\"\n```\n\nBroken \"quote here.\n\nHeight 5'2\" is fine \"ok\".";
    const { frags, unbalanced } = quotedFragments(t);
    expect(frags.map(f => f.text)).toEqual(["one", "two", "ok"]);
    expect(unbalanced.length).toBe(1);
  });
});

describe("L2 against L1 (fixtures/l2 vs fixtures/l1)", () => {
  const r = run(FX("l2"), FX("l1"));
  test("section headings, in order, exactly", () => {
    const heads = r.markdown.split("\n").filter(l => l.startsWith("## "));
    expect(heads).toEqual(["## Inputs", "## Uncited below-level items", "## Citation check", "## Quote check", "## Summary"]);
  });
  test("Inputs line; archive/ folders are ignored", () => {
    expect(r.markdown).toContain("Below-level files: 3; items: 9");
    expect(r.markdown).not.toContain("Old_Person");
    expect(r.markdown).not.toContain("L2-02_Touch_Decides_old");
    expect(r.stats.setFiles).toBe(3);
  });
  test("master document is ignored when individual theme files exist, and said so", () => {
    expect(r.markdown).toContain("master document ignored for L2");
  });
  test("uncited findings are listed by file", () => {
    expect(r.stats.uncitedItems).toBe(1);
    expect(r.markdown).toMatch(/### L1_Chloe_Winter_2026-01-03_findings\.md \(code CW\): 1 of 2 uncited\n- Finding 2: /);
  });
  test("a finding number that does not exist and an unknown code are caught", () => {
    expect(r.markdown).toContain("AB (Finding 9): L1_Abi_Bell_2026-01-01_findings.md has no Finding 9");
    expect(r.markdown).toContain('XX (Finding 1): unknown code "XX"');
    expect(r.stats.citationErrors).toBe(2);
  });
  test("an altered quote is NOT FOUND; ellipsis, curly quotes, emphasis and diacritic-named files pass", () => {
    expect(r.stats.notFound).toBe(1);
    expect(r.markdown).toContain('"the zipper pull was the whole decision" — NOT FOUND');
    expect(r.stats.present).toBeGreaterThanOrEqual(5);
    expect(r.stats.presentPunct).toBe(2); // trailing period in the theme, none in the finding
  });
  test("quotes under a broken citation are reported as not checkable, never as clean", () => {
    expect(r.stats.uncheckable).toBe(2);
    expect(r.markdown).toContain("cited source unavailable");
  });
  test("an unparsed evidence bullet is listed and the summary says the counts are incomplete", () => {
    expect(r.stats.unparsed).toBe(1);
    expect(r.markdown).toContain("AB mentions Finding 2 in a bullet with no bold label");
    expect(r.markdown).toContain("Treat the counts above as incomplete");
  });
  test("source_files: of the master is compared with the files on disk", () => {
    expect(r.markdown).toContain("is in l1 but not in source_files");
  });
});

describe("participant-code collision", () => {
  const r = run(FX("l2"), FX("l1-collision"));
  test("is reported, and the colliding citations are not guessed", () => {
    expect(r.stats.collisions).toBe(1);
    expect(r.markdown).toContain('CODE COLLISION: initials "AB"');
    expect(r.markdown).toContain('code "AB" is ambiguous');
    expect(r.markdown).toContain("could not be attributed");
  });
});

describe("L3 against L2", () => {
  test("individual files: unknown L2-NN, participant cite, quotes, Trace kept apart", () => {
    const r = run(FX("l3"), FX("l2"));
    expect(r.markdown).toContain("L3-01 cites L2-09: no such item");
    expect(r.markdown).toContain("participant cite CW2 is in none of the cited items");
    expect(r.stats.fragments).toBe(8);
    expect(r.stats.present).toBe(3); // incl. "Money Well Spent" (curly/case/emphasis)
    expect(r.markdown).toContain('"nobody said this" — NOT FOUND');
    expect(r.markdown).toContain('"early in the morning" — NOT FOUND'); // a Trace "Verified" line stays in scope
    expect(r.stats.notFound).toBe(2);
    expect(r.stats.selfQuote).toBe(1);
    expect(r.stats.draft).toBe(2); // Revised at the check + Near-miss discarded
  });
  test("self-quote and draft wording are listed apart, one line per item, and counted", () => {
    const r = run(FX("l3"), FX("l2"));
    expect(r.markdown).toContain("### Self-quotes (1)");
    expect(r.markdown).toContain("### Draft wording in Trace (2)");
    expect(r.markdown).toMatch(/- L3-01_Anchor\.md \(L3-01\): 2 — "price follows the leader"/);
    const iCand = r.markdown.indexOf("### NOT FOUND: candidates"), iSelf = r.markdown.indexOf("### Self-quotes");
    expect(iCand).toBeGreaterThan(-1);
    expect(iCand).toBeLessThan(iSelf); // candidates first
    expect(r.markdown).not.toContain('"the leader\'s price is the anchor" — NOT FOUND');
  });
  test("--also: a fragment found in a deeper directory is present (deeper source), not NOT FOUND", () => {
    const r = run(FX("l3"), FX("l2"), [FX("l1")]);
    expect(r.stats.deeper).toBe(1);
    expect(r.stats.notFound).toBe(1); // "nobody said this" is in no source
    expect(r.markdown).toContain("### Present in a deeper source (1)");
    expect(r.markdown).toContain(", in l1)");
    expect(r.markdown).toContain("Deeper source (--also): l1");
    expect(r.markdown).not.toContain('"early in the morning" — NOT FOUND');
  });
  test("a self-quote must occur outside the quote itself, in the title, Insight or Observation text", () => {
    const doc = (insight: string) => "---\ninsight_id: L3-01\nsynthesis_level: L3\n---\n\n# L3-01: Plain title\n\n## Observation\n\nFrom L2-01. Said \"a lonely phrase\" once.\n\n## Insight\n\n" + insight + "\n\n## What would change this\n\nAlso \"a lonely phrase\" here.\n";
    const dir = mkdtempSync(join(tmpdir(), "pp-"));
    try {
      writeFileSync(join(dir, "L3-01_X.md"), doc("Nothing relevant."));
      const none = run(dir, FX("l2"));
      expect(none.stats.selfQuote).toBe(0); // the only other occurrence is another copy of the same quote
      expect(none.stats.notFound).toBe(2);
      writeFileSync(join(dir, "L3-01_X.md"), doc("There is a lonely phrase in the claim itself."));
      const some = run(dir, FX("l2"));
      expect(some.stats.selfQuote).toBe(2);
      expect(some.stats.notFound).toBe(0);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("a master-only document is split into its L3-NN sections, index rows count as citations", () => {
    const r = run(FX("l3-master"), FX("l2"));
    expect(r.stats.setItems).toBe(2);
    expect(r.markdown).toContain("master document only");
    expect(r.stats.uncitedItems).toBe(0); // L2-03 is cited only in the index row
    expect(r.stats.notFound).toBe(0);
    expect(r.stats.fragments).toBe(2);
  });
  test("a quote is checked against the item cited on its own line; found only in another item is its own category", () => {
    const dir = mkdtempSync(join(tmpdir(), "pp-"));
    try {
      writeFileSync(join(dir, "L3-01_X.md"), [
        "---", "insight_id: L3-01", "synthesis_level: L3", "source_themes: [L2-01, L2-02]", "---", "", "# L3-01: Plain title", "",
        "## Observation", "",
        "Touch decides (L2-02): \"money well spent\".", "",             // in L2-01, not in the L2-02 its line cites
        "Feel matters (L2-02): \"I go by how it feels in the hand\".", "",          // in the L2-02 its line cites
        "No cite on this line: \"the most I would spend is about 90\".", "", // in L2-01; no line cite, so item-wide as before
        "Also (L2-02): \"nobody said this\".", "",                         // nowhere in L2: still a plain candidate
      ].join("\n"));
      const r = run(dir, FX("l2"));
      expect(r.stats.fragments).toBe(4);
      expect(r.stats.present).toBe(2);
      expect(r.stats.otherItem).toBe(1);
      expect(r.stats.notFound).toBe(1);
      expect(r.markdown).toContain("### Found in the level below, but not in the item cited (1)");
      expect(r.markdown).toContain('"money well spent" — not in L2-02, cited on its line; found in L2-01');
      expect(r.markdown).toContain('"nobody said this" — NOT FOUND in L2-02');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("a theme no insight cites is listed", () => {
    const dir = mkdtempSync(join(tmpdir(), "pp-"));
    try {
      cpSync(FX("l3"), dir, { recursive: true });
      rmSync(join(dir, "L3-02_Unused.md"));
      const r = run(dir, FX("l2"));
      expect(r.markdown).toContain("L2-03: Runners run alone");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe("L4 and L5", () => {
  test("L4 principles and OAs cite L3: unknown id, uncited, quote not in the cited insight", () => {
    const r = run(FX("l4"), FX("l3"));
    expect(r.stats.setLevel).toBe("L4 (P, OA)");
    expect(r.markdown).toContain("P-01 cites L3-77");
    expect(r.markdown).toContain('"a made-up line" — NOT FOUND in L3-01');
    expect(r.stats.present).toBe(1);
  });
  test("L5 cites P and OA: unknown P-09, uncited OA-02, quote check not applicable", () => {
    const r = run(FX("l5"), FX("l4"));
    expect(r.markdown).toContain("cites P-09");
    expect(r.markdown).toContain("OA-02: Unused");
    expect(r.markdown).toContain("Not applicable at this level");
  });
});

describe("never silently clean", () => {
  test("a set whose evidence cannot be parsed says so", () => {
    const dir = mkdtempSync(join(tmpdir(), "pp-"));
    try {
      writeFileSync(join(dir, "L2-01_X.md"), "---\ntheme_id: L2-01\nsynthesis_level: L2\n---\n\n# L2-01: X\n\n## Behavioral pattern\n\nNo evidence section at all.\n");
      const r = run(dir, FX("l1"));
      expect(r.markdown).toContain('no "## Evidence" section found');
      expect(r.markdown).toContain("No citations were found in the set");
      expect(r.markdown).toContain("WARNING: no double-quoted fragments");
      expect(r.markdown).toContain("no citations parsed");
      expect(r.markdown).not.toContain("All 0 citations resolve");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe("seeded defects: a clean copy, then three plants", () => {
  const withSet = (mutate: (dir: string) => void) => {
    const dir = mkdtempSync(join(tmpdir(), "pp-seed-"));
    try {
      for (const f of ["L2-01_Price_Anchor.md", "L2-03_Runs_Alone.md"]) cpSync(join(FX("l2"), f), join(dir, f));
      mutate(dir);
      return run(dir, FX("l1"));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  };
  const edit = (dir: string, file: string, from: string, to: string) => {
    const p = join(dir, file), t = readFileSync(p, "utf8");
    expect(t).toContain(from);
    writeFileSync(p, t.replace(from, to));
  };
  test("the clean copy raises nothing", () => {
    const r = withSet(() => {});
    expect(r.stats.citationErrors).toBe(0);
    expect(r.stats.notFound).toBe(0);
    expect(r.stats.unparsed).toBe(0);
  });
  test("a wrong finding number is caught", () => {
    const r = withSet(d => edit(d, "L2-01_Price_Anchor.md", "**AB (Finding 1)**", "**AB (Finding 8)**"));
    expect(r.stats.citationErrors).toBe(1);
  });
  test("an altered quote is caught", () => {
    const r = withSet(d => edit(d, "L2-03_Runs_Alone.md", "I mostly run by myself", "I mostly run with friends"));
    expect(r.stats.notFound).toBe(1);
  });
  test("a removed citation shows up as an uncited finding", () => {
    const r = withSet(d => edit(d, "L2-03_Runs_Alone.md", "- **AB (Finding 4)**:", "- **AB (Finding 4)**: removed — "));
    expect(r.stats.uncitedItems).toBe(withSet(() => {}).stats.uncitedItems); // control: unchanged
    const r2 = withSet(d => writeFileSync(join(d, "L2-03_Runs_Alone.md"), readFileSync(join(d, "L2-03_Runs_Alone.md"), "utf8").replace(/^- \*\*AB \(Finding 4\)\*\*.*$/m, "")));
    expect(r2.stats.uncitedItems).toBe(r.stats.uncitedItems + 1);
    expect(r2.markdown).toContain("- Finding 4: Runs alone");
  });
});

describe("command line", () => {
  test("bad arguments exit 2", () => {
    expect(cli().status).toBe(2);
    expect(cli(FX("l2")).status).toBe(2);
    expect(cli(FX("l2"), "/no/such/dir").status).toBe(2);
    expect(cli(FX("l2"), FX("l1"), "--out").status).toBe(2);
  });
  test("a directory with no ladder files is a bad argument, not a clean report", () => {
    const dir = mkdtempSync(join(tmpdir(), "pp-"));
    try { expect(cli(dir, FX("l1")).status).toBe(2); } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("a report with defects still exits 0; stdout carries the markdown", () => {
    const p = cli(FX("l2"), FX("l1"));
    expect(p.status).toBe(0);
    expect(p.stdout).toContain("## Quote check");
  });
  test("--also is repeatable, takes a directory, and a bad one exits 2", () => {
    const p = cli(FX("l3"), FX("l2"), "--also", FX("l1"), "--also", FX("l1-collision"));
    expect(p.status).toBe(0);
    expect(p.stdout).toContain("Present in a deeper source");
    expect(cli(FX("l3"), FX("l2"), "--also", "/no/such/dir").status).toBe(2);
    expect(cli(FX("l3"), FX("l2"), "--also").status).toBe(2);
    expect(cli(FX("l3"), FX("l2"), "--bogus").status).toBe(2);
    expect(cli().stderr).toContain("--also");
  });
  test("--out writes the file", () => {
    const dir = mkdtempSync(join(tmpdir(), "pp-"));
    try {
      const out = join(dir, "report.md");
      expect(cli(FX("l2"), FX("l1"), "--out", out).status).toBe(0);
      expect(readFileSync(out, "utf8")).toContain("## Summary");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

test("older format: a bullet labelled Counter-case — CODE (Finding N) parses as a counter-case", () => {
  const r = parseEvidence("## Evidence\n\n- **Counter-case — RN (Finding 10)**: \"a quote\" — reading\n- **KG (Finding 3)**: \"another\" — reading\n");
  expect(r.unparsed.length).toBe(0);
  expect(r.bullets.length).toBe(2);
  expect(r.bullets[0].code).toBe("RN");
  expect(r.bullets[0].section).toBe("X");
  expect(r.bullets[1].code).toBe("KG");
});

test("archetype Key Indicators: quoted signals are authored, not checked as quotes", () => {
  const r = quotedFragments("## Key Indicators\n\n- \"Reaches for a somatic analogy\" — note\n\n## Behavioral Profile\n\nThey say \"you have to feel it\".\n");
  expect(r.frags.map(f => f.text)).toEqual(["you have to feel it"]);
});

test("an item with status ABSORBED is skipped and noted, not counted as live", () => {
  const d = mkdtempSync(join(require("os").tmpdir(), "pp-"));
  const set = join(d, "set"), below = join(d, "below"); mkdirSync(set); mkdirSync(below);
  writeFileSync(join(below, "L3-01_A.md"), "---\ninsight_id: L3-01\n---\n# L3-01: A\n\n## Insight\n\nText.\n");
  writeFileSync(join(set, "P-01_Live.md"), "---\nprinciple_id: P-01\nsource_insights: [L3-01]\n---\n# P-01: Live\n\nCites L3-01.\n");
  writeFileSync(join(set, "P-02_Gone.md"), "---\nprinciple_id: P-02\nstatus: ABSORBED — merged into P-01\nsource_insights: [L3-01]\n---\n# P-02: Gone\n\nCites L3-01.\n");
  const r = run(set, below);
  expect(r.markdown).toMatch(/P-02_Gone\.md: skipped, frontmatter status is ABSORBED/);
  expect(r.markdown).toMatch(/1 files?, 1 items?/);
  rmSync(d, { recursive: true, force: true });
});
