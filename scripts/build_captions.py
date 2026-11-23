"""Build src/captions.json from Whisper large-v3 word timings (scripts/transcript_raw.json, language=ms)
remapped onto the tightened voice-over (scripts/voice_map.json), with manual spelling fixes."""
import json, re, wave
import numpy as np

raw = json.load(open("scripts/transcript_raw.json"))
vmap = json.load(open("scripts/voice_map.json"))
FIX = {"energen": "anagen", "kukur": "gugur", "konsisten": "consistency", "oh": "oh,", "telogen": "telogen,", "important": "important.", "nak": "nak,"}

def remap(t):
    for s, e, d in vmap:
        if t < s: return d            # inside a removed pause -> snap to next kept speech
        if t <= e: return d + (t - s)
    s, e, d = vmap[-1]
    return d + (e - s)

words = []
for seg in raw:
    for w in seg["words"]:
        txt = w["w"].strip()
        txt = FIX.get(txt, txt)
        words.append({"text": txt, "start": w["s"], "end": w["e"]})
words[-1]["text"] = "result."
for a, b in zip(words, words[1:]):
    if a["text"] == "nak,": b["text"] = "tapi"
# whisper starts words that follow a pause too early: clamp start into kept speech after remap
for w in words:
    w["start"], w["end"] = round(remap(w["start"]), 3), round(remap(w["end"]), 3)
# snap word onsets to actual voice energy in the edited voice track (whisper starts post-pause words early)
w_ = wave.open("public/audio/voice.wav"); SR = w_.getframerate()
au = np.frombuffer(w_.readframes(w_.getnframes()), np.int16).reshape(-1, 2).mean(1) / 32768
hop = SR // 100
rms = np.sqrt(np.convolve(au ** 2, np.ones(hop) / hop, "same"))[::hop]
thr = 10 ** (-38 / 20)
for w in words:
    a0, a1 = int(w["start"] * 100), int((w["end"] - 0.1) * 100)
    quiet = [k for k in range(a0, max(a0, a1)) if rms[k] < thr]
    # word really starts after the last real pause (>=80 ms of silence) in its window
    runs, k = [], 0
    while k < len(quiet):
        j = k
        while j + 1 < len(quiet) and quiet[j + 1] == quiet[j] + 1: j += 1
        if j - k + 1 >= 8: runs.append(quiet[j])
        k = j + 1
    if runs: w["start"] = round((runs[-1] + 1) / 100, 3)
for a, b in zip(words, words[1:]):
    if b["start"] < a["end"]: a["end"] = b["start"]
for w in words:
    if w["end"] - w["start"] > 0.7: w["start"] = round(w["end"] - 0.55, 3)  # long leading gaps

# short caption chunks (max 3 words / 18 chars), break after punctuation
chunks, cur = [], []
for w in words:
    cur.append(w)
    n = sum(len(x["text"]) + 1 for x in cur)
    if re.search(r"[,.?!]$", w["text"]) or len(cur) >= 3 or n > 18:
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
out = []
for i, c in enumerate(chunks):
    end = c[-1]["end"] + 0.12
    if i + 1 < len(chunks): end = min(end, chunks[i + 1][0]["start"])
    out.append({"start": c[0]["start"], "end": round(end, 3), "words": c})
json.dump(out, open("src/captions.json", "w"), indent=1)
print(len(out), "chunks")
for c in out: print(f'{c["start"]:6.2f}-{c["end"]:6.2f}', " ".join(w["text"] for w in c["words"]))
