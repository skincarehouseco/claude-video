"""Original whimsical marimba/music-box bed (~28 s) + water-themed SFX for the hydration edit. No external samples."""
import numpy as np, wave, os, sys
SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/hydration"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)

def save(name, x, peak=0.89):
    x = np.asarray(x, float)
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x / (np.max(np.abs(x)) or 1) * peak
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def t(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, d=0.4):
    tt = np.arange(n) / SR
    return np.minimum(tt / a, 1) * np.exp(-tt / d)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def marimba(f, d=0.9, dec=0.28):
    tt = t(d)
    s = np.sin(2*np.pi*f*tt) + 0.25*np.sin(2*np.pi*4*f*tt)*np.exp(-tt/0.03) + 0.1*np.sin(2*np.pi*10*f*tt)*np.exp(-tt/0.01)
    return s * env(len(tt), 0.002, dec)
def bell(f, d=1.2, dec=0.5):
    tt = t(d)
    s = (np.sin(2*np.pi*f*tt) + 0.35*np.sin(2*np.pi*2*f*tt)*np.exp(-tt/0.15)
         + 0.18*np.sin(2*np.pi*3.01*f*tt)*np.exp(-tt/0.08))
    return s * env(len(tt), 0.003, dec)
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y

BPM = 104; beat = 60 / BPM; bars = 13  # ~30 s
L = int(bars * 4 * beat * SR) + SR * 2
mL = np.zeros(L); mR = np.zeros(L)
def add(buf, s, at):
    i = int(at * SR); n = min(len(s), len(buf) - i)
    if n > 0: buf[i:i+n] += s[:n]
# Cmaj7 - Am7 - Fmaj7 - G6 : bright, bubbly
prog = [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 52]]
mel = [79, 76, 72, 76, 81, 79, 76, 72, 77, 76, 72, 69, 74, 76, 79, 83]
for b in range(bars):
    ch = prog[b % 4]; t0 = b * 4 * beat
    pd = t(4 * beat + 0.4)
    pad = sum(np.sin(2*np.pi*hz(n+12)*pd) + 0.25*np.sin(2*np.pi*hz(n+12)*1.004*pd) for n in ch)
    pad *= np.minimum(pd / 0.5, 1) * np.minimum((pd[-1] - pd) / 0.4 + 1e-4, 1) * 0.035
    add(mL, pad, t0); add(mR, pad, t0)
    for k in (0, 1.5, 2, 3.5):  # bouncy bass
        bs = t(beat); add(mL, np.sin(2*np.pi*hz(ch[0]-12)*bs) * env(len(bs), 0.006, 0.18) * 0.22, t0 + k*beat)
        add(mR, np.sin(2*np.pi*hz(ch[0]-12)*bs) * env(len(bs), 0.006, 0.18) * 0.22, t0 + k*beat)
    for k in range(8):  # marimba arpeggio
        n = ch[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 24
        s = marimba(hz(n)) * (0.12 if k % 2 == 0 else 0.08); pan = 0.3 + 0.4 * (k % 2)
        add(mL, s * (1 - pan), t0 + k * beat / 2); add(mR, s * pan, t0 + k * beat / 2)
    if b >= 1:  # music-box melody
        for k in range(4):
            if (b + k) % 3 == 2: continue
            s = bell(hz(mel[(b * 4 + k) % 16] + 12), 1.4, 0.45) * 0.07
            add(mL, s * 0.55, t0 + k * beat); add(mR, s * 0.45, t0 + k * beat + 0.01)
        for k in range(8):  # soft shaker
            nz = rng.standard_normal(int(0.05 * SR)); nz = (nz - lp(nz, 0.35)) * env(len(nz), 0.002, 0.015)
            add(mL, nz * (0.04 if k % 2 else 0.02), t0 + k * beat / 2); add(mR, nz * (0.04 if k % 2 else 0.02), t0 + k * beat / 2 + 0.004)
        for k in (0, 2):
            kk = t(0.22); kick = np.sin(2*np.pi*(48 + 60*np.exp(-kk/0.03))*kk) * env(len(kk), 0.002, 0.08) * 0.2
            add(mL, kick, t0 + k * beat); add(mR, kick, t0 + k * beat)
music = np.stack([mL, mR], 1)
fade = int(2.0 * SR); music[-fade:] *= np.linspace(1, 0, fade)[:, None]; music[:int(0.3*SR)] *= np.linspace(0, 1, int(0.3*SR))[:, None]
save("music.wav", music)

# water drop "bloop": fast rising sine
tt = t(0.16); f = 500 + 1400 * (tt / 0.16) ** 1.6
save("drop.wav", np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tt), 0.002, 0.045))
# twinkle: tiny glittery bell run
s = np.zeros(int(1.0 * SR))
for i, n in enumerate([96, 100, 103, 108]):
    b = bell(hz(n), 0.8, 0.2) * (0.9 - i * 0.12); j = int(i * 0.045 * SR); s[j:j+len(b)] += b[:len(s)-j]
save("twinkle.wav", s)
# soft pop
tt = t(0.16); f = 850 * np.exp(-tt / 0.03) + 280
save("pop.wav", np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tt), 0.001, 0.04))
# whoosh (airy)
nz = rng.standard_normal(int(0.5 * SR)); tt = t(0.5); a = 0.02 + 0.22 * np.sin(np.pi * tt / 0.5) ** 2
y = np.zeros_like(nz); acc = 0.0
for i, v in enumerate(nz): acc += a[i] * (v - acc); y[i] = acc
save("whoosh.wav", (y - lp(y, 0.02)) * np.sin(np.pi * tt / 0.5) ** 1.5)
# crack: short dry crunch for "make up crack"
nz = rng.standard_normal(int(0.25 * SR)); clicks = np.zeros_like(nz)
for k in range(6): clicks[int(k * 0.028 * SR) + rng.integers(0, 300)] = 1
crk = np.convolve(clicks, nz[:400] * env(400, 0.0005, 0.002), "same") + 0.2 * (nz - lp(nz, 0.2)) * env(len(nz), 0.002, 0.04)
save("crack.wav", crk)
# ding (bright confirm)
s = np.zeros(int(1.3 * SR)); b1 = bell(hz(88), 1.1, 0.45); b2 = bell(hz(95), 1.2, 0.55)
s[:len(b1)] += b1; j = int(0.1 * SR); s[j:j+len(b2)] += b2[:len(s)-j]; save("ding.wav", s)
# sleepy "yawn" slide for "penat" (soft descending sine)
tt = t(0.6); f = 520 * np.exp(-tt / 0.5) + 180
save("sleepy.wav", np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi * tt / 0.6) ** 2 * 0.8)
print("ok")
