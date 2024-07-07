export const capturetrack: { [key: string]: () => Promise<MediaStreamTrack> } =
  {
    cameraV: async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      return stream.getVideoTracks()[0];
    },
    cameraA: async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      return stream.getAudioTracks()[0];
    },
    screenV: async () => {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      return stream.getVideoTracks()[0];
    },
    screenA: async () => {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: true,
      });
      return stream.getAudioTracks()[0];
    },
  };
