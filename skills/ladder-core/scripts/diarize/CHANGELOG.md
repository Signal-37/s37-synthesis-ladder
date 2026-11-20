# diarize tool — Changelog

The tool is load-bearing for `l0-transcribe-conversation` and `l0-transcribe-interview` (Method D) and its README carries the canonical Shared L0 doctrine — but it sits outside the skill-audit machinery (no validator/guardrails coverage). This CHANGELOG is the tool-side record; doctrine edits happen HERE, not in the skills.

---

## 2026-10-28 — Third model licence (community-1); setup uses uv's managed Python

**Type:** Setup and documentation fixes, reported by an independent tester against ladder v1.0.1 and v1.1 (2026-10-28). No change to transcription, diarization or dedup behavior.

- **The third gated model.** pyannote.audio 4.0.7's `SpeakerDiarization` pipeline loads its segmentation, embedding and PLDA from `pyannote/speaker-diarization-community-1` (`pipelines/speaker_diarization.py`, the constructor defaults), so `speaker-diarization-3.1` alone is not enough. A Hugging Face account that accepted only the two documented licences gets `GatedRepoError 403` on community-1. The tester hit it on a clean account (v1.0.1) and an automated release test reproduced it on v1.1 with a fresh Hugging Face account. Our own runs never did, because licence acceptance belongs to the Hugging Face account: the author's model cache has held community-1 since 2026-06-04. The README, `setup.sh`'s licence message and the model-load error now name all three.
- **`setup.sh` builds the venv with `--python-preference only-managed`**, so it uses uv's own CPython 3.12 and never a Homebrew or system Python on PATH. The tester's account picked up `/opt/homebrew/opt/python@3.12` before this. An existing venv is reused as before; the change applies on a new build or `--force`.

---

## 2026-09-22 — Runs on a clean install: `PAI_DIR` fallback, setup wording, torchcodec note

**Type:** Portability fixes (the researcher's portable-ladder rulings, 2026-09-22). No change to transcription, diarization or dedup behavior.

- `diarize_transcript.py` and `setup.sh` fall back to `~/.claude` when `PAI_DIR` is unset. Before, `setup.sh` aborted on `${PAI_DIR:?}` and the tool exited unless `HF_TOKEN` was already exported. Proven on a clean macOS account: `setup.sh` looked for the token in that account's `~/.claude/.env`.
- `setup.sh`: the token check also accepts `HF_TOKEN` in the environment; its warning says Method S (`tracks-transcript`) does not need a token; "Test with" names both entry points.
- README: the token line states the fallback; a new "Expected noise" line says the ~40-line torchcodec warning on every Method D run is harmless (the in-memory-waveform decode of 2026-08-21 never uses torchcodec's decoder).
- Clean-account tests (the portable ladder edition): Method S and Method D both run; on the same clips the live tool gives the same words, ordering and ambiguity.

---

## 2026-09-15 — Class B intra-segment loop cap widened 5 → 12 words (`LOOP_PHRASE_RANGE`)

**Type:** Detection change in `scan_hallucinations` Class B; no change to Class A, Class C, `scan_document`, dedup or attribution. Commissioned by the researcher 2026-09-15 from the recorded-not-commissioned candidate in `Inputs-to-Level-0/2026-08-26_within-segment-repetition-blind-spot.md`.

**The defect, stated more precisely than the 08-26 note did.** The note said neither scan axis looks inside a segment. Class B does; it was capped at phrases of 2–5 words. The 2026-08-26 two-speaker Method S run looped the 8-word phrase "it's time to put it back in time" 36× inside one segment on the silent track (and 7× in another) and scanned as 0 flags: the cap was the phrase LENGTH, not the repeat count. Reproduced 2026-09-15 with synthetic segments through the function: 8-word ×36 → `None`; 8-word ×7 → `None`; 4-word ×3 control → `loop(p=4)`.

**The change.** `LOOP_PHRASE_RANGE = (2, 12)`. `LOOP_MIN_REPEATS` stays 3, so a twice-said sentence still never flags.

**Tests.** `test_intra_segment_loop_long_phrase_2026_08_26` (8 words ×36 and ×7 must both flag `loop(p=8)`) shown FAILING on `(2, 5)` before the constant changed, then green; `test_intra_segment_loop_long_phrase_zero_fp_controls` (emphatic "no, no, no, no"; a long phrase said twice; a long non-repeating clause → all `None`) green before and after. Suite 109/109.

**Calibration against the retained corpus (the note's condition for adoption).** Every `L0_*.md` in the vault (53 files, 7,624 turns; project copies and processed copies both counted) scanned turn-by-turn under `(2, 5)` and `(2, 12)`: loop flags 24 and 24, identical sets, all at p=2 or p=3. **The widening introduced zero new fires on real speech.** The 24 pre-existing p=2/3 fires are stammers ("I had no, I had no, I had no") and repeated-token runs already marked as artifacts in their L0s; they are the existing Class B profile, unchanged by this entry and outside its scope.

**Real-artifact confirmation: NOT OBTAINED, and the reason is itself a finding.** Method S re-run 2026-09-15 on the retained 08-26 tracks (same model, `whisper-large-v3-turbo`, `condition_on_previous_text=False`, 2,342 s transcribe time): 729 segments, 355 turns, 9 flags, all Class C `"Thank you."`; **zero occurrences of "put it back in time" anywhere on either track.** The 08-26 loop did not recur. So the decoder's silent-track hallucination on this input is STOCHASTIC across runs (the 07-24 "Yeah." collapse, which WAS byte-identical across reruns, is a different case), and the raw segments from the original run were never retained, so the widened scanner's catch on the real artifact rests on the synthetic reconstruction in the test (the exact phrase, the exact repeat counts, from the 08-26 note), not on a re-decode. Two consequences: (1) a re-run is not a reproduction instrument for this hallucination class; the scan on the ORIGINAL pass is the only place it can be caught, which is the argument for the scanner in the first place; (2) the original run's raw segment list would have been the fixture, and it was not kept. Recorded, not actioned: whether `tracks-transcript` should keep its raw per-track segments beside the draft is a design question for the parked increment, not this entry.

**Not done, by design.** Candidate 2 of the same note (natural-end reporting) has no design and is untouched.

## 2026-09-13 — Symmetric-suppression GUARD built (`dedup_pass`); the P03 fixture now pins the guard

**Type:** Behavior change inside the dedup pass — the first since commissioning. Suppression decisions are untouched; the guard only ever adds a marked copy back. Trigger: the pre-registered rule in the spec's 2026-09-01 addendum (a second session with a real loss moves the guard from review item to build) fired at P04 on 2026-09-10 (two utterances lost, both restored by hand); connection-pass flag `2026-09-11-1`; the researcher's ruling at the 2026-09-13 review: build it before P05.

**The rule as shipped.** The words of every suppressed copy must survive in some kept copy. For any two suppressed copies on opposite tracks that share a run of ≥3 content tokens and overlap or sit within 1.0 s of each other (`GUARD_SLACK_S`), the shared run is looked up, position by position, in every kept partner of either copy (formal pairs and near-adjacent shared runs alike, on the matcher's own terms — never literal text, which the spec correctly ruled out). If ≥2 of those tokens (`GUARD_MIN_LOST`) appear in no kept copy, the warmer copy (then more tokens, then earlier track) is restored **in full** — a verbatim transcript copy, never a splice — prefixed `⚠ DEDUP-RESTORED (symmetric suppression — both copies lost; own margin … , partner …)`, logged as `restored (symmetric)` (both original suppression rows stay in the log), counted in `counts["restored"]`. Detail actions become `restored` / `suppressed (symmetric)` so `lag.py` calibrates on neither; the lag hint still renders inside the restore marker. Draft: a `**Dedup guard:**` line whenever anything was suppressed (`clean — every one of the N suppressed copies has a surviving duplicate`, or a ⚠️ callout with the count); the Attribution tally lists restored turns for the ear. Zero suppressions → no line (the Zoom no-op contract, test 7, holds byte-for-byte).

**Two simpler designs were built first and rejected on the test bed the same afternoon** — each caught P04's 08:27 and missed 08:09/08:11:
1. The spec's structural invariant ("no suppressed copy's winning partner was itself suppressed"). Per-copy margins make every partner of a suppressed copy a winner, so this reduces to "some partner survives", and at 08:09 a partner did survive — carrying only the copy's head.
2. Pair-only coverage of the shared run. The two lost copies (tx1 489.10–493.18, tx2 491.84–495.50) overlap 1.34 s where pairing needs 1.83 s (50% of the shorter), so they were never a pair; each lost to a different kept neighbour that covered only its head or only its tail. The five shared tokens survived nowhere. Found by replaying the captured session inputs (a scratch driver that wraps `dedup_pass`; nothing added to the tool).

**Validation on the test bed (known data, both shared-air sessions, end to end through `tracks-transcript`):**
- **P04 (57:45):** resolved 536 / ambiguous 205 / Class D 289; guard **2 restores — 08:11 (tx2, −9.7 dB) and 08:27 (tx2, −10.2 dB), exactly the two the 09-10 hand scan found, same track, no others.** Wall 4:20.
- **P03 (46:32):** 455 / 35 / 213; guard **2 restores — 25:49 (tx1, −7.6 dB; the fixture case, the same copy the 09-01 hand restore chose) and 09:21 (tx1, −7.6 dB): one of the interviewer's questions appears in no kept turn of this decode** (the kept tx2 fragment carries only its last five words). A third real instance, on a decode that differs from the 09-01 run (456 suppressions then; decode nondeterminism is on record, 08-23 entry) — whether the 09-01 draft had it cannot be settled from here and does not matter: the guard's claim is about the draft it ships in.

**Tests (`test_tracks.py`, 107 total, all green):** 8b flipped from pinning the defect to pinning the guard (one survivor, tx1, marked; resolved 1, restored 1); 8c synthetic mutual pair; 8d silent on ordinary suppression; 8e no-op under `resolve=False`; 8f detail actions leave lag calibration; 8g chain shape; 8h its control (a kept copy covering the run → nothing restored); 8i the P04 near-adjacent geometry (bounds and energy shape kept, tokens substituted); 14/14b the draft header, tally and log row, plus the clean-line control. Every new test was run against the build it was written to catch and shown failing there before the fix (8b–8f against the unguarded pass; 8g against the winner-invariant build; 8i against the pair-only build).

**Not harvested, on purpose:** fixtures from P04 or P03 09:21 — those are participants' words, and the S37 consent keeps the working corpus on S37 systems; the synthetic geometries in 8g/8i stand in. **Not built:** any change to the 6 dB floor or rounding; auto-resolution; a spliced partial restore (the ear trims the full copy). **Docs the same session:** README (Method S block), `PAI/Reference/DESK-CARD_Insta360-Method-S.md` §2 (manual log scan → header check), `l0-transcribe-interview/workflows/Transcribe.md` Step 3 item (2), the dedup spec and the P03 evidence note §5 (✅ AS-BUILT blocks).

---

## 2026-09-10 — Arrival-lag HINT on ambiguous copies (`lag.py`); suppression unchanged

**Type:** New sibling module + bookkeeping hook. **No decision changes** — every suppression and every ambiguous mark is exactly what the energy pass produced; the hint is an extra column, an extra header line, and an extra clause inside the ambiguity marker. Commissioned by the researcher 2026-09-10 after the P04 arrival-time test ("While not a silver bullet, it seems this should be added to the tool"); research note `PAI/Research/2026-09/2026-09-10_shared-air-transcription-methods.md`.

**What it measures.** With one worn mic per speaker, the event reaches the speaker's own mic first (≈5 ms at 1.75 m). `lag.py` band-passes both 16 kHz tracks (300–3400 Hz), takes the normalised cross-correlation over each duplicate copy's own span (±25 ms around a coarse clock offset), fits the two recorders' clock offset, drift and arrival delta on the session's own confident copies (suppressed + their kept partners, where energy already named the speaker), and names the owner of each ambiguous copy by the sign of its residual lag. Copies under 0.3 s get `n/a`; peaks under 0.15 are marked `weak`.

**Where it shows.** `**Lag hint:**` header line (offset, drift, Δ, calibration agreement, counts); a `Lag hint` column at the END of the Dedup log (existing columns untouched); the marker becomes `⚠ DEDUP-AMBIGUOUS (margin +1.7 dB · lag →Label (0.32))`. Emitted only when the dedup pass resolved a 2-track session and found duplicate pairs — the Zoom zero-match no-op contract is preserved byte-for-byte. `--no-lag` switches it off; any audio-read failure disables it with the reason in the header, never the run. Memory: the 16 kHz s16 samples of both tracks are held until the pass (≈110 MB per hour per track), then dropped.

**Validation on the test bed (known data, before any live session):**
- **P04 (57:45, ≈2 m):** counts identical to the morning run (538/205/289); clock offset +20.2 ms, drift −0.2 ms/h, Δ 5.1 ms, calibration agreement 99.9% on 1,027 copies; hints agree with the researcher's ear-confirmed rulings on **158 of 184** ambiguous copies (85.9%; energy alone 83.7%; 23 weak). The 26 disagreements cluster where the copy's window also holds the interviewer finishing or echoing the answer — the lag reports the louder talker in the window, not the owner of the words. That is the documented failure mode and the reason this is a hint.
- **P03 (46:32, ≈1 m):** 458/36/207 (the 09-01 run read 456/35/212 — decode nondeterminism already on record in the 08-23 entry); offset +4.4 ms, Δ 4.5 ms, agreement 100.0% on 909; **20 of 36 hints weak**; against a key derived from the final L0 (speaker whose turns carry the copy's words; 4 skipped as echo/short) the hint agrees on **23 of 32** (72%). Closer seating means smaller Δ and more two-voice windows; the `weak` rate is itself the signal that a session will need the ear.

**Tests:** `test_lag.py` (4: lag sign on a synthetic two-mic pair, short-span `n/a`, calibration recovers offset/drift/Δ, `detail` hook changes no decision). Suites: test_tracks + test_diarize **94/94**, test_lag **4/4**.

**Not built, on purpose:** auto-resolution on energy+lag agreement (would have let ~1 in 10 agreed answers through that the ear overturned on P04); the symmetric-suppression guard (separate ruling, now at two instances and due to build); any change to the 6 dB floor.

---

## 2026-09-01 — Symmetric-suppression defect found in the field; pinned by fixture, guard NOT built

**Type:** Defect discovery + regression fixture. No behavior change — the pass runs exactly as before.

**The defect.** First real shared-air session (P03, Insta360 rig, 46:32): in 456 suppressions, ONE utterance was deleted entirely. Two differently-bounded copies of the same question straddled a speaker handoff; the energy field flips mid-span at the handoff, so each copy measured cold over its OWN span (−7.6 / −12.3 dB) and each was suppressed in favour of the other. The draft carried no trace and no warning. This is the counterexample to the safety claim the spec ships default-ON under ("every suppression is re-run-recoverable"): recoverable is true, silent is the problem — the per-copy semantics that make the echo case safe by construction do NOT guarantee a surviving copy when the copies' spans disagree. Found structurally (two suppressed log rows at one timestamp with opposite kept/lost labels), so the one-in-456 count is a census, not a sample. Detection was downstream and human: the deleted line was the interviewer's question, noticed only because an adjacent ear-disposition would have struck its last fragment.

**What shipped:** `fixtures/dedup_symmetric_suppression.json` (harvested from the session audio via the shipped 16 kHz energy path; construction details in its `_provenance` — the tx1 span is solved against the real envelopes to reproduce the logged geometry, because a window re-decode bounds the segment differently and lands ambiguous) + `test_tracks.py::test_8b_known_answer_symmetric_suppression`, which deliberately pins the DEFECT (both copies suppressed, zero survivors). Suites: tracks 49/49, diarize 45/45.

**What did NOT ship, on purpose:** the guard — a post-pass assert that every suppressed text still has a surviving copy, warning in the draft header when not. That is a spec-review item (evidence: `Inputs-to-Level-0/2026-09-01_p03-run-evidence/ambiguous-and-residue.md` §5), and building it in the field, the same day, against n=1, is the move the machinery discipline exists to prevent. When it lands, flip test_8b's final assertions from pinning the defect to pinning the guard.

**Same-session context recorded for the next calibration review:** minimum observed suppression margin 6.0 dB (exactly on the band floor; two suppressions inside the 1.1 dB headroom under the calibrated worst-correct margin of 7.1 dB), and a measured 10%-of-turns / 2.2%-of-words bleed residue from decode-boundary mismatch that the pairwise overlap test cannot see. Both are findings about constants and coverage, not regressions.

---

## 2026-08-23 (later) — Capture type is now DETECTED from provenance markers; `--capture` becomes an override

**Type:** Follow-on to the entry below, after the researcher corrected two things: the scoping was NOT automatic (it needed a flag nobody would remember on a direct invocation), and the claim that only one Zoom folder existed to check against was wrong.

**The correction that mattered.** The previous entry said filename detection would be "n=1 on each side." **There are three Zoom recordings on disk** (2026-07-24, 2026-07-30, 2026-08-21), and their signature is identical across all three: a `recording.conf` carrying a `magic_number`, and every per-participant stem ending in the same meeting id as the combined mix. That is n=3, consistent, and it is what made a detector defensible rather than a guess.

**`detect_capture(inputs, tracks)`** — reads provenance markers, never the audio:
- **Zoom / network-separated:** `recording.conf` beside or above the tracks, **or** all stems sharing a ≥9-digit meeting-id suffix.
- **Insta360 / shared-air:** all stems carrying the `-tx<N>_orig` wearer marker.
- **Neither → `None`, and the tool does not guess.** It assumes shared-air (safety net on) and, **only when that assumption actually changed the output** — i.e. the pass produced ambiguous flags — emits a `CAPTURE TYPE UNDETERMINED` block in the draft asking for confirmation. The researcher, 2026-08-23: *"you could also ask."* Asking only when the answer matters keeps it from nagging on clean input.

`--capture` still exists and **always wins**; the draft records which applied and says so when a declaration overrode a detection.

**A real bug the battery caught, worth recording because reading would not have found it.** Marker 2 first compared each stem's whole trailing digit run. Those runs **differ**, because the participant index sits immediately before the meeting id (`audioJScottKing1` + `9876543210` vs `audioparticipant2` + `9876543210`). The comparison therefore never matched, and the three real folders were passing on `recording.conf` alone — the second marker was decorative. Fixed to compare the longest common **suffix** of the digit runs. **A folder with per-participant stems but no `recording.conf` would have gone undetected, silently.**

**Verified against every real folder on disk, not just fixtures:** all three Zoom recordings → `network-separated` (via `recording.conf`); the 05b Insta360 rig → `shared-air` (via the wearer marker); a hand-made folder → `None`, undetermined, not guessed. **End-to-end on the real 08-21 P01 tracks with NO flag passed:** detected Zoom, dedup did not run, **5 ambiguous flags → 0**, no undetermined block.

**Tests: Method S 43 → 48.** Includes the control with teeth — `test_13c` forces the WRONG `--capture` on each shape and asserts the tool obeys the operator and says it is overriding; without it, detection could be hardwired and every other new test would still pass. Method D unchanged at 45.

**Observation recorded, not a defect of this change:** the same tracks transcribed three times produced **1268 / 1284 / 1255** segments (original 08-21 run, and the two runs here). Segment counts are produced by the decoder before any capture or dedup logic, and dedup did not run in either of the new runs, so the variation is upstream — the temperature-fallback non-determinism this CHANGELOG already documents for conversational audio. **Note the asymmetry: Method D on the continuous mix DID reproduce byte-identically earlier the same day.** Per-participant tracks are ~50% dead air, which is precisely where fallback fires. Any future byte-identity claim should be scoped to Method D, not asserted for Method S on real conversation.

---

## 2026-08-23 — Dedup's ambiguous-flag scoped to SHARED-AIR capture (`--capture`); acoustic auto-detection built and rejected on evidence

**Type:** Scoping fix, ruled by the researcher after the five 2026-08-21 P01 dedup-ambiguous segments were dispositioned. Disposition + measurements: `PAI/Projects/Deferred/Inputs-to-Level-0/2026-08-21_p01-run-evidence/2026-08-23_dedup-ambiguous-disposition.md`.

**The finding.** The dedup pass's first live outing on a ZOOM recording flagged 5 segments ambiguous. **All five were genuine speech.** The paired texts are not the same utterance twice — they are *different sentences sharing a phrase* (the participant repeating the interviewer's wording back), which clears the matcher's `RUN_MIN = 3` shared content tokens easily. Cross-track correlation on those spans is **0.027–0.072**, against **0.245–0.466** on the 05b known bleed spans.

**The mechanism, stated once:** bleed is a SHARED-AIR phenomenon — one room, several mics, everyone's voice on every track. **Network-separated capture (Zoom's per-participant streams) has no shared air, so a cross-track text match CANNOT be bleed by construction.** Every ambiguous flag on that input is necessarily a false positive. The pass was built for the Insta360 rig and made default-ON for Method S generally on 2026-08-15; its Zoom safety argument was `test_7_zoom_noop_contract`, which pins byte-identity **"on separate-track input with no cross-matches"** — and this was the first live Zoom recording that produced cross-matches. The contract held only because conversation had not been tested against it.

**Code:** `--capture {shared-air,network-separated}` on `tracks-transcript`. On `network-separated` the dedup pass does not run — no suppressions, no ambiguous flags — and the draft's Dedup provenance line says so in those words. **Default is `shared-air`, the fail-safe direction:** forgetting the flag keeps the safety net on and costs a few false flags; the reverse would silently disable bleed handling on the rig that needs it, which is the forgotten-toggle failure mode this tool already names for `--no-dedup`. An explicit `--no-dedup` is never masked by the capture declaration.

**DECLARED, NOT DETECTED — and that is on evidence, not convenience.** Acoustic auto-detection was built and measured against both poles before being rejected:
- **Whole-file cross-correlation does not separate the classes at all:** shared-air known positive **0.0383**, network-separated **0.0117 / 0.0190**.
- **Span-level correlation separates 6 of 7 known bleed spans cleanly** (0.245–0.466 vs ≤0.072) — **but the 7th reads 0.0341, inside the network-separated range.** Gating on it would suppress the warning on real bleed. That is the dangerous direction, so the mechanism was dropped rather than tuned.

The known positive that made this checkable is the 05b test recording (`Vault_Two/Audio-tests/05b-test/`, 7 ground-truthed bleed spans). Without it this would have been a threshold picked from one side of the data — the same trap the `no_speech_prob` item fell into three entries below.

**Tests: Method S 39 → 43.** `test_12` (network-separated does not flag conversational echo), **`test_12b` the control with teeth** — the SAME input under the default DOES flag, without which `test_12` is equally satisfied by a build that broke dedup outright — `test_12c` (default is shared-air), `test_12d` (`--no-dedup` still wins and names its own reason). Method D battery unchanged at 45; `check.ts` green.

**Verified on the real recording, not only in fixtures:** re-running the actual 08-21 P01 tracks with `--capture network-separated` takes the draft from **5 ambiguous flags to 0**, with both echoed utterances still present on their own tracks.

**Point of use:** both L0 workflows now instruct the declaration at the `tracks-transcript` invocation. The interview workflow's standing tripwire — which still told the reader to run the n=2 Method S vs Method D comparison — was **discharged 2026-08-21** and is replaced by a dated stop sign rather than deleted, so a reader who remembers the old instruction finds its cancellation.

---

## 2026-08-23 — `no_speech_prob` boilerplate gate CLOSED as a negative result; FP-budget exception re-sized 1-2/session → 21/session

**Type:** Queued increment candidate closed by measurement, not built. Record: `PAI/Projects/Deferred/Inputs-to-Level-0/2026-08-23_b0-harvest-evidence/RESULT.md`.

**The queued fix, carried since 2026-07-23, rested on this sentence:** *"gate short-boilerplate hits on per-segment `no_speech_prob` — genuine gratitude sits on real audio, hallucinated sits on silence; the one signal that separates what text cannot."* **The second half is false, and is now measured.**

**Adjudication first (the researcher, by ear, 2026-08-23):** all 21 bare `"Thank you."` Class C flags on the 08-21 P01 Method S draft are **HALLUCINATED** — including the 76:01/76:03 sign-off pair, which the spec had guessed from position were the likeliest genuine ones. The guess was wrong; the listening pass was the point.

**Then the harvest, across all four per-participant tracks of both recordings, conditioning-off (the shipped default), 55 Class C flags:**

| | |
|---|---|
| `no_speech_prob` min / max | **5.994e-13 / 3.889e-10** |
| flags above whisper's own 0.6 silence gate | **0** |
| flags above 1e-6 | **0** |

**The decoder is overwhelmingly confident it is hearing speech at the exact moments it hallucinates.** Two mechanisms: (1) `DECODE_PARAMS["no_speech_threshold"]` is 0.6 and whisper enforces it internally, so anything silence-like was dropped *before the flagger ever saw it* — every survivor has already cleared that filter by construction; (2) a hallucinating decoder is a *committed* decoder, and `no_speech_prob` measures confidence, not correctness. **The 2026-07-23 three-chair QATester seat predicted mechanism (1) explicitly; the measurement confirms it.**

**CLOSED under the pre-registered rule** (the researcher, Q1, fixed before any number existed): if no threshold separates the populations, the item closes as a published negative result rather than becoming a threshold hunt.

**Two things survive the close and are the durable output:**
- **The FP-budget exception's SIZE is corrected.** The 2026-07-23 entry priced this class at *"a known, accepted ~1–2 per session (×tracks) benign flag"* and justified the waiver on the cost of "one human glance." **The measured figure on a 76-minute interview is 21 in one session, every one noise.** The exception stands; its stated size does not. Read the 07-23 line with this correction attached.
- **The exception's PREMISE is vindicated, and it is why the strict rule mattered.** It was unclear whether a genuine sign-off flagging had ever been observed or was merely assumed. It is now observed: on the 07-24 call, Zoom (independent engine) attests *"we'll talk to you later. Thank you. Appreciate it."*, which the tool splits into a bare `"Thank you."` and flags Class C. **Genuine flags are real — so the suppress-everything gate that the P01 data alone would have scored as perfect would have been actively harmful.** The zero-true-positive-loss ruling is what caught it.

**Honest limits, recorded:** the genuine population did not reproduce under conditioning-off, so the genuine side is *unmeasured* rather than measured-and-overlapping — the conclusion does not depend on it, since the gate needs hallucinated flags to look silence-like and they do not. The P01 re-run produced 23 Class C flags where 21 were adjudicated (decoder non-determinism on conversational audio, already on the record); timestamp matching mapped the 21 and the 2 extras change nothing. And a first pass printed every value as `0.0000` and read as "the field is inert" — a `%.4f` formatting error on numbers of order 1e-12, caught by testing the field directly on a real slice instead of trusting the summary.

**Any future attempt at this noise is a NEW item with a NEW signal.** Nothing in the measurement points at a replacement.

**No code changed. `test_bare_thank_you_flags_EXPECTED_recall_favoring_exception` stays exactly as it is** — its docstring says "the surgical fix is the queued `no_speech_prob` gate," and that sentence is now superseded by this entry rather than by an edit to the test.

---

## 2026-08-23 — Step 2 increment, part 1: turn-collapse scan + speaker-balance scan (items A and C, three-chair spec)

**Type:** Feature increment. Spec: `PAI/Projects/Deferred/Inputs-to-Level-0/2026-08-23_diarize-step2-increment-three-chair-spec.md` (Architect / Engineer / QATester, independent, the researcher ruled all five open questions the same day). Both additions are Method D only, pure, and flag-never-mutate.

**Probe A0 ran FIRST and changed the design — it was not a formality.** All three chairs refused to name a metric for item A until one unmeasured fact was checked: are the speaker changes Method D absorbs *missing from pyannote's raw output*, or *present in it and lost downstream in `assign()`*? `turns` is computed at the top of `main()`, consumed, and never printed, so nobody had ever looked. A0 (diarizer only, no transcription, nothing written) measured both known-collapsed recordings:

| | 08-21 P01 | 07-24 call |
|---|---|---|
| raw pyannote turns | 990 | 2096 |
| **raw speaker CHANGES** | **481** | **621** |
| Method S real turns | 557 | 700 |
| changes ÷ real turns | **86.4%** | **88.7%** |
| Method D emitted turns | 81 | 152 |

**The boundaries are PRESENT — the collapse is entirely downstream.** That killed the density-heuristic design and licensed an exact one: `preserved = emitted_turns − 1`, `absorbed = raw_changes − preserved`. Measured 401/481 (83%) and 470/621 (76%). It needs no Method S ground truth, so it works on exactly the runs where Method D is the only method available.

**Code:**
- **`scan_turn_collapse(raw_speaker_changes, emitted_turns)`** + `count_speaker_changes(turns)` — reports changes the diarizer found against changes the draft can show. Dual-condition (`TURN_COLLAPSE_ABSORBED` 0.25 + `TURN_COLLAPSE_MIN_CHANGES` 20), mirroring `scan_document`'s share+count shape. The count floor was **found by the battery, not by reading**: without it, `scan_turn_collapse(1, 1)` is 100% absorbed and fires a meaningless warning.
- **`scan_speaker_balance(talk_by_speaker)`** — speakers below `LOW_TALK_SHARE` (0.02) of total talk. **The denominator is fixed in the source, in writing:** share is of total detected TALK TIME, never wall clock. The "1.1%" recorded for the 07-30 artifact is the wall-clock figure; against talk time the same speaker is 1.27%, and a floor near this value discriminates differently under the two readings.
- Mapping table gains a **Share** column (checked first: no downstream parser reads that table positionally — only a human does, via the workflow). Tally gains an unconditional `speaker changes detected · preserved as turn boundaries` line.
- Both thresholds carry **UNCALIBRATED / n=1 / n=2 notices in the source**. There is still no healthy real Method D run in the corpus — every one on record failed — so the cut between the last true collapse and the first true non-collapse remains unbacked on the negative side.

**Verified end-to-end on the known positive, not just in unit tests.** A full Method D run on the 08-21 P01 mix: the TURN COLLAPSE line fires with exactly A0's numbers (481 / 80 / 401 / 83%); the Share column renders (17.4% / 82.6%); **the speaker-balance scan correctly stays SILENT** — a real negative, since both speakers are far above the floor. The run also reproduced the original 08-21 draft exactly — 755 segments, 81 turns, 49% ambiguity, 1 hallucination flag — and **the transcript body is byte-identical to the 08-21 draft (72,968 chars both)**, so the new diagnostics demonstrably flag without mutating, and the pipeline reproduces across a month and a decode-path repair.

**Batteries: Method D 30 → 45, Method S 39/39 unchanged, `check.ts` green.** Controls included per item: a blanket-pass control (an always-fires implementation fails the healthy fixture; a never-fires one fails both real positives), a mutation control at both threshold extremes, and for item C the discriminating negative — a legitimate quiet third speaker at 8% — without which a diagnostic implemented as `if len(speakers) > 2: warn` would pass every other test.

**Residual closed for free:** the 08-21 note "diarize ran ≈3.6× the 07-24 rate per audio-minute — observed, not investigated." A0 re-ran the same path at 205.9 s (76 min) and 264.8 s (100 min), in line with the original 298 s. The 1071 s figure was the `ffmpeg@7` + `DYLD_FALLBACK_LIBRARY_PATH` crutch in use that morning; the same-day `load_waveform()` repair removed the slowdown along with the torchcodec dependency. CLOSED, explained, no action.

**NOT in this entry, and why:** item B (`no_speech_prob` gate) is blocked on B0, an adjudication only the researcher can do — 21 boilerplate flags on the 08-21 Method S draft, never individually labelled; worksheet at `2026-08-21_p01-run-evidence/2026-08-23_B0-boilerplate-adjudication-worksheet.md`. Item D's Method D leg is **permanently closed** by the researcher's Q4 ruling (diagnostics stay pure and cadence-guarded, so no re-decode); its Method S leg awaits the Q2 regeneration run. Item E is declined. Item F is a doctrine ruling, not code.

---

## 2026-08-21 — Method D decode decoupled from FFmpeg majors: pyannote now fed an in-memory waveform (researcher-commissioned repair, same day as the final-test interview run)

**Type:** Defect repair, no behavior change (byte-identical output certified below). Occasion: the final-Method-S-test interview run found Method D broken on the MacBook — Homebrew ffmpeg had moved to 9.0.1 and the venv's torchcodec 0.14.0 links only against FFmpeg 4–8, so pyannote's file decoder failed on every input. Drift-under-a-confirmed-result: last exercised 2026-07-30, invisible to the battery (stubbed, never decodes). Second seam found during the interim workaround: SIP strips `DYLD_*` across the wrapper's `/bin/bash` exec, so a library-path env fix only worked when `venv/bin/python` was invoked directly.

**Code change (`diarize_transcript.py`):** new `load_waveform()` reads `to_wav()`'s 16-bit mono PCM output with stdlib `wave` + numpy and hands `pipe()` pyannote's documented `{'waveform', 'sample_rate'}` dict (`/32768.0`, pyannote's own s16→float32 convention); `pipe(wav)` → `pipe(load_waveform(wav))`. torchcodec is no longer on the decode path at all — future FFmpeg major bumps cannot re-break Method D. Non-to_wav shapes (stereo, 8-bit) fail loud. Method S untouched (never loads pyannote).

**Verified, instruments named:** (1) battery `test_diarize.py` **30/30** (T9 added: exact PCM decode incl. ±full-scale and the 16384→0.5 half case; fail-loud control with teeth), `test_tracks.py` 39/39 untouched; (2) decode equivalence on real audio — 5-min slice of the 07-24 mix, `load_waveform()` tensor `torch.equal` to torchcodec's `AudioDecoder` output, max abs diff 0.0; (3) E2E through the WRAPPER, no `DYLD_*` var, on the full 76-min interview mix — draft **byte-identical (`cmp`)** to the same-morning pre-fix run (which had used the ffmpeg@7 + direct-python workaround). The interim `brew install ffmpeg@7` crutch removed after certification.

**Residual, named:** the Studio runs this same venv contract — if its Homebrew ffmpeg is still ≤8 it never broke; either way the fix reaches it on its next PAI repo pull, and Method D there is unverified until run once (capacity certifications don't transfer across machines). Full run record: `Inputs-to-Level-0/2026-07-24_method-s-vs-method-d-same-call-test.md` §RESULTS.

---

## 2026-07-30 — QA re-baseline RUN and RULED: `condition_on_previous_text=False` is now the METHOD S DEFAULT (the researcher ruling, same day)

**Type:** The default flip the 2026-07-24 entry deferred ("flipping it is a QA re-baseline, not this increment") — re-baseline executed and ruled in one session. Full pre-registration + results: `PAI/Projects/Current/Inputs-to-Level-0/2026-07-30_no-condition-qa-rebaseline.md` (pre-registered decision rule frozen BEFORE any divergence numbers existed; run evidence + adjudication windows in `2026-07-30_run-evidence/`).

**The re-baseline (two real-call fixtures, paired pinned/nocond runs, seeded 40-block adjudication samples):**
- **F1** = 07-24 two-party call (100 min), adjudicated against the Zoom cloud transcript (independent engine). Net substantive error delta **+1 sampled** (5 pinned-right / 4 nocond-right / 1 both-wrong / 30 tie).
- **F2** = 07-30 two-party call (64.5 min), adjudicated by isolated-window audio re-transcription + internal attestation. Net **0** (5 / 5 / 1 / 27).
- **The "package Steele" regression class is sized: net ≈ 0.** Errors flow both directions at ~equal rate. The asymmetry is *kind*: nocond's F2 misses were entity-class (the client brand→near-miss ASR spellings, "ActiveAdvance") while pinned's were function-word drops — but on F1 the entity direction REVERSED ("plot"→"claude" fixed by nocond). Entity fidelity under conditioning is non-monotone; the mandatory entity cross-check pass is the compensating control either way (it caught every instance in both shipped L0s).
- **Ruling context (the researcher):** "pinned carries an unpredictable destructive tail plus 2–3× flag burden plus ~2× compute; nocond carries a balanced, net-zero local-error rate and has never destroyed content in any observed run. This makes the case for me. My ruling is flip it." Recorded honestly: the pre-registered rule AS WRITTEN said REJECTED (a 7-word false-start drop fired the destroyed-content clause; F1's +5.9/hr extrapolation sat inside sampling noise); the note documents where the rule's letter and intent diverged, and the researcher ruled on the totality.

**NEW STRUCTURAL FINDING — pinned-default loop-collapse is STOCHASTIC:** the F1 pinned re-run did NOT reproduce the documented 07-24 catastrophe (flags 131 vs 128; the `"And making them less"` ×22 destroyed window came back clean; segment/turn counts shifted on identical audio). Mechanism: DECODE_PARAMS' temperature-fallback tuple — threshold trips in loop-prone windows retry with SAMPLING. The prior byte-identical determinism cert held only on clean fixtures where fallback never fires; conversational audio is not covered by it. Corollary: 07-24's destruction is a tail risk that recurs unpredictably under conditioning, and single-run error specifics are weak evidence.

**Also measured (07-30 session, feeding the parked increment):** the 2026-07-23 trigger OVER-FIRES — it detects the flag class, not the harm. F2's pinned loops were ADDITIVE (garbage beside intact speech, verified by isolated-window ground truth) where 07-24's were DESTRUCTIVE. Queued increment candidates, NOT built here: (1) destruction test for flagged windows (pure repetition vs repetition-beside-content); (2) Method D low-talk-time speaker over-split flag (the 07-30 mix run invented a third speaker holding 1.1% talk time — invisible to the ambiguity tally); (3) the `no_speech_prob` boilerplate gate (already queued 07-23).

**Code changes (`tracks_transcript.py` only — Method D untouched, pinned default retained on 2/2 counter-evidence runs):**
- Method S CLI: `--condition` restores the pinned baseline; conditioning-off is the default; `--no-condition` kept as a compatibility no-op; the pair is mutually exclusive (loud conflict).
- Engine provenance line now records the conditioning state in BOTH cases — a bare Engine line must never be ambiguous after a default change.
- **Battery: S 25/25 (21 + 4 new `ConditioningDefault` tests: default state, `--condition` restore, no-op compat, conflict), D 28/28 unchanged, doctrine-pointers green, `check.ts` full suite green.**

**Doctrine (canonical here, one-liners at point of use per the centralization rule):** README → ASR honesty rewritten — conditioning defaults are SPLIT BY METHOD; the 07-23 trigger now governs Method D and `--condition` runs only; trigger over-fire limit recorded; entity cross-check stays mandatory on Method S output. README → Method S usage updated. Point-of-use lines updated: `l0-transcribe-conversation/workflows/TranscribeConversation.md` Step 3 + Step 5 Method S disposition (a confirmed repeat-run on a default Method S run is silence hallucination to disposition, NOT a re-run trigger), `l0-transcribe-interview/workflows/Transcribe.md` Step 3, `l0-transcribe-conversation/TranscriptFormat.md` Method S.

**Cost basis for the flip, measured:** pinned-first burned 805s producing a discarded draft on the 07-30 call; flags 58→17 (F2) and 131→67 (F1); transcribe time −64% / −51%.

---

## 2026-07-24 — Pre-registered loop trigger FIRED; flagger 1-token blind spot closed; `--no-condition` shipped; document-level completeness check added

**Type:** Trigger-fired increment (the three-chair spec's pre-registered `--no-condition` condition), plus the instrument fix the firing exposed. Occasion: a Meetily-claims investigation ran mlx-whisper defaults against a real 37.2-min customer-interview m4a (non-fixture; the file is named in the investigation note below) — the decoder entered a repetition loop and emitted bare "Yeah." for the final third: 1933 of 2024 segments, ~87% of the interview destroyed, silent clean exit, **byte-identical across two independent runs** (deterministic, will recur on this input every time).

**The trigger half-fired — and that was the finding:** the substantive condition (real loop, non-fixture recording) was met, but the flagger returned **0 flags** — `REPEAT_MIN_TOKENS = 2` made 1-token runs structurally invisible, and this collapse is a 1-token run. Instance of `feedback_grep_binary_false_negative` (a clean scan is not evidence of no loop). Order of work honored the trigger's wording: fix the instrument first, then let it confirm.

**Code changes:**
- **1-token repeat tier (Class A):** `REPEAT_MIN_CONSECUTIVE_1TOK = 20` — 1-token runs flag at ≥20 consecutive (no human utters one word 20+ consecutive segments); ≥2-token behavior byte-unchanged at 3. Zero-FP bar held: x19 silent / x20 fires; real back-channel runs (x3–x10) silent; healthy re-run of the same interview (702 segments, 19 scattered "Yeah.") → 0 flags. **Trigger formally confirmed post-fix: 1920/2024 segments flagged** (runs x673/x490/x489 split by stray substantive lines).
- **`--no-condition` shipped, both CLIs** (the deferred escape, now authorized): opt-in `condition_on_previous_text=False`; **default stays True** — flipping it is a QA re-baseline, not this increment. Draft Engine line records its use (provenance). On the incident file the escape yields 7229 words vs 2899, and runs ~24% faster.
- **Document-level completeness check (`scan_document`)** — second, independent axis (per-segment flags see local runs; this sees the whole transcript): (1) dominant-text share ≥20% of segments AND count ≥50 → collapse warning (incident: 96%, x1933 → fires; healthy → silent; quiet Method S back-channel participant shape → silent by the count floor); (2) wpm-vs-audio floor (<40) for gross-truncation classes, Method D only — Method S passes `audio_secs=None` because a per-participant track is silent most of the wall clock (wpm would false-fire on every quiet participant). Warnings only, human gate, deterministic. Tally line added on both paths (`completeness check: within tolerance` / `⚠️ COMPLETENESS`).
- Honest limit, recorded: the wpm axis correctly does NOT catch loop-collapse (loop words kept raw wpm at 78 on the incident file) — the share axis is the collapse catcher; wpm is for truncation/half-decode (e.g. meetily #607's HE-AAC class).

**Tests:** T7 (1-token tier: boundary both sides, incident shape, 2-token unchanged, mutation control) + T8 (scan_document: both axes, healthy-silent, quiet-participant negative control, determinism, mutation control) added to the D battery; the S battery's stubbed-transcribe signature updated for the new `no_condition` param. **Batteries now D 28 / S 21, all green.** `transcribe()` change is signature-additive (default `False` = pinned behavior; T5 wiring test untouched).

**Cross-references:** spec addendum in `PAI/Projects/Completed/Skills/2026-07-23-diarize-increment-three-chair-spec.md` (trigger-fired AS-BUILT); investigation record `PAI/Projects/Current/Inputs-to-Level-0/2026-07-24_meetily-parakeet-vs-mlx-whisper.md` (moved from Research/2026-07 on 2026-07-25) (incl. Parakeet ruled OUT for research transcription — entity infidelity: the client's brand name misrendered in all 29 occurrences). Memory `feedback_whisper_device` updated same session. Corpus prevalence of the collapse is **unmeasured (n=1)** — the researcher declined a shipped-transcript audit 2026-07-24; the completeness check now covers new runs going forward.

## 2026-07-23 (night) — Three-chair AS-BUILT review: 3× APPROVE WITH AMENDMENTS; all amendments applied same session

**Type:** Independent as-built review of both 2026-07-23 increments (Architect / Engineer / QATester, researcher-convened). All headline invariants held under re-verification (orthogonality, flag-never-mutate, records-match-disk, batteries re-executed independently). One real bug found (Engineer, executed repro) and fixed; the rest is hardening + record honesty. Full chair texts in the session transcript; review outcome also recorded in the spec doc per `feedback_asbuilt_closes_the_commissioning_doc`.

**Code amendments applied:**
- **Disambiguation collision FIXED (Engineer F1, repro'd):** `['A-1','A','A']` stems previously produced two tracks both labeled `A-1` → silent speaker-merge on the method that advertises perfect attribution. Now `disambiguate_labels()` — pure, extracted, symmetric suffixes (`Scott-1/Scott-2`, no bare straggler), generated names checked against used+raw stems, uniqueness `assert` as permanent post-condition, 5 tests incl. the exact repro.
- **Class A empty-transparency (Engineer F2, repro'd):** a whisper empty segment mid-run broke consecutiveness — a 4-long hallucination escaped. Empty segments are now transparent (skip, don't break); both callers behave identically; locked by test.
- **Timing line → stderr (QA F4):** the draft's only wall-clock content removed — **the byte-identical determinism cert is now UNQUALIFIED** (E2E re-verified: both methods fully `cmp`-identical across reruns).
- **Mix-detection heuristic added, then self-corrected (Architect F1b):** overlap-based `⚠️ POSSIBLE COMBINED MIX` warning for unnamed mixes — the first implementation false-positived on a genuine 2-track E2E fixture (whisper bounds include leading silence) and was caught by this increment's own re-baseline before ship. Final form requires ≥90% overlap with ≥2 other tracks (sound for ≥3-track recordings); the 2-track blind spot is documented, not guessed at noisily. FP regression test added.
- **Method S precondition honesty (Architect F1a):** tally line now reads "0% ambiguity **provided each track carries exactly one participant**"; README documents both exclusion seams (false-exclude of `Combined-*` participant names; unnamed-mix limits).
- **Floors whitelist (Architect F4):** Method S floors whisper only (`check_model_floors(names=…)`) — a corrupt pyannote cache no longer blocks the path that never loads it. Tested.
- **Guard-cadence enrollment (Architect F2 — the ladder-rung honesty fix):** new `tools/diarize/check.ts` runs both Python batteries + doctrine-pointers; enrolled in `run-guards.ts` DEFAULT_META. **The fleet is now 5 guards** — these suites run at every /wrap and age-escalate at 14d; "tested sensor" is no longer contingent on human memory.
- **Second pointer census (Architect F3):** `doctrine-pointers.test.ts` now also asserts `diarize README → <target>` pointers (outside the canonical banner, e.g. "Method S usage") against ALL README headings.
- **Draft-emission test (QA F5):** stubbed-transcribe run of the REAL Method S main() asserts the flag table renders (Track column), the body text is byte-unaltered (adjudication A locked mechanically), and a zero-segment track renders its `—` row. Plus the ≥2-track guard negative control (QA F1c).
- **Tripwire at point of use (QA F7):** all three Step-5 disposition one-liners now say a CONFIRMED repeat-run flag = the `--no-condition` trigger fired.

**Record honesty (QA F2/F3, §5 ruling):**
- **R1/R4 regression legs were NOT re-run this increment** (amix-crosstalk contested-`?` + the 0.40-gate both-directions demonstration) — unchanged code path (flagger/decode/floors touch neither `assign()` nor the gate); last exercised 2026-07-12. Recorded here so the substituted lighter two-voice fixture doesn't read as fuller coverage.
- **FP-budget exception, recorded as deliberate:** bare `"Thank you."` flags `boilerplate` on genuine sign-offs — a known, accepted ~1–2/session (×tracks) benign flag, breaching the original >~1-FP/session bar BY CHOICE: the phrase is textually inseparable from the #1 whisper silence hallucination, and this increment's first live catch (single hallucinated segment) was catchable by Class C alone. Expected-flag test added to the battery so the suite tells the truth. **Queued surgical fix (next increment candidate): gate short-boilerplate hits on per-segment `no_speech_prob`** — genuine gratitude sits on real audio, hallucinated sits on silence; the one signal that separates what text cannot.
- Residuals noted: genuine emphatic ×3 short-phrase triples flag (recall-favoring, QA F6); floor tables duplicated setup.sh↔code with comment-only parity (QA F8); batteries counts now D 17 / S 21.

**Incidental catch (outside this tool):** the review's verification sweep exposed a latent guard-cadence bug — `runFleet()`'s internal `process.exit()` skipped `main()`'s `finally`, so the concurrency lock was NEVER released on a completed run (any second fleet run within 10 min was refused; unnoticed all day because runs were spaced wider). Fixed in `run-guards.ts` (exit decision moved after the finally), verified by back-to-back runs both executing with the lock released; suite 24/24. Recorded in s37-port/03 §11 (its commissioning doc).

## 2026-07-23 (later same evening) — Method S: separate-track deterministic attribution (the researcher un-parked it)

**Type:** New sibling pipeline `tracks_transcript.py` + `tracks-transcript` wrapper + `test_tracks.py` (10/10). **Ruling change on the record:** The researcher, same evening — "separate track is how I'm going to proceed" — the demonstrated case arrived as a standing practice, un-parking the separate-tracks TRANSCRIPTION path from the 2026-07-12 "track, don't build" (the inbox-routing/file-movement automation remains parked; the CF item now reflects the split).

- **What it does:** one audio file per participant → transcribe each track (shared `transcribe()`/`DECODE_PARAMS`), interleave by deterministic `(start, end, label)` sort, collapse consecutive same-label turns (attribution-only merge, same scope note as Method D), emit a Method-D-convention draft. **No pyannote, no HF_TOKEN, no `?`/`[Speaker]` states — 0% ambiguity by construction**; `attribution_status: resolved` once the track→name mapping is confirmed. Crosstalk content-loss structurally impossible.
- Dir mode auto-excludes Zoom combined-mix stems (`audio_only*`/`playback*`/`combined*`, named in the draft header); ≥2-track guard routes single files to Method D; duplicate-label disambiguation deterministic; labels derived from filenames (leading `audio` + trailing digits stripped), human confirms in the mapping table. Hallucination scan runs PER TRACK (`scan_hallucinations` reused; table gains a Track column). Model floors checked at startup (shared).
- **Verified:** pure battery 10/10 (label derivation, dir collection/exclusion, interleave determinism + input-order independence + tiebreak + collapse + empty-drop); E2E staged Zoom folder (2 `say` voices, genuine overlap, decoy `audio_only.m4a`) — mix excluded, 3 turns in correct order, **overlapped speech fully preserved on both tracks**, content byte-identical across reruns (excl. the known Timing line), 0 false flags; `test_diarize.py` still 14/14; doctrine-pointers 3/3.
- **Doctrine:** README retitled + Method S section (canonical usage home); Conversation `TranscriptFormat.md` Speaker Label Methods gains Method S above Method D ("preferred over ALL other methods when per-participant tracks exist"); both workflows gain check-for-tracks-FIRST at Step 3 + a Method S Step-5 block. The `--no-condition` pre-registered trigger sentence added to README → ASR honesty (point-of-use wiring for the tripwire — it now surfaces at disposition time, not only in this CHANGELOG).
- **Residuals (named):** speakerphone bleed (another voice on a participant's track) — accept until observed; future lever = meetily PR #661's text-similarity dedup. "First appears" column derives from whisper segment starts (may include leading silence) — cosmetic. Timing-line wall-clock nondeterminism inherited from the draft convention (same latent finding as the morning entry).

---

## 2026-07-23 — Meetily increment: hallucination flagger + pinned decode params + model floors (three-chair spec, researcher-ratified)

**Type:** First feature increment since the 2026-07-12 audit. Spec: `PAI/Research/2026-07/2026-07-23-diarize-increment-three-chair-spec.md` (three independent chairs; three cross-chair adjudications ratified by the researcher). Charter refinement on the record: the tool owns *mechanical attribution + deterministic honesty diagnostics that flag but never mutate* — the 2026-07-12 "attribution only" boundary sharpened (axis = deterministic-mechanical vs interpretive-judgment), not overturned.

1. **Hallucination flagger** — `scan_hallucinations(segments)`: pure, stdlib-only, index-aligned reasons. Class A repeat-runs (≥3 consecutive near-identical segments, ≥2 tokens so real one-word agreement never flags), Class B 2–5-word intra-segment loops (≥3 repeats), Class C boilerplate (equality or ≥0.80 coverage, never loose substring). Emits a tally line always + a `## Hallucination scan` table when N>0. **Flags never delete, never touch the body text (adjudication A), never feed `attribution_status` (orthogonality).** Sibling battery `test_diarize.py` — 14/14: TP + mutation control, zero-FP specificity suite (incl. the naive-detector teeth demonstration), determinism, decode-wiring, floor checks. **First live catch same session:** 8s of pure silence → whisper hallucinated `"Thank you."` → draft carried `⚠️ HALLUCINATION SCAN: 1 segment(s) flagged | boilerplate` — the exact scenario this CHANGELOG's 2026-07-12 entry documented as the front line. Defense-in-depth note: a "Thank you." repeat-run is caught by Class C even with Class A disabled (found by the mutation test's own first run).
2. **Decode params pinned at 0.4.3 current defaults** (`DECODE_PARAMS`): temperature tuple / compression_ratio 2.4 / logprob −1.0 / no_speech 0.6 / condition_on_previous_text True. Zero output change (E2E content-identical pre/post); protects the audited baseline from silent library-default drift. meetily's 0.55 DECLINED (adjudication C); `hallucination_silence_threshold` stays unset on doctrine grounds (it silently drops decoder output). **`--no-condition` opt-in DEFERRED with pre-registered trigger:** first confirmed Class-A repeat-run flag on a real (non-fixture) recording re-opens it.
3. **Model-cache floors** — `check_model_floors()` at tool startup + setup.sh step 7 (fail-loud exit 1, named `rm -rf` remedy; adjudication B). Validate-if-present only: absent cache = "downloads on first run (ok)", never "models OK" (M1 honest-scope). Floors target the TWO pyannote weight caches (segmentation-3.0 ≥4,000 KB; wespeaker ≥20,000 KB) + default whisper (≥1,000,000 KB) — **never** the 8 KB `speaker-diarization-3.1` config dir (composite-model trap). Symlink-safe sizing (blobs only, no double-count — locked by test).
4. **Doctrine:** README → ASR honesty gains the mechanization paragraph (heading unchanged; doctrine-pointers 3/3 green); both workflows' Step-5 Method-D branches gain the disposition one-liner; Zoom separate-tracks doctrine landed in the CF intake-handler design note (NOT here — two-consumers, Architect ruling).
5. **Regression:** E2E two-voice `say` fixture — attribution 3/3 correct, draft content byte-identical across reruns **excluding the `**Timing:**` line, a PRE-EXISTING wall-clock nondeterminism** (the 2026-07-12 "byte-identical" cert evidently rounded lucky; recorded here as a latent finding, not introduced by this increment — candidates: round to fixed buckets or accept as-is). Error paths re-verified: missing file exit 1; silent audio path = the audited division of labor (non-empty hallucinated segment → REVIEW + scan flags, not exit 1).

**Watch: FluidAudio** (CoreML-native diarization, meetily PRs #598/#661) — potential future pyannote replacement; re-check conditions live in the research note `2026-07-23-meetily-transcription-diarization-comparison.md`. No tripwire, no build.

**Residual carried:** 3+ speakers / non-English / non-default `--model` still unexercised (inherited); T4a's staged-audio positive leg is unstageable (whisper dedups repeated speech at decode — confirmed live) so delivery-positive evidence = the real silent-audio catch above.

---

## 2026-07-12 — Tri-chair audit + remediation (Engineer / Architect / QATester)

**Type:** First audit of the tool (seeds this CHANGELOG per the Architect chair's recommendation, researcher-approved). All three fix sets approved as recommended: Set A full (code honesty), Set B = doctrine text corrected (code stays attribution-only), Set C full (caller-side gate + seams). QATester ran the pipeline for real — **PASS across every test, zero MAJORs**: 100% correct turn attribution on known-ground-truth `say` fixtures, byte-identical determinism, clean failures on every error path (missing file, bad format, spaced paths, all three HF_TOKEN scenarios). A supplemental crosstalk run (ffmpeg amix overlap fixture) exercised the previously untested paths: the CONTEST_FRAC contested-`?` grade fired exactly in the genuine-overlap window, and the 0.40 gate discriminated in both directions (silent at 12%, fired at 50%).

**Code (Set A):**
- **Fail-loud on empty transcription** — zero/whitespace-only Whisper segments now exit 1 instead of emitting a green "0% ambiguity — within tolerance" draft into the L1 gate (Engineer M3). Note: real silent audio usually produces a *hallucinated* segment instead ("Thank you."), which the 100% ambiguity REVIEW flag catches — the caller-side hallucination scan remains the front line.
- pyannote model-load and inference failures wrapped: clean `ERROR:` exits naming HF_TOKEN/licenses/cache instead of raw tracebacks.
- Wrapper hardened: resolves symlinks (works when linked onto PATH) and gives a "run setup.sh first" error when the venv is missing.
- `--out` parent directory auto-created; empty speaker-mapping table gets a `_(none detected)_` placeholder row; Timing line gains the convert phase (dead `t0` now used).
- **`requirements.lock` added** (101 pins frozen from the MPS-validated venv closure); `setup.sh` installs from the lock when present, falling back to the three top-level pins with a drift warning.
- `.gitignore` gains `.DS_Store`.

**Doctrine (Set B — README):**
- **The false merge-parity claim corrected** (Engineer M1, the audit's headline): the README claimed the tool "applies the same merge internally" as the >2s-gap/`*[pause]*` rule — the code joins same-speaker segments regardless of gap. Ruled: the doctrine text yields; the tool owns *attribution only*. The README now discloses the simplified merge, and the three caller-side one-liners repeating the claim (both TranscriptFormat.md files + Interview/Transcribe.md) were corrected to match. Pause-splitting on Method D drafts is a downstream mapping-time step.
- Confidence-label semantics corrected to the real contention-keyed model (Engineer M2): "high" = no 2nd speaker reaches 35% of the winner's overlap — not "sits cleanly in one turn"; "inferred" = genuinely contested — not "weak overlap." Plus the `__UNK__` collapse disclosure (one `[Speaker]` turn may cover multiple unattributed voices).
- **Crosstalk content-loss disclosure added** (QATester supplemental M3): overlapped speech may be transcribed as a single dominant stream — a `?`-turn can mean *words missing*, not just *label uncertain*.
- HF_TOKEN requirement rephrased to `$PAI_DIR/.env` (the resolution the code actually performs).
- Dual mlx-whisper install note (pipx manual path vs this venv's pinned one — check version parity if transcripts differ by method).
- **Enforcement added for the canonical doctrine** (Architect M2 — the "empty enforced_by" failure mode): new `tools/doctrine-pointers.test.ts` asserts every skill-side "Shared L0 doctrine → X" pointer resolves to a live README heading. On its first run it caught two prefix-only pointers (`→ mlx-whisper` vs the heading "mlx-whisper — engine of record") — fixed to exact names in both SKILL.mds.

**Caller-side (Set C — recorded here + global since the L0 skills have no CHANGELOGs yet):**
- **`attribution_status` two-limb fix** (Architect M1): `l0-transcribe-interview/workflows/Transcribe.md` Step 5 and `BatchTranscribe.md` said "read it off the tool's tally" — but the tally is only the *ratio* limb; the `[Unknown Speaker]` limb (a voice not on the roster) is human-detected during mapping and the tool structurally cannot emit it. Both steps now state both limbs.
- `l0-transcribe-interview/TranscriptFormat.md` precision: the raw draft carries `SPEAKER_xx?`, which becomes `Name?` after mapping.
- **Reverse seams opened** (Architect M3): four `EthnographicResearchDesign` workflows (ConductInDepthInterview, UseMultimediaTechniques, ConductFocusGroup, CreateParticipatoryVideo) now route their "transcribe verbatim" steps to the L0 transcription skills / Method D.
- Recorded-Calls-Zooms intake handler (vault folders exist, no driver) → carry-forward item, not built here.

**Recorded clean (chairs):** overlap/assign() math correct on all edge cases (zero-length, multi-turn spans, ties, no-overlap); turn-based ambiguity gate exactly matches TranscriptFormat.md's formula (threshold 0.40, strict >); output contract field-by-field aligned with both skills' promises (Architect: "no output-format drift"); temp-file hygiene per doctrine; HF_TOKEN env-first with clean failure modes; no hardcoded home paths; git tracking exactly right (venv/pycache/DS_Store all ignored); pins == installed reality (torch 2.12.1 / pyannote.audio 4.0.7 / mlx-whisper 0.4.3 / py 3.12.13); fallback discipline present at every Method D entry point; point-of-use rule honored (one-liners keep enforcing content + pointer).

**Residual (documented, accepted):** 3+ speakers, non-English `--language`, and non-default `--model` unexercised (QATester Q5); a collaborator's L0-doctrine inline-vs-pointer decision is pending and its collision surface was mapped — this audit's edits touch three of those one-liner sites (content corrections only, no reflow) — flag on the next package diff with a collaborator.
