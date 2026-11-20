"""Whisper large-v3 word timings -> corrected, chunked captions for the Pagi/Malam edit.

Source transcript: scripts/pagimalam_transcript_raw.json (faster-whisper large-v3, word timestamps,
Malay/English code-switching). Output: src/pagimalam/captions.json
"""
import json

d = json.load(open("scripts/pagimalam_transcript_raw.json"))
words = [dict(text=w["w"].strip(), start=w["s"], end=w["e"]) for s in d["segments"] for w in s["words"]]

FIX = {"24x7": "24/7", "Acid.": "acid.", "Both": "both"}
for w in words:
    w["text"] = FIX.get(w["text"], w["text"])
    # whisper tends to stretch the last word of a phrase into the pause; cap word length
    w["end"] = min(w["end"], w["start"] + 0.75)

MAX_WORDS, MAX_CHARS, GAP = 4, 22, 0.28
chunks, cur = [], []

def flush():
    if cur:
        chunks.append(dict(start=cur[0]["start"], end=cur[-1]["end"], words=list(cur)))
        cur.clear()

for i, w in enumerate(words):
    if cur:
        gap = w["start"] - cur[-1]["end"]
        chars = len(" ".join(x["text"] for x in cur + [w]))
        if gap > GAP or len(cur) >= MAX_WORDS or chars > MAX_CHARS:
            flush()
    cur.append(w)
    if w["text"][-1] in ".,?!":
        flush()
flush()

# glue a lone trailing word ("hour.", "barrier.") back onto the phrase it finishes
merged = []
for c in chunks:
    p = merged[-1] if merged else None
    if (p and len(c["words"]) == 1 and p["words"][-1]["text"][-1] not in ".,?!"
            and c["start"] - p["end"] < GAP
            and len(" ".join(w["text"] for w in p["words"] + c["words"])) <= 28):
        p["words"] += c["words"]; p["end"] = c["end"]
    else:
        merged.append(c)
chunks = merged

# hold each chunk on screen until the next starts (if the gap is short) so captions don't flicker
for a, b in zip(chunks, chunks[1:]):
    if b["start"] - a["end"] < 0.6:
        a["end"] = b["start"]
    else:
        a["end"] += 0.3
chunks[-1]["end"] += 0.5
json.dump(chunks, open("src/pagimalam/captions.json", "w"), indent=1)
for c in chunks:
    print(f'{c["start"]:6.2f}-{c["end"]:6.2f}  ' + " ".join(w["text"] for w in c["words"]))
