import { BACKEND, DOMAIN } from "../config";
import { enabledLocales, localizePath } from "../i18n/locales";

export type SitemapNode = { slug: string; lastmod: string };

// crawlers hit these often; re-fetch the node list from the backend at
// most once an hour instead of on every request.
export const SITEMAP_REVALIDATE_SECONDS = 3600;

// keep in sync with Controllers/publicController's SITEMAP_PAGE_SIZE. Once a
// node type has more publicly-visible documents than this, it needs more
// than one sitemap file (doctor.xml, doctor02.xml, doctor03.xml, ...).
export const SITEMAP_PAGE_SIZE = 10000;

export const fetchSitemapNodes = async (
  type: string,
  page = 1,
): Promise<SitemapNode[]> => {
  const response = await fetch(
    `${BACKEND}/api/v1/public/sitemap/${type}?page=${page}`,
    { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } },
  );
  if (!response.ok) return [];
  try {
    const json = await response.json();
    return (json?.data?.items as SitemapNode[] | undefined) || [];
  } catch {
    return [];
  }
};

export const fetchSitemapNodeCount = async (type: string): Promise<number> => {
  const response = await fetch(
    `${BACKEND}/api/v1/public/sitemap/${type}/count`,
    { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } },
  );
  if (!response.ok) return 0;
  try {
    const json = await response.json();
    const count = Number(json?.data?.count);
    return Number.isFinite(count) ? count : 0;
  } catch {
    return 0;
  }
};

// how many SITEMAP_PAGE_SIZE-sized files a node type needs, and what each
// one is called: page 1 is "<type>.xml", page 2+ gets a zero-padded numeric
// suffix ("<type>02.xml", "<type>03.xml", ...).
export const sitemapFileNames = (type: string, count: number): string[] => {
  const pageCount = Math.max(1, Math.ceil(count / SITEMAP_PAGE_SIZE));
  return Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;
    return page === 1
      ? `${type}.xml`
      : `${type}${String(page).padStart(2, "0")}.xml`;
  });
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

// Every page exists in each served language ("/x", "/en/x", ...); list
// them as hreflang alternates of the Persian URL.
const alternateLinks = (loc: string): string => {
  if (enabledLocales.length < 2 || !loc.startsWith(DOMAIN)) return "";
  const path = loc.slice(DOMAIN.length) || "/";
  const link = (hreflang: string, href: string) =>
    `\n    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`;
  return (
    link("x-default", loc) +
    enabledLocales
      .map((locale) => link(locale, DOMAIN + localizePath(path, locale)))
      .join("")
  );
};

export const buildUrlsetXml = (
  urls: { loc: string; lastmod?: string }[],
): string =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls
    .map(
      (url) =>
        `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${
          url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ""
        }${alternateLinks(url.loc)}\n  </url>`,
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
