import { SetStateAction } from "react";
import Peer, { DataConnection } from "peerjs";
import { useEffect, useState } from "react";
import { encodefilename } from "../utility/helper";

const optimizer = {
  chunks: {} as any,
  chunksize: 1024 * 1024,
};

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
  const [downloadprogress, setdownloadprogress] = useState(0);

  function onopen(connection: DataConnection) {
    connection.on("open", () => {
      setconnections({ ...connections, [connection.peer]: connection });
      console.log("handshake", connection);
    });

    connection.on("data", (data: any) => {
      if (data.file) {
        //=======================================================================================================
        if (data.key) {
          optimizer.chunks[data.key] ||= {
            buffer: new Uint8Array(Math.floor(data.length)),
            length: 0,
          };

          const download = optimizer.chunks[data.key];
          download.buffer.set(data.file, data.offset);
          download.length += data.file.byteLength;
          setdownloadprogress((download.length / data.length) * 100);

          if (download.length == data.length) {
            const fileblob = new Blob([download.buffer.buffer], {
              type: data.type,
            });
            const url = URL.createObjectURL(fileblob);
            setuploads([
              ...uploads,
              { url: url, name: data.name, type: data.type },
            ]);
            console.log("blob", fileblob);
          }
        } else {
        }
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
            if (file) {
              const reader = new FileReader();
              const chunksize = optimizer.chunksize;

              reader.onload = (event) => {
                console.log(event, "reader");
                const data = event.target?.result as ArrayBuffer;

                for (let i = 0; i < data.byteLength; i += chunksize) {
                  const chunk = data.slice(i, i + chunksize);
                  connection.send({
                    file: chunk,
                    offset: i,
                    key: file.lastModified,
                    length: data.byteLength,
                    type: file.type,
                    name: file.name,
                  });
                }
              };

              reader.onerror = () => {
                console.log("error");
              };

              reader.readAsArrayBuffer(file);

              console.log(file.size, "filesize", file.lastModified);
            }
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
        {downloadprogress}% |
        {uploads.map(({ url, name }) => (
          <div key={url}>
            {
              <a href={url} download={encodefilename(name)}>
                {name}
              </a>
            }
          </div>
        ))}
      </div>
    </>
  );
}
