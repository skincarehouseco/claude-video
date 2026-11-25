import React from 'react';
import {Composition} from 'remotion';
import {SkincareEdit} from './Edit';
import {AcneEducation, ACNE_DURATION, OTMS_DURATION, OtmsVariation} from './otms/Otms';
import {NofaEdit, NOFA_FRAMES} from './nofa/Nofa';
import {DURATION_IN_FRAMES, FPS} from './theme';

const V = ['A', 'B', 'C', 'D', 'E'] as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SkincareEdit" component={SkincareEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
    {V.map((v) => (
      <Composition key={v} id={`OTMS-01${v}`} component={OtmsVariation} defaultProps={{variant: v}} durationInFrames={Math.round(OTMS_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    ))}
    <Composition id="Nofa" component={NofaEdit} durationInFrames={NOFA_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="OTMS-02" component={AcneEducation} durationInFrames={Math.round(ACNE_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
