"""Turn the Whisper large-v3 word timings (scripts/transcript_raw.json) into caption chunks
(src/captions.json). Manual fixes are listed below; nothing is summarised or translated."""
import json, re

raw = json.load(open("scripts/transcript_raw.json"))
words = [dict(text=w["w"].strip(), start=w["s"], end=w["e"]) for s in raw for w in s["words"]]

# Whisper hallucinated an outro on the silent tail of the clip -> drop it.
words = [w for w in words if w["start"] < 87.0]

# merge hyphen splits: "betul" "-betul" -> "betul-betul", "T" "-zone" -> "T-zone"
merged = []
for w in words:
    if w["text"].startswith("-") and merged:
        merged[-1]["text"] += w["text"]
        merged[-1]["end"] = w["end"]
    else:
        merged.append(w)
words = merged

# listening fixes (Whisper misheard the fast Malay in 16.9-19.2s)
FIX = {16.98: "Mulalah", 18.00: "yang", 18.90: "tak"}
out = []
for w in words:
    k = round(w["start"], 2)
    if k == 17.34:  # "dah" after "Mula" -> part of "Mulalah"
        out[-1]["end"] = w["end"]
        continue
    if k in FIX:
        w["text"] = FIX[k] + (w["text"][-1] if w["text"][-1] in ",.?!" else "")
    out.append(w)
words = out

KEY = set("""toner moisturizer serum products product skincare skin type kenal ramai effect never ending problem prevent
awal gentle cleanser 60 seconds rinse bilas air biasa tunggu 10 minutes kering paling penting tisu dab dahi pipi hidung
dagu minyak t-zone combination dry normal oily dehydrated flaky garis-garis follow tips look closely bye""".split())

def clean(t):
    return re.sub(r"[,.?!]", "", t).lower()

chunks, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    text_len = sum(len(x["text"]) + 1 for x in cur)
    end_punct = w["text"][-1] in ",.?!"
    gap = nxt is not None and nxt["start"] - w["end"] > 0.35
    conn = nxt is not None and clean(nxt["text"]) in {"before", "and", "tapi", "kalau", "sebab", "bila", "after", "maksudnya", "most"}
    if nxt is None or end_punct or gap or conn or len(cur) >= 3 or text_len + len(nxt["text"]) > 20:
        chunks.append(cur)
        cur = []

res = []
for c in chunks:
    ws = [dict(text=re.sub(r"[,.]$", "", w["text"]), start=round(w["start"], 2), end=round(w["end"], 2), key=clean(w["text"]) in KEY) for w in c]
    res.append(dict(start=ws[0]["start"], end=ws[-1]["end"], words=ws))
# keep each chunk on screen until the next one starts (max +0.6s) so captions don't flicker
for a, b in zip(res, res[1:]):
    a["end"] = round(min(b["start"], a["end"] + 0.6), 2)
res[-1]["end"] = round(res[-1]["end"] + 0.4, 2)
json.dump(res, open("src/captions.json", "w"), ensure_ascii=False, indent=1)
print(len(res), "chunks")
for c in res:
    print(f'{c["start"]:6.2f} {" ".join(w["text"] for w in c["words"])}')
