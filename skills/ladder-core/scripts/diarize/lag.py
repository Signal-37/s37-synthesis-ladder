#!/usr/bin/env python
"""lag.py — arrival-time (cross-track lag) hints for the Method S dedup's ambiguous band.

Commissioned by J. Scott King 2026-09-10 after the P04 test (vault: Research/2026-09/
2026-09-10_shared-air-transcription-methods.md → "Test on P04"). A HINT, never a decider:
suppression is unchanged; every ambiguous copy gains the lag's answer and its correlation
peak so the ear pass starts with two instruments instead of one.

Physics: with one worn mic per speaker, the speaker's own mic hears the event first, by
distance/343 m/s (≈5 ms at 1.75 m). Band-passed normalised cross-correlation between the
two tracks over a copy's own span gives a peak at the arrival difference; after removing
the per-session clock offset between the two recorders (fitted on that session's confident
suppressions, where energy already named the speaker), the sign names the speaker.

Measured on P04 (2026-09-10): calibration sign agreement 99.9% on 1,027 confident copies;
on the 184 ear-ruled ambiguous copies the lag alone agreed with the ear 85.9% (energy 83.7%),
and where lag and energy agreed (87% of the band) 89.4%. Its known failure: a window that
holds both voices (the interviewer finishing or echoing the answer) reports the louder
talker, not the owner of the words. Hence hint, not verdict.
"""
import wave
import numpy as np

SR = 16000
BAND_HZ = (300.0, 3400.0)
SEARCH_MS = 25.0        # per-copy search half-width around the clock offset
COARSE_MS = 600.0       # half-width for the initial clock-offset search
COARSE_WINDOWS = 12
MIN_SPAN_S = 0.3        # shorter copies get no lag (too little signal)
WEAK_PEAK = 0.15        # below this the lag is reported but marked weak
_SOS = None


def load_pcm16k(wav_path):
    """Read the tool's 16 kHz mono s16 intermediate into int16 (kept small in RAM)."""
    with wave.open(wav_path, "rb") as w:
        if w.getframerate() != SR or w.getnchannels() != 1 or w.getsampwidth() != 2:
            raise ValueError(f"expected 16 kHz mono s16, got {w.getframerate()} Hz / "
                             f"{w.getnchannels()} ch / {w.getsampwidth()} B in {wav_path}")
        return np.frombuffer(w.readframes(w.getnframes()), dtype="<i2")


def _bandpass(x):
    global _SOS
    from scipy.signal import butter, sosfiltfilt
    if _SOS is None:
        _SOS = butter(4, BAND_HZ, btype="band", fs=SR, output="sos")
    return sosfiltfilt(_SOS, x.astype(np.float32)).astype(np.float32)


def ncc_lag(a, b, start, end, center_ms=0.0, search_ms=SEARCH_MS, pad_s=0.1):
    """Normalised cross-correlation of tracks a and b over [start, end] (+pad).
    Returns (peak, lag_ms) or None if the span is too short. lag_ms > 0 means the
    event appears LATER on b — it reached a's mic first."""
    from scipy.signal import correlate
    i0 = max(0, int((start - pad_s) * SR)); i1 = min(len(a), len(b), int((end + pad_s) * SR))
    if i1 - i0 < MIN_SPAN_S * SR:
        return None
    aw = _bandpass(a[i0:i1]); bw = _bandpass(b[i0:i1])
    aw -= aw.mean(); bw -= bw.mean()
    den = float(np.sqrt(np.dot(aw, aw) * np.dot(bw, bw))) + 1e-9
    cc = correlate(aw, bw, mode="full", method="fft")        # index k ↔ lag k-(n-1), a vs b
    n = len(aw); lags = np.arange(-(n - 1), n)
    # search window expressed in scipy's (negated) lag axis
    lo = int(round((-center_ms - search_ms) / 1000 * SR)); hi = int(round((-center_ms + search_ms) / 1000 * SR))
    sel = (lags >= lo) & (lags <= hi)
    if not sel.any():
        return None
    k = int(np.argmax(cc[sel])); lag = int(lags[sel][k])
    # scipy's lag axis is sum a[n+lag]*b[n]: an event that reaches a FIRST (b delayed)
    # peaks at NEGATIVE lag, so negate to honour the docstring convention.
    return float(cc[sel][k] / den), -lag / SR * 1000.0


def coarse_offset(a, b, n_windows=COARSE_WINDOWS, win_s=3.0):
    """Median lag over the loudest of n evenly spaced windows — the clock offset to a
    few ms, before the per-speaker arrival delta is known."""
    dur = min(len(a), len(b)) / SR
    if dur < 30:
        return 0.0
    out = []
    for t in np.linspace(30, dur - win_s - 1, n_windows):
        r = ncc_lag(a, b, t, t + win_s, center_ms=0.0, search_ms=COARSE_MS)
        if r:
            out.append(r[1])
    return float(np.median(out)) if out else 0.0


def calibrate(meas):
    """meas: [(t_s, lag_ms, s)] with s=+1 when the event's true source is track A.
    Fits lag = offset + drift*t + s*delta. Returns the fit and its sign agreement."""
    if len(meas) < 10:
        return None
    T = np.array([m[0] for m in meas]); L = np.array([m[1] for m in meas]); s = np.array([m[2] for m in meas])
    X = np.column_stack([np.ones_like(T), T / 3600.0, s])
    coef = np.linalg.lstsq(X, L, rcond=None)[0]
    off, drift, delta = (float(c) for c in coef)
    sg = 1.0 if delta >= 0 else -1.0
    agree = float(np.mean(np.sign((L - (off + drift * T / 3600.0)) * sg) == s))
    resid = float(np.std(L - X @ coef))
    return dict(offset_ms=off, drift_ms_per_h=drift, delta_ms=abs(delta), sign=sg,
                agreement=agree, n=len(meas), resid_ms=resid)


def lag_hints(arrays, labels, copies):
    """arrays: {label: int16 16 kHz}; labels: [A, B] (exactly two); copies: the dedup
    pass's `detail` records — dicts with label, start, end, action ∈ {suppressed,
    ambiguous, kept}, partner (the other label).
    Returns (hints, calib): hints keyed (label, start) → dict(owner, peak, lag_ms, quality)
    for EVERY copy measured; calib as from calibrate(), plus the coarse offset."""
    A, B = labels
    a, b = arrays[A], arrays[B]
    coarse = coarse_offset(a, b)
    meas_all = {}
    for c in copies:
        r = ncc_lag(a, b, c["start"], c["end"], center_ms=coarse)
        meas_all[(c["label"], c["start"])] = r
    # calibration: confident copies only — suppressed (true source = partner) and kept (own)
    cal = []
    for c in copies:
        r = meas_all[(c["label"], c["start"])]
        if r is None or c["action"] not in ("suppressed", "kept"):
            continue
        true = c["partner"] if c["action"] == "suppressed" else c["label"]
        cal.append((c["start"], r[1], 1.0 if true == A else -1.0))
    calib = calibrate(cal)
    hints = {}
    for c in copies:
        r = meas_all[(c["label"], c["start"])]
        if r is None:
            hints[(c["label"], c["start"])] = dict(owner=None, peak=None, lag_ms=None, quality="n/a")
            continue
        peak, lag = r
        if calib is None:
            hints[(c["label"], c["start"])] = dict(owner=None, peak=peak, lag_ms=lag, quality="uncalibrated")
            continue
        dl = (lag - (calib["offset_ms"] + calib["drift_ms_per_h"] * c["start"] / 3600.0)) * calib["sign"]
        owner = A if dl > 0 else B
        hints[(c["label"], c["start"])] = dict(owner=owner, peak=peak, lag_ms=lag,
                                               quality="weak" if peak < WEAK_PEAK else "ok")
    if calib is not None:
        calib["coarse_offset_ms"] = coarse
    return hints, calib


def hint_str(h, short=False):
    """Render a hint for the draft: `→Label (0.31)`, `→Label (0.09, weak)`, `n/a`."""
    if h is None or h["quality"] in ("n/a", "uncalibrated"):
        return "n/a" if (h is None or h["quality"] == "n/a") else "uncalibrated"
    s = f"→{h['owner']} ({h['peak']:.2f}"
    return s + (", weak)" if h["quality"] == "weak" else ")")
