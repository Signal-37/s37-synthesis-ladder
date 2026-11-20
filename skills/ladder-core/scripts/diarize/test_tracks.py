#!/usr/bin/env python
"""test_tracks.py — sibling test for tracks_transcript.py (Method S), stdlib unittest.

Run:  cd ~/.claude/tools/diarize && venv/bin/python test_tracks.py

Pure-function legs: label derivation, dir-mode collection/exclusion, interleave
determinism + tiebreak + same-label collapse. E2E legs live in the session
verification (say fixtures) — the pure core here is what gates.
"""
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tracks_transcript import collect_tracks, derive_label, interleave  # noqa: E402


def seg(start, end, text):
    return {"start": start, "end": end, "text": text}


class LabelDerivation(unittest.TestCase):
    def test_zoom_style_stems(self):
        self.assertEqual(derive_label("audioScottKing12345.m4a"), "ScottKing")
        self.assertEqual(derive_label("audio Scott King 12345.m4a"), "Scott King")
        self.assertEqual(derive_label("audio_jordan_rivera_2.m4a"), "jordan_rivera")

    def test_plain_name_stem_untouched(self):
        # fictional name — never use a real person's name in fixtures
        self.assertEqual(derive_label("Jordan Rivera.m4a"), "Jordan Rivera")

    def test_never_empty_falls_back_to_stem(self):
        # a stem that is ALL prefix+digits must not derive to ""
        self.assertEqual(derive_label("audio12345.m4a"), "audio12345")


class CollectTracks(unittest.TestCase):
    def test_dir_mode_excludes_combined_mix_and_sorts(self):
        with tempfile.TemporaryDirectory() as d:
            for n in ("audioBob1.m4a", "audioAlice2.m4a", "audio_only.m4a",
                      "playback.m4a", "notes.txt", ".DS_Store"):
                Path(d, n).touch()
            tracks, excluded = collect_tracks([d])
            self.assertEqual([Path(t).name for t in tracks],
                             ["audioAlice2.m4a", "audioBob1.m4a"])  # sorted, mix excluded
            self.assertEqual(sorted(Path(e).name for e in excluded),
                             ["audio_only.m4a", "playback.m4a"])

    def test_explicit_files_sorted_nothing_excluded(self):
        tracks, excluded = collect_tracks(["b.m4a", "a.m4a"])
        self.assertEqual(tracks, ["a.m4a", "b.m4a"])
        self.assertEqual(excluded, [])


class Interleave(unittest.TestCase):
    A = ("Alice", [seg(0, 4, "First point."), seg(8, 12, "Third point.")])
    B = ("Bob", [seg(4, 8, "Second point.")])

    def test_timestamp_order_across_tracks(self):
        turns = interleave([self.A, self.B])
        self.assertEqual([(t[0], t[2]) for t in turns],
                         [("Alice", "First point."), ("Bob", "Second point."),
                          ("Alice", "Third point.")])

    def test_input_order_irrelevant_deterministic(self):
        self.assertEqual(interleave([self.A, self.B]), interleave([self.B, self.A]))

    def test_tiebreak_on_simultaneous_start_is_label_order(self):
        x = ("Zed", [seg(0, 3, "Overlap zed.")])
        y = ("Amy", [seg(0, 3, "Overlap amy.")])
        turns = interleave([x, y])
        self.assertEqual([t[0] for t in turns], ["Amy", "Zed"])  # (start,end,label) key

    def test_consecutive_same_label_collapse_verbatim(self):
        a = ("Alice", [seg(0, 2, "One."), seg(2, 4, "Two."), seg(9, 10, "Four.")])
        b = ("Bob", [seg(5, 7, "Three.")])
        turns = interleave([a, b])
        self.assertEqual([(t[0], t[2]) for t in turns],
                         [("Alice", "One. Two."), ("Bob", "Three."), ("Alice", "Four.")])
        # collapse joins verbatim with a single space — no pause split (that is
        # a downstream mapping-time step, per the canonical merge doctrine)

    def test_empty_text_segments_dropped(self):
        a = ("Alice", [seg(0, 1, "  "), seg(1, 2, "Real.")])
        turns = interleave([a, ("Bob", [seg(3, 4, "Also real.")])])
        self.assertEqual([(t[0], t[2]) for t in turns],
                         [("Alice", "Real."), ("Bob", "Also real.")])


# ── As-built review amendments (2026-07-23 evening review) ────────────────────

import contextlib
import io
import numpy as _np
from tracks_transcript import disambiguate_labels, mix_suspects
import tracks_transcript as tt


class DisambiguateLabels(unittest.TestCase):
    """Engineer F1 (executed repro): the shipped block could emit COLLIDING
    labels; and plain duplicates left an unsuffixed straggler."""

    def test_plain_pair_symmetric_suffixes(self):
        self.assertEqual(disambiguate_labels(["Scott", "Scott"]), ["Scott-1", "Scott-2"])

    def test_triplicate_all_suffixed(self):
        self.assertEqual(disambiguate_labels(["A", "A", "A"]), ["A-1", "A-2", "A-3"])

    def test_preexisting_suffix_collision_repro(self):
        # The exact repro: a real 'A-1' stem + two 'A' stems. Shipped code
        # produced ['A-1','A-1','A'] — two tracks sharing a label.
        out = disambiguate_labels(["A-1", "A", "A"])
        self.assertEqual(len(set(out)), 3, f"labels must be unique: {out}")
        self.assertIn("A-1", out)  # the genuine stem keeps its name

    def test_unique_input_untouched(self):
        self.assertEqual(disambiguate_labels(["Alice", "Bob"]), ["Alice", "Bob"])

    def test_deterministic(self):
        labs = ["A-1", "A", "A", "B", "B"]
        self.assertEqual(disambiguate_labels(labs), disambiguate_labels(labs))


class MixSuspects(unittest.TestCase):
    """Architect F1b: name-based exclusion can't catch an unconventionally
    named combined mix; the overlap heuristic can."""

    def test_mix_track_flagged(self):
        alice = [(0.0, 4.0), (10.0, 14.0)]
        bob = [(5.0, 9.0)]
        mix = [(0.0, 4.0), (5.0, 9.0), (10.0, 14.0)]  # union of both
        suspects = mix_suspects([("Alice", alice), ("Bob", bob), ("weird_name", mix)])
        self.assertEqual(suspects, ["weird_name"])

    def test_disjoint_tracks_clean(self):
        self.assertEqual(
            mix_suspects([("Alice", [(0.0, 4.0)]), ("Bob", [(5.0, 9.0)])]), [])

    def test_genuine_crosstalk_not_flagged(self):
        # 1s of overlap on a 5s track is real crosstalk, far under 90%.
        self.assertEqual(
            mix_suspects([("Alice", [(0.0, 5.0)]), ("Bob", [(4.0, 9.0)])]), [])

    def test_two_track_high_overlap_NOT_flagged_fp_regression(self):
        # E2E re-baseline caught this: whisper segment bounds include leading
        # silence, so a genuine 2-track pair can overlap >=90% by timestamp.
        # The heuristic requires >=2 covered tracks and stays silent on pairs
        # (2-track mixes remain the name-exclusion + human check's job).
        self.assertEqual(
            mix_suspects([("Alice", [(0.0, 3.0)]), ("Bob", [(0.0, 4.5)])]), [])


class GuardAndEmission(unittest.TestCase):
    def test_min_two_tracks_guard_fires_naming_method_d(self):
        # QA F1(c): negative control on the routing guard — one real file.
        with tempfile.TemporaryDirectory() as d:
            p = Path(d, "audioSolo1.m4a")
            p.touch()
            argv = sys.argv
            sys.argv = ["tracks_transcript.py", str(p)]
            try:
                with self.assertRaises(SystemExit) as cm:
                    tt.main()
            finally:
                sys.argv = argv
            self.assertIn("Method D", str(cm.exception))

    def test_draft_emission_flags_render_and_body_unaltered(self):
        # QA F5: the draft-rendering path, automated without audio — stub the
        # heavy calls, run the REAL main(), assert on the REAL draft.
        planted = {
            "audioAlice1.m4a": [
                {"start": 0.0, "end": 2.0, "text": "Real opening line."},
                {"start": 20.0, "end": 21.0, "text": "Thank you."},  # will flag (boilerplate)
            ],
            "audioBob2.m4a": [
                {"start": 3.0, "end": 5.0, "text": "A normal reply."},
            ],
            "audioCarol3.m4a": [],  # zero-segment track: mapping row must not crash
        }
        with tempfile.TemporaryDirectory() as d:
            for name in planted:
                Path(d, name).touch()
            out = Path(d, "draft.md")
            orig = (tt.to_wav, tt.transcribe, tt.check_model_floors, os.remove,
                    tt.compute_envelope)
            tt.to_wav = lambda src, wd: src                      # no ffmpeg
            tt.transcribe = lambda wav, m, l, nc=False: planted[Path(wav).name]
            tt.check_model_floors = lambda **kw: None            # no cache read
            tt.compute_envelope = lambda wav: _np.zeros(1)       # no audio in stub
            removed = []
            _os_remove = os.remove
            os.remove = lambda p: removed.append(p)              # inputs aren't temp wavs here
            argv = sys.argv
            sys.argv = ["tracks_transcript.py", d, "--out", str(out)]
            try:
                with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                    tt.main()
            finally:
                sys.argv = argv
                tt.to_wav, tt.transcribe, tt.check_model_floors, _, tt.compute_envelope = orig
                os.remove = _os_remove
            draft = out.read_text()
            # flag DELIVERED: tally line + table with Track column
            self.assertIn("hallucination scan: 1 segment(s) flagged", draft)
            self.assertIn("| Time | Track | Class | Text", draft)
            self.assertIn("| Alice | boilerplate |", draft)
            # adjudication A locked mechanically: body text byte-unaltered
            self.assertIn("**Alice:** Real opening line.", draft)
            self.assertIn('"Thank you."', draft)                  # verbatim in the table
            self.assertIn("**Alice:** Thank you.", draft)         # AND untouched in the body
            # zero-segment track renders a row, first-appears em-dash
            self.assertIn("audioCarol3.m4a", draft)
            self.assertIn("| — |", draft)
            # no wall-clock in the draft (QA F4 closed)
            self.assertNotIn("**Timing:**", draft)


class ConditioningDefault(unittest.TestCase):
    """Locks the 2026-07-30 Method S default flip (the researcher ruling, QA re-baseline:
    Inputs-to-Level-0/2026-07-30_no-condition-qa-rebaseline.md):
    condition_on_previous_text=False is the DEFAULT; --condition restores the
    pinned pre-2026-07-30 baseline; --no-condition stays valid as a compat no-op.
    Provenance must be explicit in BOTH states — a bare Engine line must never
    leave the conditioning state ambiguous after a default change."""

    def _run_main(self, extra_argv):
        planted = [{"start": 0.0, "end": 2.0, "text": "Real opening line."}]
        captured = {}
        with tempfile.TemporaryDirectory() as d:
            for name in ("audioAlice1.m4a", "audioBob2.m4a"):
                Path(d, name).touch()
            out = Path(d, "draft.md")
            orig = (tt.to_wav, tt.transcribe, tt.check_model_floors, tt.compute_envelope)

            def fake_transcribe(wav, m, l, nc=False):
                captured["no_condition"] = nc
                return list(planted)

            tt.to_wav = lambda src, wd: src
            tt.transcribe = fake_transcribe
            tt.check_model_floors = lambda **kw: None
            tt.compute_envelope = lambda wav: _np.zeros(1)
            argv = sys.argv
            sys.argv = ["tracks_transcript.py", d, "--out", str(out)] + extra_argv
            try:
                with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                    tt.main()
            finally:
                sys.argv = argv
                tt.to_wav, tt.transcribe, tt.check_model_floors, tt.compute_envelope = orig
            return captured["no_condition"], out.read_text()

    def test_default_is_no_condition(self):
        nc, draft = self._run_main([])
        self.assertTrue(nc)
        self.assertIn("`condition_on_previous_text=False` (Method S default since 2026-07-30)", draft)

    def test_condition_flag_restores_pinned_baseline(self):
        nc, draft = self._run_main(["--condition"])
        self.assertFalse(nc)
        self.assertIn("`condition_on_previous_text=True` (--condition", draft)

    def test_no_condition_flag_still_accepted_as_noop(self):
        nc, draft = self._run_main(["--no-condition"])
        self.assertTrue(nc)
        self.assertIn("`condition_on_previous_text=False` (Method S default since 2026-07-30)", draft)

    def test_both_flags_conflict_loudly(self):
        with self.assertRaises(SystemExit):
            with contextlib.redirect_stderr(io.StringIO()):
                self._run_main(["--condition", "--no-condition"])




# ── Energy-attributed dedup (commissioned 2026-08-15; spec v2 tests 1–13) ─────

from dedup import (AMBIG_MARK, DEDUP_BAND_DB, compute_envelope, dedup_pass,
                   load_fixture, span_energy_db)


def dsg(start, end, text, flagged=False):
    return {"start": start, "end": end, "text": text, "_hflag": flagged}


def env_db(db, dur):
    """Constant envelope at `db` dBFS for `dur` seconds (50 ms windows)."""
    return _np.full(max(1, int(dur / 0.05)), 10 ** (db / 20.0), dtype=_np.float32)


class DedupPass(unittest.TestCase):
    TXT = "alpha bravo charlie"  # exactly a 3-run after the stoplist (boundary pinned)

    def test_1_duplicate_resolves_to_hotter(self):
        pt = [("X", [dsg(0, 2, self.TXT)]), ("Y", [dsg(0, 2, self.TXT)])]
        envs = {"X": env_db(-30, 3), "Y": env_db(-50, 3)}
        surv, log, counts = dedup_pass(pt, envs)
        self.assertEqual(counts["resolved"], 1)
        self.assertEqual([s["text"] for s in dict(surv)["X"]], [self.TXT])  # winner clean
        self.assertEqual(dict(surv)["Y"], [])                                # loser gone
        self.assertEqual([r[1] for r in log], ["suppressed"])
        self.assertIn(self.TXT, log[0][5])                                   # text verbatim

    def test_2_class_d_energy_not_consulted(self):
        # Different words at a 20 dB split: an implementation that wrongly
        # consults energy for Class D suppresses here and FAILS.
        pt = [("X", [dsg(0, 2, "alpha bravo charlie delta")]),
              ("Y", [dsg(0, 2, "echo foxtrot golf hotel")])]
        envs = {"X": env_db(-30, 3), "Y": env_db(-50, 3)}
        surv, log, counts = dedup_pass(pt, envs)
        self.assertEqual(counts["resolved"], 0)
        self.assertEqual(counts["class_d"], 1)
        self.assertEqual(counts["ambiguous"], 0)
        self.assertTrue(all(AMBIG_MARK not in s["text"]
                            for _l, ss in surv for s in ss))

    def test_3_ambiguity_band_and_exact_boundary(self):
        # +/-3 dB: both kept, both marked, log rows present.
        pt = [("X", [dsg(0, 2, self.TXT)]), ("Y", [dsg(0, 2, self.TXT)])]
        surv, log, counts = dedup_pass(pt, {"X": env_db(-40, 3), "Y": env_db(-43, 3)})
        self.assertEqual(counts["resolved"], 0)
        self.assertEqual(counts["ambiguous"], 2)
        self.assertTrue(all(s["text"].startswith(AMBIG_MARK)
                            for _l, ss in surv for s in ss))
        self.assertEqual(sorted(r[1] for r in log), ["ambiguous", "ambiguous"])
        # Exactly 6.0 dB SUPPRESSES (spec: "< 6 dB" flags; boundary side pinned).
        surv, log, counts = dedup_pass(pt, {"X": env_db(-40, 3), "Y": env_db(-46, 3)})
        self.assertEqual(counts["resolved"], 1)
        self.assertEqual(dict(surv)["Y"], [])

    def test_4_false_swallow_control(self):
        # THE TRIPWIRE: 2 shared content tokens at 20 dB — NOT deduped. Fails
        # if anyone loosens the text screen toward fuzzy matching.
        pt = [("X", [dsg(0, 2, "alpha bravo charlie")]),
              ("Y", [dsg(0, 2, "alpha bravo different")])]
        surv, log, counts = dedup_pass(pt, {"X": env_db(-30, 3), "Y": env_db(-50, 3)})
        self.assertEqual(counts["resolved"], 0)
        self.assertEqual(len(dict(surv)["Y"]), 1)

    def test_5_echo_overlap_both_genuine(self):
        # Same words, overlapping spans, each track hot over its OWN span —
        # the per-copy semantics keep both (fails under common-span semantics).
        txt = "alpha bravo charlie delta echo"
        pt = [("X", [dsg(0, 2, txt)]), ("Y", [dsg(1, 3, txt)])]
        hot, cold = 10 ** (-30 / 20.0), 10 ** (-70 / 20.0)
        ex = _np.full(60, cold, dtype=_np.float32); ex[0:40] = hot   # X hot 0-2s
        ey = _np.full(60, cold, dtype=_np.float32); ey[20:60] = hot  # Y hot 1-3s
        surv, log, counts = dedup_pass(pt, {"X": ex, "Y": ey})
        self.assertEqual(counts["resolved"], 0, "echo must never be swallowed")
        self.assertEqual(len(dict(surv)["X"]), 1)
        self.assertEqual(len(dict(surv)["Y"]), 1)

    def test_6_digit_normalization(self):
        pt = [("X", [dsg(0, 2, "section 1 test alpha")]),
              ("Y", [dsg(0, 2, "section one test alpha")])]
        surv, log, counts = dedup_pass(pt, {"X": env_db(-30, 3), "Y": env_db(-50, 3)})
        self.assertEqual(counts["resolved"], 1)

    def test_8_known_answer_replay_05b(self):
        # Real data, shipped 16 kHz energy path (fixture generated from the
        # receipted 05b audio). Exactly the 7 ground-truth suppressions and
        # ONLY those — the false-swallow regression on real data. Also pins
        # the 48 kHz-calibrated constants revalidated at 16 kHz.
        pt, envs = load_fixture(os.path.join(os.path.dirname(__file__),
                                             "fixtures", "dedup_05b.json"))
        import json as _json
        exp = _json.load(open(os.path.join(os.path.dirname(__file__),
                                           "fixtures", "dedup_05b.json")))["expected_suppressions"]
        surv, log, counts = dedup_pass(pt, envs)
        got = sorted((r[3], round(r[0], 1)) for r in log if r[1] == "suppressed")
        self.assertEqual(got, sorted((t, round(x, 1)) for t, x in exp))
        self.assertEqual(counts["resolved"], 7)
        self.assertEqual(counts["ambiguous"], 0)
        self.assertGreaterEqual(counts["class_d"], 15)  # the overtalk zones survive

    def test_8b_known_answer_symmetric_suppression(self):
        # Fixture harvested 2026-09-01 (P03, first shared-air session — sole
        # instance in 456 suppressions). Two differently-bounded copies of ONE
        # utterance straddling a speaker handoff each measure cold over their
        # OWN span (the energy field flips mid-span), so each is suppressed in
        # favour of the other and, before 2026-09-13, the utterance vanished
        # from the draft with no warning. From 2026-09-01 to 2026-09-13 this
        # test pinned that DEFECT (zero survivors). It now pins the GUARD
        # (spec: Inputs-to-Level-0/2026-09-01_p03-run-evidence/
        # ambiguous-and-residue.md §5; trigger fired at P04 2026-09-10, two
        # more instances; the researcher ruled build-before-P05 at the 2026-09-13
        # review): the warmer copy is restored, marked for the ear, and logged.
        from dedup import RESTORE_MARK
        pt, envs = load_fixture(os.path.join(os.path.dirname(__file__),
                                             "fixtures",
                                             "dedup_symmetric_suppression.json"))
        surv, log, counts = dedup_pass(pt, envs)
        sup = [(r[3], round(r[0], 2)) for r in log if r[1] == "suppressed"]
        # the signature: opposite-direction suppressions at one moment
        self.assertEqual(sorted(sup), [("tx1", 14.65), ("tx2", 14.52)])
        # THE GUARD: exactly one copy survives — the warmer one (tx1, -7.9 dB
        # over its own span vs tx2's -12.3), which is the copy the hand restore
        # chose on 2026-09-01 — carrying the restore mark for the ear.
        alive = [(lb, s_) for lb, sg in surv for s_ in sg]
        self.assertEqual(len(alive), 1)
        self.assertEqual(alive[0][0], "tx1")
        self.assertTrue(alive[0][1]["text"].startswith(RESTORE_MARK))
        self.assertIn("that plan just didn't hold up the way we hoped", alive[0][1]["text"])
        self.assertEqual(counts["resolved"], 1)      # one copy actually removed
        self.assertEqual(counts["restored"], 1)
        rest = [r for r in log if r[1].startswith("restored")]
        self.assertEqual(len(rest), 1)
        self.assertEqual((rest[0][2], rest[0][3]), ("tx1", "tx2"))  # kept / lost

    def _symmetric_pair(self, t1="alpha bravo charlie delta", t2="alpha bravo charlie"):
        # Synthetic symmetric suppression: X's copy spans [0,2), Y's spans
        # [1,3); X is hot only in [2,3) and Y only in [0,1). Over X's own span
        # X is cold (Y's hot second wins) and over Y's own span Y is cold (X's
        # hot second wins) — each copy loses to the other, as at P03 25:49.
        x = _np.concatenate([env_db(-50, 2), env_db(-30, 1)])
        y = _np.concatenate([env_db(-30, 1), env_db(-50, 2)])
        pt = [("X", [dsg(0, 2, t1)]), ("Y", [dsg(1, 3, t2)])]
        return pt, {"X": x, "Y": y}

    def test_8c_symmetric_guard_restores_one_copy(self):
        from dedup import RESTORE_MARK
        pt, envs = self._symmetric_pair()
        surv, log, counts = dedup_pass(pt, envs)
        alive = [(lb, s_) for lb, sg in surv for s_ in sg]
        self.assertEqual(len(alive), 1)
        # equal margins (-20/-20): tie broken toward the copy with more
        # content tokens, so no words are lost that the log can still show
        self.assertEqual(alive[0][0], "X")
        self.assertTrue(alive[0][1]["text"].startswith(RESTORE_MARK))
        self.assertTrue(alive[0][1]["text"].endswith("alpha bravo charlie delta"))
        self.assertEqual(counts, {"resolved": 1, "ambiguous": 0, "class_d": 0, "restored": 1})
        # both suppressions stay in the log (history), plus one restored row
        self.assertEqual([r[1] for r in log].count("suppressed"), 2)
        self.assertEqual(sum(1 for r in log if r[1].startswith("restored")), 1)

    def test_8g_guard_catches_the_chain_case(self):
        # P04 08:09/08:11 shape, the case BOTH partner-based invariants miss
        # ("some partner survives" and the spec's "the winner survives" —
        # shown on the P04 re-run 2026-09-13, which caught 08:27 and not
        # this). X's long copy loses to both of Y's copies; Y's head copy
        # survives and covers X's head; Y's tail copy lost only to X and also
        # overlaps a KEPT X segment that covers only ITS tail. The middle
        # words ("delta echo") are in two suppressed copies and no kept one.
        from dedup import RESTORE_MARK
        x = _np.concatenate([env_db(-50, 2), env_db(-30, 1)])
        y = _np.concatenate([env_db(-30, 1), env_db(-50, 2)])
        pt = [("X", [dsg(0, 2, "alpha bravo charlie delta echo"),
                     dsg(2, 3, "foxtrot golf hotel india")]),
              ("Y", [dsg(0, 1, "alpha bravo charlie"),
                     dsg(1, 2.6, "charlie delta echo foxtrot golf hotel")])]
        surv, log, counts = dedup_pass(pt, {"X": x, "Y": y})
        xs, ys = dict(surv)["X"], dict(surv)["Y"]
        self.assertEqual([s_["text"] for s_ in xs], ["foxtrot golf hotel india"])  # kept X
        self.assertEqual(len(ys), 2)
        self.assertEqual(ys[0]["text"], "alpha bravo charlie")      # untouched
        self.assertTrue(ys[1]["text"].startswith(RESTORE_MARK))     # restored in full
        self.assertTrue(ys[1]["text"].endswith("charlie delta echo foxtrot golf hotel"))
        self.assertEqual(counts["resolved"], 1)
        self.assertEqual(counts["restored"], 1)

    def test_8i_guard_catches_the_near_adjacent_case(self):
        # THE P04 08:09/08:11 GEOMETRY, replayed from the captured session
        # inputs on 2026-09-13 (tokens substituted; bounds and energy shape
        # kept): the two suppressed copies overlap 0.5 s where pairing needs
        # 1.75 s, so they never pair; each loses to a different KEPT
        # neighbour that carries only its head or only its tail. The middle
        # words ("echo foxtrot golf") are in both suppressed copies and in no
        # kept one. Both partner-based rules AND the pair-only coverage rule
        # missed this on the real run (one restore instead of two).
        from dedup import RESTORE_MARK
        x = _np.concatenate([env_db(-50, 4), env_db(-30, 4)])
        y = _np.concatenate([env_db(-30, 3), env_db(-50, 5)])
        pt = [("X", [dsg(0, 4, "alpha bravo charlie delta echo foxtrot golf"),
                     dsg(4, 8, "hotel india juliet kilo")]),
              ("Y", [dsg(0, 3, "alpha bravo charlie delta"),
                     dsg(3.5, 7, "echo foxtrot golf hotel india juliet")])]
        surv, log, counts = dedup_pass(pt, {"X": x, "Y": y})
        xs, ys = dict(surv)["X"], dict(surv)["Y"]
        self.assertEqual([s_["text"] for s_ in ys], ["alpha bravo charlie delta"])
        self.assertEqual(len(xs), 2)
        self.assertTrue(xs[0]["text"].startswith(RESTORE_MARK))     # x0 back (tie → more tokens)
        self.assertTrue(xs[0]["text"].endswith("alpha bravo charlie delta echo foxtrot golf"))
        self.assertEqual(xs[1]["text"], "hotel india juliet kilo")
        self.assertEqual(counts["resolved"], 1)                      # y1 stays suppressed
        self.assertEqual(counts["restored"], 1)
        self.assertEqual(counts["class_d"], 0)                       # near-adjacent ≠ Class D

    def test_8h_guard_silent_when_a_kept_copy_covers_the_shared_run(self):
        # THE CONTROL for 8g: same geometry, but the kept X segment now also
        # carries the middle words, so nothing is lost and nothing is restored.
        x = _np.concatenate([env_db(-50, 2), env_db(-30, 1)])
        y = _np.concatenate([env_db(-30, 1), env_db(-50, 2)])
        pt = [("X", [dsg(0, 2, "alpha bravo charlie delta echo"),
                     dsg(2, 3, "delta echo foxtrot golf hotel india")]),
              ("Y", [dsg(0, 1, "alpha bravo charlie"),
                     dsg(1, 2.6, "charlie delta echo foxtrot golf hotel")])]
        surv, log, counts = dedup_pass(pt, {"X": x, "Y": y})
        self.assertEqual(counts["restored"], 0)
        self.assertFalse(any(r[1].startswith("restored") for r in log))

    def test_8d_guard_silent_on_ordinary_suppression(self):
        # A normal asymmetric bleed pair (hot copy wins, cold copy loses) must
        # not trip the guard: the survivor IS the surviving copy.
        pt = [("H", [dsg(0, 2, self.TXT)]), ("C", [dsg(0, 2, self.TXT)])]
        surv, log, counts = dedup_pass(pt, {"H": env_db(-30, 3), "C": env_db(-50, 3)})
        self.assertEqual(counts["restored"], 0)
        self.assertFalse(any(r[1].startswith("restored") for r in log))
        self.assertEqual(len(dict(surv)["H"]), 1)
        self.assertEqual(dict(surv)["C"], [])

    def test_8e_guard_noop_when_not_resolving(self):
        # resolve=False suppresses nothing, so there is nothing to restore.
        pt, envs = self._symmetric_pair()
        surv, log, counts = dedup_pass(pt, envs, resolve=False)
        self.assertEqual(counts["restored"], 0)
        self.assertEqual(sum(len(sg) for _lb, sg in surv), 2)

    def test_8f_guard_detail_actions_leave_lag_calibration(self):
        # lag.py calibrates on detail actions "suppressed"/"kept" only; a
        # symmetric pair is exactly the case where neither copy's source is
        # confident, so both records must leave that set.
        pt, envs = self._symmetric_pair()
        detail = []
        dedup_pass(pt, envs, detail=detail)
        acts = sorted(d["action"] for d in detail)
        self.assertEqual(acts, ["restored", "suppressed (symmetric)"])

    def test_9_energy_path_real_audio(self):
        # The suite must exercise the actual windower (QA F1): two wavs
        # synthesized at runtime at a known ~20 dB ratio; margin within 1 dB.
        import wave as _wave
        rng = _np.random.default_rng(0)
        noise = rng.standard_normal(32000).astype(_np.float32)  # 2 s @ 16 kHz
        with tempfile.TemporaryDirectory() as d:
            paths = {}
            for name, amp in (("hot", 0.1), ("cold", 0.01)):
                p = os.path.join(d, name + ".wav")
                with _wave.open(p, "wb") as w:
                    w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000)
                    w.writeframes((noise * amp * 32767).astype("<i2").tobytes())
                paths[name] = p
            eh, ec = compute_envelope(paths["hot"]), compute_envelope(paths["cold"])
        margin = span_energy_db(eh, 0, 2) - span_energy_db(ec, 0, 2)
        self.assertAlmostEqual(margin, 20.0, delta=1.0)
        pt = [("H", [dsg(0, 2, self.TXT)]), ("C", [dsg(0, 2, self.TXT)])]
        surv, log, counts = dedup_pass(pt, {"H": eh, "C": ec})
        self.assertEqual(dict(surv)["C"], [])  # cold copy suppressed

    def test_10_hallucination_excluded_both_directions(self):
        # A flagged segment (Class C) neither wins a pair (suppressing real
        # speech) nor loses one (it is disposed via the scan table, not here).
        pt = [("X", [dsg(0, 2, self.TXT, flagged=True)]),
              ("Y", [dsg(0, 2, self.TXT)])]
        surv, log, counts = dedup_pass(pt, {"X": env_db(-30, 3), "Y": env_db(-50, 3)})
        self.assertEqual(counts["resolved"], 0)
        self.assertEqual(log, [])
        self.assertEqual(len(dict(surv)["X"]), 1)
        self.assertEqual(len(dict(surv)["Y"]), 1)

    def test_12_degenerate_spans_no_crash(self):
        # Zero-length span: no counterpart, kept, no NaN suppression.
        pt = [("X", [dsg(2.0, 2.0, self.TXT)]), ("Y", [dsg(1, 3, self.TXT)])]
        surv, log, counts = dedup_pass(pt, {"X": env_db(-30, 3), "Y": env_db(-50, 3)})
        self.assertEqual(counts["resolved"], 0)
        self.assertEqual(len(dict(surv)["X"]), 1)
        # Same-file-twice: every pair at ~0 dB -> ambiguous, ZERO suppressions.
        pt = [("X", [dsg(0, 2, self.TXT)]), ("Y", [dsg(0, 2, self.TXT)])]
        surv, log, counts = dedup_pass(pt, {"X": env_db(-30, 3), "Y": env_db(-30, 3)})
        self.assertEqual(counts["resolved"], 0)
        self.assertEqual(counts["ambiguous"], 2)

    def test_13_n3_downgrade_detect_and_flag(self):
        # n>2: resolve=False — marks and logs, suppresses NOTHING (uncalibrated
        # pairwise semantics can conflict; the researcher ruling Q2).
        pt = [("X", [dsg(0, 2, self.TXT)]), ("Y", [dsg(0, 2, self.TXT)]),
              ("Z", [dsg(10, 12, "unrelated words here")])]
        envs = {"X": env_db(-30, 13), "Y": env_db(-50, 13), "Z": env_db(-40, 13)}
        surv, log, counts = dedup_pass(pt, envs, resolve=False)
        self.assertEqual(counts["resolved"], 0)
        self.assertEqual(len(dict(surv)["Y"]), 1)          # nothing deleted
        self.assertIn("flagged (no-resolve)", [r[1] for r in log])


class DedupEmission(unittest.TestCase):
    """Stub-main tests: the no-op contract (test 7) and flag semantics (test 11)."""

    def _run(self, planted, extra_argv, workdir=None, envs=None):
        # envs: optional {planted filename: envelope} — per-track envelopes for
        # tests that need an energy geometry (the guard tests); default is one
        # flat envelope for every track.
        ctx = contextlib.nullcontext(workdir) if workdir else tempfile.TemporaryDirectory()
        with ctx as d:
            for name in planted:
                Path(d, name).touch()
            out = Path(d, f"draft{'-'.join(extra_argv) or 'default'}.md")
            orig = (tt.to_wav, tt.transcribe, tt.check_model_floors,
                    tt.compute_envelope, os.remove)
            tt.to_wav = lambda src, wd: src
            tt.transcribe = lambda wav, m, l, nc=False: [dict(s) for s in planted[Path(wav).name]]
            tt.check_model_floors = lambda **kw: None
            tt.compute_envelope = ((lambda wav: envs[Path(wav).name]) if envs
                                   else (lambda wav: env_db(-40, 30)))
            _os_remove = os.remove
            os.remove = lambda p: None
            argv = sys.argv
            sys.argv = ["tracks_transcript.py", d, "--out", str(out)] + extra_argv
            try:
                with contextlib.redirect_stdout(io.StringIO()), \
                     contextlib.redirect_stderr(io.StringIO()):
                    tt.main()
            finally:
                sys.argv = argv
                (tt.to_wav, tt.transcribe, tt.check_model_floors,
                 tt.compute_envelope, _) = orig
                os.remove = _os_remove
            return out.read_text()

    DISJOINT = {
        "audioAlice1.m4a": [{"start": 0.0, "end": 2.0, "text": "Her own words."}],
        "audioBob2.m4a": [{"start": 5.0, "end": 7.0, "text": "His different reply."}],
    }

    # --- symmetric-suppression guard in the draft (2026-09-13) ----------------
    SYM = {   # Insta360-shaped stems (shared air, so the pass resolves); the
              # P03 25:49 geometry: two bounded copies across a handoff
        "audio_260910_075857_32bit-tx1_orig.wav": [{"start": 0.0, "end": 2.0,
                                                    "text": "alpha bravo charlie delta"}],
        "audio_260910_075857_32bit-tx2_orig.wav": [{"start": 1.0, "end": 3.0,
                                                    "text": "alpha bravo charlie"}],
    }
    SYM_ENVS = {
        "audio_260910_075857_32bit-tx1_orig.wav": _np.concatenate([env_db(-50, 2), env_db(-30, 1)]),
        "audio_260910_075857_32bit-tx2_orig.wav": _np.concatenate([env_db(-30, 1), env_db(-50, 2)]),
    }

    def test_14_symmetric_guard_in_the_draft(self):
        from dedup import RESTORE_MARK
        draft = self._run(self.SYM, ["--no-lag"], envs=self.SYM_ENVS)
        self.assertIn("**Dedup guard: 1 symmetric suppression(s)**", draft)
        self.assertIn("1 symmetric-suppression restore(s)", draft)       # tally
        self.assertIn("| restored (symmetric) | 260910_075857_32bit-tx1_orig | "
                      "260910_075857_32bit-tx2_orig |", draft)             # log row
        self.assertIn(RESTORE_MARK, draft)
        # the utterance is IN the transcript body, not only in the log
        body = draft.split("## Attributed transcript", 1)[1]
        self.assertIn("alpha bravo charlie delta", body)

    def test_14b_control_ordinary_suppression_reads_clean(self):
        # Same stems, hot/cold geometry: tx2's copy loses normally, tx1's
        # survives, and the guard line says so — it never fires here.
        planted = {k: [dict(v[0], start=0.0, end=2.0, text="alpha bravo charlie")]
                   for k, v in self.SYM.items()}
        envs = {list(self.SYM)[0]: env_db(-30, 30), list(self.SYM)[1]: env_db(-50, 30)}
        draft = self._run(planted, ["--no-lag"], envs=envs)
        self.assertIn("**Dedup guard:** clean — every one of the 1 suppressed", draft)
        self.assertNotIn("DEDUP-RESTORED", draft)
        self.assertNotIn("restored (symmetric)", draft)

    def test_7_zoom_noop_contract(self):
        # Same source dir for both runs so the Source header line is identical
        # and the byte-identity claim stays strict.
        with tempfile.TemporaryDirectory() as d:
            on = self._run(self.DISJOINT, [], workdir=d)
            off = self._run(self.DISJOINT, ["--no-dedup"], workdir=d)
        self.assertIn("**Dedup:** on — resolved 0 / ambiguous 0 / Class D 0", on)
        self.assertIn("**Dedup:** off (--no-dedup)", off)
        self.assertNotIn("## Dedup log", on)
        self.assertNotIn("## Dedup log", off)
        strip = lambda t: "\n".join(l for l in t.splitlines()
                                     if not l.startswith("**Dedup:**"))
        self.assertEqual(strip(on), strip(off))  # byte-identical modulo the one line

    # --- capture scoping (the researcher's ruling 2026-08-23) ------------------------
    # The 2026-08-21 P01 run was the dedup pass's first live outing on a ZOOM
    # (network-separated) recording, and it flagged 5 segments ambiguous. All five
    # were dispositioned GENUINE SPEECH: the paired texts are different sentences
    # sharing a phrase (Theo repeating the interviewer's wording back), and the two tracks
    # measure acoustically independent — span cross-correlation 0.027-0.072 where
    # real bleed reads 0.245-0.466. On network-separated capture there is no shared
    # air, so a cross-track match CANNOT be bleed; every ambiguous flag there is
    # necessarily a false positive.
    ECHO = {
        # Same shape as the real P01 pairs: different utterances, shared run of
        # >=3 content tokens, which is all dedup's matcher requires.
        "audioAlice1.m4a": [{"start": 20.0, "end": 23.0,
                             "text": "so you never use the planning tool for the, for the"}],
        "audioBob2.m4a":   [{"start": 21.5, "end": 24.5,
                             "text": "never use the planning tool so the schedule"}],
    }

    # Zoom-shaped stems: every per-participant file ends in the same meeting-id
    # run, exactly as all three real Zoom recordings on disk do.
    ZOOM_ECHO = {
        "audioAlice11234567890.m4a": [{"start": 20.0, "end": 23.0,
                                       "text": "so you never use the planning tool for the, for the"}],
        "audioBob21234567890.m4a":   [{"start": 21.5, "end": 24.5,
                                       "text": "never use the planning tool so the schedule"}],
    }
    INSTA_ECHO = {
        "audio_260815_183229_32bit-tx1_orig.m4a": [{"start": 20.0, "end": 23.0,
                                                    "text": "so you never use the planning tool for the, for the"}],
        "audio_260815_183229_32bit-tx2_orig.m4a": [{"start": 21.5, "end": 24.5,
                                                    "text": "never use the planning tool so the schedule"}],
    }

    def test_13_detects_zoom_from_shared_meeting_id_suffix(self):
        draft = self._run(self.ZOOM_ECHO, [])           # NO --capture flag
        self.assertIn("**Dedup:** not run", draft)
        self.assertIn("detected", draft)
        self.assertNotIn("DEDUP-AMBIGUOUS", draft)

    def test_13b_detects_insta360_from_wearer_marker(self):
        draft = self._run(self.INSTA_ECHO, [])          # NO --capture flag
        self.assertIn("**Dedup:** on", draft)
        self.assertIn("Insta360", draft)
        self.assertIn("DEDUP-AMBIGUOUS", draft)          # shared air: bleed is possible, so flag

    def test_13c_explicit_flag_overrides_detection_both_ways(self):
        # THE CONTROL. Without it, detection could be hardwired and every test
        # above would still pass. Force the WRONG answer on each shape and check
        # the tool obeys the operator, and says that it is overriding.
        z = self._run(self.ZOOM_ECHO, ["--capture", "shared-air"])
        self.assertIn("**Dedup:** on", z)
        self.assertIn("overrides detection", z)
        i = self._run(self.INSTA_ECHO, ["--capture", "network-separated"])
        self.assertIn("**Dedup:** not run", i)
        self.assertIn("overrides detection", i)

    def test_13d_undetermined_ASKS_but_only_when_it_changed_the_output(self):
        # Unmarked folder + cross-matches: assume shared-air, but ask out loud.
        asked = self._run(self.ECHO, [])
        self.assertIn("CAPTURE TYPE UNDETERMINED", asked)
        self.assertIn("--capture network-separated", asked)
        # Unmarked folder, NO cross-matches: capture type is moot, do not nag.
        quiet = self._run(self.DISJOINT, [])
        self.assertNotIn("CAPTURE TYPE UNDETERMINED", quiet)

    def test_13e_detector_unit_cases(self):
        import tempfile, pathlib
        with tempfile.TemporaryDirectory() as d:
            for n in self.ZOOM_ECHO: pathlib.Path(d, n).touch()
            cap, ev = tt.detect_capture([d], sorted(str(p) for p in pathlib.Path(d).iterdir()))
            self.assertEqual(cap, "network-separated"); self.assertIn("meeting-id", ev)
        with tempfile.TemporaryDirectory() as d:
            for n in self.INSTA_ECHO: pathlib.Path(d, n).touch()
            cap, _ = tt.detect_capture([d], sorted(str(p) for p in pathlib.Path(d).iterdir()))
            self.assertEqual(cap, "shared-air")
        with tempfile.TemporaryDirectory() as d:
            for n in ("audioAlice1.m4a", "audioBob2.m4a"): pathlib.Path(d, n).touch()
            cap, _ = tt.detect_capture([d], sorted(str(p) for p in pathlib.Path(d).iterdir()))
            self.assertIsNone(cap, "an unmarked folder must be UNDETERMINED, never guessed")
        with tempfile.TemporaryDirectory() as d:
            # recording.conf beside the tracks is decisive even without the suffix
            for n in ("audioAlice1.m4a", "audioBob2.m4a"): pathlib.Path(d, n).touch()
            pathlib.Path(d, "recording.conf").write_text("{}")
            cap, ev = tt.detect_capture([d], [str(pathlib.Path(d, n)) for n in ("audioAlice1.m4a", "audioBob2.m4a")])
            self.assertEqual(cap, "network-separated"); self.assertIn("recording.conf", ev)

    def test_12_network_separated_does_not_flag_conversational_echo(self):
        draft = self._run(self.ECHO, ["--capture", "network-separated"])
        self.assertIn("**Dedup:** not run", draft)
        self.assertIn("network-separated", draft)
        self.assertNotIn("DEDUP-AMBIGUOUS", draft)
        self.assertNotIn("## Dedup log", draft)
        # Both utterances survive, on their own tracks, unaltered.
        self.assertIn("planning tool for the", draft)
        self.assertIn("so the schedule", draft)

    def test_12b_control_same_input_DOES_flag_under_shared_air(self):
        # THE CONTROL WITH TEETH. Without it, test_12 is equally satisfied by a
        # build that broke dedup outright, or by a matcher that never fires on
        # this input at all — in which case the scoping would be doing nothing
        # and the green would be meaningless.
        draft = self._run(self.ECHO, [])          # default = shared-air
        self.assertIn("**Dedup:** on", draft)
        self.assertIn("DEDUP-AMBIGUOUS", draft)

    def test_12c_default_is_shared_air_the_fail_safe_direction(self):
        # Forgetting the flag must keep the safety net ON. The reverse default
        # would silently disable bleed handling on the rig that needs it.
        self.assertIn("**Dedup:** on", self._run(self.DISJOINT, []))
        self.assertIn("**Dedup:** on", self._run(self.DISJOINT, ["--capture", "shared-air"]))

    def test_12d_no_dedup_still_wins_and_names_its_own_reason(self):
        d1 = self._run(self.ECHO, ["--no-dedup"])
        self.assertIn("**Dedup:** off (--no-dedup)", d1)
        d2 = self._run(self.ECHO, ["--no-dedup", "--capture", "network-separated"])
        self.assertIn("**Dedup:** off (--no-dedup)", d2)   # explicit off is not masked

    def test_11_dedup_default_and_flag_conflict(self):
        draft = self._run(self.DISJOINT, ["--dedup"])
        self.assertIn("**Dedup:** on", draft)
        with self.assertRaises(SystemExit):
            with contextlib.redirect_stderr(io.StringIO()):
                self._run(self.DISJOINT, ["--dedup", "--no-dedup"])

    def test_suppression_and_log_render_end_to_end(self):
        # A bleed pair through the REAL main(): loser leaves the body, appears
        # verbatim in the Dedup log; talk time recomputed from survivors.
        planted = {
            "audioAlice1.m4a": [{"start": 0.0, "end": 2.0, "text": "Alpha bravo charlie delta."}],
            "audioBob2.m4a": [{"start": 0.0, "end": 2.0, "text": "Alpha bravo charlie delta."},
                              {"start": 5.0, "end": 7.0, "text": "His own real words."}],
        }
        with tempfile.TemporaryDirectory() as d:
            for name in planted:
                Path(d, name).touch()
            out = Path(d, "draft.md")
            orig = (tt.to_wav, tt.transcribe, tt.check_model_floors,
                    tt.compute_envelope, os.remove)
            tt.to_wav = lambda src, wd: src
            tt.transcribe = lambda wav, m, l, nc=False: [dict(s) for s in planted[Path(wav).name]]
            tt.check_model_floors = lambda **kw: None
            tt.compute_envelope = (lambda wav: env_db(-30, 10)
                                   if "Alice" in wav else env_db(-50, 10))
            _os_remove = os.remove
            os.remove = lambda p: None
            argv = sys.argv
            sys.argv = ["tracks_transcript.py", d, "--out", str(out)]
            try:
                with contextlib.redirect_stdout(io.StringIO()), \
                     contextlib.redirect_stderr(io.StringIO()):
                    tt.main()
            finally:
                sys.argv = argv
                (tt.to_wav, tt.transcribe, tt.check_model_floors,
                 tt.compute_envelope, _) = orig
                os.remove = _os_remove
            draft = out.read_text()
        self.assertIn("**Alice:** Alpha bravo charlie delta.", draft)
        self.assertNotIn("**Bob:** Alpha bravo charlie delta.", draft)   # suppressed copy
        self.assertIn("**Bob:** His own real words.", draft)             # genuine speech survives
        self.assertIn("## Dedup log", draft)
        self.assertIn("suppressed", draft)
        self.assertIn("resolved 1 /", draft)
        # Talk-time recomputed from survivors: Bob keeps 2 s (his own words),
        # not 4 s (his words + the suppressed bleed copy).
        import re as _re
        bob_row = next(l for l in draft.splitlines() if "| **Bob** |" in l)
        self.assertIn("0:02", bob_row)


if __name__ == "__main__":
    unittest.main(verbosity=2)
