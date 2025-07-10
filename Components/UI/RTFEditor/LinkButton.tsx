import { useEffect, useRef, useState } from "react";
import classes from "./LinkButton.module.css";
import { useSlateSelection, useSlateStatic } from "slate-react";
import { Editor } from "slate";
import Input from "../Input";
import SaveIcon from "./SaveIcon";
import CloseIcon from "@/Components/Icons/CloseIcon";
import LinkIcon from "@/Components/Icons/LinkIcon";
const LinkButton = () => {
  const [isInputOpen, setIsInputOpen] = useState<boolean>(false);
  const targetRef = useRef<HTMLInputElement>(null);

  const [current, setCurrent] = useState<boolean>(false);

  const editor = useSlateStatic();

  const selection = useSlateSelection();

  useEffect(() => {
    setCurrent(!!Editor.marks(editor)?.href);
  }, [editor, selection]);

  return (
    <div>
      <button
        className={`${classes.btn} ${current ? classes.active : ""}`}
        onClick={() => setIsInputOpen(true)}
      >
        <LinkIcon />
      </button>
      {isInputOpen && (
        <div className={classes.inputCunt}>
          <Input title="Target" ref={targetRef} />
          <button
            className={classes.submit}
            onClick={() => {
              if (!targetRef.current?.value) return setIsInputOpen(false);
              Editor.addMark(editor, "href", targetRef.current.value);
              setIsInputOpen(false);
            }}
          >
            <SaveIcon />
          </button>
          <button
            className={classes.submit}
            onClick={() => setIsInputOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  );
};
export default LinkButton;
