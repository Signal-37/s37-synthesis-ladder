#!/usr/bin/env python
"""dedup.py — energy-attributed dedup for Method S shared-air recordings.

Commissioned by J. Scott King 2026-08-15 (spec: Inputs-to-Level-0/
2026-08-15_energy-dedup-tool-spec.md v2, tri-chair reviewed). Calibration:
tests 03/05/05b of 2026-08-15 — ~120 attribution decisions, zero surviving
errors; the frozen stoplist/tokenizer/energy measure lives in
Vault_Two/Audio-tests/prototype-energy-scorer.py and is mirrored here.

The rule — text first, energy second, ear third:
  1. Overlapping cross-track segments sharing >=3 consecutive content tokens
     form a DUPLICATE PAIR (bleed). Different words = Class D (genuine
     simultaneous speech): keep both, energy never consulted.
  2. Per COPY, both tracks are measured over THAT COPY's span (speech-weighted:
     mean of top-20% of 50 ms RMS windows). A copy is suppressed only when its
     own track is colder by >= 6.0 dB over its own span. Per-copy semantics
     make the echo case safe by construction: an echoer is hot on their own
     track over their own span, so their copy can never be suppressed.
  3. Margin magnitude < 6 dB: suppress nothing, keep both, mark both
     "DEDUP-AMBIGUOUS" for the ear. Margins are compared after rounding to
     0.1 dB so the 6.0 boundary is deterministic (6.0 suppresses, per spec).

Suppression removes a TRANSCRIPT COPY only — no audio is touched, and every
suppression and every ambiguous pair lands in the caller's Dedup log.
This module is a pure function over segments + cached energy envelopes;
compute_envelope() is called by the host inside the per-track loop while the
track's wav still exists (the wav is deleted per-iteration).
"""
import json
import re
import wave

import numpy as np

# --- calibration-frozen constants (provenance: spec v2, "The rule") ---------
DEDUP_BAND_DB = 6.0     # flag threshold, not a verdict threshold
RUN_MIN = 3             # consecutive content tokens that make a duplicate
OVERLAP_FRAC = 0.5      # of the shorter segment's duration
WINDOW_S = 0.05         # envelope resolution
TOP_FRAC = 0.2          # speech-weighted: mean of the top 20% of windows

# The census stoplist + digit normalization — mirrored from
# prototype-energy-scorer.py; test_digit_normalization pins the digit map,
# test_false_swallow_control pins the conservatism. Do not "improve" toward
# fuzzy matching: a missed duplicate is a visible double line, a false swallow
# silently deletes a participant's words.
STOP = {"a", "an", "the", "and", "or", "but", "so", "of", "to", "in", "on",
        "it", "is", "that", "this", "you", "i", "we", "uh", "um", "mm",
        "mmhm", "yeah", "right", "okay", "ok"}
DIGITS = {"0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
          "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
          "10": "ten"}
AMBIG_MARK = "⚠ DEDUP-AMBIGUOUS"
RESTORE_MARK = "⚠ DEDUP-RESTORED"   # symmetric-suppression guard, 2026-09-13
GUARD_MIN_LOST = 2      # shared content tokens surviving nowhere before the guard restores
GUARD_SLACK_S = 1.0     # the guard also looks at near-adjacent copies (P04 08:09/08:11 overlapped
                        # 1.34 s, under the 50%-of-shorter pairing rule, and shared five tokens)


def toks(text):
    words = re.sub(r"[^a-z0-9 ]", " ", text.lower()).split()
    return [DIGITS.get(w, w) for w in words if w and w not in STOP]


def longest_shared_run(a, b):
    best = 0
    for i in range(len(a)):
        for j in range(len(b)):
            k = 0
            while i + k < len(a) and j + k < len(b) and a[i + k] == b[j + k]:
                k += 1
            best = max(best, k)
    return best


def shared_runs(a, b, min_len=2):
    """All maximal runs of consecutive shared content tokens between token
    lists a and b, as (i, j, n): a[i:i+n] == b[j:j+n]. The duplicate test is
    max(n) >= RUN_MIN (same answer as longest_shared_run); the guard uses the
    positions to ask which of a suppressed copy's words survive somewhere."""
    runs = []
    for i in range(len(a)):
        for j in range(len(b)):
            if i and j and a[i - 1] == b[j - 1]:
                continue                      # not the start of a maximal run
            k = 0
            while i + k < len(a) and j + k < len(b) and a[i + k] == b[j + k]:
                k += 1
            if k >= min_len:
                runs.append((i, j, k))
    return runs


def compute_envelope(wav_path):
    """50 ms RMS envelope (linear) of a mono PCM wav — the 16 kHz s16le
    intermediate to_wav() produces (f32 also accepted, for offline use against
    originals). Called while the track's wav exists; the returned array is the
    only thing the dedup pass ever consults."""
    with wave.open(wav_path, "rb") as w:
        sr, sw, n = w.getframerate(), w.getsampwidth(), w.getnframes()
        raw = w.readframes(n)
    if sw == 2:
        x = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    elif sw == 4:
        x = np.frombuffer(raw, dtype="<f4").astype(np.float32)
    else:
        raise ValueError(f"unsupported sample width {sw} in {wav_path}")
    win = max(1, int(WINDOW_S * sr))
    n_win = len(x) // win
    if n_win == 0:
        return np.zeros(1, dtype=np.float32)
    trimmed = x[: n_win * win].reshape(n_win, win)
    return np.sqrt(np.mean(trimmed ** 2, axis=1)).astype(np.float32)


def span_energy_db(env, start, end):
    """Speech-weighted energy of [start, end) in dB: mean of the top-20% of
    envelope windows in the span. Empty span -> -120 (never wins anything)."""
    i0, i1 = int(start / WINDOW_S), max(int(start / WINDOW_S) + 1, int(np.ceil(end / WINDOW_S)))
    seg = env[max(0, i0): max(0, i1)]
    if seg.size == 0:
        return -120.0
    top = np.sort(seg)[::-1][: max(1, int(np.ceil(seg.size * TOP_FRAC)))]
    return float(20 * np.log10(max(float(np.mean(top)), 1e-12)))


def dedup_pass(per_track, envelopes, *, resolve=True, band_db=DEDUP_BAND_DB, detail=None):
    """The pass. Pure over (segments, envelopes) — touches no audio.

    per_track: [(label, segs)] — seg dicts {start, end, text, ...}; a seg with
        a truthy "_hflag" (hallucination-scan flag) is Class C: never paired,
        never suppressed, never logged here (disposed via the scan table).
    envelopes: {label: np.ndarray} from compute_envelope.
    resolve: False = detect-and-flag only (n>2 tracks, or mix_suspects fired) —
        would-be suppressions become ambiguity marks instead.

    Returns (surviving_per_track, log_rows, counts):
      log_rows: (time, action, kept_label, lost_label, margin_db, text) —
        one row per suppression and per ambiguous pair.
      counts: {"resolved": n_segments_suppressed, "ambiguous": n_segments_marked,
               "class_d": n_overlapping_different_word_pairs,
               "restored": n_segments_restored_by_the_symmetric_guard}
    Symmetric-suppression guard (2026-09-13; defect P03 2026-09-01 §5, trigger
    fired P04 2026-09-10). Invariant: the words of every suppressed copy must
    survive in some kept copy. Checked on the matcher's own terms, never by
    literal text: for each two suppressed copies on opposite tracks that share
    a run of >= RUN_MIN content tokens and overlap or sit within GUARD_SLACK_S
    of each other (formal pairs, or near-adjacent copies too short-overlapped
    to pair — P04 08:09/08:11), the run of content tokens they share is
    looked up in every KEPT partner of either copy; if >= GUARD_MIN_LOST of
    those tokens appear in no kept copy, they are gone from the draft. That
    covers P03 25:49 (two bounded copies across a handoff, no survivor at
    all) and P04 08:09/08:11 (a chain: B lost to A, A lost to C, C survived
    but covers only A's head — B's tail survived nowhere). The spec's simpler
    invariant ("no suppressed copy's winner was itself suppressed") misses
    the chain; the P04 re-run on 2026-09-13 showed it. Per such pair ONE copy
    is restored —    the warmer, then the one with more content tokens, then the earlier
    track — in full (a verbatim transcript copy, never a splice), prefixed
    RESTORE_MARK for the ear, logged as
    "restored (symmetric)", and counted in "restored". Its detail action
    becomes "restored" and its partners' "suppressed (symmetric)" so lag.py
    calibrates on neither (neither source is confident).
    Margins are rounded to 0.1 dB before comparison so the band boundary is
    deterministic: rounded margin <= -6.0 suppresses; |rounded| < 6.0 marks.
    detail: optional list; when given, one record per duplicate COPY is appended
        (label, start, end, margin, action ∈ suppressed|ambiguous|kept, partner)
        — the spans the arrival-lag hint (lag.py, 2026-09-10) needs. Pure
        bookkeeping: it changes no decision.
    """
    labels = [lb for lb, _ in per_track]
    cand = {}          # label -> [(idx, seg, tokens)]
    for lb, segs in per_track:
        cand[lb] = [(i, s, toks(s["text"])) for i, s in enumerate(segs)
                    if not s.get("_hflag") and s["text"].strip()
                    and (s["end"] - s["start"]) > 0]

    suppressed = {lb: set() for lb in labels}   # seg indices
    marked = {lb: {} for lb in labels}          # idx -> margin used for the mark
    restored = {lb: {} for lb in labels}        # idx -> (own margin, partner margin)
    log_rows, class_d = [], 0
    _seen_detail = set()
    pair_runs, guard_runs, sup_margin, ntok, detail_ix = {}, {}, {}, {}, {}   # guard bookkeeping
    for lb, entries in cand.items():
        for i, _s, t in entries:
            ntok[(lb, i)] = len(t)

    for ai in range(len(labels)):
        for bi in range(ai + 1, len(labels)):
            la, lb_ = labels[ai], labels[bi]
            ea, eb = envelopes.get(la), envelopes.get(lb_)
            for ia, sa, ta in cand[la]:
                for ib, sb, tb in cand[lb_]:
                    ov = min(sa["end"], sb["end"]) - max(sa["start"], sb["start"])
                    shorter = min(sa["end"] - sa["start"], sb["end"] - sb["start"])
                    if shorter <= 0 or ov <= -GUARD_SLACK_S:
                        continue
                    runs = shared_runs(ta, tb)
                    dup_words = bool(runs) and max(r[2] for r in runs) >= RUN_MIN
                    if ov <= 0 or ov < OVERLAP_FRAC * shorter:
                        # Not a pair for SUPPRESSION (the calibrated rule). But two
                        # copies this close that share a >= RUN_MIN run are the
                        # same words for the GUARD's purposes — it only ever adds
                        # a marked line back, never removes one.
                        if dup_words:
                            guard_runs[((la, ia), (lb_, ib))] = runs
                        continue
                    if not dup_words:
                        class_d += 1
                        continue
                    # duplicate pair — per-copy margins, each over its OWN span
                    pair_runs[((la, ia), (lb_, ib))] = runs
                    ma = round(span_energy_db(ea, sa["start"], sa["end"])
                               - span_energy_db(eb, sa["start"], sa["end"]), 1)
                    mb = round(span_energy_db(eb, sb["start"], sb["end"])
                               - span_energy_db(ea, sb["start"], sb["end"]), 1)
                    for (own_lb, oth_lb, idx, seg_, m) in ((la, lb_, ia, sa, ma),
                                                           (lb_, la, ib, sb, mb)):
                        if detail is not None and (own_lb, idx) not in _seen_detail:
                            _seen_detail.add((own_lb, idx))
                            detail_ix[(own_lb, idx)] = len(detail)
                            detail.append(dict(label=own_lb, idx=idx, start=seg_["start"],
                                               end=seg_["end"], margin=m, partner=oth_lb,
                                               action=("suppressed" if (m <= -band_db and resolve)
                                                       else "flagged" if m <= -band_db
                                                       else "ambiguous" if abs(m) < band_db
                                                       else "kept")))
                        if m <= -band_db:
                            if resolve:
                                if idx not in suppressed[own_lb]:
                                    suppressed[own_lb].add(idx)
                                    sup_margin[(own_lb, idx)] = m
                                    log_rows.append((seg_["start"], "suppressed",
                                                     oth_lb, own_lb, m,
                                                     seg_["text"].strip()))
                            else:
                                marked[own_lb].setdefault(idx, m)
                                log_rows.append((seg_["start"], "flagged (no-resolve)",
                                                 oth_lb, own_lb, m,
                                                 seg_["text"].strip()))
                        elif abs(m) < band_db:
                            if idx not in marked[own_lb]:
                                marked[own_lb][idx] = m
                                log_rows.append((seg_["start"], "ambiguous",
                                                 own_lb, oth_lb, m,
                                                 seg_["text"].strip()))

    # --- symmetric-suppression guard ---------------------------------------
    seg_of = lambda k: per_track[labels.index(k[0])][1][k[1]]
    all_runs = {**guard_runs, **pair_runs}      # pairs, plus near-adjacent shared runs
    alive = {k for lb in labels for k, _s, _t in
             ((( lb, i), s_, t) for i, s_, t in cand[lb])} - {(lb, i) for lb in labels for i in suppressed[lb]}

    def covered(k):
        """Token positions of copy k that appear in a run shared with a KEPT partner."""
        cov = set()
        for (ka, kb), runs in all_runs.items():
            if ka == k and kb in alive:
                for i, _j, n in runs: cov.update(range(i, i + n))
            elif kb == k and ka in alive:
                for _i, j, n in runs: cov.update(range(j, j + n))
        return cov

    while True:
        found = None
        for (ka, kb), runs in sorted(all_runs.items(), key=lambda kv: seg_of(kv[0][0])["start"]):
            if ka in alive or kb in alive:
                continue                       # only pairs that lost to each other
            ca, cb = covered(ka), covered(kb)
            lost = sum(1 for i, j, n in runs for o in range(n)
                       if (i + o) not in ca and (j + o) not in cb)
            if lost >= GUARD_MIN_LOST:
                found = (ka, kb)
                break
        if found is None:
            break
        ka, kb = found
        win = max((ka, kb), key=lambda k: (sup_margin[k], ntok[k], -labels.index(k[0])))
        loser = kb if win == ka else ka
        suppressed[win[0]].discard(win[1])
        alive.add(win)                         # now covers later pairs
        restored[win[0]][win[1]] = (sup_margin[win], sup_margin[loser])
        wseg = seg_of(win)
        log_rows.append((wseg["start"], "restored (symmetric)", win[0], loser[0],
                         sup_margin[win], wseg["text"].strip()))
        if detail is not None:
            if win in detail_ix:
                detail[detail_ix[win]]["action"] = "restored"
            if loser in detail_ix and detail[detail_ix[loser]]["action"] == "suppressed":
                detail[detail_ix[loser]]["action"] = "suppressed (symmetric)"

    surviving = []
    n_marked = 0
    for lb, segs in per_track:
        keep = []
        for i, s in enumerate(segs):
            if i in suppressed[lb]:
                continue
            if i in restored[lb]:
                om, pm = restored[lb][i]
                s = dict(s)
                s["text"] = (f"{RESTORE_MARK} (symmetric suppression — both copies lost; "
                             f"own margin {om:+.1f} dB, partner {pm:+.1f} dB) " + s["text"].strip())
                keep.append(s)
                continue
            if i in marked[lb] and i not in suppressed[lb]:
                m = marked[lb][i]
                s = dict(s)
                s["text"] = f"{AMBIG_MARK} (margin {m:+.1f} dB) " + s["text"].strip()
                n_marked += 1
            keep.append(s)
        surviving.append((lb, keep))

    counts = {"resolved": sum(len(v) for v in suppressed.values()),
              "ambiguous": n_marked, "class_d": class_d,
              "restored": sum(len(v) for v in restored.values())}
    log_rows.sort(key=lambda r: (r[0], r[1]))
    return surviving, log_rows, counts


def load_fixture(path):
    """Known-answer replay fixture: {"segments": {label: [...]},
    "envelopes": {label: [...]}} — envelopes as plain lists."""
    d = json.load(open(path))
    per_track = [(lb, d["segments"][lb]) for lb in sorted(d["segments"])]
    envs = {lb: np.asarray(v, dtype=np.float32) for lb, v in d["envelopes"].items()}
    return per_track, envs
