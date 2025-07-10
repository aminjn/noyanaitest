import { useSlateStatic } from "slate-react";
import { Transforms } from "slate";
import ImageIcon from "./ImageIcon";
import SelectMediaPopup, { IMedia } from "./SelectMediaPopup";
import usePopup from "@/Components/Hooks/usePopup";
import Ixon from "../Ixon";

const ImageButton = () => {
  const { setPopup, closePopup } = usePopup();
  const editor = useSlateStatic();

  const onExecute = (media: IMedia) => {
    Transforms.insertNodes(
      editor,
      media.kind === "image"
        ? {
            type: "img",
            alt: media.alt || "",
            src: media.src,
            children: [{ text: "" }],
          }
        : { type: "vid", src: media.src, children: [{ text: "" }] }
    );
    closePopup();
  };

  return (
    <button onClick={() => setPopup(<SelectMediaPopup onDone={onExecute} />)}>
      <Ixon width="1.5rem">
        <ImageIcon />
      </Ixon>
    </button>
  );
};
export default ImageButton;
