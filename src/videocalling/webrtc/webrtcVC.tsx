import { useContext, useEffect, useState } from "react";
import { WebRTCInit } from "./connectionsetup/connectionsetup";
import {
  connectionCtx,
  connectionparams,
} from "../../peer_connection/connectionsetup";
import { DataConnection } from "peerjs";
import { InputButton } from "../../widgets/components/inputbutton";
import { MediaSharing } from "./VC/MediaSharing";
import { Messenger_wrtc } from "./MSG/messenger";
import { useNegotiateUsingPeerjsCloud } from "./connectionsetup/negotiation/negotiateUsingPeerjsConnection";

export const wrtc = WebRTCInit();

const useConnectionStatus = ({ rtc }: { rtc: typeof wrtc }) => {
  const [signalingstate, setsignalingstate] = useState("disconnected");
  useEffect(() => {
    console.log("signalingStatechangex", rtc.peerconnection.signalingState);
    setsignalingstate(rtc.peerconnection.signalingState);
  }, [rtc.peerconnection.signalingState]);
  return { signalingstate: signalingstate };
};

export const WEBRTCVC = () => {
  useNegotiateUsingPeerjsCloud();
  const { signalingstate } = useConnectionStatus({ rtc: wrtc });

  return (
    <div>
      connection status : {signalingstate}
      {/* <NegotiateManually /> */}
      <Messenger_wrtc />
      <MediaSharing />
    </div>
  );
};
