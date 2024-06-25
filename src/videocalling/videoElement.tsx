import { useEffect, useRef } from "react";

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
