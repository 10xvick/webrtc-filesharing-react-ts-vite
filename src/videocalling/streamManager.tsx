import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { VideoElement } from "../widgets/components/videoElement";

export const initialtrackflags_ = {
  camA: false,
  camV: false,
  screenA: false,
  screenV: false,
};

export const useLocalStream = (
  initialtrackflags = initialtrackflags_
): [
  MediaStream,
  Dispatch<SetStateAction<typeof initialtrackflags_>>,
  typeof initialtrackflags,
  () => void
] => {
  const [stream, setstream] = useState(new MediaStream());
  const [trackflags, settrackflags] = useState(initialtrackflags);

  const fetchstreams = async () => {
    stream.getTracks().forEach((e) => {
      e.stop();
      stream.removeTrack(e);
    });

    if (trackflags.camA || trackflags.camV) {
      const camstream = await navigator.mediaDevices.getUserMedia({
        video: trackflags.camV,
        audio: trackflags.camA,
      });
      camstream?.getTracks().forEach((e) => stream.addTrack(e));
    }

    if (trackflags.screenA || trackflags.screenV) {
      const screenstream = await navigator.mediaDevices.getDisplayMedia({
        video: trackflags.screenV,
        audio: trackflags.screenA,
      });
      screenstream?.getTracks().forEach((e) => stream.addTrack(e));
    }

    setstream(stream);
  };

  useEffect(() => {
    fetchstreams();
  }, [trackflags]);

  const closestream = () => {
    setstream(new MediaStream());
  };

  return [stream, settrackflags, trackflags, closestream];
};
