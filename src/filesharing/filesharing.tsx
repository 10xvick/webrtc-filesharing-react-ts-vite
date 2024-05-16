import React, { useContext, useEffect, useState } from "react";
import {
  convertArrayBufferToUint8Array as convertFileToUint8Array,
  processReceivedData,
  sendfile,
} from "./sendreceive";
import { connectionCtx } from "../peer_connection/connectionsetup";

export interface iFile {
  url: string;
  progress: number;
  name: string;
  type: string;
  lastModified: number;
  byteLength: number;
  data: Uint8Array;
}

export function Filesharing() {
  const connection = useContext(connectionCtx);
  const [files, setfiles] = useState<{ [key: string]: iFile }>({});

  useEffect(() => {
    if (!connection) return;

    connection.on("data", (data: any) => {
      if (!data.file) return;

      const { url, progress }: { url: string; progress: number } =
        processReceivedData(data);

      setfiles((uploads) => ({
        ...uploads,
        [data.key]: {
          url: url,
          progress: progress,
          name: data.name,
          type: data.type,
          byteLength: data.byteLength,
          lastModified: data.key,
          data: data.file,
        },
      }));
    });
  }, [connection]);

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e: any) => {
          const newfiles = e.target.files;
          setfiles((files) => {
            for (let file of newfiles) {
              files[file.lastModified] = file;
              file.byteLength = file.size;
            }
            return { ...files };
          });
        }}
      />
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Type</th>
            <th>Modified</th>
            <th>Size (kb)</th>
            <th>Download All </th>
            <th>Send All </th>
          </tr>
        </thead>
        <tbody>
          {Object.values(files).map((file) => (
            <DownloadsRow key={file.lastModified} file={file} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DownloadsRow({ file }: { file: iFile }) {
  const { url, progress, name, type, lastModified, byteLength } = file;

  const sendfile = useSendfile(file);

  return (
    <tr>
      <td>{name}</td>
      <td>{type}</td>
      <td>{lastModified}</td>
      <td>{byteLength / 1024}</td>
      <td>
        <a href={url}>{progress}</a>
      </td>
      <td onClick={sendfile}>send</td>
    </tr>
  );
}

function useSendfile(file: iFile) {
  const [data, setdata] = useState(new Uint8Array(0));
  const connection = useContext(connectionCtx);

  useEffect(() => {
    if (file instanceof File) convertFileToUint8Array(file).then(setdata);
    else setdata(file.data);
  }, [file]);

  return () =>
    connection
      ? sendfile(file, data, connection)
      : alert("connection unavailable");
}

export function debug() {}
