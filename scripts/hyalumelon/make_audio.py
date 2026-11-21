"""Original whimsical bed (plucky music-box + soft pad, 104 BPM) and extra SFX for the Hyalumelon edit.
Everything is synthesized here: no third-party samples."""
import numpy as np, wave, os, sys
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/hyalumelon/audio"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)

def save(name, x, peak_to=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x / (np.max(np.abs(x)) or 1) * peak_to
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
def pluck(f, d=0.6, dec=0.18):  # soft marimba-ish pluck
    tt = t(d)
    return (np.sin(2*np.pi*f*tt) + 0.25*np.sin(2*np.pi*4*f*tt)*np.exp(-tt/0.03)) * env(len(tt), 0.002, dec)
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y

# ---------------- music bed ----------------
BPM = 104; beat = 60 / BPM; bars = 28  # ~65 s
L = int(bars * 4 * beat * SR) + SR * 3
mL = np.zeros(L); mR = np.zeros(L)
def add(buf, s, at):
    i = int(at * SR); n = min(len(s), len(buf) - i)
    if n > 0: buf[i:i+n] += s[:n]
# G - Em7 - Cmaj7 - D6sus  (bright, playful)
prog = [[55, 59, 62, 66], [52, 55, 59, 62], [48, 52, 55, 59], [50, 54, 57, 59]]
melody = [79, 81, 83, 86, 83, 81, 79, 76, 76, 79, 81, 79, 74, 76, 78, 81]
for b in range(bars):
    ch = prog[b % 4]; t0 = b * 4 * beat
    pd = t(4 * beat + 0.5)
    pad = sum(np.sin(2*np.pi*hz(n)*pd) + 0.3*np.sin(2*np.pi*hz(n)*1.004*pd) for n in ch)
    pad *= np.minimum(pd / 0.6, 1) * np.minimum((pd[-1] - pd) / 0.5 + 0.0001, 1) * 0.04
    add(mL, pad, t0); add(mR, pad, t0)
    for k in (0, 1.5, 2, 3):  # bouncy bass
        bs = t(beat); bass = np.sin(2*np.pi*hz(ch[0]-12)*bs) * env(len(bs), 0.01, 0.22) * 0.2
        add(mL, bass, t0 + k*beat); add(mR, bass, t0 + k*beat)
    for k in range(8):  # pluck arpeggio
        n = ch[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12
        s = pluck(hz(n)) * (0.12 if k % 2 == 0 else 0.08)
        pan = 0.3 + 0.4 * (k % 2)
        add(mL, s * (1 - pan), t0 + k * beat / 2); add(mR, s * pan, t0 + k * beat / 2)
    if b >= 2 and b % 2 == 1:  # music-box melody
        for k in range(4):
            s = bell(hz(melody[(b // 2 * 4 + k) % 16]), 1.6, 0.55) * 0.1
            add(mL, s * 0.55, t0 + k * beat); add(mR, s * 0.45, t0 + k * beat + 0.012)
    if b >= 1:  # shaker + soft kick + finger snap
        for k in range(8):
            nz = rng.standard_normal(int(0.06 * SR)); nz = (nz - lp(nz, 0.3)) * env(len(nz), 0.002, 0.016)
            add(mL, nz * (0.045 if k % 2 else 0.02), t0 + k * beat / 2)
            add(mR, nz * (0.045 if k % 2 else 0.02), t0 + k * beat / 2 + 0.006)
        for k in (0, 2.5):
            kk = t(0.25); kick = np.sin(2*np.pi*(50 + 70*np.exp(-kk/0.03))*kk) * env(len(kk), 0.002, 0.09) * 0.22
            add(mL, kick, t0 + k * beat); add(mR, kick, t0 + k * beat)
        for k in (1, 3):
            nz = rng.standard_normal(int(0.08 * SR)); sn = (nz - lp(nz, 0.15)) * env(len(nz), 0.001, 0.03) * 0.07
            add(mL, sn, t0 + k * beat); add(mR, sn, t0 + k * beat)
music = np.stack([mL, mR], 1)
fade = int(2.5 * SR); music[-fade:] *= np.linspace(1, 0, fade)[:, None]; music[:int(0.6*SR)] *= np.linspace(0, 1, int(0.6*SR))[:, None]
save("music.wav", music)

# ---------------- extra SFX ----------------
# spray: short airy "psst" (high-passed noise burst)
nz = rng.standard_normal(int(0.45 * SR)); tt = t(0.45)
y = nz - lp(nz, 0.35); y = y - lp(y, 0.5) * 0.5
save("spray.wav", y * np.minimum(tt / 0.01, 1) * np.exp(-tt / 0.13), 0.7)
# tick: tiny wooden tick for checklist items
tt = t(0.12); save("tick.wav", (np.sin(2*np.pi*1800*tt) + 0.5*np.sin(2*np.pi*2700*tt)) * env(len(tt), 0.0005, 0.018))
# bloop: rising bubble (for stickers)
tt = t(0.22); f = 300 + 900 * (tt / 0.22) ** 1.5
save("bloop.wav", np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tt), 0.002, 0.07))
print("ok")
