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

const NS: ContentNamespace[] = ["common", "clinicsList", "clinicCard"];

export const generateMetadata = () => getListPageMetadata("/clinic");

const ClinicsList = async (ctx: {
  searchParams: Promise<{
    search?: string;
    category?: string[] | string;
    page?: string;
  }>;
}) => {
  const { page: _page, search, category } = await ctx.searchParams;

  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
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
