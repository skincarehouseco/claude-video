# Yellow mask demo with the creator's own face — production pack

**Goal.** A 55 s, 9:16, 1080×1920, 30 fps phone-style skincare demo. The creator is on camera, applying a thick
golden-yellow mask. The shot order and timing follow the reference segment (00:26–01:21).

- **Identity:** the woman on screen is generated from the creator's own portrait. No face-swap onto the reference footage.
- **Script and voice:** the voice-over is original Malay, written for this video.

**What's ready in this repo:**
- an original script plus Malay voice-over for each shot (`voice/`);
- the shot timeline and an assembly project (`src/facedemo/FaceDemo.tsx`, composition `FaceDemo`);
- soft mask sounds;
- the prompts below.

**What's missing:** the clips themselves. They have to come from an image-to-video tool that takes a face reference.
Kling (the creator has it) works.

**Files kept local and never pushed:**
- `identity_portrait.png` and `identity_face_crop.png`: the creator's photo.
- `pose_refs/`: frames from the reference creator's video. Use them only to look at pose and framing. Do **not**
  upload them to the generator as start frames, because her face would blend into yours.

---

## 1. Identity guide (from the creator's portrait)

Lock these features. Write them into every image prompt, and check them on every clip.

| Feature | Description |
|---|---|
| Face shape | Oval, softly rounded cheeks; gently tapered jaw with a rounded (not pointed) chin |
| Eyes | Dark brown, almond-shaped, slightly upturned outer corners; moderate spacing (≈ one eye-width apart); visible double eyelid; long dark lashes |
| Brows | Medium-thick, softly arched, dark brown, natural (not sharp/laminated) |
| Nose | Straight, medium-width bridge, softly rounded tip, moderate nostril width |
| Lips | Full, defined cupid's bow, lower lip slightly fuller; natural rosy-mauve tone |
| Skin | Warm light-medium (golden-beige) Malay skin tone; natural texture with visible pores and a few tiny marks; no airbrushing |
| Small marks | One small dark mole on the centre of the forehead, just above the gap between the brows, and faint freckles on the cheeks: keep them |
| Do NOT | Slim the face, enlarge the eyes, narrow the nose, make it symmetrical, smooth the skin, lighten the skin tone |

**Head covering.** The reference style is a white towel wrapped turban-style. The creator normally wears hijab:
- The towel turban fully covers the hair.
- For a covered neck, add to the prompts: *"white towel wrapped as a turban over a fitted white inner cap; neck covered
  by the collared top"*. This is the creator's choice.

---

## 2. Global look (paste into every prompt)

> vertical 9:16 smartphone selfie video, handheld with slight natural micro-shake, the woman from the reference photo
> (same exact face, identity locked), white terry-cloth bath towel wrapped turban-style fully covering the hair, bright
> magenta-pink satin collared pyjama-style shirt, natural light makeup, warm indoor evening light, background of dark
> brown vertical wooden slats with a warm wall lamp glow on the left, shallow phone-camera depth of field, realistic skin
> pores and texture, true-to-life colours, no beauty filter

**Props:**
- An orange silicone mask-mixing bowl, held in the left hand.
- An orange flat silicone mask spatula, held in the right hand.
- Use plain props: **no brand logo or text** on the bowl.

**Mask:** a thick golden-yellow (mustard/turmeric-coloured) clay paste, dense, slightly grainy, glossy and wet-looking,
in a visible thick layer with spatula streaks.

**Negative prompt (use on every generation):**

> face change, different person, identity drift, face morphing, melting features, beauty filter, plastic or airbrushed
> skin, face slimming, enlarged eyes, nose reshaping, extra fingers, fused or missing fingers, deformed hands, floating
> spatula, spatula passing through skin, mask appearing or disappearing suddenly, flicker, inconsistent towel, changing
> clothes, text, subtitles, logo, watermark, cartoon, CGI look

---

## 3. Mask coverage stages

Make the start frames first, then animate them. Coverage only ever increases, until the clean reveal.

| Stage | Coverage | Used by |
|---|---|---|
| **S0** | Clean face | C01, C02 start |
| **S1** | Small patch on her right cheek (viewer's left) | C02 end |
| **S2** | Right cheek fully covered, jaw to cheekbone | C03 end, C04 start |
| **S3** | S2 + nose bridge and nose tip | C04 end, C05 start |
| **S4** | S3 + under the right eye and upper cheek (not the eyelid) | C05 end, C06 start |
| **S5** | Full mask: both cheeks, nose, forehead, chin; eyes, eyelids, lips and brows left clear | C06 end, C07, C08 |
| **S6** | Clean face just after rinsing: slightly damp, naturally dewy, same towel and top, skin exactly as in S0 (no retouching) | C10 |

**How to make the start frames.** Use Kling **Image** with *Face reference*, or ChatGPT image editing, with
`identity_portrait.png` attached.

1. Generate **F-S0** first: *"[global look] … holding the orange bowl at chest height and the spatula in the other
   hand, looking at the camera"*. Regenerate until the identity checklist (section 6) passes.
2. Create every other stage by **editing F-S0** (not from scratch), so the face stays identical. Example:
   *"Same photo, same woman, same towel, top and lighting. Add a thick, dense, slightly grainy, glossy golden-yellow clay
   mask on her right cheek only, with spatula streaks. Change nothing else."*
3. For a new camera angle, edit again: *"same image, head turned three-quarters to her left, camera at the same distance"*.

---

## 4. Shot list and clip prompts

**Kling settings:**
- Image-to-video, latest model, **Professional** mode.
- 9:16, **5 s or 10 s** clips, *creativity/relevance* about 0.5.
- Upload a start frame, plus an end frame when the coverage changes. Start + end frames are what make the mask build up
  gradually instead of popping in.
- Export at 1080p. If the export is 720p, the assembly step upscales it.

Timings below are positions in the final 55 s video (reference time = +26 s).

### C01 · 0.00–3.23 · Kling 5 s
- **Start frame:** F-S0, front-facing, close.
- **Action:** she shows the orange bowl to the camera, tilts it slightly, scrapes the thick yellow paste with the spatula
  to show the texture, and looks into the lens while talking.
- **Prompt:** `[global look] she holds the orange bowl up near her chin and shows the thick golden-yellow paste inside, slowly lifting some with the orange spatula so the texture is visible, looking into the camera and talking casually, natural blinking`
- **Voice:** c01

### C02 · 3.23–12.00 · Kling 10 s
- **Frames:** start F-S0 at three-quarter left; end F-S1.
- **Action:** she scoops paste, raises the spatula to her right cheek, presses and spreads the first thick layer with short
  strokes, and talks between strokes.
- **Prompt:** `[global look] she scoops golden-yellow paste from the orange bowl with the orange spatula and spreads a thick layer onto her right cheek with short strokes, the paste sticks to the skin and builds up gradually, spatula clearly touching the skin, she glances at the camera and talks between strokes`
- **Voice:** c02

### C03 · 12.00–21.43 · Kling 10 s
- **Frames:** start F-S1, end F-S2.
- **Action:** she keeps spreading down to the jaw and up to the cheekbone, then holds the bowl near her chest and talks.
- **Prompt:** `[global look] she continues spreading the thick yellow mask over her whole right cheek from jaw to cheekbone, coverage growing steadily, then pauses holding the bowl at chest height and talks to the camera with small natural expressions`
- **Voice:** c03

### C04 · 21.43–25.20 · Kling 5 s
- **Frames:** start F-S2, end F-S3.
- **Action:** a careful stroke down the bridge of the nose and over the tip, with her eyes looking slightly down.
- **Prompt:** `[global look] she applies the yellow paste along the bridge of her nose and over the tip with the spatula, careful slow strokes, eyes looking down then back to camera`
- **Voice:** c04

### C05 · 25.20–30.33 · Kling 5 s
- **Frames:** start F-S3, end F-S4.
- **Action:** a thin careful layer under the eye; she blinks and looks up, avoiding the eye.
- **Prompt:** `[global look] she carefully dabs a thin layer of the yellow mask under her right eye and on the upper cheek, keeping it away from the eye, she looks up while applying, natural blinking`
- **Voice:** c05

### C06 · 30.33–37.73 · Kling 10 s
- **Frames:** start F-S4, end F-S5.
- **Action:** forehead strokes, then the left cheek, then she turns back to the camera and smiles a little.
- **Prompt:** `[global look] she spreads the yellow mask across her forehead and then her left cheek, the whole face becomes evenly covered except eyes, brows and lips, then she looks at the camera and smiles slightly`
- **Voice:** c06

### C07 · 37.73–45.70 · Kling 10 s
- **Start frame:** F-S5 (no end frame; the coverage must stay the same).
- **Action:** she holds the bowl and spatula, talks to the camera, nods, and makes small hand gestures.
- **Prompt:** `[global look] her face is fully covered with the golden-yellow mask, coverage stays exactly the same, she holds the bowl and spatula and talks to the camera with natural expressions, small nods, natural blinking`
- **Voice:** c07

### C08 · 45.70–50.17 · Kling 5 s
- **Start frame:** F-S5, closer framing.
- **Action:** she raises her index finger toward the camera as if counting ("10–15 minutes") and talks.
- **Prompt:** `[global look] face fully covered with the yellow mask, she raises her index finger towards the camera as if explaining timing, talking, close framing, anatomically correct hand with five fingers`
- **Voice:** c08

### C09 · 50.17–51.30 · nothing to generate
The "rinse off" moment is a whip-blur transition, built in the assembly.

### C10 · 51.30–55.00 · Kling 5 s
- **Start frame:** F-S6, three-quarter angle, slightly closer.
- **Action:** she turns her face slowly left and right toward the light, then looks at the camera and talks.
- **Prompt:** `[global look] freshly rinsed clean face, skin slightly damp and naturally dewy, she slowly turns her face left and right towards the light then looks at the camera and talks, skin keeps its real texture and pores, same face as before`
- **Voice:** c10

---

## 5. Lip-sync and assembly

1. Generate C01–C08 and C10 as above. Keep the best take of each.
2. **Lip-sync:** in Kling, use **Lip Sync** on each clip with its voice file:
   - `voice/c01.wav`: C01
   - `voice/c02.wav`: C02
   - and so on for each clip.
   Upload the voice line on its own, not the whole track.
3. Save the clips as `public/facedemo/clips/C01.mp4` … `C10.mp4`, then:
   ```bash
   python3 deliverables/facedemo/register_clips.py
   ```
   This records each clip's length in `src/facedemo/clips.json`.
4. Render:
   ```bash
   npx remotion render src/index.ts FaceDemo out/facedemo.mp4 --codec h264 --crf 16 --concurrency 3
   ```
   Then set the loudness:
   ```bash
   ffmpeg -i out/facedemo.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k out/facedemo_final.mp4
   ```
5. Until the clips exist, `FaceDemo` renders an **animatic**: blurred grey pose frames with the shot name, plus the real
   voice-over, subtitles and sounds. Use it to check timing.

---

## 6. QA checklist (every clip, before assembly)

- [ ] Same person as the portrait in front, three-quarter and side views: eye shape and spacing, nose, lips, jaw, brows, mole.
- [ ] No face slimming, eye enlargement or skin smoothing; skin tone unchanged.
- [ ] Coverage matches the stage table and only grows; no mask popping in or vanishing.
- [ ] Hands have 5 fingers; the spatula touches the skin, never passes through it, never floats.
- [ ] Towel shape, pink top, background and light are the same as in the previous clip.
- [ ] Lips match the Malay voice; natural blinking.
- [ ] No text, logo or watermark in the generated frames.

---

## 7. Publishing notes

- **AI label:** this video is realistic AI-generated content. TikTok requires the **"AI-generated" label** on content like
  this. Turn it on when posting.
- **Clean-face reveal:** C10 is a generated visual transition, not a real before/after. Do not caption or describe it as a
  real result of the product.
- **Script:** the script makes no treatment claims (acne, scars, dark circles). Keep it that way unless the brand gives you
  approved claims.
- **Voice:** the voice-over is synthetic (Malaysian-TTS-0.6B, speaker "idayu"). It is not a clone of the reference
  creator's voice. To use your own voice, record the lines from `script.json` at the same lengths and replace the files in
  `voice/`.
