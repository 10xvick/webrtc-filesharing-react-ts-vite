import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { connectionCtx } from "../peer_connection/connectionsetup";
import { DataConnection, MediaConnection } from "peerjs";
import { useLocalStream } from "./streamManager";
import { VideoPerTrack } from "../widgets/components/videoElement";

export function VideoCalling() {
  const connection = useContext<DataConnection>(connectionCtx);
  // const [streams, setStreams] = useState<{ [key: string]: MediaStream }>({});
  const [calls, setcalls] = useState<MediaConnection[]>([]);
  const [call, setcall] = useState<MediaConnection>();
  const [localStream, settrackflags, trackflags, closeStream] =
    useLocalStream();
  const [remoteStream, setRemoteStream] = useState(new MediaStream());

  const callevents = (call: MediaConnection) => {
    if (!call) return;
    console.log("call updated", call.dataChannel, call);

    call.peerConnection.ontrack = (e) => {
      console.log("track found event", e);
      setRemoteStream(e.streams[0]);
    };

    call.peerConnection.ondatachannel = (e) => {
      console.log("data channel found event", e);
    };

    if (call.dataChannel)
      call.dataChannel.onopen = (dataChannel) => {
        console.log(
          "data channel found",
          dataChannel,
          connection.label,
          call.peerConnection
        );
        call.peerConnection.ontrack = (e) => {
          console.log("track found event", e);
          setRemoteStream(e.streams[0]);
        };
      };

    call.on("stream", (stream) => {
      console.log("remote stream received", stream.getTracks().length);
      setRemoteStream(stream);
    });
    call.on("close", () => {
      console.log("call closed");
    });
    call.on("error", () => {
      console.log("call error");
    });
  };

  const resetcall = (call_: MediaConnection) => {
    // call?.close();
    // remoteStream.getTracks().forEach((e) => e.stop());
    callevents(call_);
    setcall(call_);
    setcalls([...calls, call_]);
  };

  function makeCall() {
    if (!connection) return;
    // call?.close();
    const call_ = connection.provider.call(connection.peer, localStream);
    resetcall(call_);
  }

  useEffect(() => {
    if (!connection) return;
    connection.provider.on("call", (call) => {
      console.log("call requested", localStream.getTracks().length);
      const stream = new MediaStream();
      call.answer(stream);

      const addtrack = async () => {
        const track = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        call.peerConnection.addTrack(track.getTracks()[0]);
        // stream.addTrack(track.getTracks()[0]);
        console.log("track added", track.getTracks().length);
      };
      setTimeout(addtrack, 5000);

      resetcall(call);
    });
  }, [connection]);

  useEffect(() => {
    if (localStream.getTracks().length === 0 && calls.length === 0) return;
    // call?.answer(localStream);
    // makeCall();
  }, [localStream]);

  useEffect(() => {
    console.log("calls", calls);
  }, [calls]);

  return (
    <div>
      <button onClick={makeCall}>call</button>
      <button
        onClick={() =>
          settrackflags((flags) => ({ ...flags, camV: !flags.camV }))
        }
      >
        toggle Webcam
      </button>
      <button
        onClick={() =>
          settrackflags((flags) => ({ ...flags, camA: flags.camA }))
        }
      >
        toggle mic
      </button>
      <button
        onClick={() =>
          settrackflags((flags) => ({ ...flags, screenV: !flags.screenV }))
        }
      >
        toggle screen sharing
      </button>
      <button
        onClick={() =>
          settrackflags((flags) => ({ ...flags, screenA: flags.screenA }))
        }
      >
        toggle system mic
      </button>
      <hr />
      localstreams
      <VideoPerTrack stream={localStream} />
      <hr />
      remotestreams {remoteStream.getTracks().length}
      <VideoPerTrack stream={remoteStream} />
      {/* <VideoList streams={remoteStream} /> */}
    </div>
  );
}
