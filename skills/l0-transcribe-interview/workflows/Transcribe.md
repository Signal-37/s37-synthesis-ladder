# Transcribe Workflow

Transcribe a single interview recording and produce one L0 transcript markdown file ready for l1-findings-extraction.

## Before You Start

Read `TranscriptFormat.md` in the skill root. It defines the exact L0 file structure, speaker label conventions, and quality checks.

**Cross-call state discipline (why later steps re-read a pointer file):** each Bash tool call runs in a *fresh process* — a shell variable set in one step (like `TRANSCRIBE_TMP=$(mktemp -d)` in Step 3) is **unset** in the next, so `ls "$TRANSCRIBE_TMP"` in a later step would operate on an empty path. The temp dir must still be a fresh `mktemp -d` each run (a fixed path would let a stale SRT from a previous recording be transcribed as the wrong file). So the pattern is: Step 3 writes the `mktemp -d` path to a fixed **pointer file** (`~/.claude/state/transcribe/tmpdir-path`, local + gitignored), and every later step that needs the dir re-reads it — `TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"`. The pointer is at a fixed location; the dir it names is fresh every run. Do not carry the path forward in your head across tool calls — read the pointer.

## Step 1: Confirm Inputs

Ask the user for anything not already provided:

- **Recording file** — full path to the audio or video file (`.m4a`, `.mp3`, `.mp4`, `.wav`, `.mov`, etc.)
- **Participant name** — full name, or anonymized ID if the project uses them
- **Output directory** — where to write the L0 file (default: same directory as the recording)
- **Participant metadata** — the fields needed for the YAML frontmatter:
  - Role / participant type
  - Interview date
  - Interview type (Customer / Near-purchaser / Dealer / Industry insider / etc.)
  - Location (City, State/Country)
  - Interviewer name(s)

**Data gate:** Confirm the recording file exists before proceeding — if it does not exist at the stated path, stop and ask; never transcribe from a described, remembered, or assumed recording.

**Metadata gate:** names, roles (participant type), the date and the interview type come from the user or a document they point to. Do not infer them from the recording, the transcript or file dates. If one is missing, ask before writing the L0 file. A value you propose (such as a date taken from a file) is stated as a proposal with its source, and used only once the user confirms it.

```bash
ls -lh "[recording_file_path]"
```

## Step 2: Confirm Speaker Roster

Before Whisper runs, lock in who speaks and how they'll be labeled in the transcript.

Build the initial roster from Step 1 inputs:

| Role | Name for transcript |
|------|-------------------|
| Participant | [name from Step 1] |
| Interviewer | [name(s) from Step 1] |

Ask the user:

> "Are there any additional speakers — a co-moderator, observer who spoke, translator, or anyone else on the call?"

If yes, add them to the roster with their role.

Confirm the label format for each person: first name only, full name, or anonymized ID (e.g., `P01`). This is the exact name that will appear as `**Name:**` throughout the transcript.

Record the finalized roster — it is used in Step 5 (Apply Speaker Labels).

## Step 3: Run Whisper

**Check for separate tracks FIRST (Method S — preferred when present):** if the recording is a folder with one audio file per participant (Zoom "record a separate audio file for each participant" — the researcher's standing setting since 2026-07-23), run `../ladder-core/scripts/diarize/tracks-transcript <dir> --language en --out <draft.md>` instead — deterministic attribution, no diarizer needed. **Method S defaults to `condition_on_previous_text=False` since 2026-07-30** (do NOT pinned-first-then-re-run; `--condition` restores the old baseline; canonical rationale: diarize README → ASR honesty). At Step 5, confirm the track→name mapping (interviewer vs. participant is read off the filenames), disposition any hallucination-scan flags per the Method D instructions, and **read the draft's `**Dedup:**` line** (default ON since 2026-08-15): Zoom recordings read 0/0/0 with no Dedup log — nothing further; shared-air recordings (worn mics, one room — Insta360 standing rig) require listening to any `⚠ DEDUP-AMBIGUOUS` turns at their timestamps and a **one-line bleed disposition in the Note field, every session including clean ones** — the `## Dedup log` feeds the line, never replaces it, and the first real shared-air session's line must report the log's minimum observed margin (the researcher rulings 2026-08-15; spec: `Inputs-to-Level-0/2026-08-15_energy-dedup-tool-spec.md`). Then set `attribution_status: resolved` (mapping confirmed + ambiguous turns dispositioned), and skip the `?`-review (no such states exist on this path). (Canonical: diarize README → Method S usage.) **Capture type is DETECTED automatically (since 2026-08-23)** — a Zoom folder is recognised from its `recording.conf` and its shared meeting-id stem suffix, an Insta360 rig from its `-tx<N>_orig` wearer marker. On Zoom (network-separated streams) there is no shared air, so a cross-track text match cannot be bleed and the dedup pass does not run; on shared-air capture it does. **`--capture {shared-air,network-separated}` overrides the detection** and the draft records which applied. **If the folder carries neither marker the tool does not guess — it assumes shared-air (safety net on) and, only when that assumption actually changed the output, prints a CAPTURE TYPE UNDETERMINED block in the draft asking you to confirm.** If you see that block, answer it before dispositioning any ambiguous flag.

**Insta360 shared-air tracks (two worn TX, files `<Name>_tx1.wav` / `<Name>_tx2.wav`) are Method S too ; the author's full post-session desk card is not in this package.** The three that are load-bearing, kept here at point of use: (1) auto-split segments are concatenated per TX with `ffmpeg -c copy` only, never re-encoded; (2) **before writing the L0, read the header's `Dedup guard` line** — `clean`, or a `⚠️ Dedup guard: N symmetric suppression(s)` callout meaning both copies of one utterance lost to each other and the tool restored the warmer copy into the transcript prefixed `⚠ DEDUP-RESTORED` (defect found P03 2026-09-01, two more at P04 2026-09-10; guard shipped in the tool 2026-09-13, replacing the manual log scan) — every restored turn is ear-dispositioned for WHICH speaker, like an ambiguous flag, and nothing is restored by hand; (3) every `⚠ DEDUP-AMBIGUOUS` turn is ear-dispositioned before `attribution_status: resolved`, and the L0's Note field carries a one-line bleed disposition citing the Dedup log.

> **✅ TRIPWIRE DISCHARGED 2026-08-21 — do not run the n=2 comparison again.** The P01 interview was the final Method S test: Method S passed with no systematic failure and the interview tripwire RETIRED (the researcher ratified same day); Method D returned 49% turn ambiguity, which under the pre-registration means interviews behave like conversations. Record: `Inputs-to-Level-0/2026-07-24_method-s-vs-method-d-same-call-test.md` §RESULTS. The increment it fed was specced and discharged 2026-08-23. *(This line replaces a standing instruction that told the reader to run a test which is already complete; it is kept as a stop sign rather than deleted, so a reader who remembers the old instruction finds its cancellation here.)*

**Method D (automated diarization) — use when you want voice-based speaker separation from a mixed track** (more reliable than Q&A inference when the interviewer makes statements or the participant asks questions): run the diarize tool. It transcribes (mlx-whisper) + diarizes (pyannote) in one on-device pass, emitting a draft with graded-confidence speaker labels already applied:

```bash
mkdir -p ~/.claude/state/transcribe
DRAFT="$(mktemp -d)/draft.md"; echo "$DRAFT" > ~/.claude/state/transcribe/draft-path
../ladder-core/scripts/diarize/diarize-transcript "[recording_file_path]" \
  --model mlx-community/whisper-large-v3-turbo --language en --out "$DRAFT"
echo "diarized draft → $DRAFT"
```

The draft path is persisted to `~/.claude/state/transcribe/draft-path` because Step 5 (a separate tool call) must open it and `$DRAFT` will not survive the call boundary.

Then skip to **Step 5 → Method D** to map the two speakers to interviewer/participant.

**If Method D fails** (tool error, HF auth/license issue) or the diarizer mis-splits the two voices, fall back to the manual Q&A-inference path below for this recording and record the method change in the Note field — do not skip the recording or ship the tool's partial draft.

**Manual (Q&A inference):** transcribe with **mlx-whisper** (the Apple-native engine of record). **Do NOT use openai-whisper `--device mps` — it produces NaN logits and fails on this machine.** Use `mlx-community/whisper-large-v3-mlx` for difficult audio (heavy accent, background noise, poor microphone).

```bash
mkdir -p ~/.claude/state/transcribe
TRANSCRIBE_TMP=$(mktemp -d); echo "$TRANSCRIBE_TMP" > ~/.claude/state/transcribe/tmpdir-path
mlx_whisper "[recording_file_path]" \
  --model mlx-community/whisper-large-v3-turbo \
  --output-dir "$TRANSCRIBE_TMP" \
  --output-format srt \
  --language en
```

**Always use `mktemp -d` — never a fixed path like `/tmp/transcribe-interview`. A stale SRT from a previous session will produce a transcript of the wrong recording.** The `mktemp -d` path is written to the pointer file `~/.claude/state/transcribe/tmpdir-path` so Steps 4 and 9 (separate tool calls) can re-read it; the dir itself is still fresh every run, so the staleness guarantee holds.

**Output:** Whisper writes a `.srt` file to `$TRANSCRIBE_TMP`. The SRT filename matches the recording filename stem with a `.srt` extension.

If the audio is not English, replace `--language en` with the appropriate language code or remove it to let Whisper auto-detect.

mlx-whisper fetches the model on first use — ensure network access if it hasn't been downloaded. For a faster pass on clean English audio, `mlx-community/whisper-small.en-mlx` works well.

## Step 4: Read and Parse the SRT Output

Verify the output before reading — confirm the filename stem matches the input file. Re-read the temp-dir pointer first (`$TRANSCRIBE_TMP` from Step 3 is gone — separate process):

```bash
TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"
ls "$TRANSCRIBE_TMP"
```

If the filename does not match the input stem, stop and investigate before proceeding.

```bash
TRANSCRIBE_TMP="$(cat ~/.claude/state/transcribe/tmpdir-path)"
cat "$TRANSCRIBE_TMP/[filename].srt"
```

SRT format:
```
1
00:00:00,000 --> 00:00:08,500
Text of what was said.

2
00:00:08,500 --> 00:00:24,000
More text.
```

Parse this into transcript segments. Use timestamps only internally — to track flow and support speaker attribution in Step 5. Do not carry timestamps into the L0 file body.

**Anti-fabrication rule — scan for Whisper hallucination-at-silence before labeling** — full canonical procedure: `../ladder-core/scripts/diarize/README.md` → **Shared L0 doctrine → ASR honesty**. In short: remove confirmed repeated-line/boilerplate injections; where unsure, keep the text and mark `*[possible transcription artifact]*`; record removals in the Note field. Never add, complete, or smooth speech the audio does not contain.

**Merge SRT segments into turns deterministically** — full canonical rule: diarize README → **Shared L0 doctrine → Deterministic segment merge** (Method D's tool applies a simplified attribution-only merge — it does NOT split on >2s pauses; apply the pause split to Method D drafts during mapping). In short: concatenate consecutive same-speaker segments; new turn on a speaker change or a gap > ~2s; never split a continuous run sentence-by-sentence.

## Step 5: Apply Speaker Labels

**Method D (automated diarization):** Open the draft the tool wrote in Step 3 — its path is in the pointer file (`cat ~/.claude/state/transcribe/draft-path` gives the path; Read that file). It has two diarizer speakers (`SPEAKER_00/01`) with a talk-time / first-appearance stub and graded labels already applied. Map them: the speaker with more talk time and longer narrative turns is the **participant**; the one asking the questions is the **interviewer** — the Q&A pattern confirms which is which. Replace the placeholders with the roster names from Step 2, keeping the tool's confidence markers (`**Name:**` / `**Name?:**` inferred / `**[Speaker]:**`); review every turn marked `?` or `[Speaker]`, honor the tool's ambiguity tally / review flag, and carry the tally into the Note field. The draft also carries a **hallucination-scan line** (and, when nonzero, a `## Hallucination scan` table — deterministic detection only; the tool never removes text): disposition each flagged row — remove confirmed hallucinations, mark `*[possible transcription artifact]*` where unsure, record removals in the Note field; **if you CONFIRM a repeated-line (repeat-run) flag, the README's `--no-condition` trigger has fired — say so** (full procedure: diarize README → **Shared L0 doctrine → ASR honesty**). **Compute `attribution_status`** per `TranscriptFormat.md` → Attribution Status — the tool's turn-based tally gives the *ratio* limb only; also set `unresolved` if any turn you mapped is `**[Unknown Speaker]:**` (a voice not on the roster — the tool cannot detect this limb) — and set it in the frontmatter; an `unresolved` file must not proceed to L1 until labels are corrected, by the user listening to each flagged turn (you may suggest, not settle; `TranscriptFormat.md` → Attribution Status). Then continue to Step 6.

**Manual (Q&A inference):** Whisper does not produce speaker labels. Infer them from Q&A structure using the speaker roster confirmed in Step 2:

- Short questions and topic transitions → interviewer name(s)
- Longer narrative responses → participant name

Format: `**Name:**` — bold the name, not the response text. One blank line between speaker turns.

**REQUIRED on this path — sign it (ruled 2026-08-23):** a Q&A-inferred file carries `attribution_method: qa-inference` plus `attribution_attested_by: [your name]` in the frontmatter. **Both or neither.** The attestor is the person who read the Q&A structure and assigned these labels — never a tool or a model, because that is a claim only a human can make. This is **provenance, not a gate**: it does not block L1 and does not imply `resolved`. It exists because these files omit `attribution_status`, and without it a confidently-wrong file carries no markers, computes 0% ambiguity downstream, and its inference becomes invisible. Uncertainty still gets marked turn by turn as usual. Rationale: `TranscriptFormat.md` → Attribution Provenance.

For stage directions or ambient notes, use italics: `*Julian joining shortly.*`

Where speaker identity is uncertain, use `**[Speaker]:**` and flag it in the Note field of the prose header.

If speaker labels were inferred (not manually verified), add to the Note field: `Speaker labels inferred from Q&A pattern — review before L1 extraction.`

**Unknown voice (not on participant list):** If a voice appears that was not in the Step 2 roster, use `**[Unknown Speaker]:**` for those turns. Flag in the Note field with the approximate time. Do not proceed to L1 extraction until the user identifies the voice.

## Step 6: Get Recording Duration

```bash
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "[recording_file_path]" 2>/dev/null | awk '{h=int($1/3600); m=int(($1%3600)/60); s=int($1%60); printf "%02d:%02d:%02d\n", h, m, s}'
```

## Step 7: Write the L0 File

Compose the full L0 markdown file following `TranscriptFormat.md` exactly.

**File naming:**
```
L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md
```

**Structure:**
1. Lean YAML frontmatter (5 fields: participant, date, interview_type, location, synthesis_level: L0 — **Method D files add a 6th, `attribution_status:`**; **Q&A-inference files instead add `attribution_method: qa-inference` + `attribution_attested_by:`**, computed in Step 5; see `TranscriptFormat.md` → Attribution Status)
2. Prose header (# Interview Transcript — Name, then Date / Participants / Context / Location / Source / Note)
3. Speaker Key — bulleted list identifying every speaker's role
4. `##` section headers by topic throughout the transcript
5. Speaker turns as `**Name:**` with actual names, bolded

**Key formatting rules:**
- No timestamps — not used in this format
- Group short back-and-forth into natural exchange blocks
- Stage directions and non-verbals in italics: `*[inaudible]*`, `*[laughs]*`, `*[long pause]*`
- Retain filler words (um, uh, like, you know) — they carry signal
- If a pre-call debrief occurred before the participant joined, include it as `## Pre-Call — [Names] Debrief`

Write the file:

```
Write to: [output_directory]/L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md
```


### Delivery-annotation offer (optional — the window closes today)

If a researcher who was present is available today, offer the annotation pass: any turn whose delivery inverts its text (sarcasm, deadpan, hesitation)? Record per TranscriptFormat -> Delivery annotation and add the prose-header inventory line. Entirely optional — skip freely if no researcher is available or nothing needs marking. If the researcher keeps a session field-note file (FN_*, optional practice), its Delivery Notes may already hold same-day readings to transcribe here.

## Step 8: Quality Check

Before confirming completion, verify:

- [ ] YAML frontmatter present — 5 fields (6 with `attribution_status:` for Method D files; Q&A-inference files carry `attribution_method:` + `attribution_attested_by:` instead), `synthesis_level: L0`
- [ ] File named `L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md`
- [ ] Prose header complete — Date, Participants, Context, Location, Source (Note only if needed)
- [ ] Speaker Key present — every speaker listed with name and role
- [ ] `##` section headers used throughout — named by topic
- [ ] Speaker labels use actual names in bold (`**Name:**`); Method D files may carry `**Name?:**` / `**[Speaker]:**` — every such turn reviewed, none silently promoted
- [ ] Method D: `attribution_status:` computed and set in frontmatter; if `unresolved`, file flagged — do not hand to L1
- [ ] Q&A inference: `attribution_method: qa-inference` AND `attribution_attested_by: [a person's name]` both present — one without the other is invalid, and a model's name is never a valid attestor
- [ ] Whisper hallucination-at-silence scanned in Step 4; any removals noted
- [ ] Stage directions and non-verbals in italics (only where a source delivered them — Whisper doesn't emit them)
- [ ] No timestamps in transcript body
- [ ] Filler words retained *where the ASR delivered them*; note in the Note field if the engine smoothed disfluencies (absence of fillers ≠ preserved fillers — don't check blindly)
- [ ] Full transcript preserved — nothing filtered

## Step 9: Clean Up and Report

Remove the temp Whisper output (re-read the pointer — `$TRANSCRIBE_TMP` is gone; the `[ -n ]` guard prevents `rm -rf ""` from silently doing nothing on a lost pointer and, worse, guards against ever expanding to a bare `rm -rf`):

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
L0 transcript written: [output_directory]/L0_[FirstName]_[LastName]_[YYYY-MM-DD]_transcript.md
Duration: [HH:MM:SS]
Model: mlx-whisper [model]
Speaker labels: <Method D — diarized / inferred from Q&A / manually applied>
[If Method D:] Attribution: [X] confident, [Y] inferred (Name?), [Z] unknown ([Speaker]) of [T] turns — attribution_status: [resolved/unresolved]
<If attribution_status: unresolved:> ⚠️  Speaker labels not fully confirmed — review before l1-findings-extraction.
Ready for l1-findings-extraction.
```
