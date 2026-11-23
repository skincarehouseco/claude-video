import voicemap from './voicemap.json';
import wordsJson from './words.json';

export const FPS = 30;
/** Final length = the tightened voice-over exactly (public/pestana/voice.wav). */
export const DURATION_S = voicemap.duration;
export const DURATION_IN_FRAMES = Math.ceil(DURATION_S * FPS);
export const f = (s: number) => Math.round(s * FPS);

/** voice-over SOURCE time (s, raw recording) -> OUTPUT time (s, after pause tightening) */
export const outT = (t: number) => {
  for (const [s, e, o] of voicemap.segments) {
    if (t < s) return o; // inside a removed pause -> snap to next kept audio
    if (t <= e) return o + (t - s);
  }
  const [s, e, o] = voicemap.segments[voicemap.segments.length - 1];
  return o + (e - s);
};

export type Word = {i: number; text: string; start: number; end: number};
export const WORDS = wordsJson as Word[];
export const W = (i: number) => WORDS[i];

/* ------------------------------------------------------------------------------------------------
 * Cut list. Footage is arranged to the voice-over in the same order as the reference edit.
 * vo    = cut point in voice-over SOURCE time (always placed in/just before a word onset)
 * src   = footage in-point (s) in the original recording
 * end   = end of that shot in the original recording (never play past it)
 * tr    = transition INTO this clip
 * zoom  = slow camera move across the clip ("in" push-in, "out" ease-out)
 * ---------------------------------------------------------------------------------------------- */
export type Transition = 'none' | 'dissolve' | 'zoom' | 'whip' | 'sparkle' | 'slideUp';
type ClipDef = {vo: number; src: number; end: number; tr: Transition; zoom: 'in' | 'out'; origin?: string; note: string};

const CLIP_DEFS: ClipDef[] = [
  {vo: 0.52, src: 0.6, end: 4.3, tr: 'none', zoom: 'out', origin: '45% 35%', note: 'Kalau saya pakai Pestana Tinted Serum — mascara close-up'},
  {vo: 2.44, src: 4.45, end: 7.267, tr: 'whip', zoom: 'in', note: 'perlu tak saya pakai Pestana Tonic — tonic tube'},
  {vo: 4.12, src: 7.42, end: 9.2, tr: 'whip', zoom: 'in', note: 'ataupun Pestana Jelly Oil lagi? — jelly oil tube'},
  {vo: 6.4, src: 9.36, end: 12.467, tr: 'zoom', zoom: 'out', origin: '55% 35%', note: 'Jawapannya, it depends on your budget'},
  {vo: 8.77, src: 12.62, end: 16.033, tr: 'dissolve', zoom: 'in', origin: '50% 30%', note: 'and apa juga result yang you nak achieve'},
  {vo: 11.4, src: 16.18, end: 20.9, tr: 'sparkle', zoom: 'out', origin: '50% 35%', note: 'Pestana Tinted Serum boleh'},
  {vo: 13.0, src: 21.05, end: 27.1, tr: 'dissolve', zoom: 'in', origin: '45% 35%', note: 'support your lash growth and panjangkan bulu mata — mirror'},
  {vo: 16.3, src: 27.25, end: 30.6, tr: 'zoom', zoom: 'in', origin: '40% 40%', note: 'efek macam pakai mascara — eye close-up'},
  {vo: 19.75, src: 30.62, end: 34.633, tr: 'dissolve', zoom: 'in', origin: '40% 40%', note: 'more dramatic and intensive growth — eye close-up'},
  {vo: 24.7, src: 34.8, end: 40.267, tr: 'sparkle', zoom: 'in', origin: '50% 70%', note: 'recommend untuk combine bersama — product line-up'},
  {vo: 27.5, src: 66.32, end: 67.667, tr: 'whip', zoom: 'out', note: 'Pestana Lash Tonic — tonic held up'},
  {vo: 29.0, src: 40.5, end: 51.033, tr: 'slideUp', zoom: 'in', origin: '35% 45%', note: 'formula dan juga active ingredients — box'},
  {vo: 32.85, src: 51.2, end: 58.633, tr: 'dissolve', zoom: 'in', origin: '50% 35%', note: 'So, combining these two product — applying tonic'},
  {vo: 34.72, src: 62.82, end: 66.167, tr: 'zoom', zoom: 'out', origin: '45% 40%', note: 'will guarantee you a better result — closed-eye close-up'},
  {vo: 37.1, src: 67.82, end: 70.7, tr: 'whip', zoom: 'in', note: 'But, how about Jelly Oil?'},
  {vo: 38.95, src: 70.85, end: 73.4, tr: 'dissolve', zoom: 'in', origin: '50% 60%', note: 'Boleh juga ke combine dengan Tinted Serum?'},
  {vo: 41.6, src: 73.55, end: 80.2, tr: 'sparkle', zoom: 'in', origin: '50% 35%', note: 'Of course boleh! Semua Lash Serum Pestana ni'},
  {vo: 44.76, src: 80.3, end: 85.867, tr: 'dissolve', zoom: 'out', origin: '50% 35%', note: 'boleh dipakai secara combination — applying'},
  {vo: 46.9, src: 58.78, end: 62.667, tr: 'zoom', zoom: 'in', origin: '55% 40%', note: 'Ataupun, you can use it alone — mirror'},
  {vo: 49.75, src: 86.02, end: 96.6, tr: 'dissolve', zoom: 'in', origin: '50% 55%', note: 'So untuk bantu you pilih ... description — products'},
];

/** transition overlap (frames) centred on each cut */
export const TR = 8;

export type Clip = ClipDef & {from: number; to: number; rate: number};
export const CLIPS: Clip[] = CLIP_DEFS.map((c, i) => {
  const from = i === 0 ? 0 : f(outT(c.vo));
  const to = i === CLIP_DEFS.length - 1 ? DURATION_IN_FRAMES : f(outT(CLIP_DEFS[i + 1].vo));
  // footage needed incl. transition handles; slow it down gently only if the shot is too short
  const needed = (to - from + TR) / FPS;
  const avail = c.end - c.src - 0.04;
  const rate = Math.min(1, avail / needed);
  return {...c, from, to, rate};
});

export const clipAt = (frame: number) => {
  let k = 0;
  while (k < CLIPS.length - 1 && frame >= CLIPS[k + 1].from) k++;
  return k;
};
