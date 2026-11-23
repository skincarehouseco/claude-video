"""Build assets for the Pestana tinted lash serum edit.

usage: python3 scripts/lash/build.py <source.mov>

- tightens pauses in the voiceover (no words removed), cleans + loudness-normalises it -> public/lash/voice.wav
- transcodes the usable footage (0-60.55 s; the rest of the source is black) -> public/lash/footage.mp4
- maps the word timings (scripts/lash/words.json, source time) onto the tightened timeline and writes the
  cut list -> src/lash/edit.json
"""
import json, os, subprocess, sys
import numpy as np

SRC = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SR = 48000
FPS = 30
FOOTAGE_END = 60.55  # source video is black after this

# ---------------- voice ----------------
raw = subprocess.run(
    ['ffmpeg', '-v', 'error', '-i', SRC, '-vn', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
    check=True, capture_output=True).stdout
a = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
mono = a.mean(1)
hop = int(0.01 * SR)
nfr = len(mono) // hop
rms = np.sqrt(np.array([np.mean(mono[i * hop:(i + 1) * hop] ** 2) for i in range(nfr)]) + 1e-12)
db = 20 * np.log10(rms)
# smooth over 50 ms so consonant dips are not treated as pauses
sm = np.convolve(db, np.ones(5) / 5, mode='same')
quiet = sm < -42

words = json.load(open(os.path.join(ROOT, 'scripts/lash/words.json')))
first = words[0]['start']
last = words[-1]['end']

# pauses = quiet runs >= 0.30 s between first and last word
pauses = []
i = 0
while i < nfr:
    if quiet[i]:
        j = i
        while j < nfr and quiet[j]:
            j += 1
        s, e = i / 100, j / 100
        if e - s >= 0.30 and s > first and e < last + 0.05:
            pauses.append((s, e))
        i = j
    else:
        i += 1

KEEP_PAUSE = 0.28  # natural breath, removes dead air
cuts = []  # (start, end) of removed audio, in source seconds
lead_in = max(0.0, first - 0.12)
cuts.append((0.0, lead_in))
for s, e in pauses:
    if e - s > KEEP_PAUSE + 0.04:
        keep_each = KEEP_PAUSE / 2
        cuts.append((s + keep_each, e - keep_each))
tail_end = min(len(mono) / SR, last + 0.55)

segments = []  # kept (start, end)
t = 0.0
for s, e in cuts:
    if s > t:
        segments.append((t, s))
    t = max(t, e)
segments.append((t, tail_end))

XF = int(0.012 * SR)  # 12 ms equal-power crossfade at every join (joins sit in silence anyway)
out = np.zeros((0, 2), dtype=np.float32)
for s, e in segments:
    seg = a[int(s * SR):int(e * SR)].copy()
    if len(out) >= XF and len(seg) >= XF:
        ramp = np.linspace(0, 1, XF, dtype=np.float32)[:, None]
        mix = out[-XF:] * np.cos(ramp * np.pi / 2) + seg[:XF] * np.sin(ramp * np.pi / 2)
        out = np.concatenate([out[:-XF], mix, seg[XF:]])
    else:
        out = np.concatenate([out, seg])
# soft 30 ms fade at both ends
f = int(0.03 * SR)
out[:f] *= np.linspace(0, 1, f)[:, None]
out[-f:] *= np.linspace(1, 0, f)[:, None]

os.makedirs(os.path.join(ROOT, 'public/lash'), exist_ok=True)
tmp = os.path.join(ROOT, 'public/lash/_voice_raw.f32')
out.astype(np.float32).tofile(tmp)
subprocess.run([
    'ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', tmp,
    '-af', 'highpass=f=75,lowpass=f=15000,'
           'equalizer=f=250:t=q:w=1.2:g=-1.5,equalizer=f=3500:t=q:w=1.0:g=1.5,'
           'acompressor=threshold=-21dB:ratio=2.5:attack=6:release=120:makeup=2,'
           'alimiter=limit=0.89:level=false,loudnorm=I=-14:TP=-1.5:LRA=9',
    '-ar', str(SR), '-ac', '2', os.path.join(ROOT, 'public/lash/voice.wav')], check=True)
os.remove(tmp)

# ---------------- time map: source VO time -> edit time ----------------
starts = []
acc = 0.0
for s, e in segments:
    starts.append(acc)
    acc += e - s
# account for crossfade overlap
XF_S = XF / SR
starts = [st - k * XF_S for k, st in enumerate(starts)]
DURATION = acc - (len(segments) - 1) * XF_S


def remap(t):
    for (s, e), st in zip(segments, starts):
        if t < s:
            return st  # t fell inside a removed pause -> snap to next kept audio
        if t <= e:
            return st + (t - s)
    return DURATION


# snap word starts that whisper placed inside silence to actual voice onset
def onset(t, limit):
    k = int(t * 100)
    while k < min(int(limit * 100), nfr - 1) and sm[k] < -40:
        k += 1
    return k / 100

W = []
for w in words:
    s = onset(w['start'], w['end'] - 0.06)
    W.append({'text': w['text'], 'start': round(remap(s), 3), 'end': round(remap(w['end']), 3)})

# ---------------- cut list ----------------
# (VO anchor start, VO anchor end, footage in, footage out, zoom style)  -- anchors in source VO seconds,
# placed on pauses / word boundaries so every cut lands with the speech.
END = 99
PLAN = [
    # intro: hook
    (0.0, 3.50, 0.00, 2.95, 'in'),        # "I nak share tutorial cara pakai Pestana tinted lash serum"
    (3.50, 5.85, 3.02, 5.60, 'out'),      # "untuk dapatkan efek macam pakai mascara" -> result close-up
    # step 1 curl
    (5.85, 8.78, 5.70, 7.28, 'in'),       # curler
    (8.78, 11.35, 53.70, 56.20, 'out'),   # "lebih lifted dan lentik" -> lifted lashes close-up
    # step 2 pump + wipe
    (11.35, 14.62, 7.32, 9.00, 'in'),
    (14.62, 19.66, 9.05, 13.05, 'out'),
    # step 3 zigzag (one continuous application shot)
    (19.66, 37.90, 13.12, 28.28, 'zig'),
    # step 4 roll the brush
    (37.90, 46.60, 38.50, 47.40, 'in'),
    # compare with mascara
    (46.60, 49.90, 48.45, 50.88, 'out'),
    # step 5 repeat
    (49.90, 53.75, 50.92, 53.62, 'in'),
    (53.75, 57.95, 17.00, 21.20, 'tight'),
    # note: not mascara
    (57.95, 61.90, 28.36, 32.62, 'in'),
    (61.90, 68.75, 56.20, 60.50, 'out'),
    # formulated without wax / fibre
    (68.75, 73.76, 32.70, 37.40, 'in'),
    (73.76, 76.02, 3.02, 5.30, 'tight'),
    (76.02, 80.55, 53.70, 57.00, 'out'),
    # outro
    (80.55, 88.80, 38.60, 46.00, 'recap'),
    (88.80, END, 48.40, 50.88, 'in'),
]
clips = []
for vs, ve, fi, fo, style in PLAN:
    s = 0.0 if vs == 0 else remap(vs)
    e = DURATION if ve == END else remap(ve)
    fo = min(fo, FOOTAGE_END)
    clips.append({'start': round(s, 3), 'end': round(e, 3), 'in': fi, 'out': fo,
                  'rate': round((fo - fi) / (e - s), 4), 'style': style})


def at(t):
    return round(remap(t), 3)

# anchors for graphics, all in edit seconds
ANCHORS = {k: at(v) for k, v in {
    'mascaraLike': 4.36, 'step1': 5.96, 'lifted': 10.24, 'step2': 11.42, 'wipe': 14.80, 'notTooMuch': 17.68,
    'important': 20.96, 'step3': 22.86, 'zigzagWord': 24.64, 'whyZigzag': 27.6, 'noWax': 30.2, 'even': 34.64,
    'step4': 39.02, 'separate': 43.74, 'compare': 47.54, 'step5': 53.88, 'notMascara': 58.12,
    'hundred': 64.9, 'formulated': 71.58, 'growth': 74.6, 'withoutWax': 76.02, 'recap': 80.74,
    'tryIt': 88.94, 'mascaraLike2': 63.5, 'care': 83.58, 'sameTime': 85.30, 'mascaraEffect': 87.44,
}.items()}

json.dump({'fps': FPS, 'duration': round(DURATION, 3), 'words': W, 'clips': clips, 'anchors': ANCHORS},
          open(os.path.join(ROOT, 'src/lash/edit.json'), 'w'), indent=1)

# ---------------- footage ----------------
FOOTAGE = os.path.join(ROOT, 'public/lash/footage.mp4')
if not os.path.exists(FOOTAGE): subprocess.run([
    'ffmpeg', '-v', 'error', '-y', '-i', SRC, '-t', str(FOOTAGE_END + 0.4), '-an',
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '15', '-preset', 'slow', '-g', '15',
    FOOTAGE], check=True)

print(f'voice {len(mono) / SR:.2f}s -> {DURATION:.2f}s, {len(pauses)} pauses tightened')
for c in clips:
    print(c)
