import React, { useContext, useEffect, useState } from "react";
import { connectionCtx } from "../peer_connection/connectionsetup";

export function Messages() {
  const connection = useContext(connectionCtx);
  const [message, setmessage] = useState("");
  const [messages, setmessages] = useState<string[]>([]);

  useEffect(() => {
    if (!connection) return;
    connection.on("data", (data: any) => {
      if (data.message) {
        setmessages((msg) => [...msg, data.message]);
      }
    });
  }, [connection]);

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e: any) => setmessage(e.target.value)}
      />
      <button
        onClick={() => {
          connection.send({ message: message });
          setmessages((msg) => [...msg, message]);
        }}
      >
        send
      </button>
      <>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </>
    </div>
  );
}
