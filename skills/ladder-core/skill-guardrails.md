---
name: SkillGuardrails
version: "2026-08-06.1"
description: Canonical anti-hallucination guardrail doctrine for the ladder's skills — the five guardrail types, the frozen base tag vocabulary, and the suffix-extension grammar. Authoritative source read by Createskill at authoring/validation time and parsed by tools/skill-guardrails-check.
---

# Skill Guardrails — Canonical Pattern + Tag Vocabulary

**This file is the canonical source** for the anti-hallucination guardrail *pattern* (five types) and the *tag vocabulary* (frozen bases + extension grammar). It sits beside `SkillSystem.md` the way `../ladder-core/config/synthesis-gates.yaml` sits beside the ladder skills: canonical text centralizes; enforcement lives at point of use.

**What this file does NOT own — as load-bearing as what it does:** the tailored per-skill guardrail prose. The specific artifact a data gate names, the specific ask-message, the specific fabrication risk called out in a workflow — that text is skill-owned, authored fresh per skill, and stays inline where it fires. Reducing it to pointers at this file would destroy the tailoring that makes it work (the same E3 lesson from the gates wiring: don't swallow skill-owned content). This file owns the *taxonomy* and the *tag strings*, nothing else.

## Change policy

Every edit to a type definition or the vocabulary table bumps `version:` (date.serial) and gets a `skills/CHANGELOG.md` line. Adding a base tag requires at least one real attested need — do not grow the vocabulary speculatively. `tools/skill-guardrails-check` parses the vocabulary table below; keep the machine block markers intact.

## The five guardrail types

Apply at the specific points where fabrication risk is highest. Anchors are bold-label line prefixes, plain or blockquoted — both forms are valid (`**Data gate:**` / `> **Data gate:**`).

1. **Data gate** — Halt and ask if required input data is not provided; never substitute general knowledge for user-supplied artifacts. Applied at the first step of any workflow that requires them. The halt message names the specific missing artifact.
2. **Source discipline** — Tag every claim at point of generation: `[researched]` (found via active search this session) or `[model knowledge — verify]` (drawn from training). Default to `[model knowledge — verify]` when no active search was run. Applied wherever a workflow instructs research or force-identification.
3. **Anti-fabrication rule** — Prohibit inventing specificity to fill a template: no statistics, dates, named events, or quantitative projections absent from the user-supplied inventory. Narrative additions carry `(illustrative framing)`. Applied wherever free-form narrative generation is called for.
4. **Citation discipline** — Restrict theory/source use to the workflow's own listed tables; label out-of-table frameworks `(theoretical knowledge — verify)`. Never generate page numbers, journal names, or direct quotes. Applied wherever a workflow connects findings to academic theory.
5. **Labeling requirement** — Outputs not fully grounded carry a status label (`[HYPOTHESIS — …]`, `(hypothetical — …)`). Applied in synthesis and abductive-reasoning workflows.

Provenance: 2026-05-13 QA audit (skills/CHANGELOG.md); vocabulary measured from the live corpus and frozen 2026-07-10 (135 live tag instances, 102 live anchors).

## Frozen base tag vocabulary

<!-- vocab:begin — machine-parsed by tools/skill-guardrails-check; columns: base | extension -->
| Base tag | Extension rule |
|---|---|
| `[researched]` | dash-clause |
| `[model knowledge — verify]` | verify-tail |
| `[HYPOTHESIS]` | dash-clause |
| `[SINGLE-SESSION HYPOTHESIS]` | none |
| `(illustrative framing)` | dash-clause |
| `(hypothetical)` | dash-clause |
| `(theoretical knowledge — verify)` | verify-tail |
| `(case knowledge — verify)` | verify-tail |
| `[paraphrased — no direct quote]` | none |
| `(inferred from)` | required-clause |
| `[DRAFT]` | dash-clause |
| `[observation]` | dash-clause |
| `[photo]` | dash-clause |
<!-- vocab:end -->

Thirteen rows, twelve families (`theoretical`/`case` knowledge are one parameterized family; extend it only by adding a row, never by free text before "knowledge"). `[observation]` and `[photo]` (added 2026-07-31, attested need: the two-source evidence doctrine — `l1-findings-extraction/FindingsFormat.md` → Evidence Classes) are **evidence-class markers**, siblings of `[paraphrased — no direct quote]`: they cite what grounds a finding. Their clause is grammatically optional here but substantively required by L1's own quality gate (an `[observation]` without researcher + capture-artifact source, or a `[photo]` without file + consent tier, fails ExtractFindings' checklist) — enforcement at point of use, per this file's own doctrine.

## Suffix-extension grammar

A tag conforms iff it is a base tag verbatim, or the base extended per its rule. The em dash is literally `—` (U+2014). The clause may never contain the tag's own delimiter character (no `[`/`]` inside a square tag, no `(`/`)` inside a paren tag) — **no nesting**; a same-delimiter character inside the clause is the mechanical parse-failure signal.

- **none** — atomic; any extension is nonconforming. (`[SINGLE-SESSION HYPOTHESIS]` is a hard-block *state*, not a citation; `[paraphrased — no direct quote]` has zero observed drift — frozen exactly.)
- **dash-clause** — optional ` — <free-text clause>` before the closing delimiter. `[HYPOTHESIS — requires validation with extreme users]` conforms; `(illustrative framing — frog convenience-retail project)` conforms.
- **verify-tail** — base ends in `verify`; optional ` <free-text clause>` continues it directly. `[model knowledge — verify attribution before citing]` conforms; the 46-word field-context variant conforms.
- **required-clause** — ` <clause>` is mandatory and may not begin with `:`. `(inferred from scenario logic)` conforms.

**Worked non-conforming examples (real instances, found 2026-07-10):**
- `[researched / model knowledge — verify]` — compound of two bases; pick one per claim (author templates list the two options as separate tags, never slash-joined).
- `[DRAFT — …; verify any [model knowledge — verify] claims…]` — same-delimiter nesting; split into a `[DRAFT — …]` tag plus a separate sentence.
- `(inferred from: [behavioral signal])` — colon after "from" and a nested bracket; write `(inferred from behavioral signal)`.
- `(illustrative — …)` — drops "framing"; canonical spelling is `(illustrative framing)` (ruled 2026-07-10, matching the 2026-05-13 original and the 9-of-11 live majority).
- Template placeholders inside tags use angle brackets (`<research method>`), never square brackets — square brackets inside a square tag break the grammar.

## Enforcement honesty

The **vocabulary** scan is deterministic (exact strings + grammar) — `tools/skill-guardrails-check` checks it mechanically, and since v2026-07-10.2 a nonconforming or unregistered tag **HALTs** (exit 1). The promotion was ruled by the researcher 2026-07-10 after the cycle-1 backlog triage: all 6 nonconforming instances were remediated the same day, so the tree was vocabulary-clean at the moment of promotion and every future HALT is a new regression, not legacy debt. The **coverage** question ("does every fabrication-risk step carry its guardrail?") is prose-shaped: the checker reports heuristic WARN-tier candidates for a human (exit 2 max), never a mechanical verdict — this is the guardrail checker's Gate 5, and it stays WARN-tier permanently. Coverage runs two signals: v1 vocabulary-keyed risk markers and v2 imperative step-openers after headings (built 2026-07-10; "Compose" measured out as an orchestration verb in this corpus).

**Scan surface.** Vendored dependency trees (`node_modules/`) are outside skill-authoring scope and are not scanned — same rationale as the third-party Fabric files. The deciding argument is remediability, not likelihood: a vocabulary finding is **unwaivable by design**, so a vendor README that tripped the scan would have no legitimate fix (the file cannot be edited — reinstalling reverts it), and the only move left would be adding the exclusion under a red fleet. The skipped count is **printed on every run** rather than dropped silently, so the exclusion cannot quietly grow.

Human-ruled coverage dismissals live in `tools/skill-guardrails-check/coverage-waivers.txt`, and **since v2026-08-06 the waiver list is itself reconciled against the tree on every run, case-exactly: a waiver whose path resolves to nothing — or resolves with different case — HALTs (exit 1)**. A waiver that suppresses nothing is worse than no waiver, because the run reports it as suppressed. Ruled after the live case: a directory rename voided two waivers on 2026-07-12 and their candidates re-flagged as "new" on every guard-cadence run for the following three weeks. The check is case-exact by construction because macOS is case-insensitive — `existsSync()` returns true for a stale-case waiver, so the obvious implementation of this reconciler would pass on the exact defect that motivated it.

## Related

- `skills/CHANGELOG.md` — authoritative record of which workflows have been guardrail-audited.
- `../ladder-core/config/synthesis-gates.yaml` — the ladder's structural gates (a different surface: research-artifact conditions, not skill-authoring content risk).
- `hooks/lib/guardrails.ts` — **infrastructure** guardrails (memory symlinks, carry-forward, sync). No relation to this file; the name overlap is historical.
