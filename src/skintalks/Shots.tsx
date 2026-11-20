import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {c01, FPS, HOSTS, HOSTS_IMG, HostId, P, sec} from './theme';

/* Virtual multi-camera from the approved host image (1536x1024):
   - 'two'   : both hosts, framed in the middle with a soft blurred studio fill above/below
   - 'maya' / 'nadia' : 9:16 close-up crop of that host
   If an external lip-sync clip exists for a line, it replaces the still shot for that line. */

export type Shot = {line: string; kind: 'two' | HostId; start: number; end: number};
export type Line = {id: string; speaker: HostId; start: number; end: number; audio: string; energy: number[]; clip: string | null};

const IMG_W = 1536;
const IMG_H = 1024;

/** voice energy (0..1) of a host at frame f */
export const energyAt = (lines: Line[], host: HostId, f: number) => {
  const t = f / FPS;
  const L = lines.find((l) => l.speaker === host && t >= l.start && t < l.end);
  if (!L) return 0;
  const i = Math.floor((t - L.start) * FPS);
  return L.energy[Math.min(L.energy.length - 1, Math.max(0, i))] ?? 0;
};

const StillCloseUp: React.FC<{host: HostId; k: number}> = ({host, k}) => {
  // crop 576x1024 around the host, scaled to 1080x1920, slow push-in (k: 0..1 over the shot)
  const cx = HOSTS[host].face.x;
  const scale = 1920 / IMG_H; // 1.875
  const z = 1.0 + 0.06 * k;
  const left = -(cx * scale - 540);
  return (
    <AbsoluteFill style={{overflow: 'hidden', transform: `scale(${z})`, transformOrigin: `50% ${(HOSTS[host].face.y / IMG_H) * 100}%`}}>
      <Img src={staticFile(HOSTS_IMG)} style={{position: 'absolute', left, top: 0, width: IMG_W * scale, height: 1920}} />
    </AbsoluteFill>
  );
};

const StillTwoShot: React.FC<{k: number}> = ({k}) => {
  const w = 1080 * 1.6; // show both hosts large (image x ~ 320–1280)
  const h = (w * IMG_H) / IMG_W;
  const z = 1.0 + 0.04 * k;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: P.cream}}>
      {/* soft studio fill */}
      <Img src={staticFile(HOSTS_IMG)} style={{position: 'absolute', left: -700, top: -200, width: 2600, height: 2600 * (IMG_H / IMG_W), filter: 'blur(36px) brightness(1.05)', opacity: 0.9}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,249,241,0.55) 0%, rgba(255,249,241,0) 30%, rgba(255,249,241,0) 70%, rgba(255,249,241,0.6) 100%)'}} />
      <div style={{position: 'absolute', left: 540 - w * (800 / IMG_W), top: 300, width: w, height: h, transform: `scale(${z})`, transformOrigin: '50% 40%', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 8%, black 88%, transparent 100%)', maskImage: 'linear-gradient(180deg, transparent 0%, black 8%, black 88%, transparent 100%)'}}>
        <Img src={staticFile(HOSTS_IMG)} style={{width: '100%', height: '100%'}} />
      </div>
    </AbsoluteFill>
  );
};

export const ShotView: React.FC<{shot: Shot; line?: Line; hostClips?: Partial<Record<HostId, string>>}> = ({shot, line, hostClips = {}}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const k = c01((t - shot.start) / Math.max(0.5, shot.end - shot.start));
  const ke = Easing.inOut(Easing.sin)(k);
  // soft cut-in: tiny settle so every cut feels like a real camera switch
  const settle = interpolate(f - sec(shot.start), [0, 8], [1.025, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  // full-episode talking clip of this host (time-aligned with the episode timeline, so it can be cut in anywhere)
  const full = shot.kind !== 'two' ? hostClips[shot.kind] : undefined;
  if (full) {
    return (
      <AbsoluteFill style={{transform: `scale(${settle * (1 + 0.04 * ke)})`, transformOrigin: '50% 35%'}}>
        <OffthreadVideo src={staticFile(full)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    );
  }
  if (line?.clip) {
    return (
      <AbsoluteFill style={{transform: `scale(${settle})`}}>
        <OffthreadVideo src={staticFile(line.clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={{transform: `scale(${settle})`}}>{shot.kind === 'two' ? <StillTwoShot k={ke} /> : <StillCloseUp host={shot.kind} k={ke} />}</AbsoluteFill>;
};
