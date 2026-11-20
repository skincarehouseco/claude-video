# Skin Talks by Skincarehouse — reusable podcast production system

For a new episode you only provide a **topic + reference material**; characters, voices, studio, captions, graphics and
the Remotion edit stay the same.

```
series/skintalks/
  characters/   hosts_reference.png (approved identity), face/close-up crops, CHARACTERS.md (identity lock + tool prompt)
  voices.json   permanent voice profiles (model, speaker, seed, temperature) + mix rules
  episodes/epNN/script.json   dialogue lines, fact-check notes, infographic cues
  tools/generate_voices.py    TTS (Malaysian-TTS-0.6B) → best-of-N takes checked with Whisper → lines/*.wav + manifest
  tools/build_episode.py      timeline, word-synced captions, voice energy, shot plan, infographic cues → src/skintalks/episodes/epNN.json
src/skintalks/  theme.ts (master style), Shots.tsx (virtual multicam / lip-sync clip slot), Infographics.tsx
                (skin cross-section, timeline, pore steps, tip card), Episode.tsx (captions, speaker tag, doodles, titles, sound)
public/skintalks/hosts.png, public/skintalks/epNN/lines/*.wav, optional public/skintalks/epNN/clips/<line_id>.mp4
```

## Episode workflow
1. **Research** the reference: transcribe it, extract the claims, check them (AAD / peer-reviewed sources); hedge anything
   that is a rule of thumb. Nadia is an educator, not a doctor.
2. **Script** `episodes/epNN/script.json`: 8–12 short lines, Maya asks / Nadia explains, casual Malaysian BM–English,
   35–45 s total. Write numbers as words in `text` (TTS) and as digits in `display` (captions).
3. **Voices:** `python tools/generate_voices.py series/skintalks/episodes/epNN public/skintalks/epNN/lines 3`
   (needs torch, transformers, DistilCodec, faster-whisper; set `DISTILCODEC_DIR`). Check the printed transcript scores.
4. **(Optional) lip-sync clips:** for each line, generate a talking clip of the speaking host from the approved image and
   that line's wav with an identity-preserving tool, save as `public/skintalks/epNN/clips/<line_id>.mp4` (9:16, 30 fps).
   Lines without a clip use the still-image virtual camera automatically.
5. **Build:** `python3 series/skintalks/tools/build_episode.py epNN`, register `SkinTalksEpNN` in `src/Root.tsx`.
6. **Render:** `npx remotion render src/index.ts SkinTalksEpNN out/skintalks-epNN.mp4 --codec h264 --crf 18`, then
   loudness `ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out.mp4`.
7. **QA:** frame review, caption sync, safe zones, loudness, duration.

## Master style
- Palette: cream `#FFF9F1`, warm white, beige `#EADBC8`, cocoa `#4E3B30`, sage `#A8BF9C`, butter `#F3DE9C`, blush `#E9B7B1`.
- Captions: Fredoka 600 (rounded), cocoa on a cream pill, ≤2 lines, words appear only when spoken, keywords get a
  butter (Nadia) / blush (Maya) marker; lower-middle (top 1280 px), inside the TikTok working safe zone.
- Speaker tag: name + role + live voice bars (driven by the line's audio energy).
- Infographics: cream editorial cards, cocoa line art; full-screen circle-wipe cutaways with a host PIP, or a PIP tip card;
  aim for ~15–25 % of runtime.
- Sound: voices first (-14 LUFS final), soft pops/whooshes/sparkles 20+ dB under the voices, no music bed.
