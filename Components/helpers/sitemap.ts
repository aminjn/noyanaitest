import { BACKEND, DOMAIN } from "../config";

export type SitemapNode = { slug: string; lastmod: string };

// crawlers hit these often; re-fetch the node list from the backend at
// most once an hour instead of on every request.
export const SITEMAP_REVALIDATE_SECONDS = 3600;

export const fetchSitemapNodes = async (
  type: string,
): Promise<SitemapNode[]> => {
  const response = await fetch(`${BACKEND}/api/v1/public/sitemap/${type}`, {
    next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
  });
  if (!response.ok) return [];
  try {
    const json = await response.json();
    return (json?.data?.items as SitemapNode[] | undefined) || [];
  } catch {
    return [];
  }
};

export const absoluteUrl = (path: string): string =>
  `${DOMAIN}${path.startsWith("/") ? path : `/${path}`}`;

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const buildUrlsetXml = (
  urls: { loc: string; lastmod?: string }[],
): string =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) =>
        `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${
          url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ""
        }\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`;

export const buildSitemapIndexXml = (
  sitemaps: { loc: string; lastmod?: string }[],
): string =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps
    .map(
      (sitemap) =>
        `  <sitemap>\n    <loc>${escapeXml(sitemap.loc)}</loc>${
          sitemap.lastmod ? `\n    <lastmod>${sitemap.lastmod}</lastmod>` : ""
        }\n  </sitemap>`,
    )
    .join("\n")}\n</sitemapindex>\n`;

export const xmlResponse = (xml: string): Response =>
  new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": `public, max-age=0, s-maxage=${SITEMAP_REVALIDATE_SECONDS}`,
    },
  });
