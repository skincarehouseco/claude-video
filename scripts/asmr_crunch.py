"""Extra-crispy product-crushing ASMR audio, synthesised from a cue sheet (no samples, no music, no voice).

Layers: fracture cracks (grain bursts + low body + ceramic ring), Poisson micro-crackle clusters with Pareto amplitudes,
falling crumbs, soft squish underneath, fingertip friction, stick-slip pressure creak, nail/plastic ticks.
Close-mic binaural-style placement (per-event ITD + ILD + far-ear damping), tiny early reflections, gentle saturation
and a peak limiter. Re-time to a generated video by editing the cue JSON (seconds) and re-running.

usage: python scripts/asmr_crunch.py <cues.json> <out.wav>   (needs numpy, scipy; 48 kHz / 24-bit stereo out)
"""
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
cues = json.load(open(sys.argv[1]))
DUR = cues['duration']
rng = np.random.default_rng(cues.get('seed', 7))
L = np.zeros(int(DUR * SR) + SR)
R = np.zeros_like(L)

_sos = {}
def bp(x, lo, hi, order=2):
    k = ('bp', round(lo), round(hi), order)
    if k not in _sos:
        _sos[k] = butter(order, [max(20, lo), min(hi, SR / 2 - 100)], 'bandpass', fs=SR, output='sos')
    return sosfilt(_sos[k], x)
def lp(x, f):
    k = ('lp', round(f))
    if k not in _sos:
        _sos[k] = butter(2, f, 'lowpass', fs=SR, output='sos')
    return sosfilt(_sos[k], x)
def hp(x, f):
    k = ('hp', round(f))
    if k not in _sos:
        _sos[k] = butter(2, f, 'highpass', fs=SR, output='sos')
    return sosfilt(_sos[k], x)


def place(sig, at, pan=0.0, gain=1.0):
    """binaural-ish placement: ILD (equal power), ITD up to 0.55 ms, far ear slightly darker"""
    i = int(at * SR)
    if i >= len(L) or len(sig) == 0:
        return
    sig = sig * gain
    th = (pan + 1) * np.pi / 4
    gl, gr = np.cos(th), np.sin(th)
    itd = int(abs(pan) * 0.00055 * SR)
    dark = lp(sig, 6500) if abs(pan) > 0.05 else sig
    far = dark * (1 - 0.35 * abs(pan)) + sig * 0.35 * abs(pan)
    l_sig, r_sig = (sig, far) if pan < 0 else (far, sig)
    for buf, s, g, d in ((L, l_sig, gl, itd if pan > 0 else 0), (R, r_sig, gr, itd if pan < 0 else 0)):
        j = i + d
        n = min(len(s), len(buf) - j)
        if n > 0:
            buf[j:j + n] += g * s[:n] * np.sqrt(2)


def grain(bright=1.0, size=1.0):
    """one tiny crisp fracture: filtered noise burst, 0.6–5 ms, random band, random polarity"""
    n = int(rng.uniform(0.0006, 0.005) * size ** 0.5 * SR) + 8
    c = rng.uniform(1500, 9000) * bright
    x = rng.normal(0, 1, n + 400)
    x = bp(x, c * 0.55, c * 1.9)[:n + 400]
    e = np.exp(-np.arange(n + 400) / (rng.uniform(0.0008, 0.003) * SR))
    return x * e * rng.choice([-1, 1])


def crack(at, size=1.0, pan=0.0):
    """a shell fracture: propagation burst of grains + body thump + short ceramic ring + crumb spray"""
    burst_len = 0.02 + 0.05 * size
    n_g = int(3 + 9 * size)
    for k in range(n_g):
        t = at + (k / n_g) ** 1.6 * burst_len + rng.uniform(0, 0.003)
        a = (0.35 + 0.65 * rng.pareto(3) / 2) * size * (1.2 if k == 0 else 1)
        place(grain(rng.uniform(0.8, 1.25), size), t, pan + rng.uniform(-0.12, 0.12), min(a, 1.6))
    # low body (close-mic proximity), tiny pitch drop
    n = int(0.07 * SR)
    tt = np.arange(n) / SR
    f = (110 + 90 * size) * (1 + 0.8 * np.exp(-tt / 0.006))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (0.012 + 0.02 * size))
    body += 0.6 * lp(rng.normal(0, 1, n), 400) * np.exp(-tt / 0.008)
    place(body, at, pan * 0.5, 0.22 * size)
    # ceramic ring: inharmonic partials
    n = int(0.09 * SR)
    tt = np.arange(n) / SR
    ring = sum(np.sin(2 * np.pi * rng.uniform(2400, 7600) * tt + rng.uniform(0, 6)) * np.exp(-tt / rng.uniform(0.008, 0.03)) for _ in range(4))
    place(ring * np.minimum(tt / 0.0003, 1), at + 0.001, pan, 0.06 * size)
    # crumbs spraying right after
    crumbs(at + burst_len, 0.12 + 0.25 * size, rate=120 * size, amp=0.18 * size, pan=pan)


def cluster(t0, t1, rate0, rate1, amp, pan=0.0, spread=0.25, bright=1.0):
    """micro-crackle bed: Poisson grains, Pareto amplitudes (many tiny, few sharp), rate ramps rate0 -> rate1"""
    t = t0
    while t < t1:
        u = (t - t0) / max(1e-6, t1 - t0)
        r = rate0 + (rate1 - rate0) * u
        t += rng.exponential(1 / max(r, 1))
        a = amp * min(0.15 + rng.pareto(2.2) * 0.25, 1.4)
        place(grain(bright * rng.uniform(0.85, 1.2), 0.6 + a), t, pan + rng.uniform(-spread, spread), a)


def crumbs(t0, dur, rate=60, amp=0.12, pan=0.0):
    """small dry pieces falling and settling: sparse, slightly darker ticks, some double-bounces"""
    t = t0
    while t < t0 + dur:
        t += rng.exponential(1 / rate)
        a = amp * rng.uniform(0.2, 1) * (1 - 0.6 * (t - t0) / dur)
        g = lp(grain(rng.uniform(0.45, 0.8), 0.5), 7000)
        place(g, t, pan + rng.uniform(-0.6, 0.6), a)
        if rng.uniform() < 0.3:
            place(g * 0.4, t + rng.uniform(0.015, 0.04), pan + rng.uniform(-0.6, 0.6), a)


def squish(t0, dur, amp=0.3, pan=0.0):
    """soft creamy interior underneath: low-mid wet noise with slow pressure AM + tiny wet clicks"""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = bp(rng.normal(0, 1, n), 160, 900)
    am = np.clip(np.sin(np.pi * tt / dur), 0, 1) ** 1.3 * (0.7 + 0.3 * np.sin(2 * np.pi * rng.uniform(2, 4) * tt + 1))
    place(x * am, t0, pan, amp * 0.28)
    for _ in range(int(3 + dur * 6)):
        a = rng.uniform(0, dur * 0.9)
        m = int(0.03 * SR)
        ts = np.arange(m) / SR
        f0 = rng.uniform(250, 600)
        cl = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.5 * ts / 0.03)) / SR) * np.exp(-ts / 0.006)
        place(cl, t0 + a, pan + rng.uniform(-0.2, 0.2), amp * rng.uniform(0.08, 0.2))


def friction(t0, dur, amp=0.05, pan=0.0):
    """fingertip skin on packaging: soft band noise following a smooth movement envelope"""
    n = int(dur * SR)
    x = bp(rng.normal(0, 1, n), 1200, 7000)
    k = max(4, int(dur * 6))
    ctrl = np.interp(np.linspace(0, k - 1, n), np.arange(k), np.abs(rng.normal(0.6, 0.35, k)))
    win = np.sin(np.pi * np.arange(n) / n) ** 0.5
    place(x * ctrl * win, t0, pan, amp)


def creak(t0, dur, amp=0.12, pan=0.0):
    """stick-slip pressure before a break: accelerating pulse train through a resonance"""
    n = int(dur * SR)
    out = np.zeros(n + 2000)
    t = 0.0
    while t < dur:
        u = t / dur
        t += 1 / (25 + 90 * u ** 1.5)
        i = int(t * SR)
        if i < n:
            out[i] += (0.4 + 0.6 * u) * rng.uniform(0.6, 1)
    x = bp(out, 700, 2200, 2) + 0.4 * bp(out, 2500, 5000, 2)
    place(x, t0, pan, amp * 6)


def tick(at, amp=0.15, pan=0.0):
    """nail on hard plastic cap"""
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 1850 * tt) + 0.6 * np.sin(2 * np.pi * 4300 * tt)) * np.exp(-tt / 0.004) + 0.5 * hp(rng.normal(0, 1, n), 3000) * np.exp(-tt / 0.0008)
    place(x, at, pan, amp)


FN = dict(crack=crack, cluster=cluster, crumbs=crumbs, squish=squish, friction=friction, creak=creak, tick=tick)
for ev in cues['events']:
    kind = ev.pop('type')
    FN[kind](**ev)

# tiny close-room early reflections (dry, intimate)
for d_ms, g in ((3.1, 0.10), (5.3, 0.07), (8.9, 0.04)):
    d = int(d_ms / 1000 * SR)
    L[d:] += g * lp(R[:-d], 5000)
    R[d:] += g * lp(L[:-d], 5000)
st = np.stack([L, R], 1)[:int(DUR * SR)]
st = hp(st.T, 28).T
# gentle saturation for crunch density, then lookahead peak limiter at -1 dBFS
st = st / (np.percentile(np.abs(st), 99.95) + 1e-9) * 0.7
st = np.tanh(st * 1.3) / np.tanh(1.3)
ceil = 10 ** (-1.2 / 20)
pk = np.abs(st).max(1)
look = int(0.002 * SR)
need = np.maximum(pk / ceil, 1)
g = 1 / np.maximum.reduce([np.roll(need, -k) for k in range(look)])
rel = np.exp(-1 / (0.06 * SR))
for i in range(1, len(g)):
    g[i] = min(g[i], g[i - 1] * rel + (1 - rel))
st = st * g[:, None]
fade = int(0.25 * SR)
st[-fade:] *= np.linspace(1, 0, fade)[:, None]
pcm = np.clip(st * 8388607, -8388608, 8388607).astype(np.int32)
b = np.zeros((pcm.size, 3), np.uint8)
v = pcm.reshape(-1).astype(np.int64) & 0xFFFFFF
b[:, 0], b[:, 1], b[:, 2] = v & 255, (v >> 8) & 255, (v >> 16) & 255
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR)
    w.writeframes(b.tobytes())
print('wrote', sys.argv[2], f'{DUR}s')
