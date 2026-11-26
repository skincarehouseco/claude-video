"""Synthesize an original light, upbeat lifestyle music bed + CapCut-style SFX (no third-party samples).
Usage: python3 scripts/blume/make_audio.py public/blume/audio
"""
import numpy as np, wave, os, sys

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/blume/audio"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)


def save(name, x, peak=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    m = np.max(np.abs(x)) or 1
    x = x / m * peak
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a=0.004, d=0.3):
    tt = np.arange(n) / SR
    return np.minimum(tt / a, 1) * np.exp(-tt / d)


def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y


def hp(x, a):
    return x - lp(x, a)


def noise(d): return rng.standard_normal(int(d * SR))

# ------------------------------------------------------------------ SFX
# pop: short pitched-down sine blip
tt = t(0.16)
f = 900 * np.exp(-tt * 28) + 260
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.001, 0.045)
save("pop.wav", pop)

# bubble pop: rising blip, rounder
tt = t(0.14)
f = 380 + 1400 * (1 - np.exp(-tt * 40))
bub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 0.035)
save("bubble.wav", bub)

# click: tiny filtered transient
c = hp(noise(0.03), 0.5) * env(int(0.03 * SR), 0.0003, 0.004)
c += 0.5 * np.sin(2 * np.pi * 2200 * t(0.03)) * env(int(0.03 * SR), 0.0002, 0.006)
save("click.wav", c)

# soft whoosh: band-passed noise swell
d = 0.45; n = noise(d); n = lp(hp(n, 0.06), 0.25)
sh = np.sin(np.linspace(0, np.pi, len(n))) ** 2
save("whoosh.wav", n * sh)

# swipe: shorter, brighter whoosh
d = 0.22; n = lp(hp(noise(d), 0.2), 0.5)
sh = np.sin(np.linspace(0, np.pi, len(n))) ** 3
save("swipe.wav", n * sh)

# ding: bell
def bell(fr, d=1.3, dec=0.5):
    tt = t(d)
    s = (np.sin(2*np.pi*fr*tt) + 0.4*np.sin(2*np.pi*2*fr*tt)*np.exp(-tt/0.2)
         + 0.2*np.sin(2*np.pi*3.01*fr*tt)*np.exp(-tt/0.08))
    return s * env(len(tt), 0.002, dec)
save("ding.wav", bell(hz(88)) + 0.6 * np.concatenate([np.zeros(int(0.07*SR)), bell(hz(93))])[:int(1.3*SR)])

# sparkle chime: fast ascending glints
sp = np.zeros(int(1.0 * SR))
for i, m in enumerate([96, 100, 103, 108, 112]):
    s = bell(hz(m), 0.6, 0.18) * (0.9 - i * 0.1)
    st = int(i * 0.045 * SR); sp[st:st+len(s)] += s[:len(sp)-st]
save("sparkle.wav", sp)

# camera shutter: two clicks + noise burst
sh = np.zeros(int(0.25 * SR))
for at, g in [(0, 1), (0.07, 0.8)]:
    b = hp(noise(0.05), 0.3) * env(int(0.05*SR), 0.0005, 0.012) * g
    st = int(at * SR); sh[st:st+len(b)] += b
save("shutter.wav", sh)

# paper flip: crackly noise burst
d = 0.28; n = hp(noise(d), 0.4) * (rng.random(int(d*SR)) > 0.6)
pf = lp(n, 0.4) * np.sin(np.linspace(0, np.pi, int(d*SR))) ** 1.5
save("paper.wav", pf)

# soft impact: low thump + air
tt = t(0.4)
th = np.sin(2*np.pi*np.cumsum(110*np.exp(-tt*9)+45)/SR) * env(len(tt), 0.002, 0.12)
th += 0.25 * lp(noise(0.4), 0.1) * env(len(tt), 0.002, 0.06)
save("impact.wav", th)

# notification: two-note marimba-ish blip
def mar(fr, d=0.35):
    tt = t(d); return (np.sin(2*np.pi*fr*tt) + 0.3*np.sin(2*np.pi*4*fr*tt)*np.exp(-tt/0.02)) * env(len(tt), 0.001, 0.09)
no = np.zeros(int(0.5*SR)); a = mar(hz(84)); b = mar(hz(91))
no[:len(a)] += a; st = int(0.11*SR); no[st:st+len(b)] += b
save("notify.wav", no)

# record scratch: wobbling filtered noise with pitch sweep
d = 0.5; tt = t(d)
wob = np.sin(2*np.pi*np.cumsum(300 + 900*np.abs(np.sin(tt*9)))/SR)
rs = (0.6*wob + 0.5*hp(noise(d), 0.3)) * np.minimum(tt/0.01, 1) * np.exp(-tt/0.25)
save("scratch.wav", lp(rs, 0.5))

# spray: aerosol "pssht"
d = 0.6; n = hp(noise(d), 0.35); n = lp(n, 0.7)
e = np.minimum(t(d)/0.02, 1) * np.exp(-np.maximum(t(d)-0.25, 0)/0.09)
save("spray.wav", n * e)

# tick (clock / loading)
tt = t(0.05)
save("tick.wav", np.sin(2*np.pi*3200*tt) * env(len(tt), 0.0003, 0.008))

# lock click: two-stage mechanical click
lk = np.zeros(int(0.3*SR))
for at, fr, g in [(0, 1800, 0.7), (0.06, 1200, 1.0)]:
    tt = t(0.04)
    b = (np.sin(2*np.pi*fr*tt) + hp(noise(0.04), 0.5)) * env(len(tt), 0.0003, 0.006) * g
    st = int(at*SR); lk[st:st+len(b)] += b
save("lock.wav", lk)

# cha-ching / cart (bright bell pair)
cc = np.zeros(int(1.0*SR)); a = bell(hz(91), 1.0, 0.25); b = bell(hz(96), 1.0, 0.35)
cc[:len(a)] += a; st = int(0.09*SR); cc[st:st+len(b)] += b[:len(cc)-st]
cc[:int(0.05*SR)] += hp(noise(0.05), 0.5) * env(int(0.05*SR), 0.0005, 0.01) * 0.6
save("cart.wav", cc)

def pluck(fr, d=0.5):
    tt = t(d)
    s = np.sin(2*np.pi*fr*tt) + 0.5*np.sin(2*np.pi*2*fr*tt)*np.exp(-tt/0.08) + 0.2*np.sin(2*np.pi*3*fr*tt)*np.exp(-tt/0.04)
    return s * env(len(tt), 0.003, 0.16)


def pad(ch, d):
    tt = t(d); s = np.zeros(len(tt))
    for m in ch:
        for det in (-0.08, 0.08):
            s += np.sin(2*np.pi*hz(m+det)*tt + rng.random()*6)
    a = np.minimum(tt/0.25, 1) * np.minimum((d-tt)/0.3, 1)
    return lp(s, 0.08) * a * 0.12


def kick():
    tt = t(0.3); return np.sin(2*np.pi*np.cumsum(120*np.exp(-tt*20)+48)/SR) * env(len(tt), 0.001, 0.09)


def clap():
    d = 0.18; return lp(hp(noise(d), 0.3), 0.6) * env(int(d*SR), 0.001, 0.035)


def hat():
    d = 0.05; return hp(noise(d), 0.7) * env(int(d*SR), 0.0005, 0.012)



# ------------------------------------------------------------------ music beds
def make_music(name, BPM, prog, roots, melody, bars=17, swing=0.0, kick_pattern=(0, 2), seed=0):
    beat = 60 / BPM
    L = int(bars * 4 * beat * SR) + SR * 2
    mL = np.zeros(L); mR = np.zeros(L)
    def add(buf, s_, at):
        i = int(at * SR); n = min(len(s_), len(buf) - i)
        if n > 0: buf[i:i+n] += s_[:n]
    for bar in range(bars):
        ch = prog[bar % len(prog)]; t0 = bar * 4 * beat
        p = pad(ch, 4 * beat + 0.2); add(mL, p, t0); add(mR, p, t0)
        b = pluck(hz(roots[bar % len(roots)]), 0.6) * 0.9
        for k in (0, 1.5, 2, 3.5):
            add(mL, b * (0.8 if k else 1), t0 + k*beat); add(mR, b * (0.8 if k else 1), t0 + k*beat)
        if bar >= 1:
            for k in range(4):
                if k in kick_pattern:
                    add(mL, kick()*0.55, t0+k*beat); add(mR, kick()*0.55, t0+k*beat)
                if k in (1, 3):
                    cl = clap()*0.28; add(mL, cl, t0+k*beat); add(mR, cl, t0+k*beat)
            for k in range(8):
                h = hat()*0.12; add(mL if k % 2 else mR, h, t0+k*beat/2 + (swing*beat/2 if k % 2 else 0) + 0.01)
        for k in range(8):
            m = ch[k % 4] + 12
            s_ = pluck(hz(m), 0.4) * 0.22
            add(mL if k % 2 else mR, s_, t0 + k*beat/2 + (swing*beat/2 if k % 2 else 0))
        if bar % 2 == 1:
            for k, m in enumerate(melody[(bar//2 % 2)*8:(bar//2 % 2)*8+8]):
                s_ = pluck(hz(m), 0.5) * 0.18
                add(mL, s_, t0 + k*beat/2); add(mR, s_*0.9, t0 + k*beat/2 + 0.012)
    mix = np.stack([mL, mR], 1)
    mix *= np.minimum(np.arange(len(mix))/(SR*0.6), 1)[:, None]
    save(name, mix, 0.8)

# A: light upbeat lifestyle pop, 112 BPM, Fmaj7 - Am7 - Dm7 - Bbmaj7
make_music("music.wav", 112, [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57]], [41, 45, 38, 46],
           [72, 76, 79, 76, 77, 76, 74, 72, 76, 79, 81, 79, 77, 74, 72, 69])
# B: breezy swung bedroom-pop, 98 BPM, Ebmaj7 - Cm7 - Abmaj7 - Bb6 (warmer, for the polaroid version)
make_music("music_b.wav", 98, [[51, 55, 58, 62], [48, 51, 55, 58], [44, 48, 51, 55], [46, 50, 53, 55]], [39, 36, 44, 46],
           [70, 74, 75, 79, 77, 75, 74, 70, 72, 75, 79, 82, 79, 77, 75, 74], bars=15, swing=0.33, kick_pattern=(0, 2.5))
print("audio written to", OUT)
