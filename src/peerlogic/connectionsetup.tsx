import { SetStateAction } from "react";
import Peer, { DataConnection } from "peerjs";
import { useEffect, useState } from "react";
import { encodefilename } from "../utility/helper";

const chunckeddata: any = {};

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
          const arr = (chunckeddata[data.key] ||= new Array(data.length));
          console.log(data.file, data.index, data.length);
          arr[data.index] = data.file;
          if (data.index == data.length - 1) {
            console.log(data, chunckeddata);
            const chunks = chunckeddata[data.key];

            const length =
              (chunks.length - 1) * 10000 + chunks[data.length - 1].byteLength;
            const mergedBuffer = new Uint8Array(length);
            console.log(length, mergedBuffer.byteLength, mergedBuffer);
            chunks.forEach((buffer: ArrayBuffer, i: number) => {
              const uint8Array = new Uint8Array(buffer);
              mergedBuffer.set(uint8Array, i * 10000);
            });
            console.log("final buffer", mergedBuffer.buffer);
            const fileblob = new Blob([mergedBuffer.buffer], {
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
              if (file.size > 10000) {
                const reader = new FileReader();
                const chunksize = 10000;

                reader.onload = (event) => {
                  const data = event.target?.result as ArrayBuffer;
                  const chunks: ArrayBuffer[] = [];
                  for (let i = 0; i < data.byteLength; i += chunksize) {
                    const chunk = data.slice(i, i + chunksize);
                    chunks.push(chunk);
                  }

                  chunks.forEach((chunk, i) => {
                    connection.send({
                      file: chunk,
                      name: file.name,
                      type: file.type,
                      key: file.lastModified,
                      index: i,
                      totallength: data.byteLength,
                      length: chunks.length, //----------------------------------------------------------------------------------------------------------
                    });
                  });

                  console.log("chunks", chunks);
                };

                reader.onerror = () => {
                  console.log("error");
                };

                reader.readAsArrayBuffer(file);

                console.log(file.size, "filesize", file.lastModified);
                // const chunks = makechunks(file, 1000);
                // console.log(chunks, file);
              }
              // const x = connection.send(
              //   { file: file, name: file.name, type: file.type },
              //   true
              // );
              // console.log("connection promise", x);
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
        {uploads.map(({ url, name }) => (
          <div key={url}>
            <a href={url} download={encodefilename(name)}>
              {name}
            </a>
          </div>
        ))}
      </div>
    </>
  );
}

function makechunks(arr: any[] | any, chunksize: number) {
  const chunks = [];
  for (let i = 0; i < arr.length; i++) {
    const chunk = [];
    for (let j = 0; j < chunksize && i < arr.length; j++) {
      chunk.push(arr[i]);
      i++;
    }
    i--;
    chunks.push(chunk);
  }

  return chunks;
}
