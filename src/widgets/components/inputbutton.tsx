import { useState } from "react";

export const InputButton = ({
  name,
  action,
}: {
  name: string;
  action: (x: any) => void;
}) => {
  const [text, settext] = useState("");
  return (
    <div>
      <input onInput={(e: any) => settext(e.target.value)} type="text" />
      <button onClick={() => action(text)}>{name}</button>
    </div>
  );
};
