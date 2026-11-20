"""Whisper large-v3 word timings (scripts/skin_transcript_raw.json) -> corrected, chunked captions."""
import json, re
segs = json.load(open("scripts/skin_transcript_raw.json"))
words = [dict(w=x["w"].strip(), s=round(x["s"], 2), e=round(x["e"], 2)) for s in segs for x in s["words"]]

# Spelling fixes (Malay; Whisper mis-heard a few words)
FIX = {"pake": "pakai", "farm": "faham", "berjawat": "berjerawat", "Actually": "actually"}
out = []
for w in words:
    if w["w"] == "-dua" and out:  # "Dua" + "-dua" -> "Dua-dua"
        out[-1]["w"] += "-dua"; out[-1]["e"] = w["e"]; continue
    core = re.sub(r"[.,?!]", "", w["w"]); punct = w["w"][len(core):]
    w["w"] = FIX.get(core, core) + punct
    out.append(w)
words = out
words[0]["s"] = 0.32  # first onset is padded by Whisper
for w in words:  # clamp long onsets
    if w["e"] - w["s"] > 0.6: w["s"] = round(w["e"] - 0.6, 2)

# Phrase breaks chosen by meaning (index of the first word of each new chunk is detected by text)
BREAK_BEFORE = {
    "yang ni pula", "Dua-dua", "but why", "the results", "actually", "yang korang", "Yang pertama", "kulit berjerawat.",
    "Kalau kulit korang mudah", "berjerawat,", "jangan exfoliate", "setiap", "Cukup",
    "Yang kedua", "kulit kering.", "Kalau kulit korang jenis", "yang kering,", "jangan terlalu", "cuci", "Dua kali sehari",
    "Yang ketiga", "kulit berminyak.", "Kalau kulit jenis", "boleh try", "gel", "sebab", "lebih",
    "Yang keempat", "kulit kusam.", "Kalau kulit nampak", "jangan skip", "Make sure", "dalam",
    "Kalau nak", "jangan lupa",
}
chunks, cur = [], []
def flush():
    if cur:
        chunks.append(dict(start=cur[0]["s"], end=cur[-1]["e"],
                           words=[dict(text=re.sub(r"[.,]$", "", c["w"]), start=c["s"], end=c["e"]) for c in cur]))
for i, w in enumerate(words):
    ahead = " ".join(x["w"] for x in words[i:i + 4])
    if cur and any(ahead.startswith(b) for b in BREAK_BEFORE):
        flush(); cur = []
    cur.append(w)
flush()
for a, b in zip(chunks, chunks[1:]):
    a["end"] = round(min(b["start"], a["end"] + 0.45), 2)
chunks[-1]["end"] = round(chunks[-1]["end"] + 0.6, 2)
json.dump(chunks, open("src/skin/captions.json", "w"), indent=1)
for c in chunks: print(f'{c["start"]:6.2f}-{c["end"]:6.2f}  ' + " ".join(w["text"] for w in c["words"]))
