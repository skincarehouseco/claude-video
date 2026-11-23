"""Whisper large-v3 word timings (scripts/pestana/transcript_raw.json, source VO time)
-> src/pestana/words.json in OUTPUT time (after cut_voice.py tightened the pauses)."""
import json, re
raw = json.load(open('scripts/pestana/transcript_raw.json'))
vm = json.load(open('src/pestana/voicemap.json'))['segments']
# speech onsets from silencedetect: whisper tends to start the first word of a phrase too early
ONSETS = [0.674, 6.649, 8.969, 11.648, 16.489, 19.988, 24.912, 29.308, 31.228, 33.053, 37.319, 39.153, 41.807, 50.050]
FIX = {}  # manual text fixes by index, if needed

def out_t(t):
    for s, e, o in vm:
        if t < s: return o  # inside a removed gap -> snap to next kept segment
        if t <= e: return o + (t - s)
    s, e, o = vm[-1]; return o + (e - s)

words = []
for seg in raw['segments']:
    if seg['start'] > 80: continue  # trailing silence hallucination
    for w in seg['words']:
        words.append([w['w'].strip(), w['s'], w['e']])
# snap phrase-initial words to the real onset
for on in ONSETS:
    i = next(k for k in range(len(words)) if words[k][2] > on)  # first word still sounding at the onset
    words[i][1] = max(words[i][1], on - 0.03)
out = []
for i, (txt, s, e) in enumerate(words):
    txt = FIX.get(i, txt)
    out.append({"i": i, "text": txt, "start": round(out_t(s), 3), "end": round(out_t(e), 3)})
json.dump(out, open('src/pestana/words.json', 'w'), indent=0, ensure_ascii=False)
print(' '.join(f"{w['i']}:{w['text']}@{w['start']:.2f}" for w in out))
