// A value imported from the old site may be HTML or the editor's JSON
// rather than plain text: shown as its paragraphs, never as raw code.
const ENTITIES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', zwnj: "\u200c" };
export const readableText = (value?: string | null): string => {
  const v = (value || "").trim();
  if (!v) return "";
  if (v.startsWith("[")) {
    try {
      const nodes = JSON.parse(v);
      if (Array.isArray(nodes)) {
        const text = (n: { text?: unknown; children?: unknown }): string =>
          typeof n?.text === "string" ? n.text : Array.isArray(n?.children) ? n.children.map(text).join("") : "";
        return nodes.map(text).map((t) => t.trim()).filter(Boolean).join("\n\n");
      }
    } catch {
      // not JSON: read as text below
    }
  }
  if (!/<[a-z!/][^>]*>/i.test(v)) return v;
  return v
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|h[1-6]|li|tr|blockquote)\s*>/gi, "\n\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#\d+|[a-z]+);/gi, (m, c: string) =>
      c[0] === "#" ? String.fromCodePoint(Number(c.slice(1)) || 32) : ENTITIES[c.toLowerCase()] ?? m,
    )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*(\n\s*)+/g, "\n\n")
    .trim();
};
