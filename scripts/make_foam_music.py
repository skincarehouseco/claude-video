"""Synthesize a bouncy, cute 120 BPM music-box/pluck bed (~22 s) and a soft 'squish' SFX for FoamEdit.
Original synthesis only (no samples). Usage: python3 scripts/make_foam_music.py public/audio"""
import numpy as np, wave, os, sys

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)


def save(name, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    x = x / (np.max(np.abs(x)) or 1) * 0.89
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a=0.004, d=0.3):
    tt = np.arange(n) / SR
    return np.minimum(tt / a, 1) * np.exp(-tt / d)
def bell(f, d=1.0, dec=0.4):
    tt = t(d)
    s = np.sin(2*np.pi*f*tt) + 0.4*np.sin(2*np.pi*2*f*tt)*np.exp(-tt/0.12) + 0.15*np.sin(2*np.pi*3.01*f*tt)*np.exp(-tt/0.06)
    return s * env(len(tt), 0.002, dec)
def pluck(f, d=0.5, dec=0.18):  # soft marimba-ish pluck
    tt = t(d)
    s = np.sin(2*np.pi*f*tt) + 0.5*np.sin(2*np.pi*4*f*tt)*np.exp(-tt/0.02)
    return s * env(len(tt), 0.002, dec)
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y


BPM = 120; beat = 60 / BPM; bars = 11  # 22 s
L = int(bars * 4 * beat * SR) + SR
mL = np.zeros(L); mR = np.zeros(L)
def add(buf, s, at):
    i = int(at * SR); n = min(len(s), len(buf) - i)
    if n > 0: buf[i:i+n] += s[:n]

# C - Am - F - G, bright and bouncy
prog = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
mel = [79, 76, 79, 81, 79, 76, 74, 76, 77, 76, 74, 72, 74, 76, 79, 76]
for b in range(bars):
    ch = prog[b % 4]; t0 = b * 4 * beat
    # bouncy bass on 1 and 3, pickup on the "and" of 4
    for k, n in ((0, ch[0] - 24), (2, ch[0] - 24), (3.5, ch[2] - 24)):
        s = pluck(hz(n), 0.4, 0.14) * 0.32
        add(mL, s, t0 + k * beat); add(mR, s, t0 + k * beat)
    # off-beat chord plucks (ukulele-ish skank)
    for k in (0.5, 1.5, 2.5, 3.5):
        s = sum(pluck(hz(n + 12), 0.3, 0.08) for n in ch) * 0.06
        add(mL, s * 0.7, t0 + k * beat); add(mR, s, t0 + k * beat + 0.006)
    # music-box melody (8ths) from bar 1
    if b >= 1:
        for k in range(8):
            if k % 2 == 1 and (b + k) % 3 == 0: continue
            n = mel[(b * 8 + k) % 16]
            s = bell(hz(n), 0.9, 0.3) * (0.12 if k % 2 == 0 else 0.08)
            pan = 0.35 + 0.3 * (k % 2)
            add(mL, s * (1 - pan), t0 + k * beat / 2); add(mR, s * pan, t0 + k * beat / 2)
    # soft kick + finger-snap-ish click on 2 and 4
    for k in range(4):
        if k % 2 == 0:
            kk = t(0.2); kick = np.sin(2*np.pi*(50 + 80*np.exp(-kk/0.025))*kk) * env(len(kk), 0.002, 0.07) * 0.3
            add(mL, kick, t0 + k * beat); add(mR, kick, t0 + k * beat)
        else:
            nz = rng.standard_normal(int(0.05 * SR)); nz = (nz - lp(nz, 0.25)) * env(len(nz), 0.001, 0.012)
            add(mL, nz * 0.09, t0 + k * beat); add(mR, nz * 0.09, t0 + k * beat + 0.004)
    # shaker 16ths
    for k in range(16):
        nz = rng.standard_normal(int(0.04 * SR)); nz = (nz - lp(nz, 0.4)) * env(len(nz), 0.001, 0.01)
        add(mL, nz * (0.03 if k % 2 else 0.015), t0 + k * beat / 4); add(mR, nz * (0.03 if k % 2 else 0.015), t0 + k * beat / 4 + 0.003)

music = np.stack([mL, mR], 1)
f = int(1.5 * SR); music[-f:] *= np.linspace(1, 0, f)[:, None]
save("foam_music.wav", music)

# squish: low-passed noise burst with a falling resonant wobble
tt = t(0.35)
nz = rng.standard_normal(len(tt))
a = 0.03 + 0.12 * np.exp(-tt / 0.08)
y = np.zeros_like(nz); acc = 0.0
for i, v in enumerate(nz):
    acc += a[i] * (v - acc); y[i] = acc
wob = np.sin(2*np.pi*np.cumsum(180 + 120*np.exp(-tt/0.05))/SR) * 0.25
save("squish.wav", (y * 3 + wob) * env(len(tt), 0.01, 0.09))
print("ok")
