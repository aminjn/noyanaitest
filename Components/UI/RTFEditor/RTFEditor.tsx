import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import classes from "./RTFEditor.module.css";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { BaseEditor, createEditor, Descendant, Editor } from "slate";
import { Alignment, BlockName, Color, HeadingLevel, Size } from "./RTFConfigs";
import Toolbar from "./Toolbar";
import RenderElement from "./RenderElement";
import RenderLeaf from "./RenderLeaf";

export type CustomText = {
  text: string;
  size?: Size;
  color?: Color;
  bg?: Color;
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  href?: string;
  lineHeight?: string;
};

type BaseCustomElement<T extends BlockName, K = object> = {
  align?: Alignment;
  children: CustomText[];
  type: T;
  level?: never | HeadingLevel;
} & K;

type ParagraphElement = BaseCustomElement<"p">;
type ListElement = BaseCustomElement<"ol" | "ul">;
type ListItemElement = BaseCustomElement<"li">;
type HeadingElement = BaseCustomElement<"h", { level: HeadingLevel }>;
type ImageElement = BaseCustomElement<"img", { src: string; alt: string }>;
type VideoElement = BaseCustomElement<"vid", { src: string }>;
type AdsElement = BaseCustomElement<"ads", { id: string }>;

type CustomElement =
  | ParagraphElement
  | ListElement
  | ListItemElement
  | HeadingElement
  | ImageElement
  | VideoElement
  | AdsElement;

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const inititalValue: Descendant[] = [{ type: "p", children: [{ text: "" }] }];

const voids = ["img", "vid"];

const withVoid = (editor: Editor) => {
  const { isVoid } = editor;
  editor.isVoid = (element) =>
    voids.includes(element.type) ? true : isVoid(element);
  return editor;
};

const RTFEditor = forwardRef<
  Editor,
  {
    defaultValue?: string;
    onChange?: (e: string) => unknown;
    hideMediaLibrary?: boolean;
  }
>(({ defaultValue, onChange, hideMediaLibrary }, ref) => {
  const [editor] = useState(() =>
    withVoid(withHistory(withReact(createEditor()))),
  );

  const init = useMemo<Descendant[]>(() => {
    if (defaultValue) {
      try {
        return JSON.parse(defaultValue);
      } catch {}
    }
    return inititalValue;
  }, [defaultValue]);

  useImperativeHandle(ref, () => editor, [editor]);

  return (
    <div className={classes.container}>
      <Slate
        editor={editor}
        initialValue={init}
        onChange={(e) => {
          onChange?.(JSON.stringify(e));
        }}
      >
        <Toolbar hideMediaLibrary={hideMediaLibrary} />
        <Editable
          className={classes.main}
          renderElement={RenderElement}
          renderLeaf={RenderLeaf}
          placeholder="یه داستان بنویس ..."
          renderPlaceholder={({ children, attributes }) => (
            <span className={classes.placeholder} {...attributes}>
              {children}
            </span>
          )}
        />
      </Slate>
    </div>
  );
});

RTFEditor.displayName = "RTFEditor";

export default RTFEditor;
