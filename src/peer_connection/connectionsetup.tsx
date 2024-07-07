import React, { createContext } from "react";
import Peer, { DataConnection } from "peerjs";
import { useEffect, useState } from "react";
import { Filesharing, debug } from "../filesharing/filesharing";
import { Messages } from "../messenger/messenger";
import { VideoCalling } from "../videocalling/videocalling";
import { WEBRTCVC } from "../videocalling/webrtc/webrtcVC";

export const connectionparams = {
  initiator: false,
};

export const optimizer = {
  chunks: {} as any,
  chunksize: 1024 * 1024,
};

const peer = new Peer();
console.log("peer", peer);

export const connectionCtx = createContext<DataConnection | any>(null);

export function PeerApp() {
  const [id, setid] = useState("");
  const [target, settarget] = useState("");
  const [connections, setconnections] = useState<{
    [key: string]: DataConnection;
  }>({});
  const [connection, setconnection] = useState<DataConnection>();

  function onopen(connection: DataConnection) {
    console.log(
      "connected",
      connection.peer,
      connection.provider.id,
      connection.peerConnection,
      connection
    );
    connection.on("open", () => {
      setconnection(connection);
      setconnections({ ...connections, [connection.peer]: connection });
      console.log("handshake", connection);
    });
  }

  useEffect(() => {
    peer.on("open", (id: string) => {
      console.log("initialised with id:" + id);
      setid(id);
      peer.on("connection", (connection: DataConnection) => {
        onopen(connection);
      });
    });

    peer.on("error", (e: Error) => {
      alert(e.message);
      console.warn("webrtc error", e);
    });

    debug();
  }, []);

  function connect() {
    const connection = peer.connect(target);
    if (!connection)
      return alert("could not connect. make sure target id is correct");
    onopen(connection);
    connectionparams.initiator = true;
  }

  return (
    <connectionCtx.Provider value={connection}>
      <div>peer id : {id}</div>
      connect to :
      <input
        value={target}
        onInput={(e: any) => {
          settarget(e.target?.value);
        }}
      />
      <button onClick={connect}>connect</button>
      <br />
      <select
        aria-placeholder="select connection"
        name="connections"
        onChange={(e: any) => setconnection(connections[e.target.value])}
      >
        {Object.keys(connections).map((conn) => (
          <option key={conn} value={conn}>
            {conn}
          </option>
        ))}
      </select>
      <div>
        connection from {connection?.provider?.id} to {connection?.peer}
      </div>
      <hr />
      {connection && (
        <div>
          <hr />
          [Filesharing]
          <Filesharing />
          <hr />
          [Messages]
          <Messages />
          <hr />
          <hr />
          [VideoCalling]
          <VideoCalling />
          <hr />
          [VideoCalling_webrtc]
          <WEBRTCVC />
        </div>
      )}
    </connectionCtx.Provider>
  );
}
