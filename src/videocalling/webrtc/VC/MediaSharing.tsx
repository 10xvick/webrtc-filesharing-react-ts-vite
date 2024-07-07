import { useEffect, useState } from "react";
import { wrtc } from "../webrtcVC";
import { ReceiverTracks } from "./receivertracks";
import { LocalTracks } from "./localtracks";

export function MediaSharing() {
  const [receivers, setreceivers] = useState<RTCRtpReceiver[]>([]);

  const updatereceivers = () => {
    setreceivers(wrtc.peerconnection.getReceivers());
  };

  useEffect(() => {
    wrtc.peerconnection.ontrack = (e) => {
      console.log("ontrack: new track was added", e.track);

      e.track.onmute = (ex) => {
        console.log("track muted", ex);
        updatereceivers();
      };

      e.track.onunmute = (ex) => {
        console.log("track unmuted", ex);
        updatereceivers();
      };
    };
  }, []);

  return (
    <div>
      <ReceiverTracks type="receiver" receivers={receivers} />
      <hr />
      <LocalTracks type="cameraA" />
      <LocalTracks type="cameraV" />
      <LocalTracks type="screenV" />
    </div>
  );
}
