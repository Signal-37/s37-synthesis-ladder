#!/usr/bin/env python
"""test_diarize.py — sibling test for diarize_transcript.py (stdlib unittest, no new deps).

Run:  ../ladder-core/scripts/diarize/venv/bin/python -m unittest tools.diarize.test_diarize
 or:  cd ~/.claude/tools/diarize && venv/bin/python test_diarize.py

Covers the three-chair battery's pure-function legs (2026-07-23 spec):
  T1  flagger fires on the hallucination pattern (+ mutation control)
  T2  flagger silent on legitimate repetition (zero-FP specificity bar,
      incl. the naive-detector demonstration that the fixtures have teeth)
  T3a flagger determinism (identical output across reruns)
  T5  decode-threshold kwargs actually reach mlx_whisper.transcribe (wiring,
      at the PINNED-current-defaults values — not meetily's numbers)
  T6  runtime model-floor check (scratch cache: above-floor pass, undersized
      fail-loud, absent pass) — runtime plants only, never the live cache
2026-07-24 additions (trigger-fired increment — the loop-collapse incident):
  T7  1-token repeat tier: x19 silent / x20 fires; short agreement runs and
      the >=2-token threshold unchanged
  T8  scan_document: dominant-share + wpm axes fire on collapse-shaped input,
      silent on healthy input and on the quiet-back-channel-participant shape
House discipline: every control is shown capable of failing before its passing
run counts; plants happen in scratch dirs at runtime, never committed fixtures.
"""
import os
import sys
import tempfile
import types
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import diarize_transcript as dt  # noqa: E402  (heavy imports are function-local there)


def seg(start, end, text):
    return {"start": start, "end": end, "text": text}


CLEAN = [
    seg(0, 4, "So tell me about the first time you rode that trail."),
    seg(4, 9, "It was 2019, right after the bridge section opened."),
    seg(9, 14, "I remember the rock garden being terrifying."),
    seg(14, 20, "We came back the next weekend with the whole crew."),
]


class T1_FlaggerFires(unittest.TestCase):
    def test_neg_control_clean_list_no_flags(self):
        self.assertEqual(dt.scan_hallucinations(CLEAN), [None] * len(CLEAN))

    def test_repeat_run_flagged_with_range(self):
        planted = CLEAN[:2] + [
            seg(20, 22, "Thank you."),
            seg(22, 24, "Thank you."),
            seg(24, 26, "thank you"),
            seg(26, 28, "Thank you."),
        ] + CLEAN[2:]
        flags = dt.scan_hallucinations(planted)
        self.assertEqual(flags[:2], [None, None])
        for k in range(2, 6):
            self.assertEqual(flags[k], "repeat-run(x4)", f"segment {k} should be in the run")
        self.assertEqual(flags[6:], [None, None])

    def test_near_identical_drift_still_a_run(self):
        planted = [seg(i * 2, i * 2 + 2, t) for i, t in enumerate(
            ["Please subscribe to the channel.", "Please subscribe to the channel",
             "please subscribe to the channel."])]
        flags = dt.scan_hallucinations(planted)
        self.assertTrue(all(f == "repeat-run(x3)" for f in flags))

    def test_intra_segment_loop(self):
        s = [seg(0, 8, "and then you know you know you know it just kept going")]
        self.assertEqual(dt.scan_hallucinations(s)[0], "loop(p=2)")

    def test_intra_segment_loop_long_phrase_2026_08_26(self):
        # 2026-08-26 two-speaker Method S run: 36 repetitions of an 8-word
        # phrase inside ONE segment on the silent track scanned as 0 flags,
        # because LOOP_PHRASE_RANGE capped Class B at 5 words. Recorded in
        # Inputs-to-Level-0/2026-08-26_within-segment-repetition-blind-spot.md;
        # commissioned 2026-09-15. Both shapes from that run must flag.
        phrase = "it's time to put it back in time"
        s36 = [seg(0, 30, " ".join([phrase] * 36) + ".")]
        self.assertEqual(dt.scan_hallucinations(s36)[0], "loop(p=8)")
        s7 = [seg(0, 10, " ".join([phrase] * 7))]
        self.assertEqual(dt.scan_hallucinations(s7)[0], "loop(p=8)")

    def test_intra_segment_loop_long_phrase_zero_fp_controls(self):
        # Widening the phrase cap must not fire on real speech: emphatic
        # single-word repeats, a twice-said long phrase, and a long segment
        # with no repetition stay unflagged.
        controls = [
            seg(0, 3, "no, no, no, no, that is not what I meant"),
            seg(3, 9, "we need to get this right, we need to get this right, before Friday"),
            seg(9, 20, "the point I keep coming back to is that the plant only pays "
                       "when the frames are spread over more bikes than the brand can sell"),
        ]
        self.assertEqual(dt.scan_hallucinations(controls), [None, None, None])

    def test_boilerplate_equality_and_coverage(self):
        self.assertEqual(dt.scan_hallucinations([seg(0, 2, "Thanks for watching!")])[0], "boilerplate")
        # containment WITHOUT coverage must NOT flag
        long = seg(0, 10, "and at the end he said thanks for watching which I thought was odd for a live talk")
        self.assertIsNone(dt.scan_hallucinations([long])[0])

    def test_mutation_control_detector_produces_the_green(self):
        # Prove T1's pass comes from the detector, not the harness: raise the
        # run threshold impossibly high and the planted fixture must NOT fire.
        # Fixture is deliberately NOT in BOILERPLATE, so only Class A can catch
        # it (a "Thank you." fixture would fall through to Class C — found by
        # this test's own first run, and kept as the defense-in-depth note).
        planted = [seg(0, 2, "The bridge is out."), seg(2, 4, "The bridge is out."),
                   seg(4, 6, "the bridge is out")]
        self.assertEqual(dt.scan_hallucinations(planted)[0], "repeat-run(x3)")
        orig = dt.REPEAT_MIN_CONSECUTIVE
        try:
            dt.REPEAT_MIN_CONSECUTIVE = 99
            self.assertEqual(dt.scan_hallucinations(planted), [None, None, None])
        finally:
            dt.REPEAT_MIN_CONSECUTIVE = orig


class T2_Specificity(unittest.TestCase):
    """Zero false positives on real repeated speech — the alert-fatigue bar.
    A single FP here fails the battery (QATester chair)."""

    FIXTURES = {
        "agreement":  [seg(0, 1, "Yes."), seg(1, 2, "Yes."), seg(2, 3, "Yes.")],
        "backchannel": [seg(0, 2, "Right, right."), seg(2, 6, "So we kept the original spec.")],
        "emphatic":   [seg(0, 3, "No no no no, that came later.")],
        "refrain":    [seg(0, 4, "As I said, quality first."),
                       seg(4, 9, "The vendor pushed back on the timeline."),
                       seg(9, 13, "But again: quality first."),
                       seg(13, 18, "That's what won the account."),
                       seg(18, 21, "Quality first.")],
    }

    def test_zero_fp_on_all_fixtures(self):
        for name, segs in self.FIXTURES.items():
            flags = dt.scan_hallucinations(segs)
            self.assertEqual(flags, [None] * len(segs), f"FP on legitimate '{name}': {flags}")

    def test_fixtures_have_teeth_naive_detector_fires(self):
        # The agreement fixture is genuinely adversarial: without the
        # REPEAT_MIN_TOKENS constraint (a naive >=3-consecutive-identical
        # detector), it WOULD flag. Proves the specificity is load-bearing.
        orig = dt.REPEAT_MIN_TOKENS
        try:
            dt.REPEAT_MIN_TOKENS = 1  # naive detector
            flags = dt.scan_hallucinations(self.FIXTURES["agreement"])
            self.assertEqual(flags[0], "repeat-run(x3)",
                             "naive detector should fire — fixture has no teeth otherwise")
        finally:
            dt.REPEAT_MIN_TOKENS = orig


class T3a_Determinism(unittest.TestCase):
    def test_identical_output_across_reruns(self):
        planted = CLEAN + [seg(30, 32, "Thank you."), seg(32, 34, "Thank you."),
                           seg(34, 36, "Thank you.")]
        self.assertEqual(dt.scan_hallucinations(planted), dt.scan_hallucinations(planted))


class T5_DecodeWiring(unittest.TestCase):
    def test_pinned_kwargs_reach_mlx_whisper(self):
        captured = {}
        stub = types.ModuleType("mlx_whisper")
        stub.transcribe = lambda wav, **kw: (captured.update(kw) or
                                             {"segments": [seg(0, 1, "hi"), seg(1, 2, "there")]})
        orig = sys.modules.get("mlx_whisper")
        sys.modules["mlx_whisper"] = stub
        try:
            out = dt.transcribe("fake.wav", "some/model", "en")
        finally:
            if orig is not None:
                sys.modules["mlx_whisper"] = orig
            else:
                sys.modules.pop("mlx_whisper", None)
        self.assertEqual(len(out), 2)
        # exact pinned-current-default values (Engineer venv verification —
        # NOT meetily's 0.55; adjudication C)
        self.assertEqual(captured["no_speech_threshold"], 0.6)
        self.assertEqual(captured["logprob_threshold"], -1.0)
        self.assertEqual(captured["compression_ratio_threshold"], 2.4)
        self.assertEqual(captured["temperature"], (0.0, 0.2, 0.4, 0.6, 0.8, 1.0))
        self.assertTrue(captured["condition_on_previous_text"])
        self.assertEqual(captured["language"], "en")
        # doctrine exclusions: never passed at all
        self.assertNotIn("hallucination_silence_threshold", captured)
        self.assertNotIn("word_timestamps", captured)


class T6_ModelFloors(unittest.TestCase):
    def _hub(self, tmp):
        return os.path.join(tmp, "hub")

    def test_absent_cache_passes(self):
        with tempfile.TemporaryDirectory() as tmp:
            dt.check_model_floors(hub=self._hub(tmp))  # no dirs at all — no exit

    def test_above_floor_passes(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(self._hub(tmp)) / "models--pyannote--segmentation-3.0" / "blobs"
            d.mkdir(parents=True)
            (d / "weights.bin").write_bytes(b"\0" * (5 * 1024 * 1024))  # 5 MB > 4000 KB floor
            dt.check_model_floors(hub=self._hub(tmp))

    def test_undersized_cache_fails_loud_with_remedy(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(self._hub(tmp)) / "models--pyannote--segmentation-3.0" / "blobs"
            d.mkdir(parents=True)
            (d / "weights.bin").write_bytes(b"\0" * (100 * 1024))  # 100 KB — truncated
            with self.assertRaises(SystemExit) as cm:
                dt.check_model_floors(hub=self._hub(tmp))
            msg = str(cm.exception)
            self.assertIn("partial/corrupt", msg)
            self.assertIn("rm -rf", msg)  # named remedy

    def test_symlinks_not_double_counted(self):
        # HF snapshots symlink into blobs/; only real blob bytes may count.
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(self._hub(tmp)) / "models--pyannote--segmentation-3.0"
            (root / "blobs").mkdir(parents=True)
            (root / "snapshots").mkdir(parents=True)
            blob = root / "blobs" / "abc"
            blob.write_bytes(b"\0" * (2 * 1024 * 1024))  # 2 MB real — BELOW 4000 KB floor
            os.symlink(blob, root / "snapshots" / "weights.bin")  # would 'add' 2 MB if followed
            with self.assertRaises(SystemExit):
                dt.check_model_floors(hub=self._hub(tmp))  # must still fail: real bytes < floor




# ── As-built review amendments (2026-07-23 evening review) ────────────────────

class ReviewAmendments(unittest.TestCase):
    def test_empty_segment_is_transparent_in_class_a(self):
        # Engineer F2 (executed repro): an empty whisper segment mid-run
        # previously BROKE Class-A consecutiveness — a 4-long hallucination
        # escaped unflagged. Empty segments are now transparent.
        planted = [seg(0, 2, "The bridge is out."), seg(2, 4, "The bridge is out."),
                   seg(4, 5, "   "), seg(5, 7, "The bridge is out."),
                   seg(7, 9, "The bridge is out.")]
        flags = dt.scan_hallucinations(planted)
        self.assertEqual(flags[0], "repeat-run(x4)")
        self.assertIsNone(flags[2])  # the transparent empty carries no flag
        self.assertEqual([flags[0], flags[1], flags[3], flags[4]], ["repeat-run(x4)"] * 4)

    def test_bare_thank_you_flags_EXPECTED_recall_favoring_exception(self):
        # QA FP-budget ruling (as-built review §5): bare "Thank you." DOES flag
        # — genuine sign-off gratitude is textually inseparable from the #1
        # whisper silence hallucination, and the increment's first live catch
        # was exactly this shape (single segment — Class A cannot see it).
        # This is a RECORDED, deliberate exception to the zero-FP bar: cost is
        # one human glance at disposition. Do NOT "fix" this by dropping the
        # tuple entry; the surgical fix is the queued no_speech_prob gate.
        self.assertEqual(dt.scan_hallucinations([seg(0, 2, "Thank you.")])[0], "boilerplate")
        # ...while genuine LONGER gratitude stays clean (coverage < 0.80):
        self.assertIsNone(dt.scan_hallucinations(
            [seg(0, 3, "Thank you so much for your time.")])[0])

    def test_model_floors_names_filter_skips_unrelated_caches(self):
        # Architect F4: Method S floors whisper only — an undersized pyannote
        # cache must NOT block it.
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp, "hub", "models--pyannote--segmentation-3.0", "blobs")
            d.mkdir(parents=True)
            (d / "weights.bin").write_bytes(b"\0" * (100 * 1024))  # corrupt pyannote
            hub = os.path.join(tmp, "hub")
            with self.assertRaises(SystemExit):
                dt.check_model_floors(hub=hub)                     # full check fails
            dt.check_model_floors(hub=hub, names=("whisper",))     # filtered passes


class T7_OneTokenTier(unittest.TestCase):
    """2026-07-24: 1-token repeat runs flag at REPEAT_MIN_CONSECUTIVE_1TOK.

    Motivating incident: "Yeah." x1933 (95.5% of segments) scanned as 0 flags
    because 1-token anchors were skipped entirely. Real agreement runs must
    still never flag (zero-FP bar) — hence a tier, not a floor removal.
    """

    def _yeahs(self, n):
        return [seg(i, i + 1, "Yeah.") for i in range(n)]

    def test_real_backchannel_run_never_flags(self):
        for n in (3, 5, 10, dt.REPEAT_MIN_CONSECUTIVE_1TOK - 1):
            self.assertEqual(dt.scan_hallucinations(self._yeahs(n)), [None] * n,
                             f"1-token x{n} must NOT flag (below tier)")

    def test_collapse_run_fires_at_tier(self):
        n = dt.REPEAT_MIN_CONSECUTIVE_1TOK
        flags = dt.scan_hallucinations(self._yeahs(n))
        self.assertEqual(flags, [f"repeat-run(x{n})"] * n)

    def test_incident_shape_no_longer_scans_clean(self):
        # Collapse-shaped: healthy opening, then a long 1-token loop.
        planted = CLEAN + self._yeahs(60)
        flags = dt.scan_hallucinations(planted)
        self.assertEqual(flags[:len(CLEAN)], [None] * len(CLEAN))
        self.assertEqual(flags[len(CLEAN):], ["repeat-run(x60)"] * 60)

    def test_two_token_threshold_unchanged(self):
        # The tier must not loosen the >=2-token rule: x3 still fires.
        planted = [seg(i, i + 1, "you know.") for i in range(3)]
        self.assertEqual(dt.scan_hallucinations(planted), ["repeat-run(x3)"] * 3)

    def test_mutation_control_tier_produces_the_green(self):
        # Prove T7's pass comes from the tier constant, not elsewhere.
        n = dt.REPEAT_MIN_CONSECUTIVE_1TOK
        orig = dt.REPEAT_MIN_CONSECUTIVE_1TOK
        try:
            dt.REPEAT_MIN_CONSECUTIVE_1TOK = 10 ** 9
            self.assertEqual(dt.scan_hallucinations(self._yeahs(n)), [None] * n)
        finally:
            dt.REPEAT_MIN_CONSECUTIVE_1TOK = orig


class T8_DocumentCompleteness(unittest.TestCase):
    """2026-07-24: whole-transcript collapse warnings (scan_document)."""

    def test_healthy_transcript_silent(self):
        self.assertEqual(dt.scan_document(CLEAN, audio_secs=20.0), [])

    def test_dominant_share_fires_on_collapse_shape(self):
        planted = CLEAN + [seg(i, i + 1, "Yeah.") for i in range(60)]
        warnings = dt.scan_document(planted)  # no audio_secs: share axis alone
        self.assertEqual(len(warnings), 1)
        self.assertIn("dominant text", warnings[0])
        self.assertIn("x60", warnings[0])

    def test_quiet_backchannel_participant_does_not_fire(self):
        # Method S shape: a track that is mostly "Yeah." but at a real count —
        # high share, below DOC_DOMINANT_MIN. Must stay silent.
        planted = CLEAN + [seg(i, i + 1, "Yeah.") for i in range(20)]
        self.assertEqual(dt.scan_document(planted), [])

    def test_wpm_floor_fires_only_with_audio_secs(self):
        # 4 short segments against an hour of audio → gross truncation.
        self.assertEqual(dt.scan_document(CLEAN), [])  # no duration → silent
        warnings = dt.scan_document(CLEAN, audio_secs=3600.0)
        self.assertEqual(len(warnings), 1)
        self.assertIn("wpm", warnings[0])

    def test_determinism_identical_across_reruns(self):
        planted = CLEAN + [seg(i, i + 1, "Yeah.") for i in range(60)]
        self.assertEqual(dt.scan_document(planted, 120.0),
                         dt.scan_document(planted, 120.0))

    def test_mutation_control_thresholds_produce_the_green(self):
        # Prove T8's silence on healthy input comes from the thresholds.
        orig_share, orig_min = dt.DOC_DOMINANT_SHARE, dt.DOC_DOMINANT_MIN
        try:
            dt.DOC_DOMINANT_SHARE, dt.DOC_DOMINANT_MIN = 0.0, 1
            self.assertTrue(dt.scan_document(CLEAN))  # now everything fires
        finally:
            dt.DOC_DOMINANT_SHARE, dt.DOC_DOMINANT_MIN = orig_share, orig_min


class T9_WaveformLoader(unittest.TestCase):
    """2026-08-21: load_waveform() bypasses pyannote's torchcodec file decoder
    (FFmpeg-major coupling broke Method D when Homebrew ffmpeg hit 9.0.1)."""

    def _write_wav(self, path, rate=16000, channels=1, sampwidth=2, samples=b""):
        import wave
        with wave.open(path, "wb") as w:
            w.setnchannels(channels)
            w.setsampwidth(sampwidth)
            w.setframerate(rate)
            w.writeframes(samples)

    def test_exact_pcm_decode_matches_pyannote_convention(self):
        import numpy as np
        # known int16 values incl. the exact-half case 16384 -> 0.5
        pcm = np.array([0, 16384, -16384, 32767, -32768], dtype=np.int16)
        with tempfile.TemporaryDirectory() as d:
            wav = os.path.join(d, "t.wav")
            self._write_wav(wav, samples=pcm.tobytes())
            out = dt.load_waveform(wav)
        self.assertEqual(out["sample_rate"], 16000)
        t = out["waveform"]
        self.assertEqual(tuple(t.shape), (1, 5))
        self.assertEqual(str(t.dtype), "torch.float32")
        expected = [0.0, 0.5, -0.5, 32767 / 32768.0, -1.0]
        for got, want in zip(t[0].tolist(), expected):
            self.assertAlmostEqual(got, want, places=6)

    def test_non_towav_shapes_fail_loud(self):
        # control with teeth: stereo and 8-bit inputs must raise, not decode
        with tempfile.TemporaryDirectory() as d:
            stereo = os.path.join(d, "stereo.wav")
            self._write_wav(stereo, channels=2, samples=b"\x00\x00" * 4)
            with self.assertRaises(ValueError):
                dt.load_waveform(stereo)
            eight = os.path.join(d, "8bit.wav")
            self._write_wav(eight, sampwidth=1, samples=b"\x00" * 4)
            with self.assertRaises(ValueError):
                dt.load_waveform(eight)


# ─── T10: speaker-balance scan (item C, three-chair spec 2026-08-23) ─────────
# Motivating incident: the 2026-07-30 mix run invented a THIRD speaker holding
# 43s on a TWO-PERSON call. The ambiguity tally could not see it — that tally
# counts turn CONFIDENCE and never asks who the speakers are — so the check was
# done by hand on 2026-08-21 and the defect sat unwatched in between.
#
# The known positive is real and on disk: 2026-07-30 run-evidence mapping table,
# talk times 1969s / 43s / 1370s. The known negatives are also real: the 07-24
# (2930s / 1806s) and 08-21 (two speakers) runs. What no real corpus supplies is
# the DISCRIMINATING negative — a legitimate 3-speaker call whose quietest voice
# is genuinely low — so that one is manufactured, which the QATester chair ruled
# adequate because this leg tests arithmetic over a talk dict, not an acoustic
# property.
class T10_SpeakerBalance(unittest.TestCase):
    # Real, from 2026-07-30 run3-methodD-mix.md (43s = 1.27% of 3382s talk)
    SEVEN_THIRTY = {"SPEAKER_00": 1969.0, "SPEAKER_01": 43.0, "SPEAKER_02": 1370.0}
    # Real, from 2026-07-24 methodD-draft.md
    SEVEN_TWENTY_FOUR = {"SPEAKER_00": 2930.0, "SPEAKER_01": 1806.0}
    # Real, from 2026-08-21 p01 methodD draft (12:27 / 59:14)
    P01 = {"SPEAKER_00": 747.0, "SPEAKER_01": 3554.0}

    def test_fires_on_the_known_over_split(self):
        w = dt.scan_speaker_balance(self.SEVEN_THIRTY)
        self.assertEqual(len(w), 1, f"expected exactly the 43s artifact, got: {w}")
        self.assertIn("SPEAKER_01", w[0])
        self.assertIn("verify", w[0])          # flags, never verdicts
        self.assertNotIn("wrong", w[0].lower())

    def test_silent_on_real_two_speaker_negatives(self):
        # Both are REAL runs whose speaker sets were confirmed correct.
        self.assertEqual(dt.scan_speaker_balance(self.SEVEN_TWENTY_FOUR), [])
        self.assertEqual(dt.scan_speaker_balance(self.P01), [])

    def test_silent_on_a_legitimately_quiet_third_speaker(self):
        # THE DISCRIMINATING CONTROL, and the way this item fails quietly.
        # Without it, a diagnostic implemented as `if len(speakers) > 2: warn`
        # passes every other test in this class. A real but quiet third
        # participant (~8% of talk) must NOT flag.
        legit = {"SPEAKER_00": 1800.0, "SPEAKER_01": 1400.0, "SPEAKER_02": 280.0}
        self.assertEqual(dt.scan_speaker_balance(legit), [])

    def test_denominator_is_talk_time_not_wall_clock(self):
        # The record said "1.1%" (wall clock); against talk time the same
        # speaker is 1.27%. The choice is load-bearing near the floor, so it is
        # asserted rather than left to a reader. Doubling everyone's talk must
        # not change any verdict — a wall-clock denominator would drift.
        doubled = {k: v * 2 for k, v in self.SEVEN_THIRTY.items()}
        self.assertEqual(len(dt.scan_speaker_balance(doubled)), 1)
        self.assertIn("1.27%", dt.scan_speaker_balance(self.SEVEN_THIRTY)[0])

    def test_mutation_control_threshold_is_load_bearing(self):
        # If neither extreme changes the verdicts, the function is not
        # threshold-driven and every green above is meaningless.
        orig = dt.LOW_TALK_SHARE
        try:
            dt.LOW_TALK_SHARE = 0.0
            self.assertEqual(dt.scan_speaker_balance(self.SEVEN_THIRTY), [],
                             "floor 0 must silence the known artifact")
            dt.LOW_TALK_SHARE = 1.0
            self.assertEqual(len(dt.scan_speaker_balance(self.SEVEN_TWENTY_FOUR)), 2,
                             "floor 1.0 must fire on a normal 2-speaker split")
        finally:
            dt.LOW_TALK_SHARE = orig

    def test_degenerate_inputs_do_not_raise(self):
        self.assertEqual(dt.scan_speaker_balance({}), [])
        self.assertEqual(dt.scan_speaker_balance({"S": 0.0}), [])
        self.assertEqual(dt.scan_speaker_balance({"S": 900.0}), [])  # lone speaker = 100%

    def test_determinism_and_ordering(self):
        a = dt.scan_speaker_balance(self.SEVEN_THIRTY)
        b = dt.scan_speaker_balance(dict(reversed(list(self.SEVEN_THIRTY.items()))))
        self.assertEqual(a, b, "output must not depend on dict insertion order")



# ─── T11: turn-collapse scan (item A, three-chair spec 2026-08-23) ────────────
# Method D's worst failure — merged-turn misattribution inside CONFIDENT turns —
# had no instrument: the ambiguity tally grades the turns that were emitted and
# is structurally blind to changes that never became turns.
#
# The numbers below are REAL, measured by probe A0 on 2026-08-23 against both
# known-collapsed recordings (evidence: Inputs-to-Level-0/2026-08-23_a0-probe-evidence).
# A0 settled the question the whole item turned on — whether pyannote ever
# emitted the absorbed boundaries. It did: 481 raw changes against 557 real
# Method S turns (08-21) and 621 against 700 (07-24). The collapse is entirely
# downstream in assign()/merge, which is what makes this an exact count rather
# than a texture heuristic.
class T11_TurnCollapse(unittest.TestCase):
    # A0-measured: (raw_speaker_changes, emitted_turns)
    P01_08_21 = (481, 81)    # 401 absorbed = 83%
    CALL_07_24 = (621, 152)   # 470 absorbed = 76%

    def test_fires_on_both_real_collapsed_runs(self):
        for name, (chg, emitted) in (("p01", self.P01_08_21),
                                     ("call", self.CALL_07_24)):
            w = dt.scan_turn_collapse(chg, emitted)
            self.assertEqual(len(w), 1, f"{name}: expected a warning, got {w}")
            self.assertIn("absorbed", w[0])
            # It must report the COUNT, not merely assert a problem.
            self.assertIn(str(chg), w[0])

    def test_silent_on_a_healthy_run(self):
        # THE NEGATIVE CONTROL. No healthy real Method D run exists in the
        # corpus — every one on record failed — so the healthy pole is
        # constructed. It is principled rather than arbitrary: if Whisper's
        # segments align with speaker turns, every detected change becomes a
        # turn boundary and absorption tends to zero by construction.
        self.assertEqual(dt.scan_turn_collapse(100, 101), [])   # 0 absorbed
        self.assertEqual(dt.scan_turn_collapse(100, 85), [])    # 16% — under floor

    def test_blanket_pass_control_partial_absorption_stays_silent(self):
        # An implementation that always warns fires here and fails. Combined
        # with the two positives above, an implementation that never warns also
        # fails — both degenerate versions are caught by the same three cases.
        self.assertEqual(dt.scan_turn_collapse(100, 80), [])     # 21% — under
        self.assertEqual(len(dt.scan_turn_collapse(100, 60)), 1) # 41% — over

    def test_mutation_control_threshold_is_load_bearing(self):
        orig = dt.TURN_COLLAPSE_ABSORBED
        try:
            dt.TURN_COLLAPSE_ABSORBED = 1.01
            self.assertEqual(dt.scan_turn_collapse(*self.P01_08_21), [],
                             "unreachable floor must silence a known positive")
            dt.TURN_COLLAPSE_ABSORBED = 0.0
            self.assertEqual(len(dt.scan_turn_collapse(100, 101)), 1,
                             "floor 0 must fire on the healthy fixture")
        finally:
            dt.TURN_COLLAPSE_ABSORBED = orig

    def test_degenerate_inputs_do_not_raise(self):
        self.assertEqual(dt.scan_turn_collapse(0, 0), [])
        self.assertEqual(dt.scan_turn_collapse(0, 50), [])
        self.assertEqual(dt.scan_turn_collapse(50, 0), [])

    def test_count_floor_suppresses_meaningless_tiny_inputs(self):
        # Found by this battery, not by reading: without a count floor,
        # scan_turn_collapse(1, 1) is 100% absorbed and fires — a warning that
        # means nothing. Pairs the ratio with a minimum, the same dual-condition
        # shape scan_document uses.
        self.assertEqual(dt.scan_turn_collapse(1, 1), [])
        self.assertEqual(dt.scan_turn_collapse(dt.TURN_COLLAPSE_MIN_CHANGES - 1, 1), [])
        self.assertEqual(len(dt.scan_turn_collapse(dt.TURN_COLLAPSE_MIN_CHANGES, 1)), 1,
                         "at the floor exactly, a fully-absorbed run must fire")

    def test_count_speaker_changes_counts_transitions_not_turns(self):
        # Same-speaker splits (a pause inside one person's speech) must NOT
        # count: only a change of speaker can be absorbed into a wrong label.
        turns = [(0, 1, "A"), (1, 2, "A"), (2, 3, "B"), (3, 4, "A"), (4, 5, "A")]
        self.assertEqual(dt.count_speaker_changes(turns), 2)
        self.assertEqual(dt.count_speaker_changes([]), 0)
        self.assertEqual(dt.count_speaker_changes([(0, 1, "A")]), 0)

    def test_determinism(self):
        self.assertEqual(dt.scan_turn_collapse(*self.P01_08_21),
                         dt.scan_turn_collapse(*self.P01_08_21))



if __name__ == "__main__":
    unittest.main(verbosity=2)
