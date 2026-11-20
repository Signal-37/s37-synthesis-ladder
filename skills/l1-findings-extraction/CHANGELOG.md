# l1-findings-extraction — Changelog

*Prior history: this skill's record before 2026-07-11 lives in family-level entries in `skills/CHANGELOG.md` and `../ladder-core/ladder-map.md` (vocabulary freeze 2026-07-10, synthesis-gates build 2026-07-10, ladder provenance 2026-07-11).*

---

## 2026-09-27 (rename) — Survey Variant points to l0-survey-corpus-prep

`FindingsFormat.md`, `SKILL.md` and `workflows/ExtractFindings.md` name the renamed skill (was `survey-corpus-prep`), including the `AuditRound.ts` path in the coverage check. No rule changed.

## 2026-09-27 (final) — Survey Variant finished after the final check

Contrary is defined, and Row accounting gains two dispositions: ambiguous rows (counted nowhere) and single rows carried. Wish rows are marked in mixed findings, and every row read must be placed exactly once, checked by `AuditRound --accounting`. A text/score Contradiction counts only when the score rates the same object as the text. `survey_id` is added to the frontmatter.

## 2026-09-27 (later) — Survey Variant revised after a four-reviewer audit

Claim kind line; `**Rows:**` now counts quoted, supporting and contrary rows and names the corpus files; a required Row accounting appendix places every row read (replaces the file-level coverage check); signal types adapted to rows (Repetition does not apply, Contradiction only within a row, Delivery excluded); scores given in Context; singular wording for one-row findings; `tagging_method:` added; a sampling clause in the Limits line; saturation-sampled categories get their L1 file at close, and the rounds file stays as the audit trail. ExtractFindings Steps 6 and 7 point to the variant. Checker gate 2 WARNs on a survey file without Row accounting.

## 2026-09-27 — Survey Variant (third input contract)

Added with the new `survey-corpus-prep` skill (scope ruled by the author, 2026-09-27). `FindingsFormat.md` → Survey Variant: one findings file per batch of survey corpus files, `source_type: survey`, verbatim-quote evidence only, each quote cited by row ID and file, a `**Rows:** k cited of n read` line, no Speaker field, a required Limits line (not representative; independence assumed without respondent IDs), read-before-cite rules, and a coverage check in place of the volume floor. Wired at point of use: SKILL.md (third input contract), ExtractFindings Step 1 (routing), Volume Calibration (exemption note). The volume-floor exemption is canonical in `../ladder-core/config/synthesis-gates.yaml` → `gates.volume_floor_l1`, enforced in `synthesis-gates-check` gate 2 with a test.

## 2026-07-31 — FieldNoteHowTo fidelity check (single chair) + fixes

Researcher-commissioned single-chair fidelity review of the runbook against its five authority documents: FAITHFUL WITH FIXES — the solo single-interview path verified exact end-to-end (worked-example frontmatter field-by-field, delivery-annotation forms, quarantine, optional posture at all four pointer sites), with 7 findings, all applied same day: worked example's Delivery Notes trimmed to turn-reference-only (F-1, the one drift — full reading lives on the L0 only); written-only FN path surfaced (F-2); re-attribution-by-position rule added to the structuring step (F-3); `late-entry:` marking added beside `post-exchange` (F-4); conversation-type naming + `session_id:` mirroring added (F-5); one-shared-FN-file merge rule for co-researcher sessions (F-6); and the runbook's invented `hunch:` prefix canonicalized into FieldNoteFormat's Hunches section as a RECOMMENDED convention, not required (F-7 — rule and practice now agree; Kai default, the researcher may overrule). Validators clean.

## 2026-07-31 — FieldNoteHowTo.md added (practitioner runbook)

The researcher asked for practical how-to instructions for the field-note practice. New reference doc `FieldNoteHowTo.md`: time-ordered runbook (2 min before / watch-don't-transcribe during / 5-min spoken debrief before any conversation / 15–20 min same-day structuring / transcript-lag handling), the cue-card discipline, the five-prompt debrief script, the five failure modes (ending with "homework guilt" — the channel is optional and skipping is normal), and a worked micro-example FN file including a deadpan delivery note, a D6-tiered screen capture, and an Off-Record entry flagged for on-record follow-up. Rules stay in `FieldNoteFormat.md` (now cross-pointed both ways); the runbook duplicates no law, only practice. Registered in SKILL.md; validator clean.

## 2026-07-31 — Observation channel restored; WriteObservation → WriteFinding (scope-change)

**Re-justification:** still one job — translate a session's externalized material (now transcript + field notes, not transcript alone) into L1 Findings. Researcher-attested doctrine (two peer finding sources: participant quotation or research-team observation — the 2015 whiteboard's own L1 label) restored to the format after the extraction pipeline had narrowed to transcripts-only. All rulings the researcher's, 2026-07-31, adopted provisionally; design record in vault `Inputs-to-Level-0/2026-07-31_observation-capture-and-delivery-annotation-options.md`.

- `FindingsFormat.md`: new **Evidence Classes** section — four peers (verbatim quote / `[paraphrased — no direct quote]` / `[observation — <researcher>, <source>]` / `[photo — …, consent tier]`), each with a source requirement; anti-fabrication rule reframed from quote-with-fallback to class-with-source; new **Delivery** signal type, source-gated (requires an L0 delivery annotation or FN entry; text-only tone inference banned — a faithful transcript of a joke reads as a claim); provenance note anchored so no tidy-up pass narrows the format to quotes-only.
- New reference doc **`FieldNoteFormat.md`**: per-session FN file — spoken-debrief capture mechanic, silence-first anchoring guard (independent externalization before joint conversation, the frog-era protocol ported), photo log with capture-time consent tiers, Off-Record section, and the evidence line: L1 cites Observations and the Photo Log, never Hunches.
- `ExtractFindings.md`: FN file as optional companion input (Step 1 + Pass 1); Delivery row in the Pass 2 signal table; quality check — observation/Delivery findings must cite their capture artifact.
- **`WriteObservation.md` renamed `WriteFinding.md`** — it writes all findings, quote-sourced included; keeping "observation" on it would collide with the new term of art. Internal refs, routing table, Example 3, ladder L1 list all updated. Delivery carve-out added to its "stay behavioral" rule.
- Description recut same day (after the three-chair review): "Extracts L1 findings — quotes and observations. USE WHEN processing transcripts or session field notes into findings (brand, product/UX, org, policy)." (149 chars; field notes now in the TRIGGER half. Honest keyword accounting, correcting this entry's own earlier claim: "preferences" and "implications" were DROPPED from the description for the character band — not "all retained" — with "observations" kept and "quotes"/"field notes" added; the dropped words remain in the SKILL.md body prose.)
- Structural: `tools/.gitkeep` added (pre-existing validator error). Validator + guardrails scanner clean.

## 2026-07-11 — Seeded during the ladder gap audit (Architect + Engineer chairs)

Per-skill CHANGELOG created per the gap audit's hybrid recommendation. Skill-specific history to date: the ladder provenance note (Scott King / Jon Freach, frog, Nov 2015) carries a one-line echo in this skill's Based On (2026-07-11); the L0–L5 QualResearcher fidelity pass (2026-07-11, two seats) found L1 carries **no author-attributed claims** and praised its "normative, not derived" volume disclaimer as **the model other rungs should copy** — that caveat was propagated to the five sibling Format files during the gap audit. Gap-audit changes to this skill: template placeholders converted to angle brackets per the frozen convention (family-wide sweep).
