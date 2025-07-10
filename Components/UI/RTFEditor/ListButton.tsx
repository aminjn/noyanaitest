import classes from "./ListButton.module.css";
import { Editor, Element, Transforms } from "slate";
import { useSlate } from "slate-react";
import { ReactNode } from "react";
import OLIcon from "./OLIcon";
import UlIcon from "./UlIcon";
import { BlockName } from "./RTFConfigs";
const listTypes = ["ol", "ul"] as const;
type ListType = (typeof listTypes)[number];

const icons: { [key in ListType]: ReactNode } = {
  ol: <OLIcon />,
  ul: <UlIcon />,
};

const isBlockActive = (
  editor: Editor,
  name: BlockName,
  blockType: "type" | "align" = "type"
): boolean => {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        Editor.isEditor(editor) &&
        Element.isElement(n) &&
        n[blockType] === name,
    })
  );
  return !!match;
};

const ListButton = (props: { type: ListType }) => {
  const editor = useSlate();
  const onApply = () => {
    const isActive = isBlockActive(editor, props.type);
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        Editor.isEditor(editor) &&
        Element.isElement(n) &&
        listTypes.includes(n.type as ListType),
      split: true,
    });
    Transforms.setNodes(editor, { type: isActive ? "p" : "li" });
    if (!isActive) {
      Transforms.wrapNodes(editor, { type: props.type, children: [] });
    }
  };

  return (
    <button
      onClick={onApply}
      className={`${classes.btn} ${
        isBlockActive(editor, props.type) ? classes.active : ""
      }`}
    >
      {icons[props.type]}
    </button>
  );
};
export default ListButton;
