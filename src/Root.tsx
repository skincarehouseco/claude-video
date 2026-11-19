import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./lib/theme";
import { WhimsyVideo, editDuration } from "./WhimsyVideo";
import { edits } from "./edits";

export const RemotionRoot: React.FC = () => (
  <>
    {edits.map((e) => (
      <Composition key={e.id} id={e.id} component={WhimsyVideo} width={W} height={H} fps={FPS}
        durationInFrames={Math.round(editDuration(e) * FPS)} defaultProps={{ edit: e }} />
    ))}
  </>
);
