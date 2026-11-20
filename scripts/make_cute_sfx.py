"""Synthesize a pack of cute / whimsy SFX (original synthesis, no samples).
Usage: python3 scripts/make_cute_sfx.py public/audio"""
import numpy as np, wave, os, sys

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(5)


def save(name, x, gain=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    x = x / (np.max(np.abs(x)) or 1) * gain
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a=0.003, d=0.2):
    tt = np.arange(n) / SR
    return np.minimum(tt / a, 1) * np.exp(-tt / d)
def sweep(f0, f1, d, curve=1.0):
    tt = t(d); u = (tt / d) ** curve
    f = f0 * (f1 / f0) ** u
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def bell(f, d=0.8, dec=0.3):
    tt = t(d)
    return (np.sin(2*np.pi*f*tt) + 0.4*np.sin(2*np.pi*2*f*tt)*np.exp(-tt/0.1) + 0.2*np.sin(2*np.pi*3.01*f*tt)*np.exp(-tt/0.05)) * env(len(tt), 0.002, dec)
def mix(parts, d):
    out = np.zeros(int(d * SR))
    for s, at in parts:
        i = int(at * SR); n = min(len(s), len(out) - i)
        if n > 0: out[i:i+n] += s[:n]
    return out


# bubble pop: tiny upward "blip"
def blip(f0=500, f1=1400, d=0.07):
    s = sweep(f0, f1, d, 0.6) * env(int(d * SR), 0.001, 0.03)
    return s
save("bubble_pop.wav", mix([(blip(), 0)], 0.12))

# bubbles: a rising cluster of blips
save("bubbles.wav", mix([(blip(400 + 120 * i, 1100 + 200 * i, 0.06) * (0.9 - i * 0.06), i * 0.055 + rng.uniform(0, 0.02)) for i in range(8)], 0.7))

# twinkle: fast glockenspiel run up
save("twinkle.wav", mix([(bell(hz(n), 0.7, 0.18) * (1 - i * 0.07), i * 0.045) for i, n in enumerate([88, 91, 95, 98, 100, 103, 107])], 1.0))

# plink: single kalimba-ish note pair
def kal(f, d=0.6):
    tt = t(d)
    return (np.sin(2*np.pi*f*tt) + 0.25*np.sin(2*np.pi*5.1*f*tt)*np.exp(-tt/0.015)) * env(len(tt), 0.001, 0.22)
save("plink.wav", mix([(kal(hz(84)), 0), (kal(hz(91)) * 0.8, 0.09)], 0.8))

# slide whistle up / down
for name, (a, b) in {"slide_up.wav": (500, 1500), "slide_down.wav": (1400, 450)}.items():
    d = 0.45; tt = t(d)
    vib = 1 + 0.02 * np.sin(2 * np.pi * 7 * tt)
    f = a * (b / a) ** (tt / d) * vib
    s = (np.sin(2*np.pi*np.cumsum(f)/SR) + 0.15*np.sin(4*np.pi*np.cumsum(f)/SR)) * np.minimum(tt / 0.03, 1) * np.minimum((d - tt) / 0.06, 1)
    save(name, s, 0.8)

# squeak: rubber-toy squeak (two quick wobbly tones)
def sq(f, d=0.12):
    tt = t(d)
    fm = f * (1 + 0.25 * np.sin(np.pi * tt / d)) * (1 + 0.03 * np.sin(2 * np.pi * 45 * tt))
    x = np.sin(2*np.pi*np.cumsum(fm)/SR)
    x = np.tanh(2.2 * x)  # reedy
    return x * np.sin(np.pi * tt / d) ** 0.6
save("squeak.wav", mix([(sq(1200), 0), (sq(1500, 0.1), 0.13)], 0.3), 0.7)

# boing2: cartoon spring
tt = t(0.6); f = 160 + 220 * np.exp(-tt / 0.25) * (1 + 0.6 * np.sin(2 * np.pi * 11 * tt) * np.exp(-tt / 0.2))
save("boing2.wav", np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tt), 0.002, 0.22))

# poof: soft airy foam puff
nz = rng.standard_normal(int(0.35 * SR))
def onepole(x, a):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y
p = onepole(nz, 0.08) - onepole(nz, 0.01)
save("poof.wav", p * env(len(p), 0.02, 0.08), 0.6)

# psst: spray hiss with a soft attack
nz = rng.standard_normal(int(0.7 * SR)); h = nz - onepole(nz, 0.35)
tt = t(0.7)
save("psst.wav", h * np.minimum(tt / 0.05, 1) * np.minimum((0.7 - tt) / 0.25, 1) * 0.8, 0.5)

# squish2: wet cute squelch (low blub + noise)
tt = t(0.3)
blub = np.sin(2*np.pi*np.cumsum(120 + 260*np.exp(-tt/0.04) * (1 + 0.3*np.sin(2*np.pi*30*tt)))/SR) * env(len(tt), 0.004, 0.07)
nz = onepole(rng.standard_normal(len(tt)), 0.12) * env(len(tt), 0.005, 0.05) * 3
save("squish2.wav", blub + nz, 0.75)

# tada: sparkly chime chord for the reveal
ch = [79, 83, 86, 91]
save("tada.wav", mix([(bell(hz(n), 1.6, 0.6) * 0.8, 0.0 + i * 0.03) for i, n in enumerate(ch)] + [(bell(hz(n + 12), 1.0, 0.25) * 0.4, 0.25 + i * 0.05) for i, n in enumerate(ch)], 1.8))

# heart: cute two-note "bling"
save("heart.wav", mix([(bell(hz(91), 0.6, 0.2), 0), (bell(hz(96), 0.8, 0.3), 0.08)], 0.9))
print("ok")
