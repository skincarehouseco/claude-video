"""Whisper large-v3 word timings (scripts/hyalumelon/transcript_raw.json) -> corrected, chunked captions."""
import json, re
BRAND = ""  # brand name said at 22.0s (Whisper hears "Kermen"/"K-Man"); fill in the correct spelling to show it
d = json.load(open("scripts/hyalumelon/transcript_raw.json"))
raw = [dict(w=x["w"].strip(), s=x["s"], e=x["e"]) for seg in d for x in seg["words"]]
words = []
for w in raw:
    if w["w"].startswith("-") and words:  # "Nak" "-nak" -> "Nak-nak"
        words[-1]["w"] += w["w"]; words[-1]["e"] = w["e"]; continue
    words.append(w)
FIX = {"Halumelum": "Hyalumelon", "suitkan": "soothe-kan", "belaya-belaya": "berlayer-layer"}
out = []
for w in words:
    w["w"] = FIX.get(w["w"], w["w"])
    if w["w"] == "Kermen":
        if not BRAND:
            continue
        w["w"] = BRAND
    if w["w"] == "Dia" and w["s"] > 28.9 and w["s"] < 29: w["s"] = 29.1  # low-confidence onset
    if w["e"] - w["s"] > 0.6: w["s"] = round(w["e"] - 0.6, 2)
    out.append(w)
words = out
words[0]["s"] = 0.05
chunks, cur = [], []
def flush():
    if cur: chunks.append(dict(start=cur[0]["s"], end=cur[-1]["e"], words=[dict(text=c["w"], start=c["s"], end=c["e"]) for c in cur]))
for w in words:
    if cur:
        gap = w["s"] - cur[-1]["e"]
        txt = " ".join(c["w"] for c in cur + [w])
        closes = re.search(r"[.,!?]$", w["w"]) and len(txt) <= 31 and gap < 0.3  # keep a phrase with its last word
        if gap > 0.4 or (len(txt) > 26 and not closes) or (len(cur) >= 4 and not closes) or re.search(r"[.,!?]$", cur[-1]["w"]):
            flush(); cur = []
    cur.append(w)
flush()
# merge a dangling 1-word chunk into the previous one when it fits
merged = []
for c in chunks:
    if merged and len(c["words"]) == 1 and c["start"] - merged[-1]["end"] < 0.3 and len(" ".join(x["text"] for x in merged[-1]["words"] + c["words"])) <= 26 and not re.search(r"[.,!?]$", merged[-1]["words"][-1]["text"]):
        merged[-1]["words"] += c["words"]; merged[-1]["end"] = c["end"]
    else:
        merged.append(c)
chunks = merged
for a, b in zip(chunks, chunks[1:]):
    a["end"] = round(min(b["start"], a["end"] + 0.45), 2)
chunks[-1]["end"] = round(chunks[-1]["end"] + 0.6, 2)
json.dump(chunks, open("src/hyalumelon/captions.json", "w"), indent=1)
for c in chunks: print(f'{c["start"]:6.2f}-{c["end"]:6.2f}  ' + " ".join(w["text"] for w in c["words"]))
