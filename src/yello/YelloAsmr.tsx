import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import cues from '../../deliverables/yello_asmr/cues.json';
import clips from './clips.json';

/* yello OTMS crushing ASMR — assembly.
   Video: AI-generated clips in public/yello/clips/ (A = 0–5 s handling/first press, B = 5–15 s crushing), listed in clips.json.
   Audio: public/yello/yello_asmr_audio.wav, rendered by scripts/asmr_crunch.py from deliverables/yello_asmr/cues.json.
   Without clips it renders a sync preview: the real product photo that nudges on every crack, so the audio timing can be
   heard and checked. No music, no voice, no captions. */

const FPS = 30;
export const YA_DURATION = 15 * FPS;
type Ev = {type: string; at?: number; size?: number};
const CRACKS = (cues.events as Ev[]).filter((e) => e.type === 'crack').map((e) => ({at: e.at as number, size: e.size ?? 1}));
const C = clips as {A?: number; B?: number};

const Preview: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let k = 0;
  for (const c of CRACKS) {
    const d = t - c.at;
    if (d >= 0 && d < 0.25) k = Math.max(k, c.size * Math.exp(-d * 18));
  }
  const press = t < 3 ? 0 : Math.min(1, (t - 3) / 12);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #FFF6DE, #F5DFA8)', justifyContent: 'center', alignItems: 'center'}}>
      <Img
        src={staticFile('yello/product.png')}
        style={{
          width: 1500,
          transform: `translate(${Math.sin(f * 2.3) * 6 * k}px, ${Math.cos(f * 1.7) * 4 * k}px) scale(${1 + 0.02 * Math.sin(t * 1.4) * (t < 3 ? 1 : 0)}, ${1 - 0.05 * press - 0.012 * k}) rotate(${t < 3 ? Math.sin(t * 1.2) * 4 : 0}deg)`,
          filter: `brightness(${1 + 0.06 * k})`,
          mixBlendMode: 'multiply',
        }}
      />
      <div style={{position: 'absolute', bottom: 260, fontFamily: 'sans-serif', fontSize: 30, color: '#8a6d3b', letterSpacing: 2}}>AUDIO SYNC PREVIEW · not the final video</div>
    </AbsoluteFill>
  );
};

export const YelloAsmr: React.FC = () => (
  <AbsoluteFill style={{background: '#F5DFA8'}}>
    {C.A && C.B ? (
      <>
        <Sequence from={0} durationInFrames={5 * FPS}>
          <OffthreadVideo src={staticFile('yello/clips/A.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Sequence>
        <Sequence from={5 * FPS} durationInFrames={10 * FPS}>
          <OffthreadVideo src={staticFile('yello/clips/B.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Sequence>
      </>
    ) : (
      <Preview />
    )}
    <Audio src={staticFile('yello/yello_asmr_audio.wav')} />
  </AbsoluteFill>
);
