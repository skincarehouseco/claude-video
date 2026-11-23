import React from 'react';
import {Composition} from 'remotion';
import {LashEdit} from './LashEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="LashEdit" component={LashEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
);
