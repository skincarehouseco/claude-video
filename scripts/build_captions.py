"""Turn the raw Whisper word timings into corrected, chunked captions for Remotion."""
import json, re
d = json.load(open("scripts/transcript_raw.json"))
words = [dict(w=x["w"].strip(), s=x["s"], e=x["e"]) for seg in d["segments"] for x in seg["words"]]
out = []
i = 0
while i < len(words):
    w = words[i]
    # Merge "B" + "-cinnamide" -> "niacinamide" (mis-heard)
    if w["w"] == "B" and i + 1 < len(words) and "cinnamide" in words[i+1]["w"]:
        out.append(dict(w="niacinamide.", s=w["s"], e=words[i+1]["e"])); i += 2; continue
    out.append(w); i += 1
# Drop the duplicated (hallucinated) "Hyaluronic acid." and fix its timing from the re-check pass
fixed = []
seen_ha = False
for w in out:
    if w["w"].startswith("Hyaluronic"):
        if seen_ha: continue
        seen_ha = True; w = dict(w="Hyaluronic", s=55.88, e=56.40)
    elif w["w"] == "acid.":
        if any(f["w"] == "acid." for f in fixed): continue
        w = dict(w="acid.", s=56.40, e=56.74)
    fixed.append(w)
words = fixed
fix = {"Hi": (0.30, 0.90), "night.": None}
for w in words:
    if w["w"] == "Hi": w["s"] = 0.30
    if w["w"] == "night.": w["w"] = "nights."
    if w["w"] == "brighten": w["w"] = "brightens"
    if w["w"] == "okay." and w["s"] > 42 and w["s"] < 44: w["w"] = "okay!"
    # Whisper sometimes gives long first-word onsets; clamp each word to <= 0.6 s
    if w["e"] - w["s"] > 0.6: w["s"] = round(w["e"] - 0.6, 2)
# Chunking: break at punctuation, long gaps, or ~3-4 words / 20 chars
chunks, cur = [], []
def flush():
    if cur: chunks.append(dict(start=cur[0]["s"], end=cur[-1]["e"], words=[dict(text=c["w"], start=c["s"], end=c["e"]) for c in cur]))
for k, w in enumerate(words):
    if cur:
        gap = w["s"] - cur[-1]["e"]
        txt = " ".join(c["w"] for c in cur + [w])
        ends_sentence = re.search(r"[.!?]$", w["w"]) and len(txt) <= 26 and len(cur) < 5
        if w["w"] == "C" and gap < 0.45:
            pass  # never split "vitamin | C"
        elif ends_sentence and gap < 0.45 and not re.search(r"[.,!?]$", cur[-1]["w"]):
            pass  # keep a short sentence ending with its phrase
        elif gap > 0.45 or len(txt) > 22 or len(cur) >= 4 or re.search(r"[.,!?]$", cur[-1]["w"]):
            flush(); cur = []

    cur.append(w)
flush()
# Hold each chunk until the next starts (max +0.5s) so captions don't flicker
for a, b in zip(chunks, chunks[1:]):
    a["end"] = round(min(b["start"], a["end"] + 0.5), 2)
chunks[-1]["end"] = round(chunks[-1]["end"] + 0.5, 2)
json.dump(chunks, open("src/captions.json", "w"), indent=1)
for c in chunks: print(f'{c["start"]:6.2f}-{c["end"]:6.2f}  ' + " ".join(w["text"] for w in c["words"]))
