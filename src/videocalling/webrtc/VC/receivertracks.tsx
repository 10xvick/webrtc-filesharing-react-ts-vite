import { useEffect, useState } from "react";
import { VideoPerTracks } from "../../../widgets/components/videoElement";

export const ReceiverTracks = ({
  type,
  receivers,
}: {
  type: string;
  receivers: Array<RTCRtpReceiver | RTCRtpSender>;
}) => {
  const [tracks, settracks] = useState<MediaStreamTrack[]>([]);
  const [stats, setstats] = useState<string>("");
  useEffect(() => {
    let temp: MediaStreamTrack[] = [];
    receivers.forEach((e) => {
      if (e.track) temp.push(e.track);
    });

    settracks(temp.filter((e) => e.muted === false));
    setstats(`
        total ${type}s: ${receivers.length}
        total tracks: ${temp.length}
        muted tracks: ${temp.filter((e) => e.muted).length}
        `);
  }, [receivers]);
  return (
    <div>
      <pre>{stats}</pre>
      <VideoPerTracks tracks={tracks} />
    </div>
  );
};
