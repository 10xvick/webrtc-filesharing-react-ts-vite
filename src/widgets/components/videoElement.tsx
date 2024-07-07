import { useEffect, useRef, useState } from "react";

export const VideoElement = ({ srcObject }: { srcObject: MediaStream }) => {
  const ref = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = srcObject;
    return () => {
      if (ref.current) ref.current.srcObject = null;
    };
  }, [srcObject]);

  return (
    <div>
      <video
        ref={ref}
        style={{ width: "400px", background: "brown" }}
        autoPlay
      />
    </div>
  );
};

export const VideoPerTrack = ({ stream }: { stream: MediaStream }) => {
  const [streams, setstreams] = useState<MediaStream[]>([]);

  useEffect(() => {
    if (!stream) return;
    const streams: MediaStream[] = [];
    stream.getTracks().forEach((e) => {
      streams.push(new MediaStream([e]));
    });
    setstreams(streams);
    console.log(streams);
  }, [stream]);

  return (
    <div>
      {streams.map((e) => (
        <VideoElement key={e.id} srcObject={e} />
      ))}
    </div>
  );
};

export const VideoPerTracks = ({
  tracks,
}: {
  tracks: (MediaStreamTrack | null)[];
}) => {
  const [streams, setstreams] = useState<MediaStream[]>([]);
  useEffect(() => {
    const streams: MediaStream[] = [];
    tracks.forEach((e) => {
      if (e && e.muted === false) streams.push(new MediaStream([e]));
    });

    setstreams(streams);

    return () => {
      // streams.forEach((stream) => {
      //   stream.getTracks().forEach((t) => {
      //     t.stop();
      //     stream.removeTrack(t);
      //   });
      // });
    };
  }, [tracks]);

  return (
    <div>
      {streams.map((e) => (
        <VideoElement key={e.id} srcObject={e} />
      ))}
    </div>
  );
};
