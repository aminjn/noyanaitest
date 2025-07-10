import { useSlateSelection, useSlateStatic } from "slate-react";
import classes from "./SelectionButton.module.css";
import { useCallback, useEffect, useState } from "react";
import { Editor, Element, Transforms } from "slate";
import { HeadingLevel } from "./RTFConfigs";
import SaveIcon from "./SaveIcon";
import MenuIcon from "@/Components/Icons/MenuIcon";

type Values = `h${HeadingLevel}` | "p" | null;

const types = ["h1", "h2", "h3", "h4", "h5", "h6", "p"] as const;

const HeadingButton = () => {
  const editor = useSlateStatic();
  const [selected, setSelected] = useState<Exclude<Values, null>>("p");
  const [current, setCurrent] = useState<Values>("p");
  const selection = useSlateSelection();

  const refresh = useCallback(() => {
    const generator = Editor.nodes(editor, {
      match: (n) => Element.isElement(n),
    });
    const [node] = Array.from(generator);
    setCurrent(
      types.find(
        (el) => el === `${node?.[0]?.type}${node?.[0]?.level || ""}`
      ) || null
    );
  }, [editor]);

  useEffect(() => {
    refresh();
  }, [refresh, selection]);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const listener = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      setTimeout(() => window.addEventListener("click", listener, false));
      return () => window.removeEventListener("click", listener, false);
    }
  });

  const apply = useCallback(
    (value?: Values) => {
      if (!editor.selection) return;
      const target = value || selected;
      const type = target.startsWith("h") ? "h" : "p";
      Transforms.setNodes(
        editor,
        type === "p"
          ? { type, level: undefined }
          : {
              type,
              level: Number(target[1]) as HeadingLevel,
            }
      );
      editor.collapse({ edge: "end" });
    },
    [editor, selected]
  );

  return (
    <div className={classes.main}>
      <div className={classes.box}>
        <span>{selected}</span>
        <button
          className={classes.btn}
          type="button"
          onClick={() => setIsMenuOpen(true)}
        >
          <MenuIcon />
        </button>
      </div>
      <button className={classes.btn} type="button" onClick={() => apply()}>
        <SaveIcon />
      </button>
      <span className={classes.current}>{current || "?"}</span>
      {isMenuOpen && (
        <div className={`${classes.menu}`}>
          {types.map((value) => (
            <button
              key={`${value}`}
              className={`${classes.option} ${
                value === selected ? classes.active : ""
              }`}
              onClick={() => {
                setSelected(value);
                setIsMenuOpen(false);
                apply(value);
              }}
            >
              {value}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default HeadingButton;
