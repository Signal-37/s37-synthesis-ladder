# TranscribeConversation Workflow

Transcribe a single conversation recording and produce one L0 conversation transcript markdown file ready for l1-findings-extraction.

## Before You Start

Read `TranscriptFormat.md` in the skill root. It defines the exact L0 conversation file structure, speaker label conventions, and quality checks.

**Cross-call state discipline (why later steps re-read a pointer file):** each Bash tool call runs in a *fresh process* — a shell variable set in one step (like `TRANSCRIBE_TMP=$(mktemp -d)` in Step 3) is **unset** in the next, so `ls "$TRANSCRIBE_TMP"` in a later step would operate on an empty path. The temp dir must still be a fresh `mktemp -d` each run (a fixed path would let a stale transcript from a previous recording be used for the wrong file). So the pattern is: Step 3 writes the `mktemp -d` path to a fixed **pointer file** (`~/.claude/state/transcribe/tmpdir-path`, local + gitignored), and every later step that needs the dir re-reads it — `TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"`. The pointer is at a fixed location; the dir it names is fresh every run. Do not carry the path forward in your head across tool calls — read the pointer.

## Step 1: Confirm Inputs

Ask the user for anything not already provided:

- **Recording file** — full path to the audio or video file (`.m4a`, `.mp3`, `.mp4`, `.wav`, `.mov`, etc.)
- **Topic slug** — a short hyphenated label for the conversation (used in file naming): e.g., `Expert-Panel-Racing-Heritage`, `Alex-Jordan-Dialogue`
- **Output directory** — where to write the L0 file (default: same directory as the recording)
- **Conversation metadata:**
  - Conversation type (Expert panel / Peer interview / Roundtable / Stakeholder dialogue / Expert debrief)
  - Topic (one-phrase description of the conversation subject)
  - Date
  - Location or platform (City, State — or "Remote — Zoom" / "Remote — Teams" / etc.)
  - All participants — name and role/affiliation for each

**Data gate:** Confirm the recording file exists — if it does not exist at the stated path, stop and ask; never transcribe from a described, remembered, or assumed recording.

**Metadata gate:** names, roles, the date and the conversation type come from the user or a document they point to. Do not infer them from the recording, the transcript or file dates. If one is missing, ask before writing the L0 file. A value you propose (such as a date taken from a file) is stated as a proposal with its source, and used only once the user confirms it.

```bash
ls -lh "[recording_file_path]"
```

## Step 2: Build the Speaker Roster and Agree on Label Method

Before Whisper runs, lock in who speaks, how they'll be labeled, and how speaker attribution will be applied.

Build the initial roster from Step 1 inputs:

| Name for transcript | Role / Affiliation |
|--------------------|--------------------|
| [Name 1] | [Role] |
| [Name 2] | [Role] |
| [Name 3] | [Role] |

Ask: "Are there any additional voices on the recording — a moderator, an observer who spoke, or anyone not already listed?"

Confirm the label format for each person: first name only, full name, or an ID (e.g., `Expert-A`).

**Then agree on the speaker attribution method:**

> "For conversation recordings, I can't infer speaker labels from Q&A pattern the way I do for interviews. Which approach works best for this recording?
>
> **D — Automated diarization (preferred, needs the audio):** A local model (pyannote) separates the voices and I merge that with the transcript — you just confirm which speaker is who. Most accurate and least manual; runs fully on-device.
>
> **A — Time map:** You provide rough timestamps for when each speaker takes the floor. I'll apply labels from the map and flag gaps.
>
> **B — Contextual inference:** I'll look for speakers naming each other, distinctive topic ownership, or other contextual cues. Where I'm confident I'll label; where I'm not, I'll flag as [Speaker].
>
> **C — Full manual review:** I'll transcribe and mark all turns [Speaker]. You review and correct labels before L1 extraction begins."

Record the agreed method — it will be documented in the Note field of the L0 file. **Default to D whenever you have the audio file;** A/B/C are for when you don't, or to clean up the turns D flags.

If the user chooses **A (time map)**, collect the map now:

```
Time map provided by [Name]:
- 00:00–02:15 — [Name] opens
- 02:15 — [Name] responds
- 04:30 — [Name] joins
...
```

## Step 3: Transcribe (or run Method D)

**Check for separate tracks FIRST (Method S — preferred over Method D when present):** if the recording is a folder with one audio file per participant (Zoom "record a separate audio file for each participant" — the researcher's standing setting since 2026-07-23), run `../ladder-core/scripts/diarize/tracks-transcript <dir> --language en --out <draft.md>` instead. Deterministic attribution, no diarizer, combined mix auto-excluded. **Method S defaults to `condition_on_previous_text=False` since 2026-07-30** (do NOT pinned-first-then-re-run; `--condition` restores the old baseline; canonical rationale: diarize README → ASR honesty). Then skip to **Step 5 → Method S**. (See `TranscriptFormat.md` → Speaker Label Methods → Method S.) **Capture type is DETECTED automatically (since 2026-08-23)** — a Zoom folder is recognised from its `recording.conf` and its shared meeting-id stem suffix, an Insta360 rig from its `-tx<N>_orig` wearer marker. On Zoom (network-separated streams) there is no shared air, so a cross-track text match cannot be bleed and the dedup pass does not run; on shared-air capture it does. **`--capture {shared-air,network-separated}` overrides the detection** and the draft records which applied. **If the folder carries neither marker the tool does not guess — it assumes shared-air (safety net on) and, only when that assumption actually changed the output, prints a CAPTURE TYPE UNDETERMINED block in the draft asking you to confirm.** If you see that block, answer it before dispositioning any ambiguous flag.

**If Method D (automated diarization) — preferred for mixed-track audio:** run the tool. It transcribes (mlx-whisper) *and* diarizes (pyannote) in one on-device pass, emitting a markdown draft with graded-confidence speaker labels already applied:

```bash
mkdir -p ~/.claude/state/transcribe
DRAFT="$(mktemp -d)/draft.md"; echo "$DRAFT" > ~/.claude/state/transcribe/draft-path
../ladder-core/scripts/diarize/diarize-transcript "[recording_file_path]" \
  --model mlx-community/whisper-large-v3-turbo \
  --language en \
  --out "$DRAFT"
echo "diarized draft → $DRAFT"
```

The draft path is persisted to `~/.claude/state/transcribe/draft-path` because Step 5 (a separate tool call) must open it and `$DRAFT` will not survive the call boundary.

Then skip to **Step 5 → Method D** to map `SPEAKER_xx → names`. Use `--model mlx-community/whisper-large-v3-mlx` for difficult audio; drop `--language en` for non-English.

**If Method D fails** (tool error, HF auth/license issue) or the diarizer mis-splits similar voices, fall back to the manual path below (Method A/B/C) for this recording and record the method change in the Note field — do not skip the recording or ship the tool's partial draft.

**If Method A/B/C (manual attribution):** transcribe with **mlx-whisper**, the Apple-native engine of record. **Do NOT use openai-whisper `--device mps`** — it produces NaN logits and fails on this machine.

**Always create a fresh temp directory using `mktemp -d` — never reuse a fixed path. A stale transcript from a previous session will produce output for the wrong recording.** The `mktemp -d` path is written to the pointer file `~/.claude/state/transcribe/tmpdir-path` so Steps 4 and 10 (separate tool calls) can re-read it; the dir itself is still fresh every run, so the staleness guarantee holds.

```bash
mkdir -p ~/.claude/state/transcribe
TRANSCRIBE_TMP=$(mktemp -d); echo "$TRANSCRIBE_TMP" > ~/.claude/state/transcribe/tmpdir-path
mlx_whisper "[recording_file_path]" \
  --model mlx-community/whisper-large-v3-turbo \
  --output-dir "$TRANSCRIBE_TMP" \
  --output-format srt \
  --language en
```

**Output:** mlx-whisper writes a `.srt` file to `$TRANSCRIBE_TMP`. Use `mlx-community/whisper-large-v3-mlx` for difficult audio (heavy accents, crosstalk, noise). For non-English, replace `--language en` with the language code or drop it to auto-detect.

## Step 4: Read and Parse the SRT Output

After Whisper completes, verify the output before reading. Re-read the temp-dir pointer first (`$TRANSCRIBE_TMP` from Step 3 is gone — separate process):

```bash
TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"
ls "$TRANSCRIBE_TMP"
```

**Check that the filename stem matches the input file's stem.** If there is a mismatch, do not proceed — the wrong file may have been transcribed. Investigate before continuing.

```bash
TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"
cat "$TRANSCRIBE_TMP/[filename].srt"
```

Parse into transcript segments. Use timestamps only internally during speaker attribution — they are not included in the L0 file body.

**Anti-fabrication rule — scan for Whisper hallucination-at-silence before labeling** — full canonical procedure: `../ladder-core/scripts/diarize/README.md` → **Shared L0 doctrine → ASR honesty**. In short: remove confirmed repeated-line/boilerplate injections; where unsure, keep the text and mark `*[possible transcription artifact]*`; record removals in the Note field. Never add, complete, or smooth speech the audio does not contain.

## Step 5: Apply Speaker Labels

Apply labels using the method agreed in Step 2:

**Method S (separate tracks):** Open the draft `tracks-transcript` wrote in Step 3. Confirm the track→name mapping table (labels derive from filenames — correct any); attribution is deterministic, so there are no `?`/`[Speaker]` turns to review. **Read the draft's `**Dedup:**` line (present since 2026-08-15, default ON).** Zoom recordings read `resolved 0 / ambiguous 0 / Class D 0` and carry no Dedup log — nothing further. Shared-air recordings (worn mics, one room): disposition any `⚠ DEDUP-AMBIGUOUS` turns **by listening at their timestamps** (the band means the energy rule declined to choose), read the `## Dedup log`, and write the **one-line bleed disposition into the Note field** — every shared-air session, including clean ones; the log feeds the line, never replaces it, and the first real shared-air session's line must report the log's minimum observed margin (the researcher rulings 2026-08-15; spec: `Inputs-to-Level-0/2026-08-15_energy-dedup-tool-spec.md`). `attribution_status: resolved` once the mapping is confirmed AND ambiguous turns (if any) are dispositioned. The draft carries the same **hallucination-scan line/table** as Method D (scanned per track): disposition each flagged row — remove confirmed, mark `*[possible transcription artifact]*` where unsure, record removals in the Note field; **conditioning is already OFF on a default Method S run (2026-07-30 default)** — a confirmed repeat-run here is plain silence hallucination to disposition, not a trigger to re-run; the `--no-condition` trigger language applies only to `--condition` runs (full procedure: diarize README → **Shared L0 doctrine → ASR honesty**). Then continue to Step 6.

**Method D (automated diarization):** Open the draft the tool wrote in Step 3 — its path is in the pointer file (`cat ~/.claude/state/transcribe/draft-path` gives the path; Read that file). Fill its Speaker Mapping stub — match each `SPEAKER_xx` to a name using the talk-time / first-appearance hints plus content (who's named, who introduces whom), then replace the placeholders throughout. The tool has already assigned the three confidence states — keep them (`**Name:**` / `**Name?:**` / `**[Speaker]:**`). Review every turn it marked `?` or `[Speaker]`, honor its ambiguity tally / review flag, and carry the tally into the Note field. The draft also carries a **hallucination-scan line** (and, when nonzero, a `## Hallucination scan` table — deterministic detection only; the tool never removes text): disposition each flagged row — remove confirmed hallucinations, mark `*[possible transcription artifact]*` where unsure, record removals in the Note field; **if you CONFIRM a repeated-line (repeat-run) flag, the README's `--no-condition` trigger has fired — say so** (full procedure: diarize README → **Shared L0 doctrine → ASR honesty**). Then continue to Step 6.

**Method A (time map):** Apply the mapped name only to SRT segments that fall cleanly inside a single map interval. A segment whose time range **straddles a map boundary** is ambiguous → `**[Speaker]:**`, never assigned wholesale to one side. Interjections/asides inside an interval that the map doesn't cover → `**[Speaker]:**`, not the interval's lead. If the map averages fewer than ~1 entry per minute, warn the user first that most within-interval turns will be `[Speaker]`. (See Speaker Label Methods in `TranscriptFormat.md`.)

**Method B (contextual inference):** Work through the SRT segments and assign the matching confidence state:
- **Confident** `**Name:**` — a speaker is addressed by name ("Alex, what do you think..."), or the turn is an unambiguous direct continuation of a confident turn.
- **Inferred** `**Name?:**` — content is *distinctively attributable* to one expert's domain, or another soft/style cue points to a speaker, but nothing anchors it. Use the `?` marker — do not render a soft guess as a confident label.
- **Unknown** `**[Speaker]:**` — no usable cue.

Do not chain blindly on "follows a named address": if a third voice plausibly interjects between the address and the answer, the answer is `**[Speaker]:**` or `**Name?:**`, not a confident assignment to the addressee.

**Method C (full manual review):** Label all turns `**[Speaker]:**`. Note in the file: "Speaker labels require user review before L1 extraction."

Format all confirmed labels: `**Name:**` — bold the name, not the response text. One blank line between speaker turns. Merge Whisper's short SRT segments into natural turns per the canonical rule (diarize README → **Shared L0 doctrine → Deterministic segment merge**): concatenate consecutive same-speaker segments; start a new turn on a speaker change or a gap > ~2s.

Stage directions and ambient notes in italics: `*[crosstalk]*`, `*[long pause]*`, `*[laughs]*`, `*[inaudible]*`.

**Short back-channel responses** ("mm-hmm", "right", "yeah") sandwiched between attributed turns may be attributed to the non-speaking participant **only in a two-person conversation**, where "the non-speaking participant" is unambiguous. In a 3+ speaker conversation there are multiple silent participants and no basis to pick one → mark back-channel `**[Speaker]:**` unless content gives independent confidence. Note in the Note field if back-channel was auto-attributed systematically.

**Unknown voice (not on participant list):** If a voice appears that was not in the Step 2 roster, use `**[Unknown Speaker]:**` for those turns. Flag in the Note field with the approximate timestamp range. Do not proceed to L1 extraction until the user identifies the voice and the Speaker Key is updated.

**Tally attribution outcomes as you finish:** total turns, count of `**[Speaker]:**` (unknown), count of `**Name?:**` (inferred). These are reported in Step 10 and drive the review flag: if unknown + inferred together exceed ~40% of turns, the attribution is too weak to trust — flag the file for user review before L1 extraction, regardless of which method was used. Review means the user listens to each flagged turn and decides; you may suggest, not settle (`TranscriptFormat.md` → Attribution Status).

## Step 6: Organize Into Topic Sections

Review the labeled transcript and break it into `##` sections by topic. Section names should reflect the actual content — not generic labels. **Name the subject under discussion, not the outcome or characterization** ("Racing Heritage and Brand Identity," not "Jordan Concedes the Argument") — interpretation is L1's job, not an L0 header's. Aim for roughly one section per genuine topic shift — about every 8–15 minutes of conversation — so section count is reproducible rather than arbitrary.

```
## Opening — Context and Framing
## [Topic 1]
## [Topic 2]
## Close
```

## Step 7: Get Recording Duration

```bash
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "[recording_file_path]" 2>/dev/null | awk '{h=int($1/3600); m=int(($1%3600)/60); s=int($1%60); printf "%02d:%02d:%02d\n", h, m, s}'
```

## Step 8: Write the L0 File

Compose the full L0 markdown file following `TranscriptFormat.md` exactly.

**File naming:**
```
L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md
```

**Compute `attribution_status` first:** from the final labeled turns, count `**[Speaker]:**` + `**Name?:**` against total turns; if that exceeds 40% or any `**[Unknown Speaker]:**` exists, set `attribution_status: unresolved`, else `resolved` (see `TranscriptFormat.md` → Attribution Status). Method D: read it off the tool's tally.

**Structure:**
1. YAML frontmatter (`participants:` list, `date:`, `conversation_type:`, `topic:`, `location:`, `attribution_status:`, `synthesis_level: L0`)
2. Prose header (# Conversation Transcript — Topic, then Date / Participants with roles / Context / Location / Source / Duration / Note)
3. Speaker Key — every speaker with role/affiliation; attribution method documented
4. `##` section headers by topic
5. Speaker turns as `**Name:**`; uncertain turns as `**[Speaker]:**`

Write the file:
```
Write to: [output_directory]/L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md
```


### Delivery-annotation offer (optional — the window closes today)

If a researcher who was present is available today, offer the annotation pass: any turn whose delivery inverts its text (sarcasm, deadpan, hesitation)? Record per TranscriptFormat -> Delivery annotation and add the prose-header inventory line. Entirely optional — skip freely if no researcher is available or nothing needs marking. If the researcher keeps a session field-note file (FN_*, optional practice), its Delivery Notes may already hold same-day readings to transcribe here.

## Step 9: Quality Check

- [ ] YAML frontmatter — `participants:` list, `conversation_type:`, `topic:`, `date:`, `location:`, `synthesis_level: L0`
- [ ] File named `L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md`
- [ ] Prose header complete — Date, Participants with roles, Context, Location, Source, Duration (Note only if needed)
- [ ] Speaker Key present — every speaker listed with role/affiliation; attribution method documented
- [ ] `##` section headers — named by topic
- [ ] Speaker labels use the three confidence states correctly — `**Name:**` (anchored) / `**Name?:**` (inferred) / `**[Speaker]:**` (unknown); no soft guess rendered as a confident label
- [ ] Attribution tally recorded (total / unknown / inferred); if unknown + inferred > ~40%, file flagged for user review
- [ ] Back-channel auto-attributed only in 2-person conversations
- [ ] Whisper hallucination-at-silence scanned in Step 4; any removals noted
- [ ] Stage directions in italics (only where a source delivered them — Whisper doesn't emit them)
- [ ] No timestamps in body
- [ ] Filler words retained where the ASR delivered them; note in the Note field if the engine smoothed disfluencies (don't check blindly — absence of fillers ≠ preserved fillers)
- [ ] Note field warns "Speaker labels require user review before L1 extraction" for Method C **or** whenever unknown + inferred turns exceed the ~40% threshold

## Step 10: Clean Up and Report

Re-read the pointer — `$TRANSCRIBE_TMP` is gone; the `[ -n ]` guard prevents a lost pointer from degenerating to a bare `rm -rf`:

```bash
TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path 2>/dev/null)"
[ -n "$TRANSCRIBE_TMP" ] && rm -rf "$TRANSCRIBE_TMP"
# Method D: also remove the diarized draft's temp dir
DRAFT="$(cat ~/.claude/state/transcribe/draft-path 2>/dev/null)"
[ -n "$DRAFT" ] && rm -rf "$(dirname "$DRAFT")"
rm -f ~/.claude/state/transcribe/tmpdir-path ~/.claude/state/transcribe/draft-path
```

Report completion:

```
L0 conversation transcript written: [output_directory]/L0_[Topic-Slug]_[YYYY-MM-DD]_conversation.md

Participants: [N] speakers
Duration: [HH:MM:SS]
Model: whisper-[model]
Speaker labels: <Method A (time map) / Method B (contextual inference) / Method C (pending user review)>
Attribution: [X] confident, [Y] inferred (Name?), [Z] unknown ([Speaker]) of [T] total
[If Method C, OR if Y+Z > ~40% of T, OR if any [Unknown Speaker]:] ⚠️  Speaker labels not fully confirmed — review before l1-findings-extraction.
Ready for l1-findings-extraction.
```
