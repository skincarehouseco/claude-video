import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import wordsJson from './words.json';

/* ---------------- timing ---------------- */
export const FPS = 30;
export const DUR = 728; // 24.27 s, identical to the source footage (nothing removed, no speed change)
export const f = (s: number) => Math.round(s * FPS);
export type Word = {w: string; s: number; e: number};
export const WORDS = wordsJson as Word[];

/** first word (index) whose start >= t, used to lock graphics to speech */
export const at = (word: string, nth = 0, after = 0) => {
  const hits = WORDS.filter((w) => w.w.toLowerCase().replace(/[?.,]/g, '') === word.toLowerCase() && w.s >= after);
  return hits[nth]?.s ?? 0;
};

/* ---------------- fonts (all SIL OFL, bundled in public/fonts) ---------------- */
const FONTS: [string, string, string, string][] = [
  ['Sacramento', 'fonts/Sacramento-Regular.ttf', 'normal', '400'],
  ['InterX', 'fonts/Inter-ExtraBold.ttf', 'normal', '800'],
  ['InterS', 'fonts/Inter-SemiBold.ttf', 'normal', '600'],
  ['PoppinsX', 'fonts/Poppins-ExtraBold.ttf', 'normal', '800'],
  ['PoppinsLI', 'fonts/Poppins-LightItalic.ttf', 'italic', '300'],
  ['PoppinsMI', 'fonts/Poppins-MediumItalic.ttf', 'italic', '500'],
  ['InstrSerif', 'fonts/InstrumentSerif-Regular.ttf', 'normal', '400'],
  ['InstrSerifI', 'fonts/InstrumentSerif-Italic.ttf', 'italic', '400'],
  ['JakartaX', 'fonts/PlusJakartaSans-ExtraBold.ttf', 'normal', '800'],
  ['JakartaS', 'fonts/PlusJakartaSans-SemiBold.ttf', 'normal', '600'],
  ['CaveatS', 'fonts/Caveat-SemiBold.ttf', 'normal', '600'],
  ['DMSansM', 'fonts/DMSans-Medium.ttf', 'normal', '500'],
  ['DMSansX', 'fonts/DMSans-ExtraBold.ttf', 'normal', '800'],
  ['Pixel', 'fonts/PixelifySans.ttf', 'normal', '400 700'],
  ['Fredoka', 'fonts/Fredoka.ttf', 'normal', '300 700'],
  ['PlayfairI', 'fonts/PlayfairDisplay-Italic.ttf', 'italic', '400'],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading OTMS fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    FONTS.map(([family, file, style, weight]) =>
      new FontFace(family, `url(${staticFile(file)})`, {style, weight}).load().then((ff) => document.fonts.add(ff)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

/* ---------------- footage ---------------- */
// Original footage (H.264 transcode of the HEVC source, 1080x1920 @30fps, original colours)
export const Footage: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <OffthreadVideo src={staticFile('otms/main.mp4')} muted style={{width: 1080, height: 1920, objectFit: 'cover', ...style}} />
);
// Speaker cut-out (Robust Video Matting, temporally consistent), VP9 + alpha, frame-locked to main.mp4
export const SpeakerCut: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <OffthreadVideo src={staticFile('otms/subject.webm')} transparent muted style={{width: 1080, height: 1920, ...style}} />
);

/** smooth ease helpers */
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ramp = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], clamp);
/** spring-ish overshoot pop 0..1 over n frames */
export const pop = (frame: number, start: number, n = 9) => {
  const x = Math.max(0, Math.min(1, (frame - start) / n));
  const c1 = 1.9;
  const c3 = c1 + 1;
  return x === 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/* ---------------- audio ---------------- */
export type Sfx = [number, string, number]; // [seconds, name, volume]

const useDucking = (base: number, under: number) =>
  useMemo(() => {
    const speaking = new Array(DUR).fill(0);
    WORDS.forEach((w) => {
      for (let k = f(w.s - 0.12); k <= f(w.e + 0.2); k++) if (k >= 0 && k < DUR) speaking[k] = 1;
    });
    const vol = new Array(DUR).fill(0);
    const W = 9;
    for (let k = 0; k < DUR; k++) {
      let s = 0;
      let n = 0;
      for (let j = k - W; j <= k + W; j++)
        if (j >= 0 && j < DUR) {
          s += speaking[j];
          n++;
        }
      const sp = s / n;
      vol[k] = under * sp + base * (1 - sp);
    }
    return vol;
  }, [base, under]);

export const AudioMix: React.FC<{music: string; base?: number; under?: number; sfx: Sfx[]}> = ({
  music,
  base = 0.16,
  under = 0.07,
  sfx,
}) => {
  const vol = useDucking(base, under);
  return (
    <>
      <Audio src={staticFile('otms/voice.wav')} volume={1} />
      <Audio
        src={staticFile(`otms/audio/${music}`)}
        volume={(k) => vol[Math.min(k, DUR - 1)] * interpolate(k, [0, 6, DUR - 20, DUR], [0, 1, 1, 0], clamp)}
      />
      {sfx.map(([t, name, v], i) => (
        <Sequence key={i} from={Math.max(0, f(t))} durationInFrames={40} layout="none">
          <Audio src={staticFile(`otms/audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

/* ---------------- TikTok safe zone ---------------- */
export const SAFE = {top: 160, bottom: 1490, left: 80, right: 910};
export const SAFE_CX = 495;

export const Fill: React.FC<{children?: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={style}>{children}</AbsoluteFill>
);

export const useT = () => useCurrentFrame() / FPS;

/* ---------------- phrase chunks (manually grouped & corrected transcript) ---------------- */
export type Phrase = {text: string; s: number; e: number; words: Word[]};
const RAW: [string, number, number][] = [
  ['Kalau nak pakai yang ni', 0.34, 1.16],
  ['waktu pagi boleh ke?', 1.16, 2.24],
  ['Boleh, tak ada masalah.', 2.28, 3.06],
  ['Yang ni kan dia tak ada jadual.', 3.06, 4.48],
  ['You nak pakai pagi ke,', 4.48, 5.74],
  ['tengah hari ke, malam ke, boleh.', 5.74, 8.02],
  ['Tak ada masalah.', 8.02, 8.64],
  ['Kalau contoh you shift malam,', 8.64, 10.46],
  ['pagi you bangun,', 10.46, 11.54],
  ['you nak pakai OTMS, boleh.', 11.54, 12.74],
  ['You kerja pagi, balik petang,', 12.74, 15.26],
  ['malam you nak pakai OTMS, boleh.', 15.26, 16.9],
  ['Tak ada masalah.', 16.9, 17.6],
  ['Dia tak ada buat muka you', 17.6, 20.08],
  ['sensitif kepada matahari ke apa,', 20.08, 21.74],
  ['tak ada.', 21.74, 22.14],
  ['Boleh je pakai bila-bila.', 22.14, 24.27],
];
export const PHRASES: Phrase[] = RAW.map(([text, s, e]) => ({
  text,
  s,
  e,
  words: WORDS.filter((w) => w.s >= s - 0.01 && w.s < e - 0.01),
}));
/** display tokens of a phrase (keeps punctuation from the phrase text) aligned with its timed words */
export const tokens = (p: Phrase) => {
  const parts = p.text.split(' ');
  return parts.map((t, i) => ({t, s: p.words[i]?.s ?? p.s, e: p.words[i]?.e ?? p.e}));
};
