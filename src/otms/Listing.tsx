import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

/* In-app TikTok text look (as in the reference): TikTok Sans, white, centred, a thin dark edge + soft shadow,
   ✅ bullets, the whole list on screen for the whole video. */
export const TT = 'TikTokSans';

export type Line = {t: string; bold?: boolean; check?: boolean; gap?: boolean};

const EMOJI: Record<string, string> = {heart: '1f9e1', shh: '1f92b', drop: '1f4a7', plead: '1f97a', sparkles: '2728'};

const Rich: React.FC<{text: string; size: number}> = ({text, size}) => (
  <>
    {text.split(/(:[a-z]+:)/).map((part, i) => {
      const m = part.match(/^:([a-z]+):$/);
      if (m && EMOJI[m[1]])
        return <Img key={i} src={staticFile(`emoji/${EMOJI[m[1]]}.svg`)} style={{width: size * 0.92, height: size * 0.92, verticalAlign: '-0.13em', marginLeft: 4}} />;
      return <React.Fragment key={i}>{part}</React.Fragment>;
    })}
  </>
);

export const textStyle = (size: number, weight: number): React.CSSProperties => ({
  fontFamily: TT,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 1.16,
  color: '#fff',
  textAlign: 'center',
  letterSpacing: -0.2,
  WebkitTextStroke: `${(size / 26).toFixed(1)}px rgba(20,14,10,0.85)`,
  paintOrder: 'stroke fill',
  textShadow: '0 2px 4px rgba(0,0,0,0.35)',
});

export const Listing: React.FC<{lines: Line[]; size: number; top: number; width?: number}> = ({lines, size, top, width = 860}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: (1080 - width) / 2 - 45, width, top, opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {lines.map((l, i) =>
        l.gap ? (
          <div key={i} style={{height: size * 0.6}} />
        ) : (
          <div key={i} style={{...textStyle(size, l.bold ? 800 : 700), marginBottom: size * 0.06, whiteSpace: 'nowrap'}}>
            {l.check && <Img src={staticFile('emoji/2705.svg')} style={{width: size * 0.9, height: size * 0.9, verticalAlign: '-0.12em', marginRight: size * 0.18}} />}
            <Rich text={l.t} size={size} />
          </div>
        ),
      )}
    </div>
  );
};

/** TikTok "reply to comment" sticker (from the reference post's cover) */
export const ReplySticker: React.FC<{text: string; top: number}> = ({text, top}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top, left: 0, width: 990, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{background: '#fff', borderRadius: 18, padding: '14px 22px 16px', maxWidth: 640, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', fontFamily: TT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#F6C26B,#E8954A)'}} />
          <div style={{fontSize: 22, color: '#8A8B91', fontWeight: 600}}>Reply to comment</div>
        </div>
        <div style={{fontSize: 30, color: '#161823', fontWeight: 700, marginTop: 6, lineHeight: 1.22}}>
          <Rich text={text} size={30} />
        </div>
      </div>
    </div>
  );
};

/** soft dark wash behind the list so white text stays readable over bright yellow footage */
export const TextWash: React.FC<{from?: number; to?: number; strength?: number}> = ({from = 0.08, to = 0.72, strength = 0.38}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(rgba(20,12,6,${strength * 0.6}) ${from * 100}%, rgba(20,12,6,${strength}) ${((from + to) / 2) * 100}%, rgba(20,12,6,${strength * 0.5}) ${to * 100}%, rgba(20,12,6,0) ${Math.min(1, to + 0.12) * 100}%)`,
    }}
  />
);
