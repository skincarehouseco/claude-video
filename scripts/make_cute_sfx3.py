"""Third cute SFX pack (original synthesis, no samples) with timbres not used in the earlier packs:
kalimba / ukulele plucks, cartoon spring, slide whistle, wet foam squelch, bubble wrap, water drop, woodblock,
finger snap, cork pop, glass tink, triangle, toy piano, fairy dust, toy-trombone "womp", airy swish, spray spritz.
All files are written with a k3_ prefix.
Usage: python scripts/make_cute_sfx3.py public/audio   (needs numpy + scipy)"""
import os, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(33)


def save(name, x, gain=0.89):
    x = np.asarray(x, np.float64)
    x = x / (np.max(np.abs(x)) or 1) * gain
    n = min(150, len(x) // 4)
    x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n)
    x = np.stack([x, x], 1)
    with wave.open(os.path.join(OUT, f"k3_{name}.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a=0.002, d=0.2):
    tt = np.arange(n) / SR
    return np.minimum(tt / a, 1) * np.exp(-tt / d)
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'highpass', fs=SR, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, 'lowpass', fs=SR, output='sos'), x)
def noise(d): return rng.normal(0, 1, int(d * SR))
def osc(freq):  # freq: array (Hz) -> phase
    return 2 * np.pi * np.cumsum(freq) / SR
def mix(parts, d):
    out = np.zeros(int(d * SR))
    for s, at in parts:
        i = int(at * SR); n = min(len(s), len(out) - i)
        if n > 0: out[i:i + n] += s[:n]
    return out


def pluck(f, d=0.8, bright=0.5, decay=0.996):
    """Karplus-Strong string (ukulele-ish)."""
    N = int(SR / f); buf = rng.uniform(-1, 1, N)
    buf = lp(buf, 2000 + 6000 * bright)
    out = np.zeros(int(d * SR))
    for i in range(len(out)):
        j = i % N
        out[i] = buf[j]
        buf[j] = decay * 0.5 * (buf[j] + buf[(j + 1) % N])
    return out * env(len(out), 0.001, d)
def kalimba(f, d=0.9):
    tt = t(d)
    x = np.sin(osc(f * (1 + 0.01 * np.exp(-tt / 0.01)))) * np.exp(-tt / 0.35)
    x += 0.35 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt / 0.03)
    x += 0.15 * np.sin(2 * np.pi * 8.9 * f * tt) * np.exp(-tt / 0.012)
    return x * np.minimum(tt / 0.002, 1)
def bellp(f, partials, d=1.0):
    tt = t(d)
    x = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt / dec) for r, a, dec in partials)
    return x * np.minimum(tt / 0.0008, 1)


# plucks / tines
save("kalimba_up", mix([(kalimba(hz(m)), i * 0.075) for i, m in enumerate([74, 78, 81, 86])], 1.3))
save("kalimba_down", mix([(kalimba(hz(m)), i * 0.08) for i, m in enumerate([86, 81, 78, 74])], 1.3))
save("kalimba_one", kalimba(hz(81), 0.8))
save("uke_up", mix([(pluck(hz(m), 0.7), i * 0.05) for i, m in enumerate([67, 71, 74, 79])], 1.0))
save("uke_pluck", pluck(hz(76), 0.5, 0.7))
save("kalimba_fanfare", mix([(kalimba(hz(m)), at) for m, at in [(74, 0), (78, 0.09), (81, 0.18), (86, 0.3), (81, 0.3), (90, 0.3)]], 1.6))

# cartoon spring "doi-oi-oing"
tt = t(0.7)
fr = 260 + 140 * np.sin(2 * np.pi * 16 * tt) * np.exp(-tt / 0.25) + 120 * np.exp(-tt / 0.05)
x = np.sin(osc(fr)) + 0.35 * np.sin(2 * osc(fr)) + 0.2 * np.sin(3 * osc(fr))
save("spring", x * env(len(tt), 0.003, 0.3))
tt = t(0.5)
fr = 420 + 200 * np.sin(2 * np.pi * 22 * tt) * np.exp(-tt / 0.18)
save("spring_small", (np.sin(osc(fr)) + 0.3 * np.sin(2 * osc(fr))) * env(len(tt), 0.002, 0.2))

# slide whistle up / down / wiggle
def whistle(f0, f1, d, wob=0.0):
    tt = t(d); u = tt / d
    fr = f0 * (f1 / f0) ** (u ** 0.8) * (1 + 0.025 * np.sin(2 * np.pi * 6 * tt)) * (1 + wob * np.sin(2 * np.pi * 9 * tt))
    x = np.sin(osc(fr)) + 0.08 * np.sin(2 * osc(fr)) + 0.03 * hp(noise(d), 3000)
    return x * np.minimum(u / 0.08, 1) * np.minimum((1 - u) / 0.12, 1)
save("whistle_up", whistle(600, 1900, 0.45))
save("whistle_down", whistle(1800, 550, 0.45))
save("whistle_wiggle", whistle(900, 1300, 0.5, 0.12))

# wet foam squelch: band noise with a wobbling filter + bubbly low plucks
def squelch(d=0.35, seed=0):
    r = np.random.default_rng(seed); n = int(d * SR); tt = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(8):
        c = r.uniform(300, 1400); a = int(r.uniform(0, 0.7) * n); L = int(r.uniform(0.03, 0.08) * SR)
        seg = bp(r.normal(0, 1, L), c * 0.7, c * 1.4) * np.hanning(L)
        out[a:a + L] += seg[:max(0, min(L, n - a))]
    bub = sum(np.sin(osc(np.full(n, r.uniform(180, 380)) * (1 + 0.6 * tt / d))) * env(n, 0.002, 0.03) * 0 + 0 for _ in range(1))
    for k in range(3):
        a = r.uniform(0.02, d * 0.7); f = r.uniform(220, 420); L = 0.06
        tl = t(L); out = out + mix([(0.6 * np.sin(osc(f * (1 + 2.5 * tl / L))) * env(len(tl), 0.001, 0.02), a)], d)
    return out * np.minimum(tt / 0.01, 1) * np.exp(-tt / (d * 0.6))
save("squelch", squelch(0.35, 1))
save("squelch2", squelch(0.45, 7))

# bubble wrap: tiny crisp pops at random spacing
d = 0.5; x = np.zeros(int(d * SR))
for k, at in enumerate(np.sort(rng.uniform(0, 0.42, 6))):
    L = int(0.012 * SR); s = hp(rng.normal(0, 1, L), 2500) * np.exp(-np.arange(L) / (0.002 * SR))
    i = int(at * SR); x[i:i + L] += s * rng.uniform(0.5, 1)
save("bubblewrap", x)

# water drop "plip-plunk"
tt = t(0.25)
drop = np.sin(osc(900 * (1 + 1.8 * (tt / 0.25) ** 0.5))) * env(len(tt), 0.0008, 0.05)
save("waterdrop", mix([(drop, 0), (0.5 * np.sin(osc(np.full(int(0.15 * SR), 520))) * env(int(0.15 * SR), 0.001, 0.025), 0.005)], 0.3))

# woodblock tok / double tok
def tok(f=950):
    tt = t(0.12)
    return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.3 * tt)) * env(len(tt), 0.0005, 0.018) + 0.3 * bp(noise(0.12), 1500, 5000) * env(len(tt), 0.0003, 0.004)
save("tok", tok())
save("toktok", mix([(tok(1050), 0), (tok(820), 0.11)], 0.3))

# finger snap, cork pop
L = 0.08; s = bp(noise(L), 1800, 6500) * env(int(L * SR), 0.0004, 0.012)
save("snap", s + 0.4 * np.sin(2 * np.pi * 1200 * t(L)) * env(int(L * SR), 0.0004, 0.006))
tt = t(0.18)
save("cork", 0.7 * np.sin(osc(700 * np.exp(-tt / 0.05) + 250)) * env(len(tt), 0.0005, 0.04) + 0.6 * bp(noise(0.18), 500, 3000) * env(len(tt), 0.0003, 0.006))

# glass tink, triangle ting, toy piano
save("glass", bellp(2900, [(1, 1, 0.5), (2.32, 0.5, 0.25), (4.25, 0.3, 0.12), (6.8, 0.15, 0.05)], 1.0))
save("triangle", bellp(2400, [(1, 1, 0.9), (2.76, 0.4, 0.5), (5.40, 0.25, 0.3), (8.93, 0.12, 0.15)], 1.4))
def toyp(f): return bellp(f, [(1, 1, 0.22), (3.1, 0.35, 0.06), (5.9, 0.15, 0.03)], 0.6)
save("toypiano", mix([(toyp(hz(m)), i * 0.02) for i, m in enumerate([79, 83, 86])], 0.8))
save("toypiano_up", mix([(toyp(hz(m)), i * 0.09) for i, m in enumerate([72, 76, 79, 84])], 0.9))

# fairy dust: rising shimmer of tiny bell grains
d = 0.9; x = np.zeros(int(d * SR))
for k in range(22):
    at = k * 0.03 + rng.uniform(0, 0.02); f = hz(rng.choice([88, 91, 93, 95, 98, 100, 103]) + min(k // 6, 3))
    g = bellp(f, [(1, 1, 0.08), (2.7, 0.3, 0.03)], 0.25) * (0.5 + 0.5 * rng.uniform())
    i = int(at * SR); n = min(len(g), len(x) - i); x[i:i + n] += g[:n]
save("fairy", x * np.linspace(0.6, 1, len(x)))

# toy trombone "womp womp" (cute, short)
def womp(f, d):
    tt = t(d); fr = f * (1 - 0.06 * tt / d) * (1 + 0.02 * np.sin(2 * np.pi * 7 * tt))
    ph = osc(fr); x = sum(np.sin(k * ph) / k for k in range(1, 8))
    return lp(x, 1600) * np.minimum(tt / 0.03, 1) * np.minimum((d - tt) / 0.06, 1)
save("womp", mix([(womp(hz(67), 0.22), 0), (womp(hz(64), 0.42), 0.25)], 0.7))

# airy swish (transition), spray spritz
d = 0.3; tt = t(d); u = tt / d
x = np.zeros(len(tt)); nz = noise(d)
for a, b in [(0, 0.25), (0.25, 0.5), (0.5, 0.75), (0.75, 1.0)]:
    lo = 700 * 6 ** ((a + b) / 2); m = (u >= a) & (u < b)
    x += bp(nz, lo, lo * 1.8) * m
save("swish", lp(x, 9000) * np.sin(np.pi * u) ** 2)
d = 0.16; tt = t(d)
spr = hp(noise(d), 3500) * np.minimum(tt / 0.005, 1) * np.exp(-tt / 0.07)
save("spritz", mix([(spr, 0), (0.8 * spr, 0.19)], 0.38))
print("ok")
