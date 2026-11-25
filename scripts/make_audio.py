"""Synthesise the music bed and every SFX from scratch (numpy/scipy only, no third-party samples),
so all audio is original and cleared for commercial use.

Usage: python3 scripts/make_audio.py public/audio [duration_seconds]
"""
import os, sys, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 88.0
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.002, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4))


def lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    return lfilter([1 - a], [1, -a], x)


def hp(x, cutoff):
    return x - lp(x, cutoff)


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def save(name, x):
    x = np.asarray(x, np.float32)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    fade = min(len(x), 240)
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def sweep(f0, f1, d):
    t = t_(d)
    f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ---------------------------------------------------------------- SFX
def pop():
    x = sweep(900, 260, 0.07) * env(int(SR * 0.07), 0.001, 0.03)
    x += 0.25 * rng.standard_normal(len(x)) * env(len(x), 0.0005, 0.006)
    return norm(x, 0.85)


def bubble():
    return norm(sweep(350, 1500, 0.09) * env(int(SR * 0.09), 0.004, 0.05, 3), 0.8)


def whoosh(d=0.45, lo=300, hi=3500):
    n = int(SR * d)
    noise = rng.standard_normal(n)
    t = np.arange(n) / n
    e = np.sin(np.pi * t) ** 1.6
    y = np.zeros(n)
    blk = 1024
    for b in range(0, n, blk):
        c = lo + (hi - lo) * np.sin(np.pi * min(1, b / n)) ** 2
        seg = noise[max(0, b - 2048) : b + blk]
        band = lp(seg, c) - lp(seg, c * 0.35)
        m = len(y[b : b + blk])
        y[b : b + m] = band[-m:]
    return norm(y * e, 0.8)


def swipe():
    return norm(whoosh(0.22, 800, 6000), 0.7)


def ding(f=1320, d=1.1):
    t = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (3 + 2 * k)) for k, a in [(1, 1), (2.76, 0.35), (5.4, 0.12)])
    return norm(x * env(len(t), 0.002, d, 1), 0.75)


def notif():
    a = ding(1568, 0.35)[: int(SR * 0.12)]
    return norm(np.concatenate([a, ding(2093, 0.6)]), 0.7)


def click():
    n = int(SR * 0.025)
    x = hp(rng.standard_normal(n) * env(n, 0.0002, 0.004), 2000) + 0.5 * np.sin(2 * np.pi * 2400 * t_(0.025)) * env(n, 0.0002, 0.006)
    return norm(x, 0.7)


def shutter():
    n = int(SR * 0.09)
    mech = hp(rng.standard_normal(n), 1500) * env(n, 0.001, 0.03)
    return norm(np.concatenate([click(), np.zeros(int(SR * 0.06)), mech, np.zeros(int(SR * 0.02)), click() * 0.7]), 0.8)


def scratch():
    d = 0.55
    t = t_(d)
    rate = 1 + 0.9 * np.sin(2 * np.pi * 3.2 * t) * np.sign(np.sin(2 * np.pi * 1.6 * t))
    ph = np.cumsum(500 * np.abs(rate)) / SR
    tone = np.sin(2 * np.pi * ph) + 0.6 * np.sin(2 * np.pi * 2.3 * ph)
    noise = hp(rng.standard_normal(len(t)), 900)
    return norm((tone * 0.6 + noise * 0.4) * np.abs(rate) * env(len(t), 0.005, 0.5, 2), 0.8)


def boing():
    t = t_(0.6)
    f = 180 + 140 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4) + 120 * np.exp(-t * 6)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.003, 0.5, 3), 0.8)


def tick():
    n = int(SR * 0.04)
    x = np.sin(2 * np.pi * 3200 * t_(0.04)) * env(n, 0.0003, 0.008) + 0.4 * hp(rng.standard_normal(n), 3000) * env(n, 0.0002, 0.003)
    return norm(x, 0.6)


def ticking(d=2.0, step=0.25):
    out = np.zeros(int(SR * d))
    k = tick()
    for i in range(int(d / step)):
        s = int(i * SR * step)
        tk = k * (1 if i % 2 == 0 else 0.7)
        out[s : s + len(tk)] += tk[: len(out) - s]
    return norm(out, 0.6)


def typing(d=1.2):
    out = np.zeros(int(SR * d))
    t = 0.0
    while t < d - 0.05:
        k = click() * rng.uniform(0.5, 1.0)
        s = int(t * SR)
        out[s : s + len(k)] += k[: len(out) - s]
        t += rng.uniform(0.06, 0.14)
    return norm(out, 0.6)


def impact():
    t = t_(1.2)
    x = np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-t * 18)) / SR) * env(len(t), 0.002, 1.0, 3)
    x += 0.3 * lp(rng.standard_normal(len(t)), 400) * env(len(t), 0.001, 0.15)
    return norm(np.tanh(x * 2.2), 0.9)


def vine_boom():
    t = t_(1.6)
    f = 48 + 70 * np.exp(-t * 9)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.35 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR)
    x *= env(len(t), 0.003, 1.4, 2.2)
    x += 0.25 * lp(rng.standard_normal(len(t)), 250) * env(len(t), 0.002, 0.3)
    return norm(np.tanh(x * 3), 0.95)


def drum_hit():
    def tom(f, d=0.22):
        t = t_(d)
        return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t * 30))) / SR) * env(len(t), 0.001, d, 4)

    def cym(d=0.9):
        n = int(SR * d)
        return hp(rng.standard_normal(n), 6000) * env(n, 0.001, d, 3.5)

    out = np.zeros(int(SR * 1.4))
    for at, x in [(0.0, tom(180)), (0.16, tom(120)), (0.34, 0.6 * cym())]:
        s = int(at * SR)
        out[s : s + len(x)] += x[: len(out) - s]
    return norm(out, 0.85)


def buzzer():
    t = t_(0.5)
    x = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.6 + np.sign(np.sin(2 * np.pi * 116 * t)) * 0.4
    return norm(lp(x, 2200) * env(len(t), 0.005, 0.5, 0.8), 0.6)


def chime():
    out = np.zeros(int(SR * 1.3))
    for i, f in enumerate([1047, 1319, 1568, 2093]):
        x = ding(f, 1.0) * 0.8
        s = int(i * 0.07 * SR)
        out[s : s + len(x)] += x[: len(out) - s]
    return norm(out, 0.75)


def riser(d=1.2):
    n = int(SR * d)
    t = np.arange(n) / SR
    tone = sweep(120, 900, d) * 0.5 + sweep(181, 1350, d) * 0.3
    noise = hp(rng.standard_normal(n), 2500) * (t / d) ** 2
    return norm((tone + noise * 0.6) * (t / d) ** 1.5, 0.7)


SFX = {
    "pop": pop, "bubble": bubble, "whoosh": whoosh, "swipe": swipe, "ding": ding, "notif": notif,
    "click": click, "shutter": shutter, "scratch": scratch, "boing": boing, "tick": ticking,
    "typing": typing, "impact": impact, "vineboom": vine_boom, "badumtss": drum_hit,
    "buzzer": buzzer, "chime": chime, "riser": riser,
}


# ---------------------------------------------------------------- music
def music(dur):
    """Minimal modern instrumental, 96 BPM: soft kick, finger snap, hats, sub bass and a plucky
    electric-piano chord loop (Fmaj7 - Em7 - Dm7 - Cmaj7). No pads, bells or 'magic' textures."""
    beat = 60 / 96
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

    def kick():
        t = t_(0.35)
        return np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-t * 35)) / SR) * env(len(t), 0.001, 0.3, 4)

    def snap():
        k = int(SR * 0.12)
        return hp(rng.standard_normal(k), 1800) * env(k, 0.001, 0.05) + 0.3 * np.sin(2 * np.pi * 1800 * t_(0.12)) * env(k, 0.001, 0.02)

    def hat(open_=False):
        d = 0.18 if open_ else 0.05
        k = int(SR * d)
        return hp(rng.standard_normal(k), 7000) * env(k, 0.0005, d, 4)

    def epiano(freqs, d):
        t = t_(d)
        x = np.zeros(len(t))
        for f in freqs:
            mod = np.sin(2 * np.pi * f * t) * 1.4 * np.exp(-t * 5)
            x += np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.2)
        return lp(x / len(freqs), 3500) * env(len(t), 0.004, d, 1.5)

    def bass(f, d):
        t = t_(d)
        return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * env(len(t), 0.01, d, 1.2)

    mid = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
    roots = [41, 40, 38, 36]
    bars = int(dur / (4 * beat)) + 1
    k_, s_, h_, ho_ = kick(), snap(), hat(), hat(True)
    cache = {ci: epiano([mid(m) for m in chords[ci]], 1.6 * beat) for ci in range(4)}
    for b in range(bars):
        t0 = b * 4 * beat
        ci = b % 4
        intro = b < 1
        for k in range(4):
            tb = t0 + k * beat
            if not intro:
                if k in (0, 2):
                    add(k_, tb, 0, 0.55)
                if k == 2 and b % 2 == 1:
                    add(k_, tb + beat * 0.75, 0, 0.35)
                if k in (1, 3):
                    add(s_, tb, 0.15, 0.32)
            add(h_, tb, -0.3, 0.12)
            add(ho_ if k == 3 else h_, tb + beat / 2, -0.3, 0.08)
        for off, g in [(0, 0.30), (1.5, 0.22), (3.0, 0.18)]:
            add(cache[ci], t0 + off * beat, 0.25, g)
        if not intro:
            for off, d in [(0, 1.4), (1.5, 0.4), (2.5, 1.3)]:
                add(bass(mid(roots[ci]), d * beat), t0 + off * beat, 0, 0.32)
    st = np.stack([L, R], 1)
    fi = int(SR * 1.0)
    st[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo = int(SR * 2.0)
    st[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return st / (np.max(np.abs(st)) or 1) * 0.8


if __name__ == "__main__":
    for name, fn in SFX.items():
        save(name, fn())
    save("music", music(DUR))
    print("audio done:", ", ".join(SFX), "+ music")
