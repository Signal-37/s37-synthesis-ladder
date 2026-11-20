"""Arrival-lag hint (lag.py) — three focused tests: the lag measurement on a synthetic
two-mic pair, the clock-offset calibration, and the dedup `detail` hook that feeds it."""
import unittest
import numpy as np

from lag import SR, ncc_lag, calibrate, lag_hints
from dedup import dedup_pass


def _two_mic_pair(delay_samples, seconds=3.0, bleed=0.3, noise=0.02, seed=1):
    """Source speech-like noise burst on mic A; the same event arrives on mic B
    delay_samples later at `bleed` amplitude. Independent noise on both."""
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    src = rng.standard_normal(n).astype(np.float32)
    a = src + noise * rng.standard_normal(n)
    b = np.zeros(n, dtype=np.float32); b[delay_samples:] = bleed * src[:n - delay_samples]
    b += noise * rng.standard_normal(n)
    return (a * 8000).astype(np.int16), (b * 8000).astype(np.int16)


class LagMeasurement(unittest.TestCase):
    def test_event_reaching_a_first_gives_positive_lag(self):
        a, b = _two_mic_pair(delay_samples=80)          # 5.0 ms at 16 kHz
        peak, lag_ms = ncc_lag(a, b, 0.2, 2.8)
        self.assertGreater(peak, 0.5)
        self.assertAlmostEqual(lag_ms, 5.0, delta=0.15)

    def test_short_span_returns_none(self):
        a, b = _two_mic_pair(delay_samples=80)
        self.assertIsNone(ncc_lag(a, b, 1.0, 1.02))


class Calibration(unittest.TestCase):
    def test_recovers_offset_drift_and_delta(self):
        rng = np.random.default_rng(2)
        meas = []
        for t in np.linspace(0, 3600, 200):
            s = 1.0 if rng.random() < 0.5 else -1.0
            meas.append((t, 20.0 + 0.5 * t / 3600 + s * 5.0 + rng.normal(0, 0.3), s))
        c = calibrate(meas)
        self.assertAlmostEqual(c["offset_ms"], 20.0, delta=0.3)
        self.assertAlmostEqual(c["drift_ms_per_h"], 0.5, delta=0.3)
        self.assertAlmostEqual(c["delta_ms"], 5.0, delta=0.2)
        self.assertEqual(c["sign"], 1.0)
        self.assertGreater(c["agreement"], 0.99)


class DetailHook(unittest.TestCase):
    def test_detail_records_every_copy_and_changes_no_decision(self):
        pt = [("X", [{"start": 0.0, "end": 2.0, "text": "the quick brown fox jumps"}]),
              ("Y", [{"start": 0.1, "end": 2.1, "text": "quick brown fox jumps over"}])]
        env_x = np.full(60, 10 ** (-40 / 20), dtype=np.float32)   # X hot
        env_y = np.full(60, 10 ** (-50 / 20), dtype=np.float32)   # Y 10 dB colder -> Y copy suppressed
        d = []
        surv, log, counts = dedup_pass(pt, {"X": env_x, "Y": env_y}, detail=d)
        surv2, log2, counts2 = dedup_pass(pt, {"X": env_x, "Y": env_y})
        self.assertEqual((log, counts), (log2, counts2))          # bookkeeping only
        self.assertEqual(sorted(c["action"] for c in d), ["kept", "suppressed"])
        self.assertEqual({c["label"] for c in d}, {"X", "Y"})
        self.assertTrue(all(c["end"] > c["start"] for c in d))


if __name__ == "__main__":
    unittest.main()
