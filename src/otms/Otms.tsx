import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';
import {cutTimes, Footage, Shot, Transition} from './Footage';
import {nativeText, OTMS_DURATION, OtmsText, SCRIPT, SOFIA, TextLayout} from './OtmsText';

/* Shot lists. `main` = the creator's main OTMS video; the other ids are Drive clips (first 4 chars of the Drive id).
   Every list sums to 22.5 s and follows the same 7 text slots (3.3 / 3.1 / 3.1 / 3.1 / 3.3 / 2.9 / 3.7 s). */
type Variant = {
  shots: Shot[];
  transition: Transition;
  tf: number;
  text: TextLayout;
  music: string;
  musicVol: number;
  cutSfx?: {name: string; vol: number};
  textSfx?: {name: string; vol: number};
};

const S = (src: string, inS: number, dur: number, extra: Partial<Shot> = {}): Shot => ({src, in: inS, dur, ...extra});

export const VARIANTS: Record<string, Variant> = {
  // 1A — reference style: the main video in its own order, carousel-like swipes, reply sticker over the opening shot
  A: {
    shots: [
      S('main', 0.0, 1.0), S('main', 1.0, 1.5), S('main', 2.55, 0.8), // hook
      S('1MTe', 2.0, 3.1, {zoom: [1.08, 1.12], origin: '50% 30%'}), // cuci muka (she explains clean skin first)
      S('main', 6.97, 0.8), S('main', 3.95, 1.75), S('main', 7.82, 0.55), // campur
      S('main', 9.4, 2.0), S('162P', 2.0, 1.1), // paste + sapu
      S('main', 13.22, 1.7), S('13mb', 8.5, 1.6), // 10-15 minit
      S('main', 11.42, 1.75), S('main', 5.75, 1.15), // bilas
      S('1HU1', 18.0, 2.0, {zoom: [1.1, 1.18], origin: '50% 35%'}), S('main', 14.95, 1.7), // tip
    ],
    transition: 'swipe',
    tf: 7,
    text: {y: 1180, size: 76, enter: 'pop', bubble: {x: 250, y: 300, rotate: -2}},
    music: 'otms_lofi',
    musicVol: 0.55,
    cutSfx: {name: 'swipe', vol: 0.12},
  },
  // 1B — macro & texture: close-ups of powder, lid, paste and the drying mask; crisp ASMR ticks on the cuts
  B: {
    shots: [
      S('1sxD', 13.0, 1.6, {zoom: [1.0, 1.15]}), S('main', 6.97, 0.8, {zoom: [1.05, 1.12]}), S('1gDm', 1.0, 0.9, {zoom: [1.15, 1.2]}),
      S('1gDm', 4.0, 1.5, {zoom: [1.1, 1.2]}), S('1sxD', 0.5, 1.6, {zoom: [1.1, 1.18]}),
      S('181s', 0.0, 1.5, {zoom: [1.2, 1.3], origin: '50% 55%'}), S('12C1', 0.5, 1.6, {zoom: [1.15, 1.25]}),
      S('main', 9.4, 1.6, {zoom: [1.0, 1.1]}), S('162P', 18.5, 1.5, {zoom: [1.25, 1.35], origin: '45% 40%'}),
      S('1MSW', 0.0, 1.8, {zoom: [1.0, 1.12]}), S('main', 7.82, 1.5, {zoom: [1.0, 1.08]}),
      S('1sxD', 18.0, 1.5, {zoom: [1.05, 1.2]}), S('main', 3.95, 1.4, {zoom: [1.1, 1.18]}),
      S('1MSW', 5.0, 1.8, {zoom: [1.3, 1.45], origin: '50% 40%'}), S('1HU1', 18.3, 1.9, {zoom: [1.3, 1.4], origin: '50% 35%'}),
    ],
    transition: 'cut',
    tf: 0,
    text: {y: 1250, size: 74, enter: 'type', bubble: {x: 120, y: 320, rotate: 0}},
    music: 'otms_bounce',
    musicVol: 0.4,
    cutSfx: {name: 'crisp', vol: 0.35},
  },
  // 1C — product focus: opens on the jar, then lid, opening, scooping, texture; soft zoom-dissolves + taps
  C: {
    shots: [
      S('1_K_', 30.0, 1.8, {zoom: [1.0, 1.06]}), S('main', 1.0, 1.5),
      S('1gDm', 0.0, 1.6), S('1sxD', 1.0, 1.5),
      S('1gRw', 0.5, 1.7, {zoom: [1.05, 1.12]}), S('181s', 3.0, 1.4, {zoom: [1.15, 1.2]}),
      S('12C1', 1.0, 1.5, {zoom: [1.05, 1.1]}), S('main', 9.6, 1.6),
      S('1a-7', 1.0, 1.7, {zoom: [1.05, 1.1], origin: '50% 50%'}), S('1sxD', 8.0, 1.6),
      S('main', 11.42, 1.6), S('main', 5.75, 1.3),
      S('1_K_', 4.0, 1.8, {zoom: [1.12, 1.04]}), S('main', 15.5, 1.9),
    ],
    transition: 'zoom',
    tf: 8,
    text: {y: 1170, size: 76, enter: 'rise', bubble: {x: 200, y: 380, rotate: 2}},
    music: 'otms_lofi',
    musicVol: 0.5,
    cutSfx: {name: 'tap', vol: 0.3},
  },
  // 1D — aesthetic routine: application + lifestyle takes, long shots, gentle cross-dissolves, clean framing
  D: {
    shots: [
      S('1ebi', 23.0, 3.3, {zoom: [1.12, 1.04]}),
      S('1MTe', 5.0, 3.1, {zoom: [1.04, 1.1]}),
      S('1RYy', 17.0, 1.6), S('1gRw', 6.5, 1.5, {zoom: [1.04, 1.1]}),
      S('162P', 1.5, 3.1, {zoom: [1.0, 1.06]}),
      S('13mb', 0.0, 1.8, {zoom: [1.06, 1.0]}), S('1I3h', 17.5, 1.5),
      S('1H0r', 2.0, 2.9, {zoom: [1.0, 1.06]}),
      S('1HU1', 17.5, 2.2, {zoom: [1.05, 1.12], origin: '50% 35%'}), S('1_K_', 8.0, 1.5, {zoom: [1.06, 1.0]}),
    ],
    transition: 'fade',
    tf: 10,
    text: {y: 1290, size: 72, enter: 'fade', bubble: {x: 160, y: 300, rotate: -1}},
    music: 'otms_lofi',
    musicVol: 0.6,
  },
  // 1E — dynamic: macro-face hook, ~1 s cuts, punch-in zooms, whip transitions
  E: {
    shots: [
      S('1MSW', 0.3, 0.7, {punch: 1.12}), S('main', 7.82, 0.8, {punch: 1.1}), S('1sxD', 14.0, 0.8, {punch: 1.1}), S('main', 0.0, 1.0, {punch: 1.08}),
      S('1MTe', 9.0, 1.0, {punch: 1.1, zoom: [1.1, 1.14], origin: '50% 30%'}), S('1I3h', 2.0, 1.0, {punch: 1.1}), S('1gDm', 2.0, 1.1, {punch: 1.1}),
      S('181s', 1.0, 0.9, {punch: 1.1}), S('main', 6.97, 0.8, {punch: 1.1}), S('12C1', 2.0, 0.7, {punch: 1.1}), S('1gRw', 1.0, 0.7, {punch: 1.1}),
      S('162P', 30.0, 1.0, {punch: 1.1}), S('main', 9.5, 1.0, {punch: 1.1}), S('162P', 5.0, 1.1, {punch: 1.1}),
      S('1H0r', 0.5, 1.0, {punch: 1.1}), S('1MSW', 6.0, 1.1, {punch: 1.1}), S('13mb', 9.0, 1.2, {punch: 1.1}),
      S('main', 11.6, 1.0, {punch: 1.1}), S('1a-7', 28.0, 1.0, {punch: 1.1}), S('main', 1.2, 0.9, {punch: 1.1}),
      S('1HU1', 19.0, 1.3, {punch: 1.1, zoom: [1.1, 1.16], origin: '50% 35%'}), S('main', 13.3, 1.2, {punch: 1.1}), S('1_K_', 40.0, 1.2, {punch: 1.1}),
    ],
    transition: 'whip',
    tf: 5,
    text: {y: 1130, size: 78, enter: 'pop', bubble: {x: 240, y: 260, rotate: 3}, plate: true},
    music: 'otms_bounce',
    musicVol: 0.5,
    cutSfx: {name: 'swipe', vol: 0.14},
    textSfx: {name: 'pop', vol: 0.25},
  },
};

const OtmsAudio: React.FC<{v: Variant}> = ({v}) => {
  const total = Math.round(OTMS_DURATION * FPS);
  const cuts = cutTimes(v.shots).slice(1);
  return (
    <>
      <Audio
        src={staticFile(`audio/${v.music}.wav`)}
        volume={(f) => v.musicVol * interpolate(f, [0, 10, total - 30, total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      {v.cutSfx &&
        cuts.map((c, i) => (
          <Sequence key={`c${i}`} from={Math.max(0, Math.round(c * FPS) - (v.transition === 'cut' ? 0 : Math.round(v.tf / 2)))} durationInFrames={30} layout="none">
            <Audio src={staticFile(`audio/${v.cutSfx!.name}.wav`)} volume={v.cutSfx!.vol} />
          </Sequence>
        ))}
      {v.textSfx &&
        SCRIPT.map((s, i) => (
          <Sequence key={`t${i}`} from={Math.round(s.from * FPS)} durationInFrames={30} layout="none">
            <Audio src={staticFile(`audio/${v.textSfx!.name}.wav`)} volume={v.textSfx!.vol} />
          </Sequence>
        ))}
      {/* the reply sticker pops in on frame 0 */}
      <Audio src={staticFile('audio/pop.wav')} volume={0.22} />
    </>
  );
};

export const OtmsVariation: React.FC<{variant: keyof typeof VARIANTS}> = ({variant}) => {
  const v = VARIANTS[variant];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage shots={v.shots} transition={v.transition} tf={v.tf} />
      <OtmsText layout={v.text} />
      <OtmsAudio v={v} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- Video 2: acne education (text-based, like its reference:
   one continuous shot, a single centred block of in-app style text that stays up; split over two pages so every line is readable) */
const PAGE1 = [
  {t: 'Things you need to know if you have acne-prone skin:', b: true},
  {t: ''},
  {t: 'Ingredients to look for:', b: true},
  {t: '• Azelaic Acid — Acne & dark spots'},
  {t: '• Salicylic Acid — Clogged pores'},
  {t: '• Niacinamide — Oil control'},
  {t: '• Centella Asiatica — Calming'},
  {t: '• Ceramide — Skin barrier'},
  {t: '• Panthenol — Soothing & hydration'},
];
const PAGE2 = [
  {t: 'Jangan terlalu banyak pakai acid. Nanti kulit makin kering dan mudah iritasi.'},
  {t: ''},
  {t: 'Prioritise your skin barrier first.', b: true},
  {t: ''},
  {t: 'Bila skin barrier rosak, jerawat boleh jadi semakin susah nak settle.'},
  {t: ''},
  {t: 'Kurangkan minuman manis dan susu lembu sekiranya ia trigger breakout.'},
  {t: ''},
  {t: 'Jangan skip moisturizer.', b: true},
  {t: ''},
  {t: 'Be consistent, not aggressive.', b: true},
];
export const ACNE_PAGE_SWITCH = 13.0;
export const ACNE_DURATION = 30.0;

export const AcneEducation: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const page = t < ACNE_PAGE_SWITCH ? PAGE1 : PAGE2;
  const local = t < ACNE_PAGE_SWITCH ? t : t - ACNE_PAGE_SWITCH;
  const o = Math.min(1, local / 0.35) * Math.min(1, ((t < ACNE_PAGE_SWITCH ? ACNE_PAGE_SWITCH : ACNE_DURATION) - t) / 0.25);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* one continuous take, like the reference */}
      <Footage shots={[S('172Q', 2.0, ACNE_DURATION, {zoom: [1.04, 1.1], origin: '50% 40%'})]} transition="cut" />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.30), rgba(0,0,0,0.12) 55%, rgba(0,0,0,0) 80%)'}} />
      <div
        style={{
          position: 'absolute',
          left: 90,
          width: 810,
          top: t < ACNE_PAGE_SWITCH ? 300 : 330,
          opacity: o,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {page.map((l, i) =>
          l.t === '' ? (
            <div key={i} style={{height: 26}} />
          ) : (
            <div key={i} style={{...nativeText(l.b ? 54 : 50, l.b ? 800 : 700), fontFamily: SOFIA, marginBottom: 4}}>
              {l.t}
            </div>
          ),
        )}
      </div>
      <Audio
        src={staticFile('audio/otms_calm.wav')}
        volume={(f) => 0.6 * interpolate(f, [0, 15, ACNE_DURATION * FPS - 40, ACNE_DURATION * FPS], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      <Sequence from={Math.round((ACNE_PAGE_SWITCH - 0.1) * FPS)} durationInFrames={30} layout="none">
        <Audio src={staticFile('audio/swipe.wav')} volume={0.15} />
      </Sequence>
    </AbsoluteFill>
  );
};
