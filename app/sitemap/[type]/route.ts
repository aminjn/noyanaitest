import { DOMAIN } from "@/Components/config";
import {
  buildUrlsetXml,
  fetchSitemapNodes,
  xmlResponse,
} from "@/Components/helpers/sitemap";
import {
  isSitemapNodeType,
  sitemapNodePath,
  sitemapStaticPages,
} from "@/Components/helpers/sitemapNodeTypes";

export const revalidate = 3600;

// a node type's file name is either "<type>.xml" (page 1) or
// "<type>02.xml", "<type>03.xml", ... for later 10,000-link pages. Node
// type names are plain letters, so any trailing digits are always a page
// number, never part of the type itself.
const parseNodeFileName = (
  base: string,
): { type: string; page: number } | null => {
  const match = base.match(/^([a-zA-Z]+)(\d+)?$/);
  if (!match) return null;
  const [, type, pageSuffix] = match;
  const page = pageSuffix ? Number(pageSuffix) : 1;
  return page >= 1 ? { type, page } : null;
};

// serves every sitemap that /sitemap.xml (the index) links to:
// - /sitemap/pages.xml: static pages + every list page (/drug, /disease, ...)
// - /sitemap/<type>.xml, /sitemap/<type>02.xml, ...: every published
//   single-node page for that type, 10,000 per file
//   (/sitemap/drug.xml, /sitemap/disease.xml, /sitemap/dr.xml, ...)
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) => {
  const { type: rawType } = await params;
  if (!rawType.endsWith(".xml"))
    return new Response("Not Found", { status: 404 });
  const base = rawType.slice(0, -".xml".length);

  if (base === "pages") {
    return xmlResponse(
      buildUrlsetXml(
        sitemapStaticPages.map((path) => ({ loc: `${DOMAIN}${path}` })),
      ),
    );
  }

  const parsed = parseNodeFileName(base);
  if (!parsed) return new Response("Not Found", { status: 404 });
  const { type, page } = parsed;
  if (!isSitemapNodeType(type))
    return new Response("Not Found", { status: 404 });

  const nodes = await fetchSitemapNodes(type, page);
  if (!nodes.length && page > 1)
    return new Response("Not Found", { status: 404 });

  const toPath = sitemapNodePath[type];
  return xmlResponse(
    buildUrlsetXml(
      nodes.map((node) => ({
        loc: `${DOMAIN}${toPath(node.slug)}`,
        lastmod: node.lastmod,
      })),
    ),
  );
};
