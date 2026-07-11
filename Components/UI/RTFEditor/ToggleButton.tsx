import { ReactNode, useEffect, useState } from "react";
import classes from "./ToggleButton.module.css";
import { useSlateSelection, useSlateStatic } from "slate-react";
import { Editor } from "slate";

const togglables = ["underline", "strong", "italic", "strike"] as const;

type Togglable = (typeof togglables)[number];

const ToggleButton = <T extends Togglable>({
  thisKey,
  icon,
}: {
  thisKey: T;
  icon: ReactNode;
}) => {
  const editor = useSlateStatic();
  const selection = useSlateSelection();

  const [current, setCurrent] = useState<boolean>(false);

  useEffect(
    () => setCurrent(!!Editor.marks(editor)?.[thisKey]),
    [editor, selection, thisKey],
  );

  return (
    <button
      onClick={() => {
        Editor.addMark(editor, thisKey, !Editor.marks(editor)?.[thisKey]);
      }}
      className={`${classes.main} ${current ? classes.active : ""}`}
    >
      {icon}
    </button>
  );
};
export default ToggleButton;
