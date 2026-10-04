import type { IDisease, IDrug, ISymptom } from "../Admin/Disease/AdminManageDiseasesPage";

// The public medical directory (2026-10): /disease, /drug, /symptom and their
// facet pages, one crawlable URL per state - the Mayo Clinic / WebMD /
// Drugs.com / Altibbi pattern (backend Controllers/directoryController.ts).
export const directoryKinds = ["disease", "drug", "symptom"] as const;
export type DirectoryKind = (typeof directoryKinds)[number];

export const directoryFacetTypes = {
  disease: ["letter", "part", "speciality", "category"],
  drug: ["letter", "class", "status"],
  symptom: ["letter", "part", "category"],
} as const;
export type DirectoryFacetType =
  (typeof directoryFacetTypes)[DirectoryKind][number];

export const isDirectoryFacet = (
  kind: DirectoryKind,
  type: string,
): type is DirectoryFacetType =>
  (directoryFacetTypes[kind] as readonly string[]).includes(type);

// the SEO page type of a facet (backend Lib/seo/seoResolver facetConfigs)
export const directorySeoPath = (kind: DirectoryKind, type?: DirectoryFacetType) =>
  type ? `/${kind}/${type}/[${type === "letter" ? "letter" : "slug"}]` : `/${kind}`;

export const directoryFacetPath = (
  kind: DirectoryKind,
  type: DirectoryFacetType,
  value: string,
) => `/${kind}/${type}/${value}`;

export type DirectoryFacetRow = {
  _id: string;
  name?: string;
  slug?: string;
  region?: string;
  count: number;
};

export type DirectoryNode = { _id: string; name?: string; slug?: string };

export type DirectoryData = {
  kind: DirectoryKind;
  data: (IDisease | IDrug | ISymptom)[];
  count: number;
  page: number;
  pagesCount: number;
  letters: { letter: string; count: number }[];
  facets: Partial<{
    parts: DirectoryFacetRow[];
    specialities: DirectoryFacetRow[];
    categories: DirectoryFacetRow[];
    classes: DirectoryFacetRow[];
    statuses: { value: "rx" | "otc"; count: number }[];
  }>;
  active: { type: DirectoryFacetType; value: string; node?: DirectoryNode } | null;
  funnel: { speciality?: DirectoryNode | null };
};

// Bad data must not crash the page: a response missing a part is filled in.
export const normalizeDirectoryData = (
  raw: Partial<DirectoryData> | undefined,
  kind: DirectoryKind,
): DirectoryData | null => {
  if (!raw || typeof raw !== "object") return null;
  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const facets = (raw.facets && typeof raw.facets === "object" ? raw.facets : {}) as DirectoryData["facets"];
  return {
    kind,
    data: arr(raw.data),
    count: Number(raw.count) || 0,
    page: Number(raw.page) || 1,
    pagesCount: Number(raw.pagesCount) || 1,
    letters: arr<{ letter: string; count: number }>(raw.letters).filter(
      (l) => l && typeof l.letter === "string",
    ),
    facets: {
      parts: arr(facets.parts),
      specialities: arr(facets.specialities),
      categories: arr(facets.categories),
      classes: arr(facets.classes),
      statuses: arr(facets.statuses),
    },
    active: raw.active && typeof raw.active === "object" ? raw.active : null,
    funnel: { speciality: raw.funnel?.speciality || null },
  };
};

// The index's alphabet: Persian (آ to ی) for the RTL languages, Latin A-Z
// for the others; letters found in the data but not in it (a name not yet
// translated, Cyrillic...) are added after it.
const PERSIAN = Array.from("آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی");
const LATIN = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
export const directoryAlphabet = (
  locale: string,
  present: { letter: string; count: number }[],
) => {
  const base = ["fa", "ar", "ur"].includes(locale) ? PERSIAN : LATIN;
  const counts = new Map(present.map((l) => [l.letter, l.count]));
  const extra = present
    .map((l) => l.letter)
    .filter((l) => !base.includes(l))
    .sort((a, b) => a.localeCompare(b, locale));
  return [...base, ...extra].map((letter) => ({ letter, count: counts.get(letter) || 0 }));
};
