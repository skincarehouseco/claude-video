"""Tighten the voice-over: shorten long pauses (keeping a natural breath) with equal-power crossfades.
usage: python3 cut_voice.py voice_full.wav out_voice.wav out_map.json
Writes the kept segments as [[srcStart, srcEnd, outStart], ...] so captions/footage can be re-timed."""
import sys, json, wave, numpy as np

# pauses detected on the raw voice-over (ffmpeg silencedetect -35dB, d=0.35)
GAPS = [(6.146, 6.649), (8.578, 8.969), (11.122, 11.648), (16.096, 16.489), (19.496, 19.988),
        (24.480, 24.912), (28.803, 29.308), (30.807, 31.228), (32.678, 33.053), (36.874, 37.319),
        (38.752, 39.153), (41.392, 41.807), (49.696, 50.050)]
HEAD, TAIL = 0.52, 54.24 + 0.55   # start just before the first word, keep a soft tail after the last
TARGET = 0.24                     # pause length kept (s)
XF = 0.04                         # crossfade (s)

inp, out, mapf = sys.argv[1:4]
w = wave.open(inp); sr = w.getframerate(); ch = w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64).reshape(-1, ch) / 32768

segs = []; cur = HEAD
for a, b in GAPS:
    L = b - a
    if L <= TARGET + 0.02: continue
    cut = L - TARGET
    mid = (a + b) / 2
    segs.append((cur, mid - cut / 2)); cur = mid + cut / 2
segs.append((cur, TAIL))

n = int(XF * sr); fade_in = np.sin(np.linspace(0, np.pi / 2, n))[:, None]; fade_out = np.cos(np.linspace(0, np.pi / 2, n))[:, None]
outbuf = np.zeros((0, ch)); mp = []
for i, (s, e) in enumerate(segs):
    piece = x[int(s * sr):int(e * sr)].copy()
    if i == 0:
        piece[:n] *= np.linspace(0, 1, n)[:, None]
        mp.append([s, e, 0.0]); outbuf = piece; continue
    out_start = len(outbuf) / sr - XF
    outbuf[-n:] = outbuf[-n:] * fade_out + piece[:n] * fade_in
    outbuf = np.concatenate([outbuf, piece[n:]])
    mp.append([s, e, out_start])
fo = int(0.35 * sr); outbuf[-fo:] *= np.linspace(1, 0, fo)[:, None]
with wave.open(out, 'wb') as o:
    o.setnchannels(ch); o.setsampwidth(2); o.setframerate(sr)
    o.writeframes((np.clip(outbuf, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump({"segments": mp, "duration": len(outbuf) / sr}, open(mapf, 'w'), indent=1)
print("duration", len(outbuf) / sr)
