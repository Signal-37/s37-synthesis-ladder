---
name: l1-findings-extraction
description: Extracts L1 findings — quotes and observations. USE WHEN processing transcripts or session field notes into findings (brand, product/UX, org, policy).
license: CC-BY-SA-4.0 for content, Apache-2.0 for code. See LICENSING.md in the ladder package.
---

# l1-findings-extraction

Extracts L1 Findings from interview transcripts using the V1 methodology: exhaustive, fine-grained extraction that captures behavioral observations and individual preferences alongside domain implications — not just the highest-inference moments. The domain (brand/design, product/UX, organizational, policy/advocacy, or other) is confirmed at the start of each extraction and sets the implication framing via `DomainScope.md`.

**Where this sits in the synthesis funnel:**

```
Transcripts → [L0 Utterances] → [this skill] → [L1 Findings] → [synthesis] → [L2 Themes] → [L3 Insights] → [L4 OAs + Principles] → [L5 Framework]
```

Findings produced here are Level 1 on the synthesis ladder — interpreted statements derived from L0 utterances. They become the raw material for pattern recognition, abductive reasoning, and downstream synthesis. A finding is not a quote (too raw) and not an insight (not yet synthesized across participants) and not a recommendation (not yet directive).

The V1 method is exhaustive by design: if it tells you something real about this person — what they own, how they decide, what they avoid, who they trust, what they feel — it's worth a finding. Fewer than 15 findings for a 45-minute transcript means you're only extracting the obvious (warn-level floor; canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.volume_floor_l1`).

See `FindingsFormat.md` for the exact output format, signal type definitions, volume calibration, and an annotated example. See `DomainScope.md` for implication framing per project type. See `FieldNoteFormat.md` for the session field-note template — the observation channel's capture artifact — and `FieldNoteHowTo.md` for the practitioner runbook (what to actually do before, during, and after a session, with times).

**A finding has two peer sources (2015 whiteboard doctrine, restored 2026-07-31):** an exact quotation from the participant, or an observation of the research team. The whiteboard's own L1 label was *Observation*; "observation" is now the term of art for the researcher-sourced kind. Evidence classes and sourcing rules: `FindingsFormat.md` → Evidence Classes.

**Two input contracts:** single-participant **interview** transcripts (one findings file per participant), and multi-speaker **conversation** transcripts from `l0-transcribe-conversation` (one findings file per conversation, `source_type: conversation`, a structured `**Speaker:**` field on every finding, and a hard **attribution gate** — extraction refuses on an `unresolved` L0 file; canonical condition: `../ladder-core/config/synthesis-gates.yaml` → `gates.attribution_gate`). The attribution gate also applies to **Method D (diarized) interview files**, which carry the same `attribution_status:` field and can contain the same `Name?`/`[Speaker]` ambiguity markers (added 2026-07-01). See `FindingsFormat.md` → Conversation Variant and The Attribution Gate.

**Third input contract (2026-09-27): survey corpus files** from `l0-survey-corpus-prep` (one findings file per batch, `source_type: survey`, verbatim-quote evidence cited by row ID, a Claim kind line, supporting and contrary rows per finding, a required Limits line, and a Row accounting appendix in place of the volume floor). See `FindingsFormat.md` → Survey Variant.

**Optional companion input (adopted provisionally 2026-07-31, validate in first fieldwork):** a per-session field-note file (`FN_*` per `FieldNoteFormat.md`) carrying researcher observations, the session photo log, and delivery notes; delivery annotations may also ride the L0 transcript itself (see the L0 skills' TranscriptFormat → Delivery Annotation). These are the only admissible sources for observation-class evidence and the Delivery signal — text-only tone inference is banned at point of use.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ExtractFindings** | Extract findings from a transcript, run L1 extraction, process interview into findings | `workflows/ExtractFindings.md` |
| **WriteFinding** | Translate a single raw moment or quote into a well-formed finding | `workflows/WriteFinding.md` |

## Based On

After Kolko, *Exposing the Magic of Design* — sensemaking and abductive reasoning; Peirce on abduction (surprise as the trigger for new knowledge). The leveled ladder structure itself is J. Scott King / Jon Freach practitioner lineage (frog Design, November 2015) — provenance note in `../ladder-core/ladder-map.md`

## Examples

**Example 1: Extract findings from a single transcript**
```
User: "Extract L1 findings from this transcript and write the file"
→ Invokes ExtractFindings workflow
→ Reads transcript twice: shape pass, then extraction pass
→ Targets 20-28 findings covering behavior, preference, and domain implication
→ Writes a .md file with the V1 header block and Finding X structure
```

**Example 2: Batch extraction across multiple transcripts**
```
User: "Extract L1 findings for all interviews in this directory"
→ Invokes ExtractFindings workflow for each transcript
→ Reads all transcripts, writes one .md file per participant
→ Reports finding counts and notable absences on completion
```

**Example 3: Translate a single raw moment**
```
User: "The participant said 'I just email it to myself before I submit' — make that a finding"
→ Invokes WriteFinding workflow
→ Translates the raw quote into an interpreted statement with evidence and abductive flag
→ Returns a formatted finding ready for the file or cluster
```

