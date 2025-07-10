import { ReactNode, useCallback, useEffect, useState } from "react";
import classes from "./AlignmentButton.module.css";
import { useSlateSelection, useSlateStatic } from "slate-react";
import { Editor, Transforms } from "slate";
import AlignRightIcon from "./AlignRightIcon";
import AlignLeftIcon from "./AlignLeftIcon";
import AlignCenterIcon from "./AlignCenterIcon";
import JustifyIcon from "./JustifyIcon";
import { Alignment, alignments } from "./RTFConfigs";
import { Element } from "slate";

const alignmentIcon: { [key in Alignment]: ReactNode } = {
  right: <AlignRightIcon />,
  left: <AlignLeftIcon />,
  center: <AlignCenterIcon />,
  justify: <JustifyIcon />,
};

const alignables = ["p", "h", "list", "li"];

const AlignmentButton = () => {
  const selection = useSlateSelection();
  const editor = useSlateStatic();

  const refresh = useCallback(() => {
    const generator = Editor.nodes(editor, {
      match: (n) => Element.isElement(n),
    });
    const [node] = Array.from(generator);
    if (!node) return setCurrent(null);
    if (!alignables.includes(node[0].type)) return setCurrent(null);
    setCurrent(node[0].align || null);
  }, [editor]);

  const onAlign = (align: Alignment) => {
    const generator = Editor.nodes(editor, {
      match: (n) => Element.isElement(n) && alignables.includes(n.type),
    });
    const [node] = Array.from(generator);
    if (!node) return;
    Transforms.setNodes(
      editor,
      { align },
      { at: editor.selection || undefined }
    );
    refresh();
  };

  const [current, setCurrent] = useState<Alignment | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh, selection]);

  return (
    <div className={classes.main}>
      {alignments.map((alignment) => (
        <button
          className={`${classes.btn} ${
            current === alignment ? classes.active : ""
          }`}
          key={alignment}
          onClick={() => onAlign(alignment)}
        >
          {alignmentIcon[alignment]}
        </button>
      ))}
    </div>
  );
};
export default AlignmentButton;
