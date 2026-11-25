"""Whisper large-v3 word timings -> chunked, corrected captions for the Blumé edit (src/blume/captions.json).
Dialogue is kept exactly as spoken (Malaysian Malay-English code-switching); only spelling of the product
name is aligned with the packaging ("BLUMÉ BRIGHT TONER MIST")."""
import json, re
d = json.load(open("scripts/blume/transcript_raw.json"))
words = [dict(w=x["w"].strip(), s=x["s"], e=x["e"]) for seg in d for x in seg["words"]]
out = []
i = 0
while i < len(words):
    w = words[i]
    if w["w"] == "pat" and i + 1 < len(words) and words[i+1]["w"].startswith("-pat"):
        out.append(dict(w="pat-pat", s=w["s"], e=words[i+1]["e"])); i += 2; continue
    if w["w"] == "Bloom" and i + 3 < len(words):
        # keep the product name together as one caption unit
        last = words[i+3]
        out.append(dict(w="Blumé Bright Toner Mist" + re.sub(r"[A-Za-z]", "", last["w"]), s=w["s"], e=last["e"])); i += 4; continue
    if w["w"] == "Hello": w["s"] = max(w["s"], 2.0)
    out.append(w); i += 1
words = out
for w in words:
    if " " not in w["w"] and w["e"] - w["s"] > 0.6: w["s"] = round(w["e"] - 0.6, 2)

# keywords that get the accent colour
HL = {"blumé bright toner mist", "blumé", "bright", "toner", "mist", "gentle", "cleanser", "kering", "dua", "cara", "direct", "tangan",
      "pat-pat", "lock", "moisturizer", "50", "terawal", "serum", "free", "grab", "yours", "now", "rumorik", "first"}
# never split these pairs
GLUE = {("Blumé", "Bright"), ("Bright", "Toner"), ("Toner", "Mist"), ("toner", "mist"), ("gentle", "cleanser"),
        ("dua", "cara."), ("Rumorik", "Serum"), ("Serum", "for"), ("for", "free.")}
chunks, cur = [], []
def flush():
    if cur:
        chunks.append(dict(start=cur[0]["s"], end=cur[-1]["e"], words=[
            dict(text=c["w"], start=c["s"], end=c["e"], hl=re.sub(r"[^\w\-é ]", "", c["w"].lower()) in HL) for c in cur]))
for w in words:
    if cur:
        prev = cur[-1]
        gap = w["s"] - prev["e"]
        txt = " ".join(c["w"] for c in cur + [w])
        glued = (re.sub(r"[,.!?]", "", prev["w"]), re.sub(r"[,!?]", "", w["w"])) in GLUE or (prev["w"], w["w"]) in GLUE
        if glued and len(txt) <= 30 and gap < 0.4:
            pass
        elif gap > 0.4 or len(txt) > 20 and not (len(cur) == 1 and len(w["w"]) > 18) or len(cur) >= 4 or re.search(r"[.,!?]$", prev["w"]):
            flush(); cur = []
    cur.append(w)
flush()
for a, b in zip(chunks, chunks[1:]):
    a["end"] = round(min(b["start"], a["end"] + 0.4), 2)
chunks[-1]["end"] = round(chunks[-1]["end"] + 0.6, 2)
json.dump(chunks, open("src/blume/captions.json", "w"), indent=1, ensure_ascii=False)
for c in chunks:
    print(f'{c["start"]:6.2f}-{c["end"]:6.2f}  ' + " ".join(("*" + w["text"] + "*") if w["hl"] else w["text"] for w in c["words"]))
