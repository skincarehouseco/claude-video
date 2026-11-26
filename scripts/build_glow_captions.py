"""Word-timed caption chunks for GlowEdit from faster-whisper large-v3 output, with manual fixes."""
import json, re
BRAND = "Bulani"   # <- product name as spoken; change here if spelled differently
raw = json.load(open("scripts/glow_transcript_raw.json"))
FIX = {"BTUNA": BRAND, "BULANI": BRAND, "Scalactomyces": "Galactomyces", "skin care": "skincare"}
words = []
for seg in raw:
    for w in seg["words"]:
        t = w["w"].strip()
        for k, v in FIX.items():
            t = t.replace(k, v)
        if t == "%" and words:  # "5 %" -> "5%"
            words[-1]["t"] += "%"; words[-1]["e"] = w["e"]; continue
        words.append({"t": t, "s": round(w["s"], 2), "e": round(w["e"], 2)})
# merge "skin" + "care" -> "skincare"
out = []
for w in words:
    if out and out[-1]["t"].lower() == "skin" and w["t"].lower().startswith("care"):
        out[-1]["t"] = "skin" + w["t"]; out[-1]["e"] = w["e"]; continue
    out.append(w)
words = out
# chunk: max 3 words / 18 chars, break after punctuation or pauses > 0.3 s
chunks, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    text = " ".join(x["t"] for x in cur)
    if (nxt is None or re.search(r"[.,?!]$", w["t"]) or len(cur) >= 3 or len(text) >= 16
            or (nxt["s"] - w["e"]) > 0.3):
        chunks.append({"start": cur[0]["s"], "end": cur[-1]["e"], "words": [{"text": x["t"], "start": x["s"], "end": x["e"]} for x in cur]})
        cur = []
json.dump(chunks, open("src/glow/captions.json", "w"), indent=1)
print(len(chunks)); [print(c["start"], " ".join(w["text"] for w in c["words"])) for c in chunks]
