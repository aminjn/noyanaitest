// Mirrors Controllers/publicController's sitemapNodeTypes on the backend.
// Each entry is one dedicated single-node sitemap, e.g. /sitemap/drug.xml.
export const sitemapNodeTypes = [
  "drug",
  "disease",
  "symptom",
  "speciality",
  "doctor",
  "dr",
  "clinic",
  "hospital",
  "paraClinic",
  "insurance",
  "service",
  "servicePackage",
  "product",
  "productPackage",
  "blog",
] as const;

export type SitemapNodeType = (typeof sitemapNodeTypes)[number];

export const isSitemapNodeType = (value: string): value is SitemapNodeType =>
  (sitemapNodeTypes as readonly string[]).includes(value);

// slug -> public page path for each node type. "doctor" (legacy Doctor
// model) and "dr" (DoctorProfile model) are both live routes backed by
// different models, so they get separate entries and separate sitemaps.
export const sitemapNodePath: Record<
  SitemapNodeType,
  (slug: string) => string
> = {
  drug: (slug) => `/drug/${slug}`,
  disease: (slug) => `/disease/${slug}`,
  symptom: (slug) => `/symptom/${slug}`,
  speciality: (slug) => `/speciality/${slug}`,
  doctor: (slug) => `/doctor/${slug}`,
  dr: (slug) => `/dr/${slug}`,
  clinic: (slug) => `/clinic/${slug}`,
  hospital: (slug) => `/hospital/${slug}`,
  paraClinic: (slug) => `/paraClinic/${slug}`,
  insurance: (slug) => `/insurance/${slug}`,
  service: (slug) => `/service/${slug}`,
  servicePackage: (slug) => `/servicePackage/${slug}`,
  product: (slug) => `/product/${slug}`,
  productPackage: (slug) => `/productPackage/${slug}`,
  blog: (slug) => `/mag/${slug}`,
};

// static + list pages that get bundled into /sitemap/pages.xml. Paginated
// variants (e.g. /doctors?page=2) are intentionally left out: the root of
// each list is the canonical entry point search engines should crawl from.
export const sitemapStaticPages: string[] = [
  "/",
  "/doctors",
  "/drug",
  "/disease",
  "/symptom",
  "/speciality",
  "/clinic",
  "/hospital",
  "/paraClinic",
  "/insurance",
  "/service",
  "/product",
  "/mag",
  "/test",
  "/faq",
  "/about",
  "/contact",
  "/privacy",
  "/policy",
  "/map",
  "/become",
  "/become/doctor",
  "/become/clinic",
  "/become/pharmacy",
  "/become/insurance",
  "/become/paraClinic",
  "/become/hospital",
];
