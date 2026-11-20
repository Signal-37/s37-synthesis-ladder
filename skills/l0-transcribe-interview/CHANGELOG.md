# l0-transcribe-interview — Changelog

*Prior history: this skill's record before 2026-07-31 lives in family-level entries in `skills/CHANGELOG.md` (creation, the diarize n=2 interview tripwire mirror 2026-07-24, `--no-condition` Method S default 2026-07-30 via the diarize CHANGELOG).*

---

## 2026-10-26 — The metadata gate

All three workflows: names, roles, the date and the interview type come from the user or a document they point to, never inferred from the recording, the transcript or file dates; a proposed value is stated with its source and used only once the user confirms it. Found on the 2026-10-26 clean-account run of the S37 Synthesis Ladder v1.1: the agent asked for the date but filled in both speakers' roles itself (disclosed); on 2026-10-23 it had asked. Roles in L0 feed L1's participant type and segment. The researcher's ruling 2026-10-26.

## 2026-09-22 — Flagged turns are corrected by the user, by ear; frontmatter for the portable edition

**Type:** Method rule (the researcher, 2026-09-22), plus metadata. No code change.

**The rule.** An `unresolved` file's labels are corrected by the user listening to each flagged turn (`**Name?:**`, `**[Speaker]:**`, `**[Unknown Speaker]:**`) and deciding. A realignment the agent computes itself may be offered as a suggestion, never applied as the correction; a confirmed voice-to-name mapping is not a disposition of the flagged turns. Written into `TranscriptFormat.md` → Attribution Status (the canonical rule, identical in `l0-transcribe-conversation`) and at point of use in the workflow.

**Why.** Found in the portable edition's clean-account test (Method D, two-minute clip, 50% ambiguity): the agent re-attributed the two flagged turns with an improvised script against the tool's internals and marked the file `resolved`. Its answer looked right; the status rested on an undocumented procedure. The same tool on the author's machine gives the same 50% ambiguity, so this is a rule gap, not a packaging defect. Method S already required ear disposition for ambiguous and restored turns.

**Also today:** `license:` and `compatibility:` frontmatter (the latter names macOS on Apple Silicon, uv, FFmpeg, and the Hugging Face token for Method D); `ProcessRecordedCalls` marked as separate skills. Validator: PASSED.

---

## 2026-09-13 — Step 3's symmetric-suppression instruction becomes a header check (guard shipped in the tool)

**Trigger.** The pre-registered trigger in the dedup spec's 2026-09-01 addendum (a second session with a real symmetric-suppression loss moves the guard from review item to build) fired at P04 on 2026-09-10 — two utterances lost, both restored by hand from the Dedup log. Connection-pass flag `2026-09-11-1` raised it; the researcher ruled at the 2026-09-13 review: build it before P05.

**Change.** Step 3's Method S block, item (2): "scan the Dedup log for symmetric suppression … restore the line from the log's verbatim text" is replaced by "read the header's `Dedup guard` line" — `clean`, or a callout naming N symmetric suppressions the tool has already restored (warmer copy kept, prefixed `⚠ DEDUP-RESTORED`, logged `restored (symmetric)`). Restored turns join the ambiguous flags in the ear pass for speaker; nothing is restored by hand. `PAI/Reference/DESK-CARD_Insta360-Method-S.md` §2 changed the same way, same session (its sync rule).

**Not changed.** The ambiguous-flag disposition duty, the Note-field bleed attestation, and the 6 dB floor watch. Tool side: diarize CHANGELOG 2026-09-13 (`dedup.py` guard, `test_tracks.py` 8b flipped + 8c–8f + 14/14b, P04 re-run).

## 2026-09-02 — Step 3 gains the Insta360 shared-air pointer (desk card split off the field card)

**Trigger.** The researcher, on the 09-01 field-card line "scan the Dedup log for symmetric suppression before writing the L0": "Is there something I can do in the room while setting up to avoid? How can I review a dedup log for an interview that has not yet happened?" — and the ruling that followed: a field card holds ONLY what is done in the field. The card's old §4–§6 (bleed attestations, auto-split concat, After) were desk steps, and this workflow — the place Kai actually runs them — had no Insta360 path at all; the Method S step was Zoom-only.

**Change.** `PAI/Reference/FIELD-CARD_Insta360-Method-S.md` is now v0.6, field-only (§1 Before you leave · §2 Setting up · §3 First sixty seconds · §4 Packing up). Every desk line moved verbatim to the new `PAI/Reference/DESK-CARD_Insta360-Method-S.md`. Step 3's Method S block gains a pointer to the desk card with the three load-bearing steps inline (stream-copy concat; symmetric-suppression log scan before the L0 — the defect shape and the restore-from-log rule; ambiguous-turn ear-disposition + bleed disposition line). Point-of-use doctrine: the rule and the number stay here, the full checklist lives on the card.

**Not changed.** Nothing in the tool; the symmetric-suppression guard remains a spec-review item (diarize CHANGELOG 2026-09-01).


## 2026-08-23 — Q&A-inference files carry signed PROVENANCE, not a computed gate

**Type:** Doctrine/format change. No tool code. Commissioned by the researcher at Q3 of the diarize Step 2 three-chair spec, as the honest alternative to an item that was declined.

**What was declined, and why it mattered.** The queued idea was to give Q&A-inferred interview files a computed `attribution_status`, for parity with Method D. All three chairs rejected it and the QATester seat gave the decisive reason: `attribution_status` is computed from ambiguity-marker counts, and the failure it was meant to catch is a file whose author was **confident and wrong** — which carries no markers at all. Marker ratio over a marker-free file is 0%, which computes to `resolved`. **There is no case in which the proposed diagnostic fires on the defect it was proposed to catch**, and `l1-findings-extraction` gates on that field, so it would have placed a computed-looking green light on the one path with no computation behind it.

**What ships instead — provenance, claiming only what it can support:**

```yaml
attribution_method: qa-inference
attribution_attested_by: Jane Researcher
```

- **Both fields or neither.** An unattributed attestation is the thing the field exists to prevent.
- **The attestor is a person, never a tool or a model.** The claim is *I read the Q&A structure and assigned these labels* — which is why it is recorded rather than computed.
- **Not a gate.** It does not block L1, does not imply `resolved`, does not substitute for `[Speaker]` markers. `attribution_status` stays absent on these files; the two fields are not alternatives.

**The half that would otherwise have been declared and never executed** — wired at point of use, not only in the format doc: `workflows/Transcribe.md` manual-path step (where labels are actually assigned), its frontmatter instruction, and two checklist lines, one of which names the invalid cases explicitly. `l1-findings-extraction/workflows/ExtractFindings.md` Step 1b now distinguishes **absent-because-legacy** from **absent-because-qa-inference**: on the latter it copies both fields forward and states in the extraction report that attribution was inferred by the named attestor, then continues (never blocks). `FindingsFormat.md` carries the fields forward verbatim, never inferring them at L1.

**Contract exercised against its failure cases, not just its happy path:** signed → valid; `attribution_method` without an attestor → invalid; attestor that is a model name → invalid; Method D files unaffected.

---

## 2026-08-15 — Method S dedup pass: attribution_status extended, shared-air disposition duty added

Tool change (diarize dedup pass, commissioned 2026-08-15 — see the conversation skill's entry and the spec for full provenance). This skill's updates: `attribution_status:` is now carried by Method S files whose draft reports `⚠ DEDUP-AMBIGUOUS` turns (stays `unresolved` until each is listened to and dispositioned; 0/0/0 Method S files omit the field as before), and the workflow's Method S step reads the Dedup line, dispositions ambiguous turns by ear, and writes the shared-air one-line bleed disposition (log feeds it, never replaces it; first real session reports minimum margin). Zoom interviews unchanged — the 08-21 pre-registered run proceeds on a re-battery-tested tool (39/39 + 28/28, logged at the 07-24 pre-registration's foot).

---

## 2026-07-31 — Delivery annotation convention added (seeded on first touch)

`TranscriptFormat.md` → Transcript Body gains the **Delivery annotation** convention (the researcher ruling B1, adopted provisionally — validate in first fieldwork): a researcher who was present may record HOW a turn was said inline after the turn — attributed, dated, same-day at the L0 gate, never inferred from transcript or re-listened audio. Carve-out to the no-interpretive-notes rule, scoped to delivery and referent only; meaning stays L1. Header carries a `delivery_annotations: N` inventory line. Consumer: L1's source-gated Delivery signal + observation-class evidence. Same convention, same date, same design record as l0-transcribe-conversation — see its CHANGELOG and `skills/CHANGELOG.md` for the full family entry.
