import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {APPEAR, CUT_END, CUT_SHELF, FPS, P, REMOVE, sec} from './data';

const ease = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);
const c01 = (x: number) => Math.min(1, Math.max(0, x));

/* how "focused on the pair" the shelf camera is (0..1) */
const pairFocus = (t: number) => {
  let v = 0;
  APPEAR.forEach((a, i) => {
    const r = REMOVE[i] ?? CUT_END + 1;
    if (t >= a && t < r) v = ease(c01((t - a) / 1.2));
    if (t >= r && t < r + 0.8) v = 1 - ease(c01((t - r) / 0.8));
  });
  return v;
};

/** camera scale stays within ~1.00–1.08, purposeful moves only */
export const zoomAt = (t: number) => {
  if (t < CUT_SHELF) return 1.0 + 0.06 * ease(c01(t / CUT_SHELF)); // slow push-in on the hook
  if (t < CUT_END) return 1.0 + 0.012 * Math.sin((t - CUT_SHELF) / 2.5) + 0.05 * pairFocus(t); // ease onto each pair
  return 1.08 - 0.08 * easeOut(c01((t - CUT_END) / 2.0)); // gentle zoom-out to close
};
const originAt = (t: number) => (t < CUT_SHELF ? '50% 42%' : t < CUT_END ? '56% 64%' : '50% 46%');

/** graded footage (public/otms/beige.mp4) with a soft settle on each real cut */
export const Camera: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let settle = 1;
  for (const c of [CUT_SHELF, CUT_END]) {
    if (t >= c && t < c + 1.2) settle = 1 + 0.035 * (1 - spring({frame: f - sec(c), fps: FPS, config: {damping: 14, stiffness: 120, mass: 0.8}}));
  }
  const handShot = t < CUT_SHELF || t >= CUT_END;
  const style: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover'};
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: P.cream}}>
      <AbsoluteFill style={{transform: `scale(${(zoomAt(t) * settle).toFixed(5)})`, transformOrigin: originAt(t)}}>
        <OffthreadVideo src={staticFile('otms/beige.mp4')} muted style={style} />
        {/* hand shots: lens-style focus falloff + warm beige wash on the busy stock shelves at the frame edges
            (no AI matting: tested masks were unstable on the hand, so a mask-free treatment keeps it realistic) */}
        {handShot && (
          <AbsoluteFill
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 58% 44% at 50% 50%, transparent 55%, black 100%)',
              maskImage: 'radial-gradient(ellipse 58% 44% at 50% 50%, transparent 55%, black 100%)',
            }}
          >
            <OffthreadVideo src={staticFile('otms/beige.mp4')} muted style={{...style, filter: 'blur(14px) saturate(0.9)'}} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      {handShot && <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(255,249,241,0) 55%, rgba(236,224,208,0.22) 100%)'}} />}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------
   Studio light: soft daylight from a window (top-left) + slowly drifting dappled leaf shadows,
   plus out-of-focus greenery in the foreground corners. Subtle by design.
   ------------------------------------------------------------------ */
const LEAF = 'M0 -40 C22 -30 26 10 0 40 C-26 10 -22 -30 0 -40Z';
export const StudioLight: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const shelf = t >= CUT_SHELF && t < CUT_END;
  const drift = Math.sin(f / 70) * 18;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* warm window light */}
      <AbsoluteFill style={{background: 'linear-gradient(128deg, rgba(255,247,232,0.12) 0%, rgba(255,247,232,0.04) 35%, rgba(255,247,232,0) 60%)', mixBlendMode: 'screen'}} />
      {/* dappled leaf shadows on the shelf wall */}
      {shelf && (
        <svg width={1080} height={1920} style={{position: 'absolute', mixBlendMode: 'multiply', opacity: 0.1, filter: 'blur(16px)'}}>
          <g transform={`translate(${drift} ${drift * 0.4}) rotate(-24 900 300)`} fill="#8A7A62">
            {Array.from({length: 14}).map((_, i) => {
              const x = 640 + (i % 4) * 110 + Math.sin(i * 2.1) * 40;
              const y = 120 + Math.floor(i / 4) * 150 + Math.cos(i * 1.7) * 30;
              return <path key={i} d={LEAF} transform={`translate(${x} ${y}) rotate(${i * 37 + Math.sin(f / 50 + i) * 6}) scale(${1.6 + (i % 3) * 0.4})`} />;
            })}
            <path d="M560 -40 C760 120 900 300 1180 420" stroke="#8A7A62" strokeWidth={14} fill="none" />
          </g>
        </svg>
      )}
      {/* soft-focus greenery in the foreground corners (decorative, outside the key safe area) */}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: 'blur(6px)', opacity: 0.6}}>
        <g transform={`translate(1010 40) rotate(${200 + Math.sin(f / 45) * 4})`} fill={P.sage}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={LEAF} transform={`translate(${i * 26} ${i * 70}) rotate(${(i % 2 ? 1 : -1) * 48}) scale(1.7)`} opacity={0.75 - i * 0.06} />
          ))}
          <path d="M0 0 C20 120 60 230 120 330" stroke={P.sageDeep} strokeWidth={6} fill="none" opacity={0.6} />
        </g>
        <g transform={`translate(30 1880) rotate(${-20 + Math.sin(f / 55) * 4})`} fill={P.sage}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={LEAF} transform={`translate(${i * 40} ${-i * 60}) rotate(${(i % 2 ? 1 : -1) * 50 + 30}) scale(1.5)`} opacity={0.6} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* soft cream light-leak dip used on the two real cuts */
export const LightLeak: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const k = f - sec(at);
  if (k < -8 || k > 12) return null;
  const o = interpolate(k, [-8, 0, 12], [0, 0.75, 0], {easing: Easing.inOut(Easing.sin)});
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 60% at ${40 + k}% 40%, ${P.warmWhite} 0%, rgba(255,246,230,0.85) 45%, rgba(246,228,205,0.4) 100%)`, opacity: o}} />;
};

/* gentle bloom over the stop-motion product swaps so the jump feels like a little moment of magic */
export const SwapBloom: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const k = f - sec(at);
  if (k < -2 || k > 8) return null;
  const o = interpolate(k, [-2, 0, 8], [0, 0.32, 0]);
  return <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 60%, rgba(255,253,246,1) 0%, rgba(255,250,240,0.6) 40%, rgba(255,250,240,0) 75%)', opacity: o}} />;
};
