"""Original (synthesised, commercially clear) music beds + ASMR SFX for the OTMS videos.
Reuses the synth helpers from make_audio.py.

  otms_lofi.wav   ~78 BPM soft lo-fi R&B bed (warm keys, brushed kick/snap, vinyl hiss) — 1A, 1C, 1D
  otms_bounce.wav ~100 BPM light bouncy bed (plucks + claps)                               — 1B, 1E
  otms_calm.wav   ~70 BPM calm piano bed (no drums)                                         — Video 2
  crisp.wav       short crunchy "ASMR" crackle for macro cuts
  tap.wav         soft wooden tap (spatula / lid)

Usage: python3 scripts/make_otms_audio.py public/audio
"""
import os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import make_audio as A  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
A.OUT = OUT
SR = A.SR
rng = np.random.default_rng(11)
mid = lambda m: 440 * 2 ** ((m - 69) / 12)


def keys(freqs, d, bright=1.0):
    t = A.t_(d)
    x = np.zeros(len(t))
    for f in freqs:
        x += np.sin(2 * np.pi * f * t + 1.1 * bright * np.sin(2 * np.pi * f * t) * np.exp(-t * 4)) * np.exp(-t * 1.6)
    return A.lp(x / len(freqs), 2600 * bright) * A.env(len(t), 0.01, d, 1.2)


def pluck(f, d=0.5):
    t = A.t_(d)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t)) * A.env(len(t), 0.002, d, 6)


def kick(g=1.0):
    t = A.t_(0.3)
    return g * np.sin(2 * np.pi * np.cumsum(48 + 90 * np.exp(-t * 30)) / SR) * A.env(len(t), 0.001, 0.25, 4)


def snap():
    k = int(SR * 0.1)
    return A.hp(rng.standard_normal(k), 2000) * A.env(k, 0.001, 0.04)


def hat():
    k = int(SR * 0.04)
    return A.hp(rng.standard_normal(k), 7500) * A.env(k, 0.0005, 0.04, 4)


def bed(dur, bpm, chords, drums=True, style="lofi"):
    beat = 60 / bpm
    n = int(SR * dur)
    L = np.zeros(n)
    R = np.zeros(n)

    def add(x, at, pan=0.0, g=1.0):
        s = int(at * SR)
        if s >= n:
            return
        x = x[: n - s] * g
        L[s : s + len(x)] += x * (1 - max(0, pan))
        R[s : s + len(x)] += x * (1 + min(0, pan))

    bars = int(dur / (4 * beat)) + 1
    kk, sn, hh = kick(), snap(), hat()
    for b in range(bars):
        t0 = b * 4 * beat
        ch = chords[b % len(chords)]
        if style == "bounce":
            for i, off in enumerate([0, 0.75, 1.5, 2.5, 3.0, 3.5]):
                add(pluck(mid(ch[i % len(ch)] + 12), 0.45), t0 + off * beat, 0.3 if i % 2 else -0.3, 0.22)
            add(keys([mid(m) for m in ch], 2 * beat, 0.8), t0, 0, 0.18)
        elif style == "calm":
            for i, m in enumerate(ch):
                add(keys([mid(m + 12)], 3.5 * beat, 0.6), t0 + i * beat, (-0.3, 0.3)[i % 2], 0.22)
            add(keys([mid(ch[0] - 12)], 4 * beat, 0.4), t0, 0, 0.25)
        else:
            add(keys([mid(m) for m in ch], 3.8 * beat, 0.7), t0, 0.15, 0.32)
            add(keys([mid(ch[-1] + 12)], beat, 0.9), t0 + 2.5 * beat, -0.3, 0.12)
        if drums and b > 0:
            for k in range(4):
                tb = t0 + k * beat
                if k in (0, 2):
                    add(kk, tb, 0, 0.5 if style == "bounce" else 0.4)
                if k in (1, 3):
                    add(sn, tb, 0.1, 0.25)
                add(hh, tb + beat / 2, -0.2, 0.08)
            if style == "lofi":
                add(kk, t0 + 2.75 * beat, 0, 0.25)
            # bass
            t = A.t_(1.8 * beat)
            bass = np.sin(2 * np.pi * mid(ch[0] - 12) * t) * A.env(len(t), 0.01, 1.8 * beat, 1.5)
            add(bass, t0, 0, 0.3)
            add(bass, t0 + 2 * beat, 0, 0.22)
    st = np.stack([L, R], 1)
    if style == "lofi":
        st += (A.lp(rng.standard_normal(n), 3000) * 0.006)[:, None]  # vinyl hiss
    fi, fo = int(SR * 0.6), int(SR * 1.5)
    st[:fi] *= np.linspace(0, 1, fi)[:, None]
    st[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return st / (np.max(np.abs(st)) or 1) * 0.8


def crisp():
    n = int(SR * 0.16)
    x = np.zeros(n)
    for _ in range(18):
        s = rng.integers(0, n - 400)
        k = rng.integers(60, 260)
        x[s : s + k] += A.hp(rng.standard_normal(k), 3000) * rng.uniform(0.3, 1.0)
    return A.norm(x * A.env(n, 0.002, 0.14, 2), 0.7)


def tap():
    t = A.t_(0.12)
    x = np.sin(2 * np.pi * 820 * t) * A.env(len(t), 0.0005, 0.03) + 0.4 * A.hp(rng.standard_normal(len(t)), 1500) * A.env(len(t), 0.0005, 0.008)
    return A.norm(x, 0.7)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    A.save("otms_lofi", bed(34, 78, [[53, 57, 60, 64], [50, 53, 57, 60], [55, 58, 62, 65], [48, 52, 55, 59]], style="lofi"))
    A.save("otms_bounce", bed(34, 100, [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], style="bounce"))
    A.save("otms_calm", bed(40, 70, [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]], drums=False, style="calm"))
    A.save("crisp", crisp())
    A.save("tap", tap())
    print("otms audio done")
