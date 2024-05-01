import Peer, { DataConnection } from "peerjs";
import { useEffect, useState } from "react";

const peer = new Peer();

export function PeerApp() {
  const [id, setid] = useState("");
  const [target, settarget] = useState("");

  useEffect(() => {
    peer.on("open", (id: string) => {
      console.log("this is my peer id " + id);
      setid(id);

      peer.on("connection", (conn: DataConnection) => {
        conn.on("data", (data: unknown) => {
          console.log("connection made", data);
        });
      });

      //
    });
  }, []);

  function connect() {
    const connection = peer.connect(target);
    if (!connection) {
      alert("could not connect. make sure target id is correct");
      return;
    }
    connection.on("open", () => {
      connection.send("Hi!! lets share some files!");
    });
  }

  return (
    <>
      <div>peer id : {id}</div>
      connect to :{" "}
      <input
        value={target}
        onInput={(e: any) => {
          settarget(e.target?.value);
        }}
      />{" "}
      <button onClick={connect}>connect</button>
    </>
  );
}
