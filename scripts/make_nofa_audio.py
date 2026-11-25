"""Premium beauty ASMR set + soft K-beauty style music bed for the Nofa video.
All synthesised here (no samples) -> original and commercially clear.

Usage: python3 scripts/make_nofa_audio.py public/audio
"""
import os, sys
import numpy as np
from scipy.signal import butter, sosfilt

sys.path.insert(0, os.path.dirname(__file__))
import make_audio as A  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
A.OUT = OUT
SR = A.SR
rng = np.random.default_rng(23)


def band(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lowp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def squeeze(d=0.75):
    """cosmetic tube squeeze: soft plastic flex + a creamy, wet squelch that swells then settles"""
    n = int(SR * d)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    flex = band(noise, 300, 1800) * np.exp(-((t - 0.12) ** 2) / 0.004) * 0.6
    # wet squelch: bursts of narrow resonance gliding down
    sq = np.zeros(n)
    for k in range(9):
        s = int(SR * (0.18 + k * 0.045 + rng.uniform(0, 0.02)))
        m = int(SR * 0.05)
        f0 = rng.uniform(500, 900) * (1 - 0.04 * k)
        tt = np.arange(m) / SR
        burst = np.sin(2 * np.pi * np.cumsum(f0 * (1 - 0.6 * tt / 0.05)) / SR) * np.exp(-tt * 70)
        burst += 0.6 * band(rng.standard_normal(m), 800, 3000) * np.exp(-tt * 90)
        sq[s : s + m] += burst[: n - s] * (1 - k / 12)
    env = np.minimum(1, t / 0.05) * np.exp(-np.maximum(0, t - 0.5) * 8)
    return A.norm((flex + sq * 0.8) * env, 0.7)


def creamy(d=0.4):
    """creamy squish: soft, wet, fine bubbles"""
    n = int(SR * d)
    t = np.arange(n) / SR
    x = band(rng.standard_normal(n), 600, 4500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 38 * t + 3 * np.sin(2 * np.pi * 5 * t))))
    for _ in range(14):
        s = rng.integers(0, n - 800)
        m = 600
        tt = np.arange(m) / SR
        x[s : s + m] += 0.7 * np.sin(2 * np.pi * rng.uniform(900, 2200) * tt) * np.exp(-tt * 260)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.8
    return A.norm(x * env, 0.6)


def fswipe(d=0.32):
    """crispy finger swipe across skin: fine, airy, slightly granular"""
    n = int(SR * d)
    t = np.arange(n) / SR
    grit = np.zeros(n)
    idx = rng.integers(0, n, 260)
    grit[idx] = rng.uniform(-1, 1, len(idx))
    x = band(rng.standard_normal(n), 2500, 9000) * 0.5 + band(grit, 3000, 11000) * 2.0
    env = np.sin(np.pi * t / d) ** 1.4
    return A.norm(x * env, 0.55)


def handle(d=0.6):
    """gentle packaging handling: soft plastic ticks + tiny rustle"""
    n = int(SR * d)
    x = band(rng.standard_normal(n), 1500, 6000) * 0.08
    for _ in range(7):
        s = rng.integers(0, n - 600)
        m = 500
        tt = np.arange(m) / SR
        x[s : s + m] += band(rng.standard_normal(m), 1200, 5000) * np.exp(-tt * 180) * rng.uniform(0.4, 1)
    t = np.arange(n) / SR
    return A.norm(x * np.sin(np.pi * t / d), 0.5)


def softclick():
    return A.norm(lowp(A.click(), 5000), 0.5)


def softpop():
    x = A.sweep(700, 300, 0.06) * A.env(int(SR * 0.06), 0.002, 0.03)
    return A.norm(lowp(x, 3000), 0.5)


def chime_soft():
    t = A.t_(1.6)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * dcy) for f, a, dcy in [(1760, 1, 2.5), (2637, 0.35, 3.5), (3520, 0.15, 5)])
    return A.norm(x * A.env(len(t), 0.004, 1.6, 1), 0.45)


def air(d=0.7):
    return A.norm(lowp(A.whoosh(d, 200, 2200), 3500), 0.45)


def shutter_soft():
    return A.norm(lowp(A.shutter(), 6000), 0.5)


def kbeauty(dur=27.0):
    """soft, modern, airy bed ~ 84 BPM: clean e-piano (maj9 voicings), warm sub, rim + shaker, light airy pad-free"""
    bpm = 84
    beat = 60 / bpm
    n = int(SR * dur)
    L = np.zeros(n)
    R = np.zeros(n)
    mid = lambda m: 440 * 2 ** ((m - 69) / 12)

    def add(x, at, pan=0.0, g=1.0):
        s = int(at * SR)
        if s >= n:
            return
        x = x[: n - s] * g
        L[s : s + len(x)] += x * (1 - max(0, pan))
        R[s : s + len(x)] += x * (1 + min(0, pan))

    def ep(freqs, d):
        t = A.t_(d)
        x = np.zeros(len(t))
        for f in freqs:
            x += (np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6))) * np.exp(-t * 1.3)
        return lowp(x / len(freqs), 3200) * A.env(len(t), 0.006, d, 1.0)

    def rim():
        k = int(SR * 0.05)
        return band(rng.standard_normal(k), 1500, 5000) * A.env(k, 0.0005, 0.02)

    def shaker():
        k = int(SR * 0.08)
        return band(rng.standard_normal(k), 5000, 12000) * np.sin(np.pi * np.arange(k) / k) ** 2

    chords = [[60, 64, 67, 71, 74], [57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [55, 59, 62, 64, 69]]
    roots = [36, 33, 29, 31]
    for b in range(int(dur / (4 * beat)) + 1):
        t0 = b * 4 * beat
        ci = b % 4
        add(ep([mid(m) for m in chords[ci]], 3.6 * beat), t0, 0.1, 0.34)
        add(ep([mid(chords[ci][-1] + 12)], 0.8 * beat), t0 + 2.5 * beat, -0.35, 0.10)
        if b >= 1:
            t = A.t_(3.8 * beat)
            sub = np.sin(2 * np.pi * mid(roots[ci] + 12) * t) * A.env(len(t), 0.02, 3.8 * beat, 0.9)
            add(sub, t0, 0, 0.22)
            for k in range(4):
                if k in (1, 3):
                    add(rim(), t0 + k * beat, 0.2, 0.12)
                for h in range(2):
                    add(shaker(), t0 + k * beat + h * beat / 2, -0.25, 0.05 if h else 0.035)
    st = np.stack([L, R], 1)
    fi, fo = int(SR * 0.8), int(SR * 2.5)
    st[:fi] *= np.linspace(0, 1, fi)[:, None]
    st[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return st / (np.max(np.abs(st)) or 1) * 0.8


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in {
        "n_squeeze": squeeze, "n_creamy": creamy, "n_swipe": fswipe, "n_handle": handle, "n_click": softclick,
        "n_pop": softpop, "n_chime": chime_soft, "n_air": air, "n_shutter": shutter_soft,
    }.items():
        A.save(name, fn())
    A.save("n_music", kbeauty(27.0))
    print("nofa audio done")
