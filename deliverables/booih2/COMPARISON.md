# booih foam — Version A vs Version B

**Chosen: Version A** (original background). Final A: original clip audio removed (soft SFX only), HD grade
(lighter denoise + contrast-adaptive sharpening `cas=0.6`), rendered at CRF 14 / JPEG 95 (~37 Mbps).

Both videos: 1080×1920, 30 fps, H.264 + AAC, full original length (36.17 s), the same Remotion timeline
(`src/booih2/BooihWhimsy.tsx`, compositions `BooihWhimsyA` / `BooihWhimsyB`) — same text, graphics, zooms, sound.

| | **A — SKINCAREHOUSE_WHIMSICAL_ORIGINAL.mp4** | **B — SKINCAREHOUSE_WHIMSICAL_AESTHETIC.mp4** |
|---|---|---|
| Background | Original wall, enhanced | New generated affiliate room (white cabinet/drawers, cream walls, white shelves, plants, framed art, daylight) |
| Footage grade | Light denoise, pink cast neutralised to warm white, +brightness/contrast/saturation, light sharpening | Same grade on the hands/foam/can |
| Depth of field | None added (avoids artifacts) | Subtle lens-style bokeh on the new room only (stronger towards the edges) |
| Compositing | — | Hybrid matte (hue key for hands/can/sleeves + u2net for pale foam, wall-colour pixels removed), temporal smoothing, edge decontamination, matched grain, soft shadow, light wrap |
| Risk | None — real room | Fast motion-blurred frames can show slightly soft edges; background is a still image (camera in the clip is static) |
| Best for | Authentic, "real person" feel | Polished affiliate aesthetic |

## Important notes
- **No speech in the clip.** Whisper only produced unrelated hallucinations at −41 dB and VAD found nothing stable, so
  there is nothing to transcribe. The on-screen text is title/callout copy (re-using previously approved booih lines);
  `SKINCAREHOUSE_WHIMSICAL_onscreen_text.srt` lists that text with timings and is not a speech transcript.
- **No face/person in frame** — only hands, sleeves, foam and the booih can, all kept from the original footage
  (the can and its label are never regenerated; Version B only replaces the wall behind them).
- Background image generated locally with Realistic Vision 5.1 + LCM-LoRA (CreativeML OpenRAIL-M):
  `public/backgrounds/affiliate_room_gen.png` (seed 404). Script: `scripts/gen_background.py`, compositor:
  `scripts/bg_replace_hybrid.py` + `scripts/matte_huekey.py`.
- Sound: original clip audio removed at the creator's request; soft SFX only (−17 LUFS integrated, peak −4 dBFS).
