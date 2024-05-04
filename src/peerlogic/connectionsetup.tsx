import React, { SetStateAction } from "react";
import Peer, { DataConnection } from "peerjs";
import { useEffect, useState } from "react";

const peer = new Peer();

export function PeerApp() {
  const [id, setid] = useState("");
  const [target, settarget] = useState("");
  const [connections, setconnections] = useState<
    SetStateAction<Array<DataConnection>> | any
  >([]);
  const [message, setmessage] = useState<SetStateAction<string>>("");

  function onopen(connection: DataConnection) {
    connection.on("open", () => {
      setconnections({ ...connections, [connection.peer]: connection });
      console.log("handshake", connection);
    });

    connection.on("data", (data) => {
      console.log(data);
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

    peer.on("error", (e) => {
      console.warn("webrtc error", e);
    });
  }, []);

  function connect() {
    const connection = peer.connect(target);
    if (!connection) {
      alert("could not connect. make sure target id is correct");
      return;
    }

    onopen(connection);
  }

  return (
    <>
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
      <input
        onInput={(e: any) => {
          setmessage(e.target?.value);
        }}
      />
      {Object.keys(connections).map((conn) => (
        <button
          key={conn}
          onClick={() => {
            const connection = connections[conn];
            connection.send(message);
          }}
        >
          {conn}
        </button>
      ))}
    </>
  );
}
