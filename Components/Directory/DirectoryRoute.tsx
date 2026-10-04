import { notFound } from "next/navigation";
import { cache } from "react";
import { getPublicData } from "../helpers/getPublicData";
import {
  getDirectoryPageMetadata,
  getDirectoryWebSchema,
} from "../helpers/getPageMetadata";
import JsonLdSchema from "../UI/JsonLdSchema";
import LocaleScopeProvider from "../Store/LocaleScopeProvider";
import { ContentNamespace } from "../Enums/contentNamespaces";
import DirectoryPage from "./DirectoryPage";
import {
  DirectoryData,
  DirectoryFacetType,
  DirectoryKind,
  directorySeoPath,
  isDirectoryFacet,
  normalizeDirectoryData,
} from "./directoryTypes";

// Server side of every directory URL: /disease, /disease/letter/ب,
// /drug/class/<slug>, /symptom/part/<slug>, ... (the page files under
// app/<kind>/<facet>/[value] are one line each).

export type DirectorySearchParams = { page?: string; search?: string };

const NS: Record<DirectoryKind, ContentNamespace[]> = {
  disease: ["common", "diseasesList", "diseaseCard"],
  drug: ["common", "drugsList", "drugCard"],
  symptom: ["common", "symptomsList", "symptomCard"],
};

const decode = (value?: string) => {
  if (!value) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const pageOf = (raw?: string) => {
  const page = Number(raw || 1);
  return Number.isInteger(page) && page >= 1 ? page : null;
};

// cached per request: generateMetadata and the page share one fetch
const fetchDirectory = cache(
  async (kind: DirectoryKind, type: string, value: string, page: number, search: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("query", search);
    if (type) {
      params.set("facet", type);
      params.set("value", value);
    }
    return normalizeDirectoryData(
      await getPublicData<Partial<DirectoryData>>(`directory/${kind}?${params.toString()}`),
      kind,
    );
  },
);

export const directoryMetadata = async (
  kind: DirectoryKind,
  type: DirectoryFacetType | undefined,
  rawValue: string | undefined,
  searchParams: DirectorySearchParams,
) => {
  const page = pageOf(searchParams.page) || 1;
  const value = decode(rawValue);
  return getDirectoryPageMetadata(directorySeoPath(kind, type), type ? value : undefined, {
    page,
    search: searchParams.search,
  });
};

const DirectoryRoute = async ({
  kind,
  type,
  value: rawValue,
  searchParams,
}: {
  kind: DirectoryKind;
  type?: DirectoryFacetType;
  value?: string;
  searchParams: DirectorySearchParams;
}) => {
  const page = pageOf(searchParams.page);
  if (!page) return notFound();
  if (type && !isDirectoryFacet(kind, type)) return notFound();
  const value = decode(rawValue) || "";
  if (type && !value) return notFound();
  const search = (searchParams.search || "").trim().slice(0, 100);
  const [data, webSchema] = await Promise.all([
    fetchDirectory(kind, type || "", value, page, search),
    getDirectoryWebSchema(directorySeoPath(kind, type), type ? value : undefined),
  ]);
  if (!data) return notFound();
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS[kind]} initialTextContent={undefined}>
        <DirectoryPage data={data} search={search} />
      </LocaleScopeProvider>
    </>
  );
};

export default DirectoryRoute;
