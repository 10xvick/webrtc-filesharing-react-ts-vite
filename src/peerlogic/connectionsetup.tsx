import { SetStateAction } from "react";
import Peer, { DataConnection } from "peerjs";
import { useEffect, useState } from "react";

const peer = new Peer();

export function PeerApp() {
  const [id, setid] = useState("");
  const [target, settarget] = useState("");
  const [connections, setconnections] = useState<{
    [key: string]: DataConnection;
  }>({});
  const [message, setmessage] = useState<SetStateAction<string>>("");
  const [file, setfile] = useState<File>();
  const [uploads, setuploads] = useState<
    Array<{ url: string; name: string; type: string }>
  >([]);

  function onopen(connection: DataConnection) {
    connection.on("open", () => {
      setconnections({ ...connections, [connection.peer]: connection });
      console.log("handshake", connection);
    });

    connection.on("data", (data: any) => {
      console.log("data", data);
      if (data.file) {
        const fileblob = new Blob([data.file], { type: data.type });
        const url = URL.createObjectURL(fileblob);
        setuploads([
          ...uploads,
          { url: url, name: data.name, type: data.type },
        ]);
        console.log("blob", fileblob);
      }
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
      {Object.keys(connections).map((conn: string) => (
        <button
          key={conn}
          onClick={() => {
            const connection = connections[conn];
            connection.send(message);
            if (file)
              connection.send(
                { file: file, name: file.name, type: file.type },
                true
              );
          }}
        >
          {conn}
        </button>
      ))}
      <hr />
      <input
        type="file"
        multiple
        onInput={(e: any) => {
          const file = e.target.files[0];
          console.log("sending", file);
          setfile(file);
        }}
      />
      <div>
        {uploads.map(({ url, name }) => (
          <div key={url}>
            <a href={url}>{name}</a>
          </div>
        ))}
      </div>
    </>
  );
}
