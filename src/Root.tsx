import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {PestanaEdit} from './pestana/PestanaEdit';
import {DURATION_IN_FRAMES as PESTANA_FRAMES, FPS as PESTANA_FPS} from './pestana/timeline';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PestanaEdit" component={PestanaEdit} durationInFrames={PESTANA_FRAMES} fps={PESTANA_FPS} width={1080} height={1920} />
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
