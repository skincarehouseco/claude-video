import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {MistToner} from './toner/MistToner';
import {DURATION as TONER_DURATION} from './toner/theme';

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
  <Composition id="MistToner" component={MistToner} durationInFrames={TONER_DURATION} fps={30} width={1080} height={1920} />
  </>
);
