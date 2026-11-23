"""Clean the voice-over and tighten awkward pauses.

Input : source .mov (voice-over is its audio track)
Output: public/audio/voice.wav  (cleaned, pauses tightened, 48 kHz stereo)
        scripts/voice_map.json  (list of kept [src_start, src_end, dst_start] segments)
Cuts only happen inside detected silences, each with a short equal-power fade,
so no word is ever clipped.
"""
import json, re, subprocess, sys, wave
import numpy as np

src = sys.argv[1]
SR = 48000
GAP_KEEP = 0.30      # longest pause we keep between phrases (s)
LEAD, TAIL = 0.12, 0.45
FADE = 0.03

chain = ("highpass=f=75,lowpass=f=15000,afftdn=nf=-32,"
         "acompressor=threshold=-22dB:ratio=2.5:attack=6:release=120:makeup=2,"
         "loudnorm=I=-15:TP=-1.5:LRA=8")
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vn", "-af", chain, "-ar", str(SR), "-ac", "2",
                      "-f", "s16le", "-"], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float32)

log = subprocess.run(["ffmpeg", "-i", src, "-vn", "-af", "silencedetect=noise=-38dB:d=0.25", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
sil = list(zip(starts, ends))
dur = len(a) / SR

# speech regions = complement of silences
speech, t = [], 0.0
for s, e in sil:
    if s > t: speech.append([t, s])
    t = e
if t < dur: speech.append([t, dur])
speech = [r for r in speech if r[1] - r[0] > 0.05]

keep = []
for i, (s, e) in enumerate(speech):
    pre = LEAD if i == 0 else GAP_KEEP / 2
    post = TAIL if i == len(speech) - 1 else GAP_KEEP / 2
    keep.append([max(0, s - pre), min(dur, e + post)])
# merge overlapping
merged = [keep[0]]
for s, e in keep[1:]:
    if s <= merged[-1][1]: merged[-1][1] = max(merged[-1][1], e)
    else: merged.append([s, e])

out, mp, t = [], [], 0.0
nf = int(FADE * SR)
ramp = np.sin(np.linspace(0, np.pi / 2, nf)) ** 2
for s, e in merged:
    seg = a[int(s * SR):int(e * SR)].copy()
    seg[:nf] *= ramp[:, None]; seg[-nf:] *= ramp[::-1, None]
    out.append(seg); mp.append([round(s, 4), round(e, 4), round(t, 4)])
    t += len(seg) / SR
y = np.concatenate(out)
with wave.open("public/audio/voice.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(np.clip(y, -32768, 32767).astype(np.int16).tobytes())
json.dump(mp, open("scripts/voice_map.json", "w"), indent=1)
print(f"voice: {dur:.2f}s -> {t:.2f}s, {len(mp)} segments")
