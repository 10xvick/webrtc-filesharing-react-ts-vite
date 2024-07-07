const configs = {
  server: {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
          // "stun:stun01.sipphone.com",
          "stun:stun.ekiga.net",
          // "stun:stun.fwdnet.net",
          "stun:stun.ideasip.com",
          // "stun:stun.iptel.org",
          "stun:stun.rixtelecom.se",
          "stun:stun.schlund.de",
          "stun:stunserver.org",
          "stun:stun.softjoys.com",
          "stun:stun.voiparound.com",
          "stun:stun.voipbuster.com",
          "stun:stun.voipstunt.com",
          "stun:stun.voxgratia.org",
          "stun:stun.xten.com",
        ],
      },
    ],
  },
  offer: { options: { offerToReceiveAudio: 1, offerToReceiveVideo: 1 } },
};

export const WebRTCInit = () => {
  const peerconnection = new RTCPeerConnection(configs.server);

  //   for (let key in peerconnection) {
  //     if (key[0] + key[1] == "on") {
  //       peerconnection[key] = (e: any) => {
  //         // if (key.includes("hannel"))
  //         // console.log(key, e, "---------------------");
  //       };
  //     }
  //   }

  const connectioncontrols = {
    createoffer: async () => {
      const offer = await peerconnection.createOffer();
      await peerconnection.setLocalDescription(offer);
      return offer;
    },
    createanswer: async (offer: RTCSessionDescription) => {
      await peerconnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerconnection.createAnswer();
      await peerconnection.setLocalDescription(answer);
      return answer;
    },
    setremotedescription: async (answer: RTCSessionDescription) => {
      await peerconnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    },

    renegotiate: async () => {
      console.log("renegotiating...");
      const channel = connectioncontrols.datachannel.negotiation;
      const offer = await connectioncontrols.createoffer();
      if (channel.readyState == "open") channel.send(JSON.stringify(offer));
      else
        console.log(
          "notification channel not open yet. could not re-negotiate"
        );
    },

    peerconnection: peerconnection,
    datachannel: {
      negotiation: peerconnection.createDataChannel("negotiation", {
        negotiated: true,
        id: 2,
      }),
      chat: peerconnection.createDataChannel("chat", {
        negotiated: true,
        id: 3,
      }),
    },
  };

  peerconnection.onnegotiationneeded = async () => {
    console.log("negotiation needed.. tracks updated");
    connectioncontrols.renegotiate();
  };

  connectioncontrols.datachannel.negotiation.addEventListener("open", () => {
    connectioncontrols.datachannel.negotiation.addEventListener(
      "message",
      async (e) => {
        const message = JSON.parse(e.data);
        switch (message.type) {
          case "offer": {
            // first answer is trash 2nd answer works
            await connectioncontrols.createanswer(message);
            const answer = await connectioncontrols.createanswer(message);
            connectioncontrols.datachannel.negotiation.send(
              JSON.stringify(answer)
            );
            break;
          }
          case "answer": {
            await connectioncontrols.setremotedescription(message);
            console.log("negotiated");
            break;
          }
        }
      }
    );
  });

  return connectioncontrols;
};
