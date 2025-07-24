import AdvertisementIcon from "@/Components/Icons/AdvertisementIcon";
import Ixon from "../Ixon";
import usePopup from "@/Components/Hooks/usePopup";
import { useSlateStatic } from "slate-react";
import SelectAdPopup from "./SelectAdPopup";
import { useCallback } from "react";
import { Transforms } from "slate";

const AdsButton = () => {
  const { setPopup, closePopup } = usePopup();
  const editor = useSlateStatic();

  const onExecute = useCallback(
    (id: string) => {
      Transforms.insertNodes(editor, {
        type: "ads",
        id,
        children: [{ text: "" }],
      });
      closePopup();
    },
    [closePopup, editor]
  );

  return (
    <button
      onClick={() => setPopup("SelectAd", <SelectAdPopup onDone={onExecute} />)}
    >
      <Ixon width="1.5rem">
        <AdvertisementIcon />
      </Ixon>
    </button>
  );
};

export default AdsButton;
