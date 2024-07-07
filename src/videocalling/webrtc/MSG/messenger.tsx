import { useEffect, useState } from "react";
import { wrtc } from "../webrtcVC";
import { InputButton } from "../../../widgets/components/inputbutton";

export function Messenger_wrtc() {
  const [messages, setmessages] = useState<string[]>([]);

  const setmsg = (e: string) => {
    setmessages((messages) => [...messages, e]);
  };

  useEffect(() => {
    wrtc.datachannel.chat.onmessage = (e) => {
      setmsg(e.data);
    };
  }, []);

  return (
    <div>
      <InputButton
        name="send"
        action={(e) => {
          wrtc.datachannel.chat.send(e);
          setmsg(e);
        }}
      />
      <>
        {JSON.stringify(messages)}|
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </>
    </div>
  );
}
