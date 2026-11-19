# yello OTMS — whimsy TikTok edits (Remotion)

Three 9:16 TikTok edits cut from the raw DJI footage of the **yello Oatmeal Turmeric Mask & Scrub**.

| Composition | Idea | Length |
|---|---|---|
| `Yello-1-CleanserDulu` | "Cleanser dulu ke mask dulu?" + "campur air je boleh?" with product B-roll cutaways | ~57s |
| `Yello-2-PregnantMom` | "Pregnant mom boleh pakai ke?" — ingredients, kitchen-safe, refer-your-doctor note | ~47s |
| `Yello-3-KunyitSafe` | "Kunyit kat muka, selamat ke sis?" — curry joke, organik ingredients, 10–15 min (or minion!), spot-treatment tip | ~59s |

## Look & feel
- **Captions**: word-synced from a Whisper large-v3 transcript (Malay/English), Quicksand 500 (clean, not bold), soft butter yellow `#FBEFA0`, 50px, short 2–4 word lines.
- **Display type**: VT323 pixel font + Sacramento script accents (matches the whimsical references), flat outlines — **no gradients anywhere**.
- **Grade**: gentle contrast/saturation/brightness polish only (`src/lib/theme.ts → GRADE`); no tint, LUT or gradient overlay.
- **Motion**: spring pop-ins, floating stickers, eased punch-in/zoom-out keyframes on emphasis, zoom-dissolve transitions, punch-in jump cuts.
- **Safe zone**: all captions/graphics inside x 80–930, y 170–1440 (clear of TikTok's top bar, right action rail and bottom caption area).
- **Audio**: voice loudness-normalised to −16 LUFS; original synthesized music beds (`scripts/synth_audio.py`, royalty-free) ducked under speech; soft SFX (pop, sparkle, ding, boing, whoosh, click, magic).

## Layout
- `src/edits/*.ts` — the edit decision lists (segments, zoom keys, B-roll cutaways, graphics, SFX). Graphics are timed against source timestamps via `atSrc()`.
- `src/data/transcript.json` — word-level transcript of every clip.
- `src/components/` — captions, overlays, stickers.

## Rebuild
1. Put 1080x1920/30fps proxies in `public/clips/<clipNo>.mp4` (from the DJI originals, e.g.
   `ffmpeg -i DJI_..._0571.mov -vf scale=1080:1920,fps=30 -af loudnorm=I=-16:TP=-1.5 -c:v libx264 -crf 19 public/clips/0571.mp4`).
2. `npm i`, then `npm run studio` to preview or `npm run render:all` to render to `out/`.
