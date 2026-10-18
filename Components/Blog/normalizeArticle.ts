// An article's stored content (Slate JSON) cleaned up for reading
// (2026-10, the owner's report on imported articles): posts written in the
// old editor or converted from the old site carry a font size, colour and
// line height on every piece of text, empty paragraphs as spacing, links
// around whole paragraphs, and their section titles as plain short lines.
// On the page that gave giant gaps, black text in dark mode, a blue
// underlined intro and no headings to build a table of contents from.
// The stored post is not changed; only what the reader sees.

type Leaf = { text?: string; href?: string; strong?: boolean; size?: number; [key: string]: unknown };
type Block = { type?: string; level?: number; children?: (Block | Leaf)[]; [key: string]: unknown };

const MEDIA = new Set(["img", "vid", "ads"]);
// a link around this much text is the old page's wrapper, not a link
const PARAGRAPH_LINK = 120;
// a section title: one short line without a sentence's end
const TITLE_MAX = 70;
const SENTENCE_END = /[.!?؟:،؛…]\s*$/;

const isLeaf = (n: Block | Leaf): n is Leaf => typeof (n as Leaf).text === "string";
const textOf = (n: Block | Leaf): string =>
  isLeaf(n) ? n.text || "" : (n.children || []).map(textOf).join("");
const hasMedia = (n: Block | Leaf): boolean =>
  !isLeaf(n) && (MEDIA.has(String(n.type)) || (n.children || []).some(hasMedia));

const cleanLeaf = (leaf: Leaf, unlink: boolean): Leaf => {
  // the page's typography decides size, colour and leading
  const { size: _size, color: _color, bg: _bg, lineHeight: _lh, ...rest } = leaf;
  void _size; void _color; void _bg; void _lh;
  if (unlink) delete rest.href;
  return rest;
};

const cleanBlock = (block: Block): Block => {
  const unlink = textOf(block).length > PARAGRAPH_LINK;
  return {
    ...block,
    children: (block.children || []).map((c) => (isLeaf(c) ? cleanLeaf(c, unlink) : cleanBlock(c))),
  };
};

const looksLikeTitle = (block: Block, next?: Block) => {
  if (block.type !== "p" && block.type !== undefined) return false;
  const text = textOf(block).trim();
  if (!text || text.length > TITLE_MAX || SENTENCE_END.test(text)) return false;
  // a title opens a section: what follows is a longer paragraph or a list
  if (!next) return false;
  const after = textOf(next).trim();
  return next.type === "ul" || next.type === "ol" || after.length > text.length * 1.5;
};

const titleLevel = (block: Block) => {
  const leaves = (block.children || []).filter(isLeaf);
  const big = leaves.some((l) => Number(l.size) >= 20);
  const bold = leaves.length > 0 && leaves.every((l) => !l.text?.trim() || l.strong);
  return big || bold ? 2 : 3;
};

export const normalizeArticle = (value?: string): string | undefined => {
  if (!value) return value;
  let nodes: Block[];
  try {
    nodes = JSON.parse(value);
  } catch {
    return value;
  }
  if (!Array.isArray(nodes)) return value;
  // empty paragraphs were spacing: the page has its own
  const kept = nodes.filter((n) => n && typeof n === "object" && (textOf(n).trim() || hasMedia(n)));
  const hasHeadings = kept.some((n) => n.type === "h");
  const out = kept.map((block, i) => {
    // an article written without headings gets its short title lines as
    // headings (the page's table of contents comes from them)
    if (!hasHeadings && looksLikeTitle(block, kept[i + 1]))
      return cleanBlock({ ...block, type: "h", level: titleLevel(block) });
    return cleanBlock(block);
  });
  return JSON.stringify(out);
};
