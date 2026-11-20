import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, captionFont, SAFE, SAFE_CENTER_X} from '../theme';
import {LashCamera} from './Camera';
import {LashGraphics, PixelSparkle} from './Graphics';
import {f, LASH_FPS, LYRICS, SECTION_CUTS} from './timeline';

/* ------------ word-synced lyric captions (soft butter yellow, regular weight) ------------ */
const CAPTION_Y = 1340; // lower-middle, well above TikTok's caption/UI area (safe bottom = 1490)
const LyricCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / LASH_FPS;
  const chunk = LYRICS.find((c) => t >= c.start && t < c.end);
  if (!chunk) return null;
  const enter = spring({frame: frame - f(chunk.start), fps, config: {damping: 14, stiffness: 170, mass: 0.6}});
  const exit = interpolate(frame, [f(chunk.end) - 5, f(chunk.end)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const note = (side: number) => (
    <span
      style={{
        fontFamily: captionFont,
        fontSize: 52,
        color: C.pink,
        display: 'inline-block',
        transform: `translateY(${Math.sin(frame / 6 + side) * 5}px) rotate(${side * 10}deg)`,
        WebkitTextStroke: '5px #4B3340',
        paintOrder: 'stroke fill',
      }}
    >
      ♪
    </span>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: CAPTION_Y - 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        columnGap: 16,
        opacity: Math.min(enter, exit),
        transform: `translateY(${(1 - enter) * 20}px) scale(${0.92 + 0.08 * enter})`,
      }}
    >
      {note(-1)}
      {chunk.words.map((w, i) => {
        const said = t >= w.start - 0.03;
        const active = said && t < w.end + 0.05;
        const bump = said ? spring({frame: frame - f(w.start - 0.03), fps, config: {damping: 9, stiffness: 240, mass: 0.4}}) : 0;
        const pop = active ? Math.sin(Math.min(1, bump) * Math.PI) : 0;
        return (
          <span
            key={i}
            style={{
              fontFamily: captionFont,
              fontWeight: 400,
              fontSize: 70,
              lineHeight: 1.15,
              letterSpacing: 0.5,
              color: C.butter,
              opacity: said ? 1 : 0.45, // upcoming words wait softly, then light up as they are sung
              display: 'inline-block',
              transform: `translateY(${-pop * 8}px) scale(${1 + pop * 0.08})`,
              WebkitTextStroke: '6px #4B3340',
              paintOrder: 'stroke fill',
              textShadow: '0 4px 14px rgba(40,22,32,0.5)',
            }}
          >
            {w.text}
          </span>
        );
      })}
      {note(1)}
      {/* tiny sparkle that hops to the word being sung */}
      <div style={{position: 'absolute', right: 40, top: -24, opacity: 0.9}}>
        <PixelSparkle size={30} phase={frame} />
      </div>
    </div>
  );
};

/* ------------ audio: original track untouched, light SFX tucked underneath ------------ */
type Sfx = [number, string, number]; // [frame, name, volume]
const SFX: Sfx[] = [
  [1, 'pop', 0.16], // comment bubble
  [3, 'sparkle', 0.1],
  ...SECTION_CUTS.map((c) => [c - 5, 'whoosh', 0.09] as Sfx),
  ...SECTION_CUTS.filter((c) => c !== 410).map((c) => [c + 3, 'pop', 0.12] as Sfx),
  [102 + 14, 'sparkle', 0.08], // sprout grows
  [216 + 12, 'boing', 0.1], // jelly drops
  [298 + 6, 'sparkle', 0.07], // droplets
  [410 + 5, 'sparkle', 0.12], // CTA burst
  [410 + 6, 'ding', 0.12],
];

const AudioMix: React.FC = () => (
  <>
    {/* the creator's original sound, full level */}
    <Audio src={staticFile('lash/original.wav')} volume={1} />
    {SFX.map(([at, name, v], i) => (
      <Sequence key={i} from={Math.max(0, at)} durationInFrames={45} layout="none">
        <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

export const LashEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <LashCamera />
    <LashGraphics />
    <LyricCaptions />
    <AudioMix />
  </AbsoluteFill>
);

export {SAFE_CENTER_X};
