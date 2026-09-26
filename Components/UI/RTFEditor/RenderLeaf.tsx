import { RenderLeafProps } from "slate-react";
import { CSSProperties } from "react";
import Link from "@/Components/i18n/Link";
const RenderLeaf = ({ children, leaf, attributes }: RenderLeafProps) => {
  const style: CSSProperties = {
    fontSize: leaf.size || 16,
    //TODO: add default color for link element
    color: leaf.color || "var(--black)",
    backgroundColor: leaf.bg || "transparent",
    textAlign: "center",
    lineHeight: leaf.lineHeight || "100%",
  };
  if (leaf.href)
    children = (
      <Link target="_blank" href={leaf.href}>
        {children}
      </Link>
    );
  if (leaf.strong) children = <strong {...attributes}>{children}</strong>;
  if (leaf.italic)
    children = (
      <em style={{}} {...attributes}>
        {children}
      </em>
    );
  if (leaf.underline) children = <u {...attributes}>{children}</u>;
  if (leaf.strike) children = <s {...attributes}>{children}</s>;
  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
};
export default RenderLeaf;
