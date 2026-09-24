import DiseasesListPage, {
  DiseasesListPageProps,
} from "@/Components/Disease/DiseasesListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";

export const generateMetadata = () => getListPageMetadata("/disease");

const DiseasesList = async (ctx: {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}) => {
  const { page: _page, search, category } = await ctx.searchParams;

  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (category) params.append("category", category);
  const [data, textContent] = await Promise.all([
    getPublicData<DiseasesListPageProps>(`disease?${params.toString()}`),
    getScopedTextContent(["common", "diseasesList", "diseaseCard"]),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/disease");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["common", "diseasesList", "diseaseCard"]}
        initialTextContent={textContent}
      >
        <DiseasesListPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default DiseasesList;
