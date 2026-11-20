# Field Notes — How To

The practitioner runbook for the observation channel. `FieldNoteFormat.md` owns the rules; this file tells you what to actually do, in order, with times. **The whole practice is optional** — skipping it on any session is normal. When you do run it, this is how.

**The practice in one paragraph:** the recording takes dictation, so you don't. During the session you watch — you are the only instrument pointed at everything the microphone can't hear. Afterward you speak what you saw into a recorder for five minutes, before discussing the session with anyone. Same day, you structure that into the field-note file. Total cost: about twenty-five minutes per session. That's the entire practice.

---

## Before the session — 2 minutes

- Know the study's photo consent tiers (for scaling-AI: the D6 tiers). The tier decision happens **at capture**, so know the menu before you need it.
- Remote session? Photography means screen capture — decide now that you'll capture during the artifact walkthrough, not scramble mid-session.
- Put a cue card within reach: one sheet of paper or one open note. Nothing else.

## During the session — watch; write almost nothing

The recording has every word. Your job is everything else: the pause before an answer, the glance at the manager, the screen-share fumble that contradicts "we use it every day," the tone that inverts the sentence.

- **Cue words only — three words, not sentences.** "sarcasm — 30 n" · "long pause, pricing" · "showed spreadsheet not tool." A cue card is a trigger list for your debrief, not notes. If you're writing sentences, you've stopped watching.
- **What earns a cue:** delivery that inverts text (sarcasm, deadpan, hesitation, performed confidence) · behavior you saw (what they did, opened, avoided, showed) · the setting (who else was present, interruptions) · anything said before the recorder started or after it stopped.
- **Photos / screen captures:** shoot at the moment, say the tier to yourself as you shoot ("internal"), move on. Same-day captions come later.
- Moderation craft is unchanged — this rides on the attention the recorder freed; it never competes with running the interview.

## Immediately after — the spoken debrief, 5 minutes, BEFORE you talk to anyone

The silence-first rule is the practice's spine: with a co-researcher, **no conversation about the session until you have both debriefed independently.** This is the anchoring guard — independent noticing is the value; one sentence of chat contaminates it.

Recorder on. Walk your cue card aloud, in this order:

1. **Setting** — who was in the room/call, anything relevant before recording started.
2. **Observations, one at a time** — what you *saw*, stated as behavior: "she looked at the manager before answering the budget question." Not "she doesn't trust the manager" — that's L1's job, later, on the record.
3. **Delivery moments** — name the turn by its opening words, then the reading: "when he said 'I've been told twelve interviews is never enough' — that was sarcasm, riffing on the essay."
4. **Off-record** — what happened before/after the recorder. Say it; the file restricts it.
5. **Hunches** — prefix them out loud: "hunch: …". The prefix survives into the file, and hunches are never evidence.

Done in five minutes. *Now* talk to your co-researcher — and anything you add to your notes after that conversation, say or mark "post-exchange." Anything you add on a *later day* gets `late-entry: YYYY-MM-DD` — marked, never silently blended.

**Can't speak a debrief?** (No privacy, interrupted, no recorder.) Write the FN file directly — the written-only path is legitimate; the same-day and present-researcher rules still hold. Skipping the spoken step doesn't mean skipping the channel.

## Same day — structure it, 15–20 minutes

1. **Transcribe the debrief:** `mlx-whisper` directly on the audio. Save as `DEBRIEF_<session-slug>_<date>_<you>.md`. **Never `L0_` anything, no `synthesis_level:` field** — this is working material, and it must never be mistaken for participant data.
2. **Create the FN file** from the template in `FieldNoteFormat.md`, beside the session's L0 — `FN_<participant>_<date>.md` for interviews; `FN_<topic-slug>_<date>.md` for conversations and panels, mirroring the L0's `session_id:` in frontmatter. Move the debrief material into its sections: Setting / Observations (numbered, attributed) / Delivery Notes / Photo Log / Off-Record / Hunches. **Co-researcher sessions produce ONE shared FN file** — each researcher's debrief material lands in the same sections, every Observations entry tagged `— <name>`, so independent noticing stays visible without competing files. **If an observation concerns a turn the transcript couldn't attribute, describe it by position ("the third exchange after the break"), never by name** — the FN file is not a second attribution source.
3. **Photo log:** one row per shot — file, what it shows, **the study's tier value**, a caption written now while you remember why you took it.
4. **Delivery Notes:** turn reference = speaker + opening words. If the L0 transcript already exists, transcribe each reading onto it as an inline annotation and add the header inventory line; if the transcript comes later, the readings wait here — dated today, the date of noticing.
5. **Frontmatter honesty:** `written:` = today; `independent_before_exchange:` = the truth (`yes` / `mixed` / `no` / `solo`).
6. **Archive or delete the DEBRIEF file.** Its content now lives in the FN file; the raw transcript should not linger where a batch job could find it.

## When the transcript lands later (the normal case)

Transcribe the Delivery Notes readings onto the L0 as inline annotations — the annotation carries the date you *noticed*, with the transcription date if you want the record: `*[delivery: sarcasm — riffing on the method-slide scene. — the researcher, 2026-07-30, transcribed at the L0 gate 2026-07-31]*`. Add the prose-header line: `**Delivery annotations:** N — the researcher (2026-07-30)`.

## The five failure modes

1. **Dictation.** Writing sentences during the session — you've become a stenographer and stopped being the instrument. The recorder has the words.
2. **Meaning instead of behavior.** "Doesn't trust the manager" in Observations. Write what you saw; put the interpretation in Hunches or leave it for L1.
3. **Memory as a source.** Remembering something at extraction time that isn't in the FN file or on the L0 — it's not evidence, and the extractor is forbidden to use it. If it mattered, it needed to be in the debrief.
4. **Analysis in the debrief.** Five minutes of theory-building instead of noticing. The "hunch:" prefix is the pressure valve — use it and move on.
5. **Homework guilt.** The channel is optional. A skipped debrief, a session with no FN file, a study run entirely on transcripts — all normal. The practice earns its 25 minutes or it doesn't run.

## Worked micro-example

```markdown
---
type: field-note
session: L0_Dana_Reyes_2026-08-12_transcript.md
domain: organizational
date: 2026-08-12
researchers: [Alex]
written: 2026-08-12
independent_before_exchange: solo
photo_count: 1
---

# Field Notes — Dana Reyes (2026-08-12)

## Setting
Remote, Zoom. Dana joined from an open-plan office; a colleague was audible until ~min 10.

## Observations
1. During the artifact walkthrough, opened a personal spreadsheet before the sanctioned
   tool — navigated it fluently, fumbled the tool's menus. — the researcher
2. Four-minute silent stretch reproducing the report by hand rather than using the export. — the researcher

## Delivery Notes
- Dana, "Oh sure, the process works great…" (turn reference only — the full reading lives
  on the L0 as its inline annotation, transcribed at the gate)

## Photo Log
| File | What it shows | Consent tier | Caption (same-day) |
|---|---|---|---|
| dana-spreadsheet-0812.png | Personal tracking spreadsheet, screen capture | anonymous (D6 tier 1) | The real workflow — sanctioned tool nowhere on screen |

## Off-Record
After the recorder stopped: "honestly, nobody on my team opens it." NEVER evidence —
flag for an on-record follow-up next session.

## Hunches
- hunch: the spreadsheet predates the tool rollout — check adoption timeline next session.
```

Rules, markers, and the extraction contract: `FieldNoteFormat.md`. Delivery-annotation grammar on the transcript: the L0 skills' `TranscriptFormat.md`. What the extractor does with all of it: `workflows/ExtractFindings.md`.
