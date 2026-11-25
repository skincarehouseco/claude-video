import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {FPS} from '../theme';
import {cutTimes, Footage, Shot, Transition} from './Footage';
import {Line, Listing, ReplySticker, TextWash} from './Listing';

/* ---------------------------------------------------------------- the ONE list (same in all five versions)
   Steps are the creator's own explanations in the Drive clips: clean skin first (1MTe), mix with plain /
   filtered water (1RYy), 10-15 min only — don't sleep in it (1H0r), big pimples: dab on the spot only,
   can stay overnight (1HU1). */
export const OTMS_DURATION = 22.5;
const QUESTION = 'Nk pakai OTMS as mask mcm mana urutannya? :plead:';
const OTMS_LIST: Line[] = [
  {t: 'cara guna OTMS as a mask :heart:', bold: true},
  {gap: true, t: ''},
  {t: 'cuci muka dulu (kulit kena bersih)', check: true},
  {t: 'campur OTMS dengan air', check: true},
  {t: '(air filter lagi bagus)'},
  {t: 'kacau sampai jadi paste', check: true},
  {t: 'sapu rata satu muka', check: true},
  {t: 'biar 10-15 minit je', check: true},
  {t: '(jangan bawa tidur!)'},
  {t: 'bilas bersih dengan air', check: true},
  {gap: true, t: ''},
  {t: 'tips: ada jerawat besar?', bold: true},
  {t: 'dab dekat area jerawat je,', bold: true},
  {t: 'boleh pakai overnight :shh:', bold: true},
];

type Variant = {shots: Shot[]; transition: Transition; tf: number; music: string; musicVol: number; cutSfx?: {name: string; vol: number}};
const S = (src: string, inS: number, dur: number, extra: Partial<Shot> = {}): Shot => ({src, in: inS, dur, ...extra});

export const VARIANTS: Record<string, Variant> = {
  // 1A — reference style: the main video played through as one continuous piece, then the jar on the table
  A: {
    shots: [S('main', 0.0, 18.4, {zoom: [1.0, 1.04]}), S('1_K_', 26.0, 4.1, {zoom: [1.06, 1.0]})],
    transition: 'fade',
    tf: 12,
    music: 'otms_lofi',
    musicVol: 0.6,
  },
  // 1B — macro & texture: long close-ups of powder, mixing, paste, the drying mask; crisp ASMR on the cuts
  B: {
    shots: [
      S('1sxD', 12.0, 3.5, {zoom: [1.0, 1.12]}),
      S('181s', 0.0, 3.0, {zoom: [1.15, 1.25], origin: '50% 55%'}),
      S('12C1', 0.5, 3.5, {zoom: [1.1, 1.2]}),
      S('main', 9.4, 2.0, {zoom: [1.0, 1.08]}),
      S('162P', 18.5, 3.5, {zoom: [1.2, 1.3], origin: '45% 40%'}),
      S('1MSW', 0.0, 3.5, {zoom: [1.0, 1.1]}),
      S('1sxD', 18.0, 3.5, {zoom: [1.05, 1.18]}),
    ],
    transition: 'fade',
    tf: 8,
    music: 'otms_lofi',
    musicVol: 0.5,
    cutSfx: {name: 'crisp', vol: 0.25},
  },
  // 1C — product focus: opens on the jar, then lid, opening, scooping, paste, the jar in hand, tabletop
  C: {
    shots: [
      S('1_K_', 30.0, 4.0, {zoom: [1.0, 1.06]}),
      S('1gDm', 0.0, 3.0),
      S('1sxD', 1.0, 4.0, {zoom: [1.0, 1.08]}),
      S('1gRw', 0.5, 3.5, {zoom: [1.05, 1.12]}),
      S('main', 9.6, 1.8),
      S('1a-7', 1.0, 3.0, {zoom: [1.05, 1.1]}),
      S('1_K_', 4.0, 3.2, {zoom: [1.1, 1.02]}),
    ],
    transition: 'zoom',
    tf: 10,
    music: 'otms_lofi',
    musicVol: 0.55,
  },
  // 1D — aesthetic routine: lifestyle + application, long takes, slow cross-dissolves
  D: {
    shots: [
      S('1ebi', 23.0, 4.0, {zoom: [1.1, 1.03]}),
      S('1MTe', 5.0, 3.5, {zoom: [1.03, 1.08]}),
      S('162P', 1.5, 4.5, {zoom: [1.0, 1.06]}),
      S('13mb', 0.0, 3.5, {zoom: [1.06, 1.0]}),
      S('1H0r', 2.0, 3.5, {zoom: [1.0, 1.05]}),
      S('1HU1', 17.5, 3.5, {zoom: [1.04, 1.1], origin: '50% 35%'}),
    ],
    transition: 'fade',
    tf: 15,
    music: 'otms_calm',
    musicVol: 0.6,
  },
  // 1E — dynamic: macro-face hook, ~1.5 s cuts, punch-ins, alternate angles
  E: {
    shots: [
      S('1MSW', 0.3, 1.5, {punch: 1.08}), S('main', 7.82, 1.5, {punch: 1.06}), S('1sxD', 14.0, 1.5, {punch: 1.06}), S('main', 0.0, 1.0, {punch: 1.06}),
      S('1gDm', 2.0, 1.5, {punch: 1.06}), S('181s', 1.0, 1.5, {punch: 1.06}), S('12C1', 2.0, 1.5, {punch: 1.06}), S('162P', 30.0, 1.5, {punch: 1.06}),
      S('main', 9.5, 1.5, {punch: 1.06}), S('162P', 5.0, 1.5, {punch: 1.06}), S('13mb', 9.0, 1.5, {punch: 1.06}), S('1MSW', 6.0, 1.5, {punch: 1.06}),
      S('1a-7', 28.0, 1.5, {punch: 1.06}), S('1HU1', 19.0, 1.5, {punch: 1.06, zoom: [1.08, 1.12], origin: '50% 35%'}), S('1_K_', 40.0, 2.0, {punch: 1.06}),
    ],
    transition: 'cut',
    tf: 0,
    music: 'otms_bounce',
    musicVol: 0.45,
    cutSfx: {name: 'swipe', vol: 0.08},
  },
};

export const OtmsVariation: React.FC<{variant: keyof typeof VARIANTS}> = ({variant}) => {
  const v = VARIANTS[variant];
  const total = Math.round(OTMS_DURATION * FPS);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage shots={v.shots} transition={v.transition} tf={v.tf} />
      <TextWash from={0.06} to={0.66} strength={0.34} />
      <ReplySticker text={QUESTION} top={210} />
      <Listing lines={OTMS_LIST} size={52} top={410} />
      <Audio
        src={staticFile(`audio/${v.music}.wav`)}
        volume={(f) => v.musicVol * interpolate(f, [0, 10, total - 30, total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      {v.cutSfx &&
        cutTimes(v.shots)
          .slice(1)
          .map((c, i) => (
            <Sequence key={i} from={Math.max(0, Math.round(c * FPS) - Math.round(v.tf / 2))} durationInFrames={30} layout="none">
              <Audio src={staticFile(`audio/${v.cutSfx!.name}.wav`)} volume={v.cutSfx!.vol} />
            </Sequence>
          ))}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- Video 2: acne education — exactly like its reference:
   one continuous take, the whole text block on screen for the whole video (✅ bullets as in the reference). */
export const ACNE_DURATION = 30.0;
const ACNE_LIST: Line[] = [
  {t: 'Things you need to know if you', bold: true},
  {t: 'have acne-prone skin:', bold: true},
  {gap: true, t: ''},
  {t: 'Ingredients to look for:', bold: true},
  {t: 'Azelaic Acid — Acne & dark spots', check: true},
  {t: 'Salicylic Acid — Clogged pores', check: true},
  {t: 'Niacinamide — Oil control', check: true},
  {t: 'Centella Asiatica — Calming', check: true},
  {t: 'Ceramide — Skin barrier', check: true},
  {t: 'Panthenol — Soothing & hydration', check: true},
  {gap: true, t: ''},
  {t: 'Jangan terlalu banyak pakai acid. Nanti'},
  {t: 'kulit makin kering dan mudah iritasi.'},
  {gap: true, t: ''},
  {t: 'Prioritise your skin barrier first.', bold: true},
  {gap: true, t: ''},
  {t: 'Bila skin barrier rosak, jerawat boleh'},
  {t: 'jadi semakin susah nak settle.'},
  {gap: true, t: ''},
  {t: 'Kurangkan minuman manis dan susu'},
  {t: 'lembu sekiranya ia trigger breakout.'},
  {gap: true, t: ''},
  {t: 'Jangan skip moisturizer.', bold: true},
  {gap: true, t: ''},
  {t: 'Be consistent, not aggressive.', bold: true},
];

export const AcneEducation: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {/* one continuous take, like the reference */}
    <Footage shots={[S('172Q', 2.0, ACNE_DURATION, {zoom: [1.04, 1.08], origin: '50% 40%'})]} transition="cut" />
    <TextWash from={0.05} to={0.86} strength={0.42} />
    <Listing lines={ACNE_LIST} size={44} top={240} width={900} />
    <Audio
      src={staticFile('audio/otms_calm.wav')}
      volume={(f) => 0.6 * interpolate(f, [0, 15, ACNE_DURATION * FPS - 40, ACNE_DURATION * FPS], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
  </AbsoluteFill>
);
