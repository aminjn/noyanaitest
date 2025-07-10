import { useMemo, useState } from "react";
import classes from "./RenderRtf.module.css";
import { createEditor, Descendant, Editor } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import RenderElement from "./RTFEditor/RenderElement";
import RenderLeaf from "./RTFEditor/RenderLeaf";

const RenderRtf = ({ value }: { value?: string }) => {
  const [editor] = useState<Editor>(withReact(createEditor()));

  const content = useMemo<Descendant[]>(
    () => JSON.parse(value || "[]"),
    [value]
  );

  return (
    <Slate editor={editor} initialValue={content}>
      <Editable
        className={classes.main}
        readOnly
        renderElement={RenderElement}
        renderLeaf={RenderLeaf}
      />
    </Slate>
  );
};

export default RenderRtf;
