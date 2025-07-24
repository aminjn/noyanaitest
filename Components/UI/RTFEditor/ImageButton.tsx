import { useSlateStatic } from "slate-react";
import { Transforms } from "slate";
import ImageIcon from "./ImageIcon";
import SelectMediaPopup from "./SelectMediaPopup";
import usePopup from "@/Components/Hooks/usePopup";
import Ixon from "../Ixon";
import { useCallback } from "react";

const ImageButton = () => {
  const { setPopup, closePopup } = usePopup();
  const editor = useSlateStatic();

  const onExecute = useCallback(
    (src: string, alt: string) => {
      Transforms.insertNodes(editor, {
        type: "img",
        alt,
        src,
        children: [{ text: "" }],
      });
      closePopup();
    },
    [closePopup, editor]
  );

  return (
    <button
      onClick={() =>
        setPopup("SelectBlogMedia", <SelectMediaPopup onDone={onExecute} />)
      }
    >
      <Ixon width="1.5rem">
        <ImageIcon />
      </Ixon>
    </button>
  );
};
export default ImageButton;
