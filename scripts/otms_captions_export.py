"""Export the word-level transcript + SRT for OtmsBeige from src/otms2/data.ts (single source of truth)."""
import re, json
src = open('src/otms2/data.ts').read()
block = src[src.index('export const PHRASES'):src.index('/* the four pairings')]
phrases = []
parts = re.split(r"(?=id: ')", block)[1:]
for part in parts:
    m = re.match(r"id: '(\w+)', start: ([\d.]+), end: ([\d.]+), place: '(\w+)'", part)
    words = [(w, float(s), float(e)) for w, s, e in re.findall(r"\{t: '([^']+)', s: ([\d.]+), e: ([\d.]+)", part)]
    phrases.append(dict(id=m.group(1), start=float(m.group(2)), end=float(m.group(3)), words=words))
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
srt = []
for i, p in enumerate(phrases, 1):
    first = p['words'][0][1]
    text = ' '.join(w for w, _, _ in p['words'])
    srt.append(f"{i}\n{ts(first)} --> {ts(p['end'])}\n{text}\n")
open('deliverables/otms/otms_captions.srt', 'w').write('\n'.join(srt))
md = ['# OTMS video — transcript (word-level)', '',
      'Language: Malay with English product words. Times in seconds from the start of the 24 s video.',
      'Word start times were checked against the audio waveform (phrase-first words snapped to the real voice onset).', '',
      '| Phrase | Time | Spoken text | Words (start s) |', '|---|---|---|---|']
for p in phrases:
    md.append(f"| {p['id']} | {p['words'][0][1]:.2f}–{p['words'][-1][2]:.2f} | {' '.join(w for w,_,_ in p['words'])} | " + ', '.join(f"{w} ({s:.2f})" for w, s, _ in p['words']) + ' |')
md += ['', '## Notes on spelling (flagged, not invented)',
       '- **ni / ini** (0.42 s): the word is very short (≈0.15 s); Whisper heard "ini". Written "ni" as in the creator\'s draft.',
       '- **toink toink** (5.98 s): Whisper heard "toing-toing"; written as in the creator\'s draft.',
       '- **Product names** (Jelita KL, Cyanara Essence, Blumé Bright Toner Mist, Bulaney Essence): Whisper mis-spelled them ("Gelita", "Shinara", "Plume", "Beleni"); spelled as in the creator\'s draft.',
       '- **soothe redness** (20.44 s): low Whisper confidence ("sus ratness"); matches the creator\'s draft.',
       '- **mencuba / mencoba** (22.56 s): Whisper heard "mencoba"; written "mencuba" as in the creator\'s draft.',
       '- "+" is spoken as "plus".']
open('deliverables/otms/otms_transcript.md', 'w').write('\n'.join(md) + '\n')
print(open('deliverables/otms/otms_captions.srt').read())
