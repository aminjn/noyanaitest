import { cache } from "react";
import type { Metadata } from "next";
import { getPublicData } from "./getPublicData";
import { FilePath } from "../config";
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
    alternates: data.canonicalUrl
      ? { canonical: data.canonicalUrl }
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

export const getNodePageMetadata = async (
  path: PageMetaNodeResourceType,
  nodeSlug?: string,
): Promise<Metadata> =>
  nodeSlug ? toMetadata(await fetchNodePageMeta(path, nodeSlug)) : {};

export const getListPageWebSchema = async (
  path: PageMetaListResourceType,
): Promise<Record<string, unknown> | undefined> =>
  (await fetchListPageMeta(path))?.webSchema;

export const getNodePageWebSchema = async (
  path: PageMetaNodeResourceType,
  nodeSlug?: string,
): Promise<Record<string, unknown> | undefined> =>
  nodeSlug ? (await fetchNodePageMeta(path, nodeSlug))?.webSchema : undefined;
