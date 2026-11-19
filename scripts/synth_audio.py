"""Synthesizes original, royalty-free whimsical music beds and SFX (no external samples)."""
import numpy as np, wave, os, sys
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public"
rng = np.random.default_rng(7)

def write(path, x):
    x = np.asarray(x, np.float32)
    if x.ndim == 1: x = np.stack([x, x], 1)
    peak = np.max(np.abs(x)) or 1
    x = x / peak * 0.89
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def t_(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.005, d=0.3, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(t / a, 1.0) * np.exp(-curve * np.maximum(t - a, 0) / max(d, 1e-3))
    return e
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

def musicbox(f, d=1.2):
    t = t_(d); n = len(t)
    x = (np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*f*2.0*t)*np.exp(-6*t)
         + 0.18*np.sin(2*np.pi*f*3.01*t)*np.exp(-9*t) + 0.08*np.sin(2*np.pi*f*5.4*t)*np.exp(-14*t))
    return x * env(n, 0.002, d*0.5, 3)
def pluck(f, d=0.5):  # pizzicato-ish Karplus-Strong
    n = int(SR*d); p = max(2, int(SR/f)); buf = rng.uniform(-1,1,p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5*(buf[i % p] + buf[(i+1) % p]) * 0.994
    return out * env(n, 0.003, d*0.6, 2.5)
def pad(fs, d):
    t = t_(d); x = sum(np.sin(2*np.pi*f*t + 0.3*np.sin(2*np.pi*0.3*t)) + 0.3*np.sin(2*np.pi*f*2.003*t) for f in fs)
    a = np.minimum(t/0.4, 1) * np.minimum((d - t)/0.4, 1)
    return x * np.clip(a, 0, 1) / len(fs)
def softkick(d=0.25):
    t = t_(d); f = 110*np.exp(-t*18) + 45
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*14)
def shaker(d=0.06):
    n = int(SR*d); x = rng.normal(0,1,n); x = np.diff(np.concatenate([[0],x]))
    return x * env(n, 0.004, d*0.4, 3) * 0.25
def add(buf, x, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(len(buf), i+len(x))
    if j <= i: return
    l, r = np.sqrt(0.5*(1-pan)), np.sqrt(0.5*(1+pan))
    buf[i:j,0] += x[:j-i]*g*l; buf[i:j,1] += x[:j-i]*g*r

def song(path, bpm, seconds, key, melody_seed, swing=0.0):
    beat = 60/bpm; bars = int(np.ceil(seconds/(beat*4)))
    buf = np.zeros((int(SR*(bars*4*beat+2)), 2))
    prog = [[0,4,7],[9,12,16],[5,9,12],[7,11,14]]  # I vi IV V
    scale = [0,2,4,7,9,12,14,16]  # pentatonic-ish
    r = np.random.default_rng(melody_seed)
    motif = [r.choice(scale) for _ in range(8)]
    for b in range(bars):
        ch = prog[b % 4]; t0 = b*4*beat
        add(buf, pad([mtof(key-12+c) for c in ch], 4*beat), t0, 0.16)
        for q in range(4):
            add(buf, pluck(mtof(key-24+ch[0] + (7 if q%2 else 0)), 0.45), t0+q*beat, 0.30, -0.2)
            if q in (0,2): add(buf, softkick(), t0+q*beat, 0.35)
            for e in range(2):
                add(buf, shaker(), t0+q*beat+e*beat/2 + (swing*beat/2 if e else 0), 0.5 if e else 0.3, 0.3)
        # music-box melody: motif varied over chord
        for k in range(8):
            if (b % 2 == 1 and k % 3 == 2): continue
            note = key + 12 + motif[(k + b) % 8] + (ch[0] if b % 4 == 2 else 0) // 2 * 0
            add(buf, musicbox(mtof(note), 1.0), t0 + k*beat/2 + (swing*beat/2 if k%2 else 0), 0.22, 0.15)
        if b % 4 == 3:  # sparkle fill
            for k, s in enumerate([24, 28, 31, 36]):
                add(buf, musicbox(mtof(key+s), 0.6), t0 + 3*beat + k*beat/8, 0.08, 0.4)
    n = int(SR*seconds); buf = buf[:n]
    fade = int(SR*1.5); buf[-fade:] *= np.linspace(1,0,fade)[:,None]; buf[:int(SR*0.3)] *= np.linspace(0,1,int(SR*0.3))[:,None]
    # gentle low-pass smoothing
    k = np.ones(3)/3; buf = np.stack([np.convolve(buf[:,c], k, 'same') for c in range(2)], 1)
    write(path, buf)

def sfx():
    d = f"{OUT}/sfx"; os.makedirs(d, exist_ok=True)
    t = t_(0.18); f = 300 + 900*np.exp(-t*30)
    write(f"{d}/pop.wav", np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*28))
    buf = np.zeros((int(SR*1.4),2))
    for i, m in enumerate([84, 88, 91, 96, 100, 103]):
        add(buf, musicbox(mtof(m), 0.9), i*0.055, 0.6 - i*0.05, (-1)**i*0.4)
    write(f"{d}/sparkle.wav", buf)
    n = int(SR*0.55); x = rng.normal(0,1,n); t = np.arange(n)/SR
    cut = 0.02 + 0.25*np.sin(np.pi*t/t[-1]); y = np.zeros(n); s = 0
    for i in range(n): s += cut[i]*(x[i]-s); y[i] = s
    write(f"{d}/whoosh.wav", y*np.sin(np.pi*t/t[-1])**2)
    write(f"{d}/ding.wav", musicbox(mtof(88), 1.4) + 0.5*musicbox(mtof(95), 1.4))
    t = t_(0.05); write(f"{d}/click.wav", np.sin(2*np.pi*2400*t)*np.exp(-t*160) + 0.3*rng.normal(0,1,len(t))*np.exp(-t*300))
    t = t_(0.5); f = 220 + 160*np.sin(2*np.pi*9*t)*np.exp(-t*5) + 200*t
    write(f"{d}/boing.wav", np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*5))
    buf = np.zeros((int(SR*0.9),2))
    for i, m in enumerate([79, 83, 86, 91]): add(buf, musicbox(mtof(m), 0.8), i*0.07, 0.6)
    write(f"{d}/magic.wav", buf)

if __name__ == "__main__":
    sfx(); os.makedirs(f"{OUT}/music", exist_ok=True)
    song(f"{OUT}/music/whimsy_a.wav", 104, 75, 72, 3, swing=0.15)   # C major, bouncy
    song(f"{OUT}/music/whimsy_b.wav", 96, 75, 77, 11, swing=0.25)   # F major, dreamy
    song(f"{OUT}/music/whimsy_c.wav", 112, 75, 74, 5, swing=0.1)    # D major, playful
    print("ok")
