import { useContext, useEffect, useState } from "react";
import {
  convertArrayBufferToUint8Array as convertFileToUint8Array,
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
  data: Uint8Array;
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
      console.log(data, data.file);
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
        {Object.entries(files).map(([key, value]: [string, download]) => (
          <DownloadsRow download={value} />
        ))}
      </tbody>
    </table>
  );
}

function DownloadsRow({ download }: { download: download }) {
  const { url, progress, name, type, lastModified, byteLength } = download;

  const sendfile = useSendfile(download);

  return (
    <tr key={lastModified}>
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

export function Uploads() {
  const [files, setfiles] = useState<File[]>([]);
  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e: any) => {
          setfiles(Array.from(e.target.files));
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
        <tbody>
          {files.map((file) => (
            <UploadsRow file={file} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UploadsRow({ file }: any) {
  const sendfile = useSendfile(file);

  return (
    <tr key={file.lastModified}>
      <td>{file.name}</td>
      <td>{file.type}</td>
      <td>{file.lastModified}</td>
      <td>{file.size / 1024}</td>
      <td onClick={sendfile}>send</td>
    </tr>
  );
}

function useSendfile(file: File | download) {
  const [data, setdata] = useState(new Uint8Array(0));
  const connection = useContext(connectionCtx);

  useEffect(() => {
    if (file instanceof File) convertFileToUint8Array(file).then(setdata);
    else setdata(file.data);
  }, [file]);

  return () => sendfile(file, data, connection);
}

export function debug() {}
