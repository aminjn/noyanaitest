import { RenderLeafProps } from "slate-react";
import { CSSProperties } from "react";
import Link from "@/Components/i18n/Link";
const RenderLeaf = ({ children, leaf, attributes }: RenderLeafProps) => {
  // only what the writer set: the rest comes from the page (its size,
  // colour in light and dark mode, and leading); a fixed 16px black at 100%
  // line height on every piece of text broke dark mode and article reading
  const style: CSSProperties = {
    ...(leaf.size ? { fontSize: leaf.size } : {}),
    ...(leaf.color ? { color: leaf.color } : {}),
    ...(leaf.bg ? { backgroundColor: leaf.bg } : {}),
    ...(leaf.lineHeight ? { lineHeight: leaf.lineHeight } : {}),
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
