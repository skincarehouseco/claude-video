import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {LashEdit} from './lash/LashEdit';
import {DURATION_IN_FRAMES as LASH_FRAMES, FPS as LASH_FPS} from './lash/theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="WhimsyEdit"
      component={WhimsyEdit}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="LashEdit"
      component={LashEdit}
      durationInFrames={LASH_FRAMES}
      fps={LASH_FPS}
      width={1080}
      height={1920}
    />
  </>
);
