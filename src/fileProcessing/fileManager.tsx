import { useContext, useEffect, useState } from "react";
import {
  convertArrayBufferToUint8Array,
  processReceivedData,
  sendfile,
} from "./sendreceive";
import { connectionCtx } from "../peerlogic/connectionsetup";

export interface download {
  url: string;
  progress: number;
  name: string;
  type: string;
  lastModified: number;
  byteLength: number;
}

export function Downloads() {
  const connection = useContext(connectionCtx);
  const [files, setfiles] = useState<{ [key: string]: download }>({});

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
        },
      }));
    });
  }, [connection]);

  return (
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Type</th>
          <th>Modified</th>
          <th>Size (kb)</th>
          <th>download All </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(files).map(([key, value]: [string, download]) =>
          DownloadsRow(value)
        )}
      </tbody>
    </table>
  );
}

function DownloadsRow({
  url,
  progress,
  name,
  type,
  lastModified,
  byteLength,
}: download) {
  return (
    <tr key={lastModified}>
      <td>{name}</td>
      <td>{type}</td>
      <td>{lastModified}</td>
      <td>{byteLength / 1024}</td>
      <td>
        <a href={url}>{progress}</a>
      </td>
    </tr>
  );
}

export function Uploads() {
  const [files, setfiles] = useState<File[]>([]);
  return (
    <div>
      <input
        type="file"
        multiple
        onInput={(e: any) => {
          const file = e.target.files[0];
          console.log("uploading", file);
          setfiles([...e.target.files] || []);
        }}
      />
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Type</th>
            <th>Modified</th>
            <th>Size (kb)</th>
            <th>Send All </th>
          </tr>
        </thead>
        <tbody>{files.map(UploadsRow)}</tbody>
      </table>
    </div>
  );
}

function UploadsRow(file: File) {
  const [data, setdata] = useState(new Uint8Array(0));
  const connection = useContext(connectionCtx);

  useEffect(() => {
    convertArrayBufferToUint8Array(file).then(setdata);
  }, []);

  return (
    <tr key={file.lastModified}>
      <td>{file.name}</td>
      <td>{file.type}</td>
      <td>{file.lastModified}</td>
      <td>{data.byteLength / 1024}</td>
      <td onClick={() => sendfile(file, data, connection)}>send</td>
    </tr>
  );
}
