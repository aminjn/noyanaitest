import ClinicsListPage, {
  ClinicsListProps,
} from "@/Components/Clinic/ClinicsListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["clinicsList", "clinicCard"];

export const generateMetadata = () => getListPageMetadata("/clinic");

const ClinicsList = async (ctx: {
  searchParams: Promise<{
    search?: string;
    category?: string[] | string;
    page?: string;
    tag?: string;
    insurance?: string;
    // «الان باز است» (2026-10): open at this minute, Tehran time
    openNow?: string;
  }>;
}) => {
  const {
    page: _page,
    search,
    category,
    tag,
    insurance,
    openNow,
  } = await ctx.searchParams;

  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (tag) params.append("tag", tag);
  if (insurance) params.append("insurance", insurance);
  if (openNow === "1") params.append("openNow", "1");
  if (category)
    for (const cat of Array.isArray(category) ? category : [category])
      params.append("category", cat);
  const [data, textContent] = await Promise.all([
    getPublicData<ClinicsListProps>(`clinic?${params.toString()}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/clinic");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ClinicsListPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default ClinicsList;
