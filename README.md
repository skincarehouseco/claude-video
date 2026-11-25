# Skincarehouse — "Cara kenal skin type" TikTok edit (Remotion)

Educational 9:16 edit of the raw "how to know your skin type" talking-head video. The output is the full
87.53 s source with no cuts, speed changes or re-ordering. It adds contextual background replacement, motion graphics,
dynamic captions, meme beats and CapCut-style SFX. The timestamped plan is in [`docs/EDIT_PLAN.md`](docs/EDIT_PLAN.md).

## Layers (`src/`)
- `Edit.tsx`: composition, audio mix (voice at full level, music ducked under speech, SFX cue list)
- `Backgrounds.tsx`: background timeline chosen from the dialogue (hook set, skin macro, shelf, warning, bathroom,
  water, clock, face-map studio, split-screen oily/matte, oily / dry textures, recap, CTA) with wipe transitions
- `Subject.tsx`: presenter cut-out + "camera" (reframes, punch-ins); it never scales below 1 or moves up, so frame edges stay covered
- `Graphics.tsx`: text behind the presenter, front graphics (crossed-out products, consequence list, 60 s timer, clock,
  tissue-tracking ring/arrow, face map, result stamps, recap cards, follow button), and the full-screen covers
  that hide the draft artefacts burned into the source (colour bars, draft title box with editor cursor, glitch)
- `Captions.tsx` + `captions.json`: word-synced one-line captions, keywords in yellow
- `FaceMap.tsx`, `ui.tsx`: drawn icons / chips / stamps

## Assets (all original or openly licensed)
- Music + all SFX are synthesised by `scripts/make_audio.py` (no samples, so no licensing issues)
- Skin / oily / dry / tile / water backgrounds are procedural renders from `scripts/make_textures.py`, tagged "ilustrasi" on screen
- Fonts: Poppins, Lilita One (SIL OFL, `public/fonts`)
- Reaction emoji: Twemoji by Twitter / jdecked, CC-BY 4.0 (`public/emoji/LICENSE-GRAPHICS.txt`)

## Rebuild
```bash
npm ci
S=work; mkdir -p $S/frames
ffmpeg -i source.mov -q:v 2 $S/frames/f_%04d.jpg
ffmpeg -i source.mov -an -c:v libx264 -crf 15 -pix_fmt yuv420p -r 30 public/main.mp4
ffmpeg -i source.mov -vn -af "highpass=f=70,afftdn=nf=-32,acompressor=threshold=-20dB:ratio=2.2:attack=8:release=150:makeup=1.5,loudnorm=I=-14:TP=-1.5:LRA=9" -ar 48000 -ac 2 public/audio/voice.wav
# matting: Robust Video Matting ResNet50 ONNX (github.com/PeterL1n/RobustVideoMatting releases)
python3 scripts/rvm.py rvm_resnet50_fp32.onnx $S/frames $S/alpha scripts/cuts.json 0.3
python3 scripts/make_subject.py $S/frames $S/alpha public/subject.webm
python3 scripts/track_tissue.py $S/frames $S/alpha 1300 1352
python3 scripts/make_audio.py public/audio 88
python3 scripts/make_textures.py public/bg
python3 scripts/transcribe.py voice16k.wav large-v3 scripts/transcript_raw.json   # faster-whisper
python3 scripts/build_captions.py
npm run render   # -> out/final.mp4 (1080x1920, 30 fps, H.264, AAC 320k)
```
