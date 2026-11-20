"""Whisper large-v3 word timings (scripts/v2_transcript_raw.json) -> corrected, chunked captions (src/v2/captions.json).

Corrections were checked with a second Whisper pass (English + Malay prompts) on the unclear spots.
"""
import json, re

d = json.load(open("scripts/v2_transcript_raw.json"))
words = [dict(w=x["w"].strip(), s=x["s"], e=x["e"]) for seg in d["segments"] for x in seg["words"]]

# merge Whisper's split "Kadang" + "-kadang" / "macam" + "-macam"
merged = []
for w in words:
    if w["w"].startswith("-") and merged:
        merged[-1]["w"] += w["w"]; merged[-1]["e"] = w["e"]
    else:
        merged.append(w)
words = merged

for w in words:
    if w["w"] == "beragam.": w["w"] = "meragam."          # both re-check passes hear "meragam"
    if w["w"] == "Sometimes": w["s"] = 0.76                # true onset (re-check pass)
    if w["w"] == "Especially": w["s"] = 26.45              # she starts right after the jump cut at 26.40
    # Whisper sometimes stretches a word over a pause; clamp to <= 0.6 s
    if w["e"] - w["s"] > 0.6: w["s"] = round(w["e"] - 0.6, 2)

# key words drawn in the italic serif accent (still butter yellow)
ACCENT = {"basic.", "less", "better.", "break,", "cleanse,", "hydrate,", "moisturize.", "Cleanse,", "hydrate",
          "simple.", "experiment", "sensitive", "breakout,", "excited"}

# Phrase breaks chosen by hand to follow her natural phrasing (word counts per caption)
PHRASES = [
    "Sometimes you just need", "to go back to the basic.",
    "Kalau kulit korang", "tengah sensitive or breakout,", "jangan terlalu try", "banyak sangat produk.",
    "Your skin needs skincare", "and bukan more skincare.",
    "Kadang-kadang kita ni kan", "terlalu excited", "nak tambah macam-macam produk", "sampai 5 ke 6 layer.",
    "But honestly,", "less is better.", "Give your skin a break,", "focus dulu pada", "basic skincare.",
    "Ingat tiga benda ni,", "cleanse,", "hydrate,", "moisturize.", "Cleanse,", "hydrate and moisturize.",
    "Especially bila", "kulit korang tengah meragam.", "Ingat, keep it simple.",
    "Jangan terlalu banyak sangat", "nak buat experiment", "dengan kulit korang.", "Okay?",
]
assert " ".join(PHRASES) == " ".join(w["w"] for w in words), "phrases must match the transcript word-for-word"
chunks, i = [], 0
for ph in PHRASES:
    n = len(ph.split()); cur = words[i:i + n]; i += n
    chunks.append(dict(start=cur[0]["s"], end=cur[-1]["e"],
                       words=[dict(text=c["w"], start=c["s"], end=c["e"], accent=c["w"] in ACCENT) for c in cur]))

# hold each chunk until the next starts (max +0.45 s) so captions never flicker
for a, b in zip(chunks, chunks[1:]):
    a["end"] = round(min(b["start"], a["end"] + 0.45), 2)
chunks[-1]["end"] = round(chunks[-1]["end"] + 0.4, 2)

json.dump(chunks, open("src/v2/captions.json", "w"), indent=1)
for c in chunks:
    print(f'{c["start"]:6.2f}-{c["end"]:6.2f}  ' + " ".join(("*" if w["accent"] else "") + w["text"] for w in c["words"]))
