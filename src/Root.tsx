import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {LashEdit} from './lash/LashEdit';
import {LASH_FPS, LASH_FRAMES} from './lash/timeline';
import {DURATION_IN_FRAMES, FPS} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="LashEdit" component={LashEdit} durationInFrames={LASH_FRAMES} fps={LASH_FPS} width={1080} height={1920} />
  </>
);
