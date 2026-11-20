# OTMS — beige whimsy edit: summary & QA

**Final video:** `out/otms-beige-final.mp4` (render with `npm run render:otms-beige`, then the loudness pass in the README).
**Remotion composition:** `OtmsBeige` → `src/otms2/` (`data.ts` timings/palette/safe zone, `Camera.tsx` camera + background treatment,
`Captions.tsx` word-synced captions + keyword highlights, `Doodles.tsx` hand-drawn graphics, `OtmsBeige.tsx` assembly + sound).

## Style read from the WHIMSY references
- Small, clean sans captions; elegant italic serif accents (WHIMSY 4 "After Marriage"), sparse sparkles/stars, light hand-drawn marks.
- Soft light flashes on cuts (WHIMSY 1), short pop/sparkle accents, uncluttered frames, pastel accents over natural footage.

## Background treatment (what was actually done)
- **Shelf scenes (3.5–22 s): enhanced, not replaced.** The wall was grey-lavender (≈RGB 172,170,177); the grade lifts it to a bright cream
  (≈223,222,212) with warm-neutral highlights, gentle denoise and light sharpening. A soft window-light gradient, very faint drifting
  leaf shadows (multiply, ~10%) and out-of-focus sage leaves in two corners give the airy studio feel. Products are untouched.
- **Hand shots (0–3.5 s, 22–24 s):** the background is stacked stock boxes. AI matting was tested (rembg isnet-general-use, u2net):
  masks dropped the hand on some frames, which would flicker/halo, and BiRefNet ran out of memory on this machine. To keep it realistic,
  a mask-free treatment is used instead: a lens-style focus falloff (edges blurred) plus a warm beige wash at the frame edges.
- No full AI background replacement was used, so no generated environment, no matting edges.

## Grade
`hqdn3d=1.5:1.5:4:4, curves(all: 0.25→0.37, 0.5→0.70, 0.8→0.93), colorbalance (warm-neutral, −blue), saturation 1.04, unsharp 0.6`.
No clipping on the wall (measured 0% pixels ≥250); skin moved from magenta toward neutral.

## Typography & captions
- Captions: **Poppins SemiBold 58 px**, deep cocoa `#4E3B30` on a frosted cream pill; max two lines; each word appears on the frame it
  is spoken (never before), phrases leave ~0.2–0.4 s after speech ends.
- Keyword highlights: brand "OTMS" blush marker, product names butter-yellow marker swash, benefits sage hand-drawn squiggle underline.
- Accents: Playfair Display Italic ("Oatmeal Turmeric Mask & Scrub" note, "MIX 01 / 04" badges).
- Placement: lower-middle on the hand shots; on the shelf the caption sits on the clear wall above the products so it never covers them.
  All captions/badges inside the working safe zone (top 12 %, bottom 22 %, left 8 %, right 17 %).

## Graphics (each tied to the words)
- Hook: italic note naming what OTMS stands for (read off the jar label) + drawn arrow to the jar, sparkles.
- Each pairing: "MIX 0n / 04" badge; pen-drawn ring drawn around the partner product as it appears; line-art benefit icon with an arrow
  to the product — bouncing jelly (toink toink skin), face with plaster (kulit berjerawat), smiling sun (kulit kusam), leaf + droplet
  (soothe redness); a soft bloom + sparkles disguise the stop-motion jumps; a few tiny flowers drift on the wall.
- Ending: drawn hearts and sparkles around "selamat mencuba!".

## Camera
Hook push-in 1.00→1.06; on the shelf a slow ease onto each pair (+5 %) and back out when the product is removed; ending zoom-out
1.08→1.00; a soft spring settle on the two real cuts, which also get a cream light-leak dip. All within ~1.00–1.08.

## Sound
Voice: high-pass 80 Hz, FFT denoise, gentle compression, loudness-normalised; it is the only continuous audio (no music).
SFX (pops, chimes, sparkles, airy whooshes) are peak-normalised one-shots played at 0.035–0.07 (≈−23 to −29 dB) so they sit well under
the voice; timed to word pops, product appearances, ring drawing, icons and transitions. Final mix −14 LUFS, true peak −1.5 dBFS.

## QA performed on the exported MP4
- 720 frames, 1080×1920, 30 fps, H.264 + AAC 48 kHz, duration 24.000 s; no black frames (ffmpeg blackdetect).
- Reviewed frames every 0.5 s across the whole export: captions match the speech, appear with the words, stay in the safe zone and
  never cover the products; rings line up with each product through the zoom; no jitter or masking artefacts (no masks used).
- Spelling choices that differ from what Whisper heard are listed in `otms_transcript.md` (ni/ini, mencuba/mencoba, product names).
