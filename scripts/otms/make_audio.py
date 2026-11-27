"""Original, synthesized music beds (one per video) + CapCut-style SFX. No third-party samples.
Usage: python3 scripts/otms/make_audio.py public/otms/audio"""
import numpy as np, wave, os, sys

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/otms/audio"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(3)
DUR = 25.0


def save(name, x, peak=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    m = np.max(np.abs(x)) or 1
    x = x / m * peak
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def T(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a=0.005, d=0.4):
    tt = np.arange(n) / SR
    return np.minimum(tt / max(a, 1e-4), 1) * np.exp(-tt / d)


def lp(x, cutoff):
    """FFT brickwall-ish smooth lowpass (fast)."""
    X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X * (g[:, None] if X.ndim == 2 else g), n=len(x), axis=0)


def hp(x, cutoff):
    X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 - 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X * (g[:, None] if X.ndim == 2 else g), n=len(x), axis=0)


def reverb(x, size=1.6, mix=0.25):
    n = int(size * SR); tt = np.arange(n) / SR
    ir = rng.normal(0, 1, (n, 2)) * np.exp(-tt / (size / 5))[:, None]
    ir = lp(ir, 5000)
    out = np.stack([np.convolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1) if False else None
    # FFT convolution
    L = len(x) + n
    Xf = np.fft.rfft(x, L, axis=0); If = np.fft.rfft(ir, L, axis=0)
    wet = np.fft.irfft(Xf * If, L, axis=0)[: len(x)]
    wet = wet / (np.max(np.abs(wet)) + 1e-9) * (np.max(np.abs(x)) + 1e-9)
    return x * (1 - mix) + wet * mix


class Track:
    def __init__(self, d=DUR):
        self.b = np.zeros((int(d * SR), 2))

    def add(self, s, at, pan=0.5, g=1.0):
        if s.ndim == 1:
            s = np.stack([s * (1 - pan) * 2 ** 0.5, s * pan * 2 ** 0.5], 1) * 0.72
        i = int(at * SR); n = min(len(s), len(self.b) - i)
        if n > 0 and i >= 0:
            self.b[i:i + n] += s[:n] * g


# ---------- instruments ----------
def bell(f, d=1.4, dec=0.5):
    tt = T(d)
    s = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.15)
         + 0.2 * np.sin(2 * np.pi * 3.01 * f * tt) * np.exp(-tt / 0.08) + 0.08 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt / 0.04))
    return s * env(len(tt), 0.002, dec)


def rhodes(f, d=1.6, dec=0.9):
    tt = T(d)
    mod = np.sin(2 * np.pi * f * 1.0 * tt) * 1.4 * np.exp(-tt / 0.4)
    s = np.sin(2 * np.pi * f * tt + mod) + 0.25 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.3)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * tt)
    return s * env(len(tt), 0.004, dec) * trem


def pluck(f, d=0.6, dec=0.18):
    tt = T(d)
    s = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * tt) * np.exp(-tt * (k + 1) / dec / 2) for k in range(5))
    return s * env(len(tt), 0.001, dec * 1.6)


def marimba(f, d=0.7):
    tt = T(d)
    return (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.22) + 0.4 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt / 0.03)) * env(len(tt), 0.001, 1)


def pad(notes, d, bright=0.3):
    tt = T(d)
    s = sum(np.sin(2 * np.pi * hz(n) * tt) + bright * np.sin(2 * np.pi * hz(n) * 1.004 * tt + 1) + 0.15 * np.sin(2 * np.pi * hz(n) * 2.002 * tt) for n in notes)
    a = np.minimum(tt / 0.8, 1) * np.minimum((d - tt) / 0.6, 1)
    return s * np.clip(a, 0, 1) / len(notes)


def sub(f, d, dec=0.6):
    tt = T(d)
    return np.sin(2 * np.pi * f * tt) * env(len(tt), 0.01, dec)


def kick(d=0.45):
    tt = T(d); f = 50 + 110 * np.exp(-tt / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.16)


def snare(d=0.3, tone=190):
    tt = T(d)
    n = hp(rng.normal(0, 1, len(tt)), 1500) * np.exp(-tt / 0.07)
    return n * 0.7 + np.sin(2 * np.pi * tone * tt) * np.exp(-tt / 0.05) * 0.5


def rim(d=0.15):
    tt = T(d)
    return (np.sin(2 * np.pi * 1700 * tt) * 0.5 + hp(rng.normal(0, 1, len(tt)), 3000) * 0.5) * np.exp(-tt / 0.012)


def hat(d=0.08, dec=0.018):
    tt = T(d)
    return hp(rng.normal(0, 1, len(tt)), 7000) * np.exp(-tt / dec)


def shaker(d=0.12):
    tt = T(d)
    return hp(rng.normal(0, 1, len(tt)), 5000) * np.sin(np.pi * np.minimum(tt / d, 1)) ** 2


def crackle(d):
    n = int(d * SR); x = np.zeros(n)
    idx = rng.integers(0, n, int(d * 40)); x[idx] = rng.normal(0, 1, len(idx))
    return lp(x, 4000) * 3 + lp(rng.normal(0, 1, n), 800) * 0.015


# ---------- MUSIC 1: dreamy music-box (Video 01, whimsical) ----------
def music1():
    tr = Track(); bpm = 92; bt = 60 / bpm
    prog = [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 60]]
    mel = [77, 76, 72, 74, 72, 69, 70, 72, 74, 72, 67, 69, 76, 77, 79, 81]
    t0 = 0; b = 0
    while t0 < DUR:
        ch = prog[b % 4]
        tr.add(pad(ch, 4 * bt + 0.6), t0, g=0.35)
        tr.add(sub(hz(ch[0] - 12), 2 * bt), t0, g=0.25); tr.add(sub(hz(ch[0] - 12), 2 * bt), t0 + 2 * bt, g=0.2)
        for k in range(8):
            n = ch[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12
            tr.add(bell(hz(n), 1.2, 0.35), t0 + k * bt / 2, pan=0.3 + 0.4 * (k % 2), g=0.13 if k % 2 == 0 else 0.08)
        if b >= 1:
            for k in range(4):
                tr.add(bell(hz(mel[(b * 4 + k) % 16]), 1.6, 0.6), t0 + k * bt, pan=0.55, g=0.16)
        for k in range(8):
            tr.add(shaker(), t0 + k * bt / 2 + bt / 4, pan=0.7, g=0.03)
        t0 += 4 * bt; b += 1
    return reverb(tr.b, 2.2, 0.35)


# ---------- MUSIC 2: minimal chill beat (Video 02) ----------
def music2():
    tr = Track(); bpm = 84; bt = 60 / bpm
    prog = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]]  # Am7 Fmaj7 G7 Em7
    t0 = 0; b = 0
    while t0 < DUR:
        ch = prog[b % 4]
        for k, off in enumerate([0, 1.5, 2.5]):
            for n in ch:
                tr.add(rhodes(hz(n), 1.4, 0.6), t0 + off * bt + 0.01 * k, pan=0.45, g=0.07)
        tr.add(sub(hz(ch[0] - 24), 1.5 * bt, 0.5), t0, g=0.35); tr.add(sub(hz(ch[0] - 24), bt, 0.4), t0 + 2.5 * bt, g=0.3)
        for k in range(4):
            if k in (0,): tr.add(kick(), t0 + k * bt, g=0.5)
            if k == 2: tr.add(kick(), t0 + k * bt + bt / 2, g=0.35)
            if k in (1, 3): tr.add(rim(), t0 + k * bt, pan=0.55, g=0.25)
            tr.add(hat(), t0 + k * bt, pan=0.65, g=0.08); tr.add(hat(), t0 + k * bt + bt * 0.55, pan=0.65, g=0.05)
        t0 += 4 * bt; b += 1
    x = tr.b
    return reverb(lp(x, 6000), 1.2, 0.18)


# ---------- MUSIC 3: bright explainer groove (Video 03) ----------
def music3():
    tr = Track(); bpm = 112; bt = 60 / bpm
    prog = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]  # C Am F G
    t0 = 0; b = 0
    pattern = [0, 2, 1, 2, 0, 2, 1, 2]
    while t0 < DUR:
        ch = prog[b % 4]
        for k in range(8):
            tr.add(marimba(hz(ch[pattern[k]] + 12)), t0 + k * bt / 2, pan=0.35 + 0.3 * (k % 2), g=0.18 if k % 2 == 0 else 0.12)
        tr.add(pad([n + 12 for n in ch], 4 * bt + 0.3, 0.2), t0, g=0.12)
        for k in range(4):
            tr.add(pluck(hz(ch[0] - 12), 0.5, 0.2), t0 + k * bt, g=0.35)
            tr.add(kick(), t0 + k * bt, g=0.45 if k % 2 == 0 else 0.3)
            if k % 2 == 1: tr.add(snare(0.25, 210), t0 + k * bt, pan=0.5, g=0.18)
            tr.add(hat(0.06, 0.012), t0 + k * bt + bt / 2, pan=0.7, g=0.09)
        t0 += 4 * bt; b += 1
    return reverb(tr.b, 1.0, 0.15)


# ---------- MUSIC 4: warm lo-fi R&B with crackle (Video 04) ----------
def music4():
    tr = Track(); bpm = 76; bt = 60 / bpm
    prog = [[62, 65, 69, 72], [55, 59, 62, 65, 69], [60, 64, 67, 71], [57, 60, 64, 67]]  # Dm9-ish G9 Cmaj7 Am7
    t0 = 0; b = 0
    while t0 < DUR:
        ch = prog[b % 4]
        for i, n in enumerate(ch):
            tr.add(rhodes(hz(n), 3.2, 1.6), t0 + i * 0.018, pan=0.4 + 0.05 * i, g=0.08)
        tr.add(rhodes(hz(ch[-1] + 12), 1.2, 0.5), t0 + 2.75 * bt, pan=0.6, g=0.05)
        tr.add(sub(hz(ch[0] - 24), 2 * bt, 0.8), t0, g=0.35); tr.add(sub(hz(ch[0] - 17), bt, 0.5), t0 + 2.5 * bt, g=0.25)
        for k in range(4):
            sw = bt * 0.58  # swing
            if k in (0, 2): tr.add(kick(), t0 + k * bt + (sw if k == 2 and b % 2 else 0), g=0.45)
            if k in (1, 3): tr.add(snare(0.3, 180), t0 + k * bt, pan=0.5, g=0.2)
            tr.add(hat(0.07, 0.02), t0 + k * bt, pan=0.6, g=0.06); tr.add(hat(0.07, 0.015), t0 + k * bt + sw, pan=0.6, g=0.04)
        t0 += 4 * bt; b += 1
    x = lp(tr.b, 4200)
    x[:, 0] += crackle(DUR)[: len(x)] * 0.05; x[:, 1] += crackle(DUR)[: len(x)] * 0.05
    return reverb(x, 1.5, 0.2)


# ---------- SFX ----------
def sfx():
    out = {}
    tt = T(0.18); f = 300 + 900 * np.exp(-tt / 0.02)
    out['pop'] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.04)
    out['click'] = rim(0.06) * 0.8 + np.pad(hat(0.03, 0.004), (0, int(0.06 * SR) - int(0.03 * SR)))
    tt = T(0.3); f = 400 + 1400 * (tt / 0.3) ** 0.6
    out['bubble'] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.minimum(tt / 0.12, 1)) * np.exp(-tt / 0.08)
    tt = T(0.55); n = rng.normal(0, 1, len(tt))
    sweep = np.sin(np.pi * tt / 0.55) ** 2
    lo = lp(n, 1200); hi = hp(n, 1500)
    out['whoosh'] = (lo * (1 - tt / 0.55) + hi * (tt / 0.55) * 0.5) * sweep
    tt = T(0.6)
    out['impact'] = kick(0.6) * 0.9 + lp(rng.normal(0, 1, len(tt)), 400) * np.exp(-tt / 0.1) * 0.6
    tt = T(0.25); n = hp(rng.normal(0, 1, len(tt)), 2000)
    out['shutter'] = n * (np.exp(-tt / 0.01) + 0.7 * np.exp(-np.maximum(tt - 0.09, 0) / 0.012) * (tt > 0.09))
    tt = T(0.3); n = rng.normal(0, 1, len(tt))
    out['swipe'] = hp(n, 3000) * np.sin(np.pi * tt / 0.3) ** 3
    note = lambda f, d: np.sin(2 * np.pi * f * T(d)) * env(int(d * SR), 0.002, 0.12)
    nt = np.zeros(int(0.5 * SR)); a = note(hz(84), 0.3); b = note(hz(91), 0.35)
    nt[:len(a)] += a; nt[int(0.1 * SR):int(0.1 * SR) + len(b)] += b
    out['notif'] = nt
    tt = T(0.45); n = rng.normal(0, 1, len(tt))
    scr = hp(n, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * tt)) * np.sin(np.pi * tt / 0.45)
    out['marker'] = scr * 0.6
    k = T(0.05)
    out['type'] = (hp(rng.normal(0, 1, len(k)), 2500) * np.exp(-k / 0.006) + np.sin(2 * np.pi * 900 * k) * np.exp(-k / 0.004) * 0.4)
    tw = np.zeros(int(0.9 * SR))
    for i, m in enumerate([96, 100, 103, 108]):
        s = bell(hz(m), 0.6, 0.15); j = int(i * 0.06 * SR); tw[j:j + len(s)] += s[: len(tw) - j]
    out['sparkle'] = tw
    out['ding'] = bell(hz(88), 1.0, 0.35)
    tt = T(0.4); f = 900 - 500 * (tt / 0.4)
    out['boing'] = np.sin(2 * np.pi * np.cumsum(f + 120 * np.sin(2 * np.pi * 14 * tt)) / SR) * np.exp(-tt / 0.15)
    tt = T(0.35)
    out['stamp'] = kick(0.35) * 0.7 + lp(rng.normal(0, 1, len(tt)), 2500) * np.exp(-tt / 0.03) * 0.8
    tt = T(0.7); f = 1200 * np.exp(-tt / 0.25) + 200
    out['rise'] = np.sin(2 * np.pi * np.cumsum(f[::-1]) / SR) * np.sin(np.pi * tt / 0.7) ** 2 * 0.6 + hp(rng.normal(0, 1, len(tt)), 4000) * (tt / 0.7) ** 2 * 0.3
    return out


if __name__ == '__main__':
    for i, fn in enumerate([music1, music2, music3, music4], 1):
        save(f'music{i}.wav', fn(), 0.8); print('music', i)
    for k, v in sfx().items():
        save(f'{k}.wav', v, 0.85)
    print('sfx done')
