"""Synthesize the soft 'glow' music bed (airy pads + gentle plucks, ~42 s) and two extra SFX
(camera click, soft swoosh) for the GlowEdit composition. No third-party samples."""
import numpy as np, wave, os, sys
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/glow"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(3)

def save(name, x, peak_to=0.89):
    x = np.asarray(x, np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x / (np.max(np.abs(x)) or 1) * peak_to
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def t(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def lp(x, cutoff):
    # FFT brick-ish lowpass with soft rolloff (fast, no python loop)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (f / cutoff) ** 4), len(x))

BPM = 84; beat = 60 / BPM; DUR = 43.0
L = int(DUR * SR); mL = np.zeros(L); mR = np.zeros(L)
def add(buf, s, at, g=1.0):
    i = int(at * SR); n = min(len(s), len(buf) - i)
    if n > 0: buf[i:i + n] += s[:n] * g

# Cmaj9 - Am11 - Fmaj9 - G6sus (dreamy, premium)
prog = [[48, 55, 59, 62, 64], [45, 52, 55, 60, 62], [41, 48, 52, 55, 57], [43, 50, 55, 57, 62]]
bar = 4 * beat
def pad(notes, d):
    tt = t(d); s = np.zeros_like(tt)
    for m in notes:
        for det in (-0.07, 0.0, 0.06):
            f = hz(m + 12) * 2 ** (det / 12)
            s += np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) + 0.3 * np.sin(4 * np.pi * f * tt)
    a = np.minimum(tt / 0.9, 1) * np.minimum((d - tt) / 0.9, 1)
    return lp(s * np.clip(a, 0, 1), 1800) / len(notes)
def pluck(m, d=1.6):
    tt = t(d); f = hz(m)
    s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(4 * np.pi * f * tt) * np.exp(-tt / 0.2)
         + 0.15 * np.sin(6 * np.pi * f * tt) * np.exp(-tt / 0.08))
    return s * np.minimum(tt / 0.004, 1) * np.exp(-tt / 0.5)
def kick():
    tt = t(0.35); f = 40 + 60 * np.exp(-tt / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.12)
def hat():
    tt = t(0.06); n = rng.standard_normal(len(tt))
    return np.diff(np.concatenate([[0], n])) * np.exp(-tt / 0.012)

nbars = int(DUR / bar) + 1
for b in range(nbars):
    ch = prog[b % 4]; at = b * bar
    p = pad(ch, bar + 1.0); add(mL, p, at, 0.5); add(mR, np.roll(p, 300), at, 0.5)
    add(mL, pluck(ch[0] - 12, 2.5), at, 0.35); add(mR, pluck(ch[0] - 12, 2.5), at, 0.35)
    arp = [ch[1] + 12, ch[3] + 12, ch[2] + 12, ch[4] + 12, ch[3] + 12, ch[2] + 24, ch[4] + 12, ch[3] + 12]
    for k, m in enumerate(arp):
        pan = 0.5 + 0.35 * np.sin(k)
        s = pluck(m, 1.2) * 0.16
        add(mL, s, at + k * beat / 2, 1 - pan); add(mR, s, at + k * beat / 2, pan)
    if b >= 1:
        for q in range(4):
            if q in (0, 2): add(mL, kick(), at + q * beat, 0.22); add(mR, kick(), at + q * beat, 0.22)
            for e in (0, 0.5):
                h = hat() * (0.05 if e else 0.03); add(mL, h, at + (q + e) * beat); add(mR, h, at + (q + e) * beat)
fade = np.ones(L); n = int(2.5 * SR); fade[-n:] = np.linspace(1, 0, n); fade[:int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR))
save("music.wav", np.stack([mL * fade, mR * fade], 1), 0.8)

# camera shutter click
tt = t(0.25); n = rng.standard_normal(len(tt))
c = lp(n, 6000) * (np.exp(-tt / 0.006) + 0.6 * np.exp(-np.maximum(tt - 0.07, 0) / 0.01) * (tt > 0.07))
save("click.wav", c, 0.7)
# soft swoosh (filtered noise swell)
tt = t(0.6); n = rng.standard_normal(len(tt)); e = np.sin(np.pi * np.clip(tt / 0.6, 0, 1)) ** 2
save("swoosh.wav", lp(n * e, 2500) * e, 0.6)
print("audio done")
