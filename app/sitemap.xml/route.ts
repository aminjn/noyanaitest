import { DOMAIN } from "@/Components/config";
import {
  buildSitemapIndexXml,
  fetchSitemapNodeCount,
  sitemapFileNames,
  xmlResponse,
} from "@/Components/helpers/sitemap";
import { sitemapNodeTypes } from "@/Components/helpers/sitemapNodeTypes";

// this file's own path can't be "sitemap.xml.tsx": the App Router only ever
// turns "route.ts" (or "page.tsx") into a route, so the closest equivalent
// is a route handler in a folder literally named "sitemap.xml". This is the
// sitemap index: it lists the static/list-page sitemap plus one or more
// dedicated sitemaps per single-node type (drugs, diseases, doctors, ...),
// each served by app/sitemap/[type]/route.ts. A type is capped at
// SITEMAP_PAGE_SIZE (10,000) links per file, so once it has more publicly
// visible documents than that it gets extra numbered files: doctor.xml,
// doctor02.xml, doctor03.xml, ...
export const revalidate = 3600;

export const GET = async () => {
  const counts = await Promise.all(
    sitemapNodeTypes.map((type) => fetchSitemapNodeCount(type)),
  );
  const sitemaps = [
    { loc: `${DOMAIN}/sitemap/pages.xml` },
    { loc: `${DOMAIN}/sitemap/directory.xml` },
    ...sitemapNodeTypes.flatMap((type, index) =>
      sitemapFileNames(type, counts[index]).map((fileName) => ({
        loc: `${DOMAIN}/sitemap/${fileName}`,
      })),
    ),
  ];
  return xmlResponse(buildSitemapIndexXml(sitemaps));
};
