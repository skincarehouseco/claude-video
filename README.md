# Remotion edits

## PestanaEdit (current) — `npm run render` -> `out/pestana_final.mp4`
9:16 whimsy TikTok edit of the Pestana Tinted Serum / Lash Tonic / Jelly Lash Oil video. The footage is cut and
arranged to the voice-over, following the reference edit's shot order and text style.

- `scripts/pestana/cut_voice.py` – tightens long pauses in the voice-over (equal-power crossfades, no cut-off words) -> `public/pestana/voice.wav` + `src/pestana/voicemap.json`
- `scripts/pestana/build_words.py` – Whisper large-v3 word timings (`scripts/pestana/transcript_raw.json`) re-timed to the cut voice -> `src/pestana/words.json`
- `src/pestana/timeline.ts` – cut list (which footage plays under each VO line) and transitions
- `src/pestana/Captions.tsx` – word-synced captions, soft butter yellow `#FFF0A6`, regular weights only: Poppins (clean sans), Nothing You Could Do (handwritten), Playfair Display (serif), Fredoka (rounded)
- `src/pestana/Doodles.tsx` – stickers / doodles (sparkles, hearts, bow, coins, lash-growth, tags, confetti, arrow)
- `src/pestana/PestanaEdit.tsx` – camera (slow zooms + emphasis punch-ins), transitions, graphics schedule, audio mix (voice, ducked music bed, soft SFX)

All text and graphics stay inside the TikTok safe zone (top 160px, bottom 430px, left 80px, right 170px clear).

### Rebuild
```bash
npm install
ffmpeg -i source.mov -an -c:v libx264 -crf 17 -g 15 -pix_fmt yuv420p -r 30 public/pestana/footage.mp4
ffmpeg -i source.mov -vn -af "highpass=f=75,afftdn=nf=-40,acompressor=threshold=-22dB:ratio=2.2:attack=10:release=150:makeup=1,loudnorm=I=-15:TP=-1.5:LRA=8" -ar 48000 -ac 2 voice_full.wav
python3 scripts/pestana/cut_voice.py voice_full.wav public/pestana/voice.wav src/pestana/voicemap.json
python3 scripts/pestana/build_words.py
python3 scripts/make_audio.py tmp && mv tmp/music.wav public/pestana/music.wav
npm run render
```

## WhimsyEdit (earlier skincare-ingredients video) — `npm run render:old`
See git history; sources in `src/*.tsx`, `scripts/*.py`.
