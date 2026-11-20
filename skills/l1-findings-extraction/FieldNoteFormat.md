# Session Field Note Format Reference (FN)

The capture artifact for the observation channel: what the research team saw that the recording cannot carry. One file per session, written same day, by researchers who were present. L1 findings cite entries here as observation-class evidence (`FindingsFormat.md` → Evidence Classes). **This file owns the rules; the step-by-step practice — what to do before, during, and after a session, with times — is `FieldNoteHowTo.md`.**

**Status: adopted provisionally 2026-07-31 (the researcher ruling — A1 + A3, try-and-see), and OPTIONAL by the same ruling: the field-note file is an available channel, never a requirement. A session without one is normal, not a violation; every rule below governs the file IF one is written. Validate in the first fieldwork; refine from use, not from theory.**

**Lineage:** this is the frog-era post-interview practice (circa 2011–2015), ported. Researchers sat immediately after the interview and created post-its — a quote or an observation from their own notes — ten minutes silent, then ten of conversation, then more notes, then more sharing. The silence-first rule is an anchoring guard: independent externalization before group influence. Provenance: `../ladder-core/ladder-map.md` → Practice history.

---

## Capture Mechanic (A3 — the spoken debrief)

Immediately after the session, each present researcher speaks a debrief (five minutes is plenty) and transcribes it. **The debrief transcript is working material, never research data:** name it `DEBRIEF_<session-slug>_<YYYY-MM-DD>_<researcher>.md`, give it no `synthesis_level:` field, never the `L0_` prefix — transcribe the audio directly (mlx-whisper), never through the L0 formatting workflows, structure the text into this file, then archive or delete the raw transcript. **A researcher's debrief is never an input to ExtractFindings and never enters the corpus as participant data** (Synthesist's detection table and ExtractFindings Step 1 carry the same exclusion). Speaking beats typing while the memory is minutes old.

**Silence-first rule (anchoring guard):** when more than one researcher was present, each debriefs **independently, before any joint conversation about the session**. Notes created after the exchange are marked `post-exchange` — they are still admissible, but a reader can see which noticing was independent.

A written-only FN file (no spoken debrief) is acceptable when the debrief step is impractical — same-day and present-researcher rules still hold.

---

## File Naming

```
interview:    FN_[FirstName]_[LastName]_[YYYY-MM-DD].md
conversation: FN_[Topic-Slug]_[YYYY-MM-DD].md
```

Lives beside the session's L0 file.

## Frontmatter

```yaml
---
type: field-note
session: <L0 filename this accompanies>
session_id: <mirror the L0's session_id where one exists (conversation files); omit for interviews>
domain: <inherited from the study — propagates to findings that cite this file>
date: YYYY-MM-DD
researchers: [<who was present>]
written: YYYY-MM-DD            # same-day rule (anchored to the session date; see Rules); a later date is a visible violation, not a secret
independent_before_exchange: yes | mixed | no | solo   # mixed = some entries pre-, some post-exchange (entry marks carry the detail); no = none were independent
photo_count: N                 # 0 = no photo log section
---
```

## Sections

```markdown
# Field Notes — <participant or topic> (<date>)

## Setting
<Room/platform, who was present, anything relevant that predates the recording.>

## Observations
<Numbered. What the research team SAW — behavior, body language, the glance, the four silent
minutes. Each entry attributed if researchers differ; marked `post-exchange` where applicable.
Record what happened, not what it means — meaning is L1's job.>

1. <observation> — <researcher>
2. ...

## Delivery Notes
<Tone the transcript will misread. Turn-specific readings belong ON the L0 as delivery
annotations (TranscriptFormat → Delivery annotation) — list them here by turn reference only.
A turn reference = speaker + the turn's opening words (L0 files carry no timestamps or line
numbers by design), e.g. `Priya, "I've been told that twelve…"`. Session-level tone that attaches
to no single turn (e.g., "guarded until the manager left") lives here in full.>

## Photo Log
| File | What it shows | Consent tier | Caption (same-day) |
|---|---|---|---|
| <file> | <subject> | <the study's own tier value> | <caption> |

<The tier recorded is the STUDY'S own consent-tier value — a photo logged with a generic
label cannot answer which publication tier governs it at readout time. The frog shape
(internal = analysis + internal readouts, bundled; outward = the separate consent) is the
default STRUCTURE when a study has not defined its own tiers; where the study's outward
side is multi-tier (e.g., the scaling-AI plan's D6), record the specific tier. A photo with
no logged tier is unusable — log it at capture, never retroactively. Remote sessions:
photography degrades to screen capture, same tier discipline.>

## Off-Record
<What happened before recording started or after it stopped. Consent-sensitive; often the
most candid material and the most restricted. NEVER evidence — L1 may not cite this
section (see Rules).>

## Hunches
<Researcher unease, suspicions, half-formed reads — explicitly NOT observations. L1 may not
cite this section as evidence; its job is to seed follow-up questions and next-session probes.
Recommended convention (not required): prefix entries `hunch:` — spoken aloud in the debrief
so the marker survives transcription into this file.>
```

## Rules

- **Same-day writing, anchored to the session.** "Same day" means the day of the session — a session ending near midnight counts as same-day if written within a few hours. When the L0 transcript is produced later than the session (the normal case), delivery readings are captured HERE same-day and transcribed onto the L0 at its gate: an annotation's date is the date of *noticing*, not of typing. A later addition is marked `late-entry: YYYY-MM-DD` rather than silently blended.
- **Present researchers only.** Nobody annotates a session they weren't in. Remote attendance counts as present — no room doesn't mean no channel: screen-share behavior and artifact handling during walkthroughs, hesitation and pause structure, what happened before and after the recorder, camera-off moments.
- **Record, don't interpret.** "Looked at the manager before answering" is an observation; "doesn't trust the manager" is L1 work. The Hunches section is the pressure valve — use it.
- **L1 cites Observations and the Photo Log ONLY.** Hunches and Off-Record are never evidence. Off-Record informs the researcher's judgment and next-session probes; it may enter the corpus only after the participant is asked and consents on the record.
- **No re-attribution around the gate.** An FN observation may not name a speaker the L0's attribution gate could not attribute. Where an observation concerns an unattributed turn, describe the turn by position, never by name — this file is not a second attribution source.
- **Photographs need a logged consent tier at capture** — not assigned retroactively at readout time.
