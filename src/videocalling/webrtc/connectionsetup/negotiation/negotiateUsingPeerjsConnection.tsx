import { DataConnection } from "peerjs";
import { useContext, useEffect } from "react";
import {
  connectionCtx,
  connectionparams,
} from "../../../../peer_connection/connectionsetup";
import { wrtc } from "../../webrtcVC";

export const useNegotiateUsingPeerjsCloud = () => {
  const connection = useContext<DataConnection>(connectionCtx);

  useEffect(() => {
    if (!connection) return;
    console.log(
      "using peerjs connection to establish webrtc connection...",
      connection
    );
    const sendoffer = async () => {
      const offer = await wrtc.createoffer();
      connection.send(offer);
    };
    if (connectionparams.initiator) sendoffer();

    connection.on("data", async (data: any) => {
      if (data.type == "offer") {
        const answer = await wrtc.createanswer(data);
        connection.send(answer);
      }
      if (data.type == "answer") {
        await wrtc.setremotedescription(data);
        console.log("negotiated by peerjs signaling");
      }
    });
  }, [connection]);
  return [connection];
};
