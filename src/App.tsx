import { createContext, useReducer } from "react";
import { DataConnection } from "peerjs";
import { PeerApp } from "./peer_connection/connectionsetup";

const store = {
  connection: null as any,
};
export const ctx = createContext(store) as any;

function red(
  state: typeof store,
  action: { type: string; payload: DataConnection }
) {
  switch (action.type) {
    case "connection": {
      return { ...state, connection: action.payload };
    }
    default:
      return state;
  }
}

function App() {
  return (
    <ctx.Provider value={useReducer(red, store)}>
      webrtc-connections: <PeerApp />
    </ctx.Provider>
  );
}

export default App;
