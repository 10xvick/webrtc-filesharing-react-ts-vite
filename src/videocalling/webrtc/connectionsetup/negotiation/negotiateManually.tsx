import { InputButton } from "../../../../widgets/components/inputbutton";
import { wrtc } from "../../webrtcVC";

export const NegotiateManually = () => {
  return (
    <>
      <button
        onClick={() => wrtc.createoffer().then((offer) => console.log(offer))}
      >
        create offer
      </button>
      <InputButton
        name="create answer from offer"
        action={(data) =>
          wrtc.createanswer(JSON.parse(data)).then((answer) => {
            console.log(answer);
          })
        }
      />
      <InputButton
        name="set remote description"
        action={(data) =>
          wrtc.setremotedescription(JSON.parse(data)).then((answer) => {
            console.log("set remote description", JSON.stringify(answer));
          })
        }
      />
    </>
  );
};
