import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { VideoElement } from "./videoElement";

const initialtrackflags_ = {
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
    const meainstream = new MediaStream();

    if (trackflags.camA || trackflags.camV) {
      const camstream = await navigator.mediaDevices.getUserMedia({
        video: trackflags.camV,
        audio: trackflags.camA,
      });
      camstream?.getTracks().forEach((e) => meainstream.addTrack(e));
    }

    if (trackflags.screenA || trackflags.screenV) {
      const screenstream = await navigator.mediaDevices.getDisplayMedia({
        video: trackflags.screenV,
        audio: trackflags.screenA,
      });
      screenstream?.getTracks().forEach((e) => meainstream.addTrack(e));
    }
    // stop old stream tracks
    stream.getTracks().forEach((e) => e.stop());
    setstream(meainstream);
  };

  useEffect(() => {
    fetchstreams();
  }, [trackflags]);

  const closestream = () => {
    setstream(new MediaStream());
  };

  return [stream, settrackflags, trackflags, closestream];
};

export const VideoPerTrack = ({ stream }: { stream: MediaStream }) => {
  const [streams, setstreams] = useState<MediaStream[]>([]);

  useEffect(() => {
    if (!stream) return;
    const streams: MediaStream[] = [];
    stream.getVideoTracks().forEach((e) => {
      streams.push(new MediaStream([e]));
    });
    setstreams(streams);
  }, [stream]);

  return (
    <div>
      {streams.map((e) => (
        <VideoElement key={e.id} srcObject={e} />
      ))}
    </div>
  );
};
