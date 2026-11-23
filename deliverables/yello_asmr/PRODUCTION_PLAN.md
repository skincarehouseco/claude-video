# yello Oatmeal Turmeric Mask & Scrub: "extra crispy" crushing ASMR (15 s, 9:16)

## Status

| Part | Status |
|---|---|
| **ASMR audio** | **Rendered.** `yello_asmr_audio.wav`: 15.0 s, 48 kHz / 24-bit stereo, −17.1 LUFS, true peak −0.6 dBFS. Synthesised from `cues.json` with `scripts/asmr_crunch.py`; no samples, music, voice or whooshes. |
| **Sync preview** | **Rendered.** `yello_asmr_audio_preview.mp4`: the real product photo nudges on every crack, so you can hear the audio against the timing. It is **not** the final video. |
| **Photoreal video** | **Not generated.** This environment has no image-to-video model. Generate it with the prompts below (Kling, Veo, Runway or similar), then send it back for assembly. |

## 1. Product analysis (from the uploaded photo, `product_reference.png`)

| Element | Exact appearance |
|---|---|
| Format | Wide, low cylindrical **jar** (not a bottle). Width ≈ 1.6 × height; straight sides with very slightly rounded bottom edge |
| Cap / lid | Glossy **orange-yellow** screw lid, ≈ 30 % of total height; lighter warm yellow at the top rim fading to deeper tangerine orange at the bottom edge; smooth, no ridges visible |
| Body | **Frosted translucent white** jar with a soft pearlescent / iridescent sheen (faint pink-peach highlights); the cream inside shows faintly through |
| Logo | **"yello"** in lowercase black serif-style wordmark with a small **®**, and **"SKINCARE"** in tiny spaced capitals underneath, front-left of centre |
| Badge | Small outlined box under the logo: a tiny leaf/drop icon + **"Acne care"** |
| Product name | Right of the logo, black sans-serif, three lines: **"Oatmeal / Turmeric / Mask & Scrub"** |
| Small copy | Under the name: *"Wash-off mask scrub to treat skin breakouts. Brightens dull skin. Instantly glows."* |
| Side text | A narrow block of small black text on the left side (back-panel info), partly visible |
| Inside (for the reveal) | The real product is an oatmeal–turmeric mask scrub, so the soft interior should be a **creamy pale-golden turmeric paste with fine oat flecks**. This keeps the transformation true to the product. |

**Branding rules:**
- Never re-letter the label.
- Keep the logo and name **facing the camera and intact until 6 s**.
- Crush the **lower half and sides first**, so "yello" stays legible as long as possible.
- The final close-up still shows a large label fragment with "yello" readable.

## 2. Composition (adapted from the reference)

- **Hands:** two feminine hands enter from left and right. The fingers wrap behind the jar and **both thumbs press on the front**, the same grip as the reference. The jar sits at frame centre, slightly below the middle. Nails are short, natural, glossy nude-pink.
- **Background:** warm butter-yellow / cream wall with soft, out-of-focus white organic "cloud" shapes, like the reference. Shallow depth of field.
- **Lighting:** soft diffused key light from the upper left, warm.
- **Lens:** macro 100 mm look, f/2.8. Focus stays locked on the jar and the cracks.
- **Format:** 9:16, 1080×1920 or above, 30 fps.

## 3. Shot timing, matched to the audio cue sheet

| Time | Visual | Sound (already in the audio) |
|---|---|---|
| 0.0–3.0 | Hands hold the clean jar and slowly rotate it about 20° each way to show the label, then return it to face front | Soft fingertip friction, nail ticks on the lid (0.7 s, 2.05 s) |
| 3.0–6.0 | Thumbs press in. Pressure creak, then three hairline cracks at **3.45 / 4.32 / 5.22 s**, each a little bigger, spreading from under the thumbs through the frosted body | Stick-slip creaks, then growing crackle clusters |
| 6.0–10.0 | The shell fractures into crunchy plates: big breaks at **6.15, 6.95, 7.70 (+7.83), 8.95 s**. Fragments of frosted white shell and orange lid crumble, and creamy golden interior shows. Crumbs fall onto the hands | Loudest section: layered fractures, dense micro-crackles, falling crumbs, soft squish under it |
| 10.0–13.0 | Thumbs fold the broken halves inward, slowly squishing the creamy turmeric-oat filling. Smaller cracks at **10.6, 11.35, 12.15 s** | Squish layers with steady crackle bed |
| 13.0–15.0 | Final hard squeeze (crackle crescendo 13.15–14.0 s), last big snap at **13.95 s**, then a still close-up of the crushed texture with "yello" fragment visible | Final crunch, crumbs settling, soft squish tail |

## 4. How to generate the video (Kling)

**Step 1: Start frame (image).** Use Kling Image or an image editor, with `product_reference.png` attached as the
product/subject reference:

> Hyperrealistic macro product photo, vertical 9:16. Two feminine hands with short natural glossy nude-pink manicured nails
> hold the exact jar from the reference image at the centre of the frame: a wide low frosted pearlescent white jar with a
> glossy orange-yellow lid; black "yello" serif logo with ® and "SKINCARE" underneath, an "Acne care" badge, and
> "Oatmeal Turmeric Mask & Scrub" in black sans-serif text on the right of the logo. The label faces the camera, sharp and
> legible. The fingers wrap behind the jar and both thumbs rest on the front lower edge. Warm butter-yellow background with
> soft blurred white cloud shapes, soft diffused warm studio light from the upper left, shallow depth of field,
> 100 mm macro, realistic skin texture, premium minimal beauty aesthetic.

- **Check:** the label text and proportions match the photo exactly. If not, regenerate. You can also paste the real
  label onto the frame in an editor.

**Step 2: Clip A, 0–5 s (Kling image-to-video, 5 s, Professional, start frame from step 1):**

> The two hands slowly rotate the yello jar a little left and right to show the label, then hold it facing the camera.
> The thumbs begin pressing into the front lower part of the jar, and tiny hairline cracks appear in the frosted
> pearlescent shell and spread slowly under the thumbs. The jar is now a brittle crispy ceramic-like shell. Label, logo and
> lid stay exactly the same and sharp. Macro, shallow depth of field, slow realistic motion, static camera.

**Step 3: Clip B, 5–15 s (Kling image-to-video, 10 s, start frame = last frame of clip A):**

> The thumbs press harder. The crispy ceramic-like shell of the yello jar fractures into several crunchy plates and
> crumbles, with small dry crumbs falling onto the fingers. A soft creamy pale-golden turmeric paste with fine oat flecks
> is revealed inside. The hands slowly fold and squeeze the broken jar inward, squishing the creamy filling, with more
> small cracks. A final firm squeeze, then the hands hold still: a close-up of the crushed crispy texture, with a large
> label fragment still showing the black "yello" logo. Physically believable pressure and fracture, real brittle crumbs,
> static camera, macro, shallow depth of field.

**Negative prompt (both clips):**

> melting, rubber, plastic bending, liquid, slime, extra fingers, deformed hands, fused fingers, long claw nails, floating
> fragments, blurry label, changed logo, misspelled text, different packaging, cartoon, CGI look, camera shake, cuts,
> transitions, text overlay, subtitles, watermark, music

**Settings:**
- Professional mode, 9:16, the newest Kling model.
- Relevance about 0.6.
- Generate 3–4 takes of clip B and keep the one where the label survives best.

## 5. Assembly and audio sync

1. Save the clips as `public/yello/clips/A.mp4` (5 s) and `public/yello/clips/B.mp4` (10 s).
2. Set `src/yello/clips.json` to `{"A": 5, "B": 10}`.
3. **Re-time the audio to your clip.** Generated clips never match the cue times exactly. Send me the clips and I'll mark
   the visible crack frames and update `cues.json`. Or do it yourself: write each crack's time in `cues.json`, then run:
   ```bash
   python scripts/asmr_crunch.py deliverables/yello_asmr/cues.json /tmp/raw.wav
   ```
   ```bash
   ffmpeg -i /tmp/raw.wav -af "aresample=192000,alimiter=limit=0.84:attack=0.5:release=30:level=disabled,volume=0.6dB,aresample=48000" -c:a pcm_s24le public/yello/yello_asmr_audio.wav
   ```
4. Render:
   ```bash
   npx remotion render src/index.ts YelloAsmr out/yello_asmr.mp4 --codec h264 --crf 14 --audio-bitrate 320k
   ```

## 6. Posting notes

- Tick TikTok's / Instagram's **AI-generated** label. The packaging-crushing transformation is synthetic.
- Use the brand's real name and logo only as permitted by your affiliate agreement with yello.
