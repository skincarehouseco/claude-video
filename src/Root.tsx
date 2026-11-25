import React from 'react';
import {Composition} from 'remotion';
import {SkincareEdit} from './Edit';
import {DURATION_IN_FRAMES, FPS} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="SkincareEdit" component={SkincareEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
);
