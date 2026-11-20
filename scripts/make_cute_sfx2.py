"""Second pack of cute SFX (original synthesis, no samples): bloop, blip_up, xylo_up, xylo_down, chime, toy_squeak,
cute_pop, sticker (a soft "plip" for stickers landing), wink.
Usage: python3 scripts/make_cute_sfx2.py public/audio"""
import numpy as np, wave, os, sys

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
os.makedirs(OUT, exist_ok=True)


def save(name, x, gain=0.89):
    x = np.asarray(x, dtype=np.float64)
    x = x / (np.max(np.abs(x)) or 1) * gain
    # tiny fade at both ends against clicks
    n = min(200, len(x) // 4)
    x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n)
    x = np.stack([x, x], 1)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
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
def mallet(f, d=0.5, dec=0.18):
    tt = t(d)
    return (np.sin(2*np.pi*f*tt) + 0.25*np.sin(2*np.pi*4*f*tt)*np.exp(-tt/0.02) + 0.12*np.sin(2*np.pi*10*f*tt)*np.exp(-tt/0.006)) * env(len(tt), 0.001, dec)
def bell(f, d=0.9, dec=0.35):
    tt = t(d)
    return (np.sin(2*np.pi*f*tt) + 0.5*np.sin(2*np.pi*2.76*f*tt)*np.exp(-tt/0.12) + 0.25*np.sin(2*np.pi*5.4*f*tt)*np.exp(-tt/0.05)) * env(len(tt), 0.001, dec)
def mix(parts, d):
    out = np.zeros(int(d * SR))
    for s, at in parts:
        i = int(at * SR); n = min(len(s), len(out) - i)
        if n > 0: out[i:i+n] += s[:n]
    return out


# bloop: water-drop pitch rise with a quick body
s = sweep(300, 1100, 0.12, 0.6) * env(int(0.12 * SR), 0.002, 0.06)
save("bloop", mix([(s, 0), (0.4 * sweep(500, 1500, 0.08, 0.6) * env(int(0.08 * SR), 0.002, 0.03), 0.09)], 0.25))
# blip_up: tiny game-like blip
save("blip_up", sweep(700, 2000, 0.09, 1.5) * env(int(0.09 * SR), 0.002, 0.05))
# xylophone arpeggios
save("xylo_up", mix([(mallet(hz(m)), i * 0.065) for i, m in enumerate([72, 76, 79, 84])], 0.8))
save("xylo_down", mix([(mallet(hz(m)), i * 0.07) for i, m in enumerate([84, 79, 76, 72])], 0.8))
# chime: two bells, a fifth apart
save("chime", mix([(bell(hz(88)), 0), (0.8 * bell(hz(95)), 0.09)], 1.2))
# toy squeak: rubber toy, two squeezes (pitch wobble + nasal harmonics)
def squeak(d=0.16, f0=900):
    tt = t(d)
    f = f0 * (1 + 0.35 * np.sin(np.pi * tt / d)) * (1 + 0.03 * np.sin(2 * np.pi * 38 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sign(np.sin(ph)) * 0.3 + np.sin(ph) + 0.5 * np.sin(2 * ph)
    return x * np.sin(np.pi * tt / d) ** 0.6
save("toy_squeak", mix([(squeak(0.14, 950), 0), (squeak(0.17, 1050), 0.2)], 0.45), 0.7)
# cute_pop: high bubble pop
tt = t(0.07)
save("cute_pop", np.sin(2 * np.pi * np.cumsum(1800 - 9000 * tt) / SR) * env(len(tt), 0.0005, 0.018) + 0.3 * np.random.default_rng(1).normal(0, 1, len(tt)) * env(len(tt), 0.0005, 0.004))
# sticker: soft "plip" + sparkle tail
save("sticker", mix([(sweep(900, 1700, 0.05, 0.5) * env(int(0.05 * SR), 0.001, 0.025), 0)] + [(0.25 * bell(hz(m), 0.4, 0.08), 0.04 + i * 0.03) for i, m in enumerate([96, 100, 103])], 0.5))
# wink: quick upward slide + bell
save("wink", mix([(0.7 * sweep(600, 2400, 0.12, 2) * env(int(0.12 * SR), 0.002, 0.07), 0), (0.6 * bell(hz(91), 0.6, 0.15), 0.1)], 0.8))
print("ok")
