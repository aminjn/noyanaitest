import { DOMAIN } from "@/Components/config";
import { buildSitemapIndexXml, xmlResponse } from "@/Components/helpers/sitemap";
import { sitemapNodeTypes } from "@/Components/helpers/sitemapNodeTypes";

// this file's own path can't be "sitemap.xml.tsx": the App Router only ever
// turns "route.ts" (or "page.tsx") into a route, so the closest equivalent
// is a route handler in a folder literally named "sitemap.xml". This is the
// sitemap index: it lists the static/list-page sitemap plus one dedicated
// sitemap per single-node type (drugs, diseases, doctors, ...), each served
// by app/sitemap/[type]/route.ts.
export const revalidate = 3600;

export const GET = () => {
  const sitemaps = [
    { loc: `${DOMAIN}/sitemap/pages.xml` },
    ...sitemapNodeTypes.map((type) => ({
      loc: `${DOMAIN}/sitemap/${type}.xml`,
    })),
  ];
  return xmlResponse(buildSitemapIndexXml(sitemaps));
};
