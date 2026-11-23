# Lash serum whimsy edit (Remotion)

9:16 TikTok edit of the "apa akan jadi kalau I stop pakai eyelash serum?" voice-over video,
cut to the voice-over and following the structure and text styles of the reference edit.

- `src/LashEdit.tsx` – composition: footage, graphics, captions, audio mix (voice, ducked music, SFX), soft flash transitions
- `src/Footage.tsx` – shot list (footage re-cut to the voice-over), smooth per-shot zoom drift + emphasis push-ins, 7-frame dissolves between shots
- `src/Graphics.tsx` – reference-style kinetic titles (comment-reply sticker, "WHAT IF I STOP", "stop pakai", neon "gugur", "TAPI JAP!", highlight boxes, arched script, "consistency is important!", ...)
- `src/PhaseCard.tsx` – animated anagen / telogen follicle cards
- `src/Captions.tsx` – word-synced captions (Quicksand medium, soft butter yellow `#FFF1A8`, 54px)
- `src/captions.json` – built by `scripts/build_captions.py` from Whisper large-v3 word timings (`scripts/transcript_raw.json`) remapped onto the edited voice, with manual fixes
- `scripts/edit_voice.py` – cleans the voice-over and shortens long pauses (cuts only inside silences, with fades) -> `public/audio/voice.wav`, `scripts/voice_map.json`
- `scripts/make_audio.py` – synthesizes the original music bed + SFX (no third-party samples)
- `public/fonts` – Quicksand, Fredoka, Gochi Hand, Sacramento, Caveat, Nothing You Could Do, Instrument Serif, Barlow Condensed (SIL OFL)

All text and graphics stay inside the TikTok safe zone (top 160px, bottom 430px, left 80px, right 170px clear).

## Rebuild
```bash
npm install
ffmpeg -i source.mov -an -c:v libx264 -crf 15 -pix_fmt yuv420p -r 30 -g 15 public/main.mp4
python3 scripts/edit_voice.py source.mov
python3 scripts/make_audio.py public/audio
python3 scripts/build_captions.py
npm run render   # -> out/final.mp4
```
