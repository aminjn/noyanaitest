import { cache } from "react";
import type { Metadata } from "next";
import { getPublicData } from "./getPublicData";
import { DOMAIN, FilePath } from "../config";
import { localeAlternates, localizeCanonical } from "../i18n/alternates";
import {
  IPageMeta,
  PageMetaListResourceType,
  PageMetaNodeResourceType,
} from "@/Components/Admin/PageMeta/pageMetaConstants";

// cached per-request so generateMetadata and the page body can both ask for
// the same record without doubling the network call
const fetchListPageMeta = cache(
  async (path: PageMetaListResourceType): Promise<IPageMeta | null> => {
    const res = await getPublicData<{ data: IPageMeta | null }>(
      `pagemeta/list?path=${encodeURIComponent(path)}`,
    );
    return res?.data ?? null;
  },
);

const fetchNodePageMeta = cache(
  async (
    path: PageMetaNodeResourceType,
    nodeSlug: string,
  ): Promise<IPageMeta | null> => {
    const res = await getPublicData<{ data: IPageMeta | null }>(
      `pagemeta/node?path=${encodeURIComponent(path)}&nodeSlug=${encodeURIComponent(
        nodeSlug,
      )}`,
    );
    return res?.data ?? null;
  },
);

const toMetadata = (data?: IPageMeta | null): Metadata => {
  if (!data) return {};
  const hasOg = !!(data.ogTitle || data.ogDescription || data.ogImage);
  return {
    title: data.title || undefined,
    description: data.description || undefined,
    keywords: data.keywords?.length ? data.keywords : undefined,
    // Setting alternates here replaces the layout's, so carry hreflang too.
    alternates: data.canonicalUrl
      ? { canonical: localizeCanonical(data.canonicalUrl), ...localeAlternates() }
      : undefined,
    robots:
      data.noIndex || data.noFollow
        ? { index: !data.noIndex, follow: !data.noFollow }
        : undefined,
    openGraph: hasOg
      ? {
          title: data.ogTitle || data.title,
          description: data.ogDescription || data.description,
          images: data.ogImage ? [`${FilePath}/${data.ogImage}`] : undefined,
        }
      : undefined,
  };
};

export const getListPageMetadata = async (
  path: PageMetaListResourceType,
): Promise<Metadata> => toMetadata(await fetchListPageMeta(path));

// A node page with no SEO entry in the admin used to get only the site
// title. It now falls back to the record itself: its name, a plain-text
// summary, its image and its own URL as canonical.
const nodeApi: Record<PageMetaNodeResourceType, string> = {
  "/mag/[blogSlug]": "blog",
  "/dr/[slug]": "dr",
  "/disease/[slug]": "disease",
  "/drug/[slug]": "drug",
  "/speciality/[slug]": "speciality",
  "/clinic/[slug]": "clinic",
  "/hospital/[slug]": "hospital",
  "/paraClinic/[slug]": "paraClinic",
  "/pharmacy/[slug]": "pharmacy",
  "/product/[slug]": "product",
  "/productPackage/[slug]": "productPackage",
  "/symptom/[slug]": "symptom",
  "/service/[slug]": "service",
  "/servicePackage/[slug]": "servicePackage",
  "/insurance/[slug]": "insurance",
};

type NodeLike = Record<string, unknown>;

export const pickNode = (body: unknown): NodeLike | null => {
  const candidates = [
    body,
    (body as NodeLike | undefined)?.data,
    ((body as NodeLike | undefined)?.data as NodeLike | undefined)?.data,
    (body as NodeLike | undefined)?.node,
    (body as NodeLike | undefined)?.profile,
  ];
  for (const c of candidates)
    if (
      c &&
      typeof c === "object" &&
      !Array.isArray(c) &&
      ("name" in c || "title" in c || "firstName" in c)
    )
      return c as NodeLike;
  return null;
};

const plain = (value: unknown, max = 160) => {
  if (typeof value !== "string") return undefined;
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

export const nodeFallbackMetadata = (
  node: NodeLike | null,
  canonicalPath: string,
): Metadata => {
  if (!node) return {};
  const title =
    plain(node.name, 70) ||
    plain(node.title, 70) ||
    plain([node.firstName, node.lastName].filter(Boolean).join(" "), 70);
  const description =
    plain(node.summary) || plain(node.description) || plain(node.content);
  const image = [node.image, node.avatar, (node.images as unknown[])?.[0]].find(
    (v) => typeof v === "string" && v,
  ) as string | undefined;
  return {
    title,
    description,
    alternates: {
      canonical: localizeCanonical(
        `${DOMAIN.replace(/\/$/, "")}${canonicalPath}`,
      ),
      ...localeAlternates(),
    },
    openGraph: {
      title,
      description,
      images: image ? [`${FilePath}/${image}`] : undefined,
    },
  };
};

const fetchNodeForMeta = cache(async (api: string, slug: string) =>
  pickNode(await getPublicData<unknown>(`${api}/${encodeURIComponent(slug)}`)),
);

export const getNodePageMetadata = async (
  path: PageMetaNodeResourceType,
  nodeSlug?: string,
): Promise<Metadata> => {
  if (!nodeSlug) return {};
  let slug = nodeSlug;
  try {
    slug = decodeURIComponent(nodeSlug);
  } catch {
    // a malformed escape: use it as is
  }
  const meta = await fetchNodePageMeta(path, slug);
  if (meta?.title) return toMetadata(meta);
  const fallback = nodeFallbackMetadata(
    await fetchNodeForMeta(nodeApi[path], slug),
    path.replace(/\[[a-zA-Z]+\]/, slug),
  );
  // an entry with only some fields set (e.g. noIndex) still applies
  return { ...fallback, ...stripUndefined(toMetadata(meta)) };
};

// A node page that builds its own fallback (e.g. /dr/[slug], whose public
// response wraps the doctor) - the admin's SEO entry wins field by field.
export const withNodePageMeta = async (
  path: PageMetaNodeResourceType,
  nodeSlug: string,
  fallback: Metadata,
): Promise<Metadata> => {
  let slug = nodeSlug;
  try {
    slug = decodeURIComponent(nodeSlug);
  } catch {
    // a malformed escape: use it as is
  }
  const meta = await fetchNodePageMeta(path, slug);
  return { ...fallback, ...stripUndefined(toMetadata(meta)) };
};

const stripUndefined = (value: Metadata): Metadata =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Metadata;

export const getListPageWebSchema = async (
  path: PageMetaListResourceType,
): Promise<Record<string, unknown> | undefined> =>
  (await fetchListPageMeta(path))?.webSchema;

export const getNodePageWebSchema = async (
  path: PageMetaNodeResourceType,
  nodeSlug?: string,
): Promise<Record<string, unknown> | undefined> =>
  nodeSlug ? (await fetchNodePageMeta(path, nodeSlug))?.webSchema : undefined;
