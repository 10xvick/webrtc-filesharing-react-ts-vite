import React, { useContext, useEffect } from "react";
import { connectionCtx } from "../peer_connection/connectionsetup";
import { DataConnection } from "peerjs";

export function VideoCalling() {
  const connection = useContext<DataConnection>(connectionCtx);
  useEffect(() => {}, []);
  return <>video</>;
}
