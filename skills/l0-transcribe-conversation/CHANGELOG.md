# l0-transcribe-conversation — Changelog

*Prior history: this skill's record before 2026-07-31 lives in family-level entries in `skills/CHANGELOG.md` (creation, ProcessRecordedCalls two-lane pointers 2026-07-24, `--no-condition` Method S default 2026-07-30 via the diarize CHANGELOG).*

---

## 2026-10-26 — The metadata gate

All three workflows: names, roles, the date and the conversation type come from the user or a document they point to, never inferred from the recording, the transcript or file dates; a proposed value is stated with its source and used only once the user confirms it. Found on the 2026-10-26 clean-account run of the S37 Synthesis Ladder v1.1: the agent asked for the date but filled in both speakers' roles itself (disclosed); on 2026-10-23 it had asked. Roles in L0 feed L1's participant type and segment. The researcher's ruling 2026-10-26.

## 2026-09-22 — Flagged turns are corrected by the user, by ear; frontmatter for the portable edition

**Type:** Method rule (the researcher, 2026-09-22), plus metadata. No code change.

**The rule.** An `unresolved` file's labels are corrected by the user listening to each flagged turn (`**Name?:**`, `**[Speaker]:**`, `**[Unknown Speaker]:**`) and deciding. A realignment the agent computes itself may be offered as a suggestion, never applied as the correction; a confirmed voice-to-name mapping is not a disposition of the flagged turns. Written into `TranscriptFormat.md` → Attribution Status (the canonical rule, identical in `l0-transcribe-interview`) and at point of use in the workflow.

**Why.** Found in the portable edition's clean-account test (Method D, two-minute clip, 50% ambiguity): the agent re-attributed the two flagged turns with an improvised script against the tool's internals and marked the file `resolved`. Its answer looked right; the status rested on an undocumented procedure. The same tool on the author's machine gives the same 50% ambiguity, so this is a rule gap, not a packaging defect. Method S already required ear disposition for ambiguous and restored turns.

**Also today:** `license:` and `compatibility:` frontmatter (the latter names macOS on Apple Silicon, uv, FFmpeg, and the Hugging Face token for Method D); `ProcessRecordedCalls` and `MeetingBrief` marked as separate skills. Validator: PASSED.

---

## 2026-08-23 — Speaker-label methods are all LETTERED (S, D, A, B, C); two naming schemes reconciled

**Type:** Documentation-consistency ruling (the researcher, 2026-08-23). No behavior change, no code change.

**The defect, found by reading the list rather than by a check.** `TranscriptFormat.md` numbered the manual methods **1 / 2 / 3** while `workflows/TranscribeConversation.md` lettered the same three **A / B / C** — two live vocabularies for one set of methods, in two files that reference each other. It reached the artifacts: the workflow's Note template wrote `Speaker labels: Method A — time map` while the format doc's own example wrote `Speaker labels: user time map`, so an L0 file's provenance line — the record of *how* attribution was established, which is exactly what a later reader checks before trusting the labels — read differently depending on which document the session followed. Method D additionally carried a stray **`0.`**, an artifact of its being inserted above the original three in July before Method S was inserted above it.

**Ruling: letters everywhere — S, D, A, B, C.** Chosen over renaming A/B/C to 1/2/3 because letters do not collide with the existing S/D scheme, it retires the `0.` oddity, and it matches the string already being written to disk.

**Changes:** format-doc headings renumbered `0/1/2/3` → `D/A/B/C`; internal cross-references updated (`fall back to methods 1–3` → `A–C`; `fall back to Method 3` → `Method C`); Note-field examples harmonized onto the `Method X (descriptor)` form Methods S and D already used; the workflow's Note template repunctuated from `Method A — time map` to `Method A (time map)` to match. Also fixed in the same pass: the section preamble said **"Four approaches"** and then listed five — Method S was added above the original four in July and the count sentence was never updated.

**Two stale spots the first pass missed, both found by grepping the OLD wording afterward rather than by re-reading the edited region:** the Speaker Key rule's example string, and the full-file worked example ~180 lines below it — the copy-paste source, and the one that would have propagated the retired vocabulary into new files.

**Pre-existing L0 files carry the older strings** (`user time map`, `contextual inference`, `Method A — time map`). That is expected, not drift, and they are not to be rewritten — the transition is recorded in `TranscriptFormat.md` § Speaker Label Methods.

---

## 2026-08-15 — Method S gains the energy-attributed dedup pass; shared-air capture becomes a supported source

Tool change (diarize `dedup.py` + `tracks_transcript.py`, commissioned by the researcher 2026-08-15; spec `Inputs-to-Level-0/2026-08-15_energy-dedup-tool-spec.md` v2, tri-chair reviewed, suites 39/39 + 28/28, live acceptance zero false swallows). Skill updates at point of use: TranscriptFormat.md Method S section now names the two capture sources (network-separated = Zoom, isolation by construction; shared-air = worn mics, dedup pass resolves bleed by energy, default ON), conditions `attribution_status: resolved` on dispositioning any `⚠ DEDUP-AMBIGUOUS` turns, and carries the shared-air one-line bleed-disposition duty (the Dedup log FEEDS it, never replaces it; first real session's line reports minimum margin). Workflow Step 5 Method S mirrors it. Zoom runs are unchanged: Dedup line reads 0/0/0, no log section, body byte-identical (pinned by `test_7_zoom_noop_contract`).

---

## 2026-07-31 — Delivery annotation convention added (seeded on first touch)

`TranscriptFormat.md` → Transcript Body gains the **Delivery annotation** convention (the researcher ruling B1, adopted provisionally — validate in first fieldwork): a researcher who was present may record HOW a turn was said (sarcasm, deadpan, hesitation, performed confidence) inline on its own line after the turn — attributed, dated, same-day at the L0 gate, never inferred from transcript or re-listened audio. A carve-out to the no-interpretive-notes rule, scoped precisely: the annotation states delivery and the referent needed to see it, never what the turn means for the research (meaning stays L1). Header carries a `delivery_annotations: N` inventory line. Precedent: the entity-correction pattern (body edit under header record). Consumer: L1's source-gated Delivery signal + observation-class evidence (`l1-findings-extraction/FindingsFormat.md` → Evidence Classes). Trigger instance: a sarcastic "twelve interviews is never enough" in the 2026-07-30 working-session L0 read cold as a live methodological objection. Design record: vault `Inputs-to-Level-0/2026-07-31_observation-capture-and-delivery-annotation-options.md`; family entry in `skills/CHANGELOG.md` same date.
