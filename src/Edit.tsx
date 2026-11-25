import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {Backgrounds} from './Backgrounds';
import captions from './captions.json';
import {Captions} from './Captions';
import {BakedTextCover, Behind, Covers, Front} from './Graphics';
import {Subject} from './Subject';
import {DURATION_IN_FRAMES, sec} from './theme';

/* ------------ SFX: every cue is tied to a visual event (time s, file, volume) ------------ */
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  // hook — crossed-out products
  [0.0, 'impact', 0.3],
  [0.24, 'pop', 0.32],
  [1.16, 'pop', 0.32],
  [2.56, 'pop', 0.32],
  [3.8, 'pop', 0.32],
  [4.08, 'buzzer', 0.12],
  [4.3, 'vineboom', 0.42], //       "TAK PAYAH!"
  [4.6, 'scratch', 0.3], //         record scratch into "Before you beli skincare..."
  [4.72, 'whoosh', 0.28],
  [5.3, 'pop', 0.26],
  [6.22, 'pop', 0.28],
  [6.6, 'impact', 0.22], //         SKIN TYPE? behind her
  [7.5, 'whoosh', 0.32], //         panel over the colour bars
  [8.08, 'swipe', 0.26],
  [8.12, 'pop', 0.26],
  [8.3, 'bubble', 0.3], //          wave
  [9.0, 'whoosh', 0.32], //         title card
  [9.66, 'impact', 0.25],
  [10.56, 'pop', 0.3],
  [10.75, 'bubble', 0.26],
  [10.87, 'bubble', 0.26],
  [10.99, 'bubble', 0.26],
  [11.11, 'bubble', 0.26],
  [11.32, 'pop', 0.24],
  [12.24, 'swipe', 0.28],
  [13.14, 'impact', 0.2], //        RAMAI
  [14.12, 'pop', 0.26],
  [15.32, 'pop', 0.26],
  [15.4, 'typing', 0.12], //        confused-math formulas
  [16.0, 'boing', 0.28],
  [16.9, 'whoosh', 0.28],
  [17.6, 'buzzer', 0.14],
  [18.7, 'buzzer', 0.14],
  [20.0, 'swipe', 0.22],
  [21.46, 'vineboom', 0.38], //     "skin problem"
  [22.5, 'whoosh', 0.28],
  [23.68, 'chime', 0.28], //        PREVENT shield
  [24.24, 'pop', 0.24],
  [25.04, 'pop', 0.24],
  [26.25, 'whoosh', 0.26],
  [26.45, 'riser', 0.22],
  [26.74, 'pop', 0.3],
  [26.9, 'bubble', 0.28],
  [27.3, 'whoosh', 0.32], //        STEP 1 panel over the glitch
  [27.6, 'impact', 0.26],
  [28.08, 'swipe', 0.26],
  [28.58, 'pop', 0.28],
  [30.2, 'swipe', 0.22],
  [30.6, 'tick', 0.22], //          60s timer
  [31.94, 'bubble', 0.28],
  [32.8, 'whoosh', 0.26],
  [33.22, 'bubble', 0.28],
  [35.16, 'pop', 0.26],
  [35.35, 'buzzer', 0.12],
  [35.43, 'pop', 0.28], //        NO PRODUCT label
  [36.45, 'whoosh', 0.24],
  [37.94, 'pop', 0.28],
  [38.0, 'tick', 0.22], //          clock spins 10 minutes
  [40.66, 'ding', 0.24], //         dah kering
  [41.86, 'impact', 0.4], //        PALING PENTING
  [42.45, 'whoosh', 0.26],
  [43.44, 'pop', 0.28],
  [44.3, 'pop', 0.3], //            DAB!
  [45.0, 'whoosh', 0.24],
  [45.8, 'bubble', 0.3],
  [46.44, 'bubble', 0.3],
  [47.04, 'bubble', 0.3],
  [48.1, 'bubble', 0.3],
  [48.5, 'whoosh', 0.24],
  [49.64, 'shutter', 0.26], //      check tisu
  [51.02, 'notif', 0.24], //        ada minyak?
  [51.8, 'whoosh', 0.26],
  [53.44, 'pop', 0.26],
  [54.66, 'pop', 0.26],
  [58.22, 'chime', 0.3], //         COMBINATION
  [59.1, 'whoosh', 0.24],
  [60.92, 'pop', 0.26],
  [62.7, 'pop', 0.28],
  [63.6, 'pop', 0.28],
  [63.7, 'ding', 0.2],
  [64.3, 'whoosh', 0.24],
  [65.52, 'bubble', 0.28],
  [67.64, 'chime', 0.3], //         OILY
  [68.3, 'whoosh', 0.24],
  [68.38, 'pop', 0.24],
  [71.22, 'pop', 0.24],
  [72.86, 'impact', 0.3], //        LOOK CLOSELY
  [72.95, 'bubble', 0.26],
  [73.75, 'whoosh', 0.26],
  [74.06, 'pop', 0.26],
  [76.22, 'pop', 0.26],
  [77.04, 'pop', 0.26],
  [78.84, 'chime', 0.3], //         DRY
  [79.4, 'whoosh', 0.26],
  [79.5, 'bubble', 0.24],
  [79.7, 'bubble', 0.24],
  [79.9, 'bubble', 0.24],
  [80.1, 'bubble', 0.24],
  [80.92, 'ding', 0.24],
  [83.55, 'whoosh', 0.24],
  [84.4, 'pop', 0.26],
  [85.85, 'click', 0.4], //         Follow tapped
  [85.95, 'notif', 0.28],
  [86.62, 'whoosh', 0.24],
  [86.7, 'boing', 0.3], //          Bye!
  [87.2, 'swipe', 0.22],
];

/* ------------ music: subtle bed, ducked under speech ------------ */
type Chunk = {words: {start: number; end: number}[]};
const useMusicVolume = () =>
  useMemo(() => {
    const n = DURATION_IN_FRAMES;
    const speaking = new Array(n).fill(0);
    (captions as Chunk[]).forEach((c) =>
      c.words.forEach((w) => {
        for (let f = sec(w.start - 0.15); f <= sec(w.end + 0.25); f++) if (f >= 0 && f < n) speaking[f] = 1;
      }),
    );
    const vol = new Array(n).fill(0);
    const W = 12;
    for (let f = 0; f < n; f++) {
      let s = 0;
      let k = 0;
      for (let j = f - W; j <= f + W; j++)
        if (j >= 0 && j < n) {
          s += speaking[j];
          k++;
        }
      const sp = s / k;
      vol[f] = 0.06 * sp + 0.11 * (1 - sp);
    }
    return vol;
  }, []);

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  return (
    <>
      <Audio src={staticFile('audio/voice.wav')} volume={1} />
      <Audio
        src={staticFile('audio/music.wav')}
        volume={(f) => vol[Math.min(f, vol.length - 1)] * interpolate(f, [DURATION_IN_FRAMES - 30, DURATION_IN_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, sec(at))} durationInFrames={75} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

export const SkincareEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Backgrounds />
    <Behind />
    <Subject>
      <BakedTextCover />
    </Subject>
    <Front />
    <Covers />
    <Captions hideFrom={87.2} />
    <AudioMix />
  </AbsoluteFill>
);
