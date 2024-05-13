import { DataConnection } from "peerjs";
import { optimizer } from "../peerlogic/connectionsetup";
import { concatenateUint8Arrays } from "../utility/helper";

export function processReceivedData(data: {
  file: any;
  key: string;
  offset: string;
  name: string;
  type: string;
  byteLength: number;
}) {
  const { file, key, offset, type, byteLength } = data;
  console.log(data);
  optimizer.chunks[key] ||= {
    buffer: new Uint8Array(Math.floor(byteLength)),
    length: 0,
  };

  const download = optimizer.chunks[key];

  download.buffer.set(file, offset);
  download.length += file.byteLength;

  const out = { url: "", progress: 0 };
  if (download.length == byteLength) {
    const fileblob = new Blob([download.buffer.buffer], {
      type: type,
    });

    out.url = URL.createObjectURL(fileblob);
  }
  out.progress = (download.length / byteLength) * 100;
  return out;
}

export function sendfile(
  file: File,
  data: ArrayBuffer,
  connection: DataConnection
) {
  console.log(file, data, connection);
  for (let i = 0; i < data.byteLength; i += optimizer.chunksize) {
    const chunk = data.slice(i, i + optimizer.chunksize);
    connection.send({
      file: chunk,
      offset: i,
      key: file.lastModified,
      byteLength: data.byteLength,
      type: file.type,
      name: file.name,
    });
  }
}

export const convertArrayBufferToUint8Array: (
  file: File
) => Promise<Uint8Array> = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as Uint8Array);
    };
    reader.onerror = (error) => {
      console.warn(error);
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });

//works but too slow and non-effecient
function compressArrayBuffer(arraybuffer: ArrayBuffer): Promise<Uint8Array> {
  const readablestream = new ReadableStream({
    start(controller) {
      controller.enqueue(arraybuffer);
      controller.close();
    },
  });
  const compressedstream = readablestream.pipeThrough(
    new CompressionStream("gzip")
  );
  const reader = compressedstream.getReader();
  let compresseddata = new Uint8Array(0);

  return new Promise((resolve, reject) => {
    reader
      .read()
      .then(function process(result) {
        console.log(result);
        if (result.done) resolve(compresseddata);
        compresseddata = concatenateUint8Arrays(compresseddata, result.value);
        reader.read().then(process);
      })
      .catch(reject);
  });
}

//   convertArrayBufferToUint8Array(file).then((data: Uint8Array) => {
//     console.log(data, "arraybuffer");
//     send(data);
//     // compressArrayBuffer(data).then((data) => {
//     //   console.log(data, "compressed");
//     //   //   send(data);
//     // });
//   });
