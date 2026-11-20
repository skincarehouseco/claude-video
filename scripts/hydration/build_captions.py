"""Build src/hydration/captions.json from Whisper large-v3 word timings (transcript_raw.json).
Word onsets after pauses are snapped to the real speech onsets (ffmpeg silencedetect, -35 dB),
spelling fixed, and words grouped into short readable phrases."""
import json, os
HERE = os.path.dirname(__file__)
raw = json.load(open(os.path.join(HERE, "transcript_raw.json")))
words = [dict(text=w["w"].strip(), start=w["s"], end=w["e"]) for s in raw["segments"] for w in s["words"]]

FIX = {"dihidrasi": "dehidrasi", "keki": "cakey"}
# (word index -> (start, end)) corrections from silencedetect: Whisper stretches words across pauses
SNAP = {0: (0.82, 0.95), 1: (0.95, 1.18), 5: (2.06, 2.66),
        6: (3.72, 3.95), 7: (3.95, 4.38), 8: (4.65, 4.90),
        16: (8.15, 8.36), 17: (8.36, 8.84), 18: (9.14, 9.30),
        24: (11.50, 11.72), 25: (11.72, 12.17), 26: (12.53, 12.84),
        33: (15.13, 15.36), 34: (15.36, 15.90), 35: (16.21, 16.36),
        46: (20.23, 20.50),
        51: (23.02, 23.25), 52: (23.25, 23.33), 53: (23.33, 23.48), 54: (23.48, 23.74),
        55: (24.08, 24.20), 56: (24.20, 24.32), 57: (24.32, 24.68)}
EMPH = {"tight", "fine", "line", "jelas", "kusam", "penat", "crack", "cakey", "berminyak", "hydration", "dehidrasi"}
for i, w in enumerate(words):
    w["text"] = FIX.get(w["text"].strip(",?"), w["text"].strip(",?")) + (w["text"][-1] if w["text"][-1] in ",?" else "")
    if i in SNAP: w["start"], w["end"] = SNAP[i]
    w["emph"] = w["text"].strip(",?").lower() in EMPH
words[0]["text"] = "5"
GROUPS = [4, 2, 2, 5, 3, 2, 4, 2, 2, 4, 3, 2, 6, 3, 2, 3, 2, 4, 3, 3]
assert sum(GROUPS) == len(words), (sum(GROUPS), len(words))
chunks, i = [], 0
for n in GROUPS:
    ws = words[i:i + n]; i += n
    chunks.append(dict(start=ws[0]["start"], end=ws[-1]["end"], words=ws))
for a, b in zip(chunks, chunks[1:]):  # hold a phrase on screen until the next one if the gap is short
    a["end"] = b["start"] if b["start"] - a["end"] < 0.7 else a["end"] + 0.3
chunks[-1]["end"] = chunks[-1]["end"] + 0.6
out = os.path.join(HERE, "..", "..", "src", "hydration", "captions.json")
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(chunks, open(out, "w"), indent=1, ensure_ascii=False)
for c in chunks: print(f"{c['start']:6.2f}-{c['end']:6.2f}  " + " ".join(w["text"] + ("*" if w["emph"] else "") for w in c["words"]))
