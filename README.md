# Skincare edits (Remotion)

## SkinTypesEdit – "4 perkara yang korang kena tahu" (default `npm run render` -> `out/skin-types.mp4`)
9:16 TikTok edit (42.9 s) following the reference layout: hook cards, "why so different?", "4 perkara" title, then for each point a typed
`#. Kulit ...` header, coral tag, and ❌ / ✅ illustrated cards split by a dashed divider, ending with a follow CTA.

- `src/skin/SkinEdit.tsx` – camera (original footage, smooth zooms), audio mix (cleaned voice, music ducked ~-24 dB under speech, light SFX), fades
- `src/skin/camera.ts` – per-shot drift, emphasis push-ins, "settle" zoom + light flash on each new point
- `src/skin/Captions.tsx` – word-synced captions, DM Sans Regular 54px (non-bold), soft butter yellow `#FFF1A8`
- `src/skin/Overlays.tsx` / `src/skin/Art.tsx` – titles (DM Serif Display + Playfair Italic), cards, SVG illustrations, emoji stickers, sparkle transitions
- `src/skin/captions.json` – built by `scripts/skin_captions.py` from Whisper large-v3 word timings (`scripts/skin_transcript_raw.json`), with spelling fixes (pakai, faham, berjerawat)
- Intro uses the real before/after photo `public/hook/before_after.jpg` (left half = pakai skincare, right half = faham skincare), placed in the empty side of each zoomed shot with a slow zoom
- All text/graphics stay inside the TikTok safe zone (top 160px, bottom 430px, left 80px, right 170px clear). Emoji use the system colour-emoji font.

Rebuild:
```bash
npm install
ffmpeg -i source.mov -map 0:v -c:v libx264 -crf 15 -pix_fmt yuv420p -r 30 -an public/skin/main.mp4
ffmpeg -i source.mov -vn -af "highpass=f=80,afftdn=nf=-30,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,loudnorm=I=-15:TP=-1.5:LRA=9" -ar 48000 -ac 2 public/skin/voice.wav
python3 scripts/make_audio.py public/audio
python3 scripts/skin_captions.py
npm run render
```

## OtmsBeige – bright airy beige whimsy version of the OTMS video (24 s, `npm run render:otms-beige` -> `out/otms-beige.mp4`)
- `src/otms2/` – `data.ts` (word-level transcript, palette, safe zone, scene times), `Camera.tsx` (camera + background treatment,
  studio light, light leaks), `Captions.tsx` (word-synced Poppins captions + keyword highlights), `Doodles.tsx` (hand-drawn rings,
  arrows, icons, sparkles, flowers, badges), `OtmsBeige.tsx` (assembly + voice/SFX mix)
- Footage grade -> `public/otms/beige.mp4`: `hqdn3d=1.5:1.5:4:4,curves=all='0/0 0.25/0.37 0.5/0.70 0.8/0.93 1/1',colorbalance=rm=0.035:gm=0.012:bm=-0.06:rh=0.04:gh=0.02:bh=-0.035:rs=0.0:gs=0.01:bs=-0.02,eq=saturation=1.04,unsharp=5:5:0.6:5:5:0.0`
- `scripts/otms_captions_export.py` -> `deliverables/otms/otms_captions.srt` + `otms_transcript.md`; notes in `deliverables/otms/EDIT_SUMMARY.md`
- Final loudness: `ffmpeg -i out/otms-beige.mp4 -t 24 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/otms-beige-final.mp4`

## OtmsEdit – "OTMS ni boleh mix dengan apa?" (24 s, `npm run render:otms` -> `out/otms.mp4`)
Yello Oatmeal Turmeric Mask & Scrub pairings. Wording/spelling follows the creator's draft (Jelita KL, Cyanara Essence,
Blumé Bright Toner Mist, Bulaney Essence); timing from Whisper large-v3 word timings of the voice.
- `src/otms/OtmsEdit.tsx` – speech-synced text (each word appears as spoken): bubbly hook question, "OTMS + product" cards
  that grow word by word, butter-yellow benefit pills with cute icons, sparkle burst / cloud poof on the stop-motion product
  changes, "+" bubble, zoom onto each pair, jelly cuts, heart wipe into "selamat mencuba!"; voice + light cute SFX
- Footage cleaned for clarity: `hqdn3d, eq=brightness=0.045:contrast=1.09:saturation=1.16:gamma=1.03, unsharp=5:5:0.95` -> `public/otms/main.mp4`;
  voice: highpass + afftdn + compressor + loudnorm -> `public/otms/voice.wav`
- Final loudness: `ffmpeg -i out/otms.mp4 -t 24 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/otms-final.mp4`

## FoamEdit – booih Fun Foam Cleanser "mainan ke sabun?!" (24 s, `npm run render:foam` -> `out/foam.mp4`)
No speech in the source clips, so captions are short playful lines timed to the action (Malay–English mix).
Face-first: opens on the girl holding the cans (hook), her spray/squish shots carry the edit, foam-ball shots are short cutaways, and it ends back on the cans (answer: sabun).
- The camera watermark (x 60-490, y 200-250) in three girl shots is cropped out by zooming those shots from the bottom edge (origin 50% 100%, scale >= 1.18).
- `src/foam/FoamEdit.tsx` – shot list (speed, zoom per shot, 3-frame dissolves), bubbly onomatopoeia stickers, toss arcs, floating bubbles, bubble wipes, end card, captions, audio mix
- Sound effects only (no music, no original audio): `scripts/make_cute_sfx.py` – whimsy SFX pack (bubble pops, twinkle, slide whistle, squeak, poof, psst, tada…)
- End card uses the real booih logo `public/brand/booih_logo.png` (pink background keyed out) + tagline "Booih dulu, baru mandi!"
- No original audio is used; every cut is moving video (no freeze frames). Slow-mo shots `public/foam/{cans_slow6,face_slow,squish_slow}.mp4` are made with ffmpeg `minterpolate` (mci) from the girl clip
- Media: cut segments from the foam clip into `public/foam/b1..b7.mp4` (+14 dB foam sounds) and the girl clip into `public/foam/girl.mp4` (see shot list for source times); shots avoid the camera watermark
- Final loudness: `ffmpeg -i out/foam.mp4 -c:v copy -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/foam-final.mp4`

## WhimsyEdit – earlier "don't mix these ingredients" edit (`npm run render:whimsy`)

9:16 TikTok edit of the "don't mix these skincare ingredients" talking-head video.

- `src/WhimsyEdit.tsx` – camera (smooth zoom keyframes, colour grade, vignette), audio mix (voice, ducked music, SFX)
- `src/Captions.tsx` – word-synced captions (Patrick Hand regular, soft butter yellow `#FFF0A6`)
- `src/Overlays.tsx` – whimsical motion graphics: hook title, combo cards, notes, AM/PM card, outro, sparkle transitions
- `src/captions.json` – generated by `scripts/build_captions.py` from Whisper large-v3 word timings (`scripts/transcript_raw.json`) with manual fixes
- `scripts/make_audio.py` – synthesizes the original music bed + SFX (no third-party samples)
- `src/camera.ts` – smooth per-shot zoom (continuous across jump cuts) + emphasis push-ins; jump cuts get a 6-frame dissolve
- `src/DayNight.tsx` – morning / night scene: animated 2D cartoon backgrounds with the speaker cut out per frame
- `scripts/grade.py` – per-shot exposure matching + colour grade -> `public/main_graded.mp4`
- `scripts/make_subject.py` – builds RGBA cut-outs (`public/subject/`) from BiRefNet-portrait masks
- `public/fonts` – Patrick Hand, Pixelify Sans, Playfair Display Italic, Fredoka (SIL OFL)

All text and graphics stay inside the TikTok safe zone (top 160px, bottom 430px, left 80px, right 170px clear).

## Rebuild
```bash
npm install
ffmpeg -i source.mov -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 -c:a aac public/main.mp4
ffmpeg -i source.mov -vn -af "highpass=f=80,afftdn=nf=-30,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,loudnorm=I=-15:TP=-1.5:LRA=9" -ar 48000 -ac 2 public/audio/voice.wav
python3 scripts/grade.py public/main.mp4 public/main_graded.mp4
# cut-outs for frames 640-820 (morning/night): extract frames, run BiRefNet-portrait (rembg model), then
python3 scripts/make_subject.py <frames_dir> <masks_dir> public/subject
python3 scripts/make_audio.py public/audio
python3 scripts/build_captions.py
npm run render:whimsy   # -> out/final.mp4
```
