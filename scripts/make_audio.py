"""Synthesize an original whimsical music-box/lofi bed and soft SFX (no external samples)."""
import numpy as np, wave, os, sys
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def save(name, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    peak = np.max(np.abs(x)) or 1
    x = x / peak * 0.89
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def t(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, d=0.4):
    tt = np.arange(n) / SR
    return np.minimum(tt / a, 1) * np.exp(-tt / d)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def bell(f, d=1.2, dec=0.5):
    tt = t(d)
    s = (np.sin(2*np.pi*f*tt) + 0.35*np.sin(2*np.pi*2*f*tt)*np.exp(-tt/0.15)
         + 0.18*np.sin(2*np.pi*3.01*f*tt)*np.exp(-tt/0.08) + 0.08*np.sin(2*np.pi*5.4*f*tt)*np.exp(-tt/0.04))
    return s * env(len(tt), 0.003, dec)
def lp(x, a):  # one-pole lowpass
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y

# ---------------- music bed ----------------
BPM = 96; beat = 60 / BPM; bars = 34  # ~85 s
L = int(bars * 4 * beat * SR) + SR * 3
mL = np.zeros(L); mR = np.zeros(L)
def add(buf, s, at):
    i = int(at * SR); n = min(len(s), len(buf) - i)
    if n > 0: buf[i:i+n] += s[:n]
# Fmaj7 - Dm9 - Bbmaj7 - C6 (soft, dreamy)
prog = [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 57]]
melody = [72, 76, 79, 76, 74, 77, 81, 77, 70, 74, 77, 74, 72, 76, 79, 84]
for b in range(bars):
    ch = prog[b % 4]; t0 = b * 4 * beat
    # warm pad
    pd = t(4 * beat + 0.5)
    pad = sum(np.sin(2*np.pi*hz(n)*pd) + 0.3*np.sin(2*np.pi*hz(n)*1.003*pd) for n in ch)
    pad *= np.minimum(pd / 0.6, 1) * np.minimum((pd[-1] - pd) / 0.5 + 0.0001, 1) * 0.05
    add(mL, pad, t0); add(mR, pad, t0)
    # soft bass
    bs = t(2 * beat); bass = np.sin(2*np.pi*hz(ch[0]-12)*bs) * env(len(bs), 0.01, 0.5) * 0.22
    add(mL, bass, t0); add(mR, bass, t0); add(mL, bass, t0 + 2*beat); add(mR, bass, t0 + 2*beat)
    # music-box arpeggio (8ths)
    for k in range(8):
        n = ch[[0, 1, 2, 3, 2, 1, 2, 3][k]] + 12
        s = bell(hz(n), 1.0, 0.35) * (0.11 if k % 2 == 0 else 0.07)
        pan = 0.35 + 0.3 * (k % 2)
        add(mL, s * (1 - pan), t0 + k * beat / 2); add(mR, s * pan, t0 + k * beat / 2)
    # melody every bar after intro bars
    if b >= 2 and b % 2 == 0:
        for k in range(4):
            s = bell(hz(melody[(b // 2 * 4 + k) % 16]), 1.6, 0.6) * 0.12
            add(mL, s * 0.6, t0 + k * beat); add(mR, s * 0.4, t0 + k * beat + 0.012)
    # light shaker + soft kick
    if b >= 1:
        for k in range(8):
            nz = rng.standard_normal(int(0.06 * SR)); nz = (nz - lp(nz, 0.3)) * env(len(nz), 0.002, 0.018)
            add(mL, nz * (0.05 if k % 2 else 0.025), t0 + k * beat / 2)
            add(mR, nz * (0.05 if k % 2 else 0.025), t0 + k * beat / 2 + 0.005)
        for k in (0, 2):
            kk = t(0.25); kick = np.sin(2*np.pi*(50 + 70*np.exp(-kk/0.03))*kk) * env(len(kk), 0.002, 0.09) * 0.25
            add(mL, kick, t0 + k * beat); add(mR, kick, t0 + k * beat)
music = np.stack([mL, mR], 1)
fade = int(2.5 * SR); music[-fade:] *= np.linspace(1, 0, fade)[:, None]; music[:int(0.8*SR)] *= np.linspace(0, 1, int(0.8*SR))[:, None]
save("music.wav", music)

# ---------------- SFX ----------------
# pop: quick pitch-drop bubble
tt = t(0.18); f = 900 * np.exp(-tt / 0.03) + 300
save("pop.wav", np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tt), 0.001, 0.04))
# sparkle: rising glittery bell cascade
s = np.zeros(int(1.4 * SR))
for i, n in enumerate([84, 88, 91, 96, 100, 103, 108]):
    b = bell(hz(n), 1.0, 0.25) * (0.9 - i * 0.08); j = int(i * 0.055 * SR); s[j:j+len(b)] += b[:len(s)-j]
save("sparkle.wav", s)
# whoosh: band-passed noise sweep
nz = rng.standard_normal(int(0.6 * SR)); tt = t(0.6)
a = 0.02 + 0.25 * np.sin(np.pi * tt / 0.6) ** 2
y = np.zeros_like(nz); acc = 0.0
for i, v in enumerate(nz): acc += a[i] * (v - acc); y[i] = acc
y = y - lp(y, 0.02); save("whoosh.wav", y * np.sin(np.pi * tt / 0.6) ** 1.5)
# ding: soft bell confirm (two notes)
s = np.zeros(int(1.5 * SR)); b1 = bell(hz(88), 1.2, 0.5); b2 = bell(hz(95), 1.3, 0.6)
s[:len(b1)] += b1; j = int(0.11 * SR); s[j:j+len(b2)] += b2[:len(s)-j]; save("ding.wav", s)
# oops: soft descending "uh-oh" (gentle, not harsh)
s = np.zeros(int(0.8 * SR))
for i, n in enumerate([76, 71]):
    tt = t(0.32); v = np.sin(2*np.pi*hz(n)*tt + 3*np.sin(2*np.pi*6*tt)*0.02) + 0.3*np.sin(2*np.pi*2*hz(n)*tt)
    v *= env(len(tt), 0.01, 0.12); j = int(i * 0.2 * SR); s[j:j+len(v)] += v
save("oops.wav", s)
# boing: whimsical spring
tt = t(0.5); f = 220 + 160 * np.sin(2*np.pi*9*tt) * np.exp(-tt / 0.15)
save("boing.wav", np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tt), 0.003, 0.18))
print("ok")
