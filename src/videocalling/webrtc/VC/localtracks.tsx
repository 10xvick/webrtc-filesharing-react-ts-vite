import { useState } from "react";
import { capturetrack } from "./mediacapturing";
import { wrtc } from "../webrtcVC";
import { VideoPerTracks } from "../../../widgets/components/videoElement";

export const LocalTracks = ({ type }: { type: string }) => {
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);
  const [sender, setSender] = useState<RTCRtpSender | null>(null);

  const handleStart = async () => {
    handleStop();

    const newTrack = await capturetrack[type]();
    setTrack(newTrack);
    if (sender) sender.replaceTrack(newTrack);
    else {
      const newSender = wrtc.peerconnection.addTrack(newTrack);
      setSender(newSender);
    }
  };

  const handleStop = () => {
    if (sender) {
      sender.track?.stop();
      setTrack(null);
    }
  };

  return (
    <div>
      {type}
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <VideoPerTracks tracks={[track]} />
    </div>
  );
};
