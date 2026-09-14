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

// serves every sitemap that /sitemap.xml (the index) links to:
// - /sitemap/pages.xml: static pages + every list page (/drug, /disease, ...)
// - /sitemap/<type>.xml: every published single-node page for that type
//   (/sitemap/drug.xml, /sitemap/disease.xml, /sitemap/dr.xml, ...)
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) => {
  const { type: rawType } = await params;
  if (!rawType.endsWith(".xml"))
    return new Response("Not Found", { status: 404 });
  const type = rawType.slice(0, -".xml".length);

  if (type === "pages") {
    return xmlResponse(
      buildUrlsetXml(
        sitemapStaticPages.map((path) => ({ loc: `${DOMAIN}${path}` })),
      ),
    );
  }

  if (!isSitemapNodeType(type))
    return new Response("Not Found", { status: 404 });

  const nodes = await fetchSitemapNodes(type);
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
