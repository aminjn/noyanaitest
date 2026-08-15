import DiseasesListPage, {
  DiseasesListPageProps,
} from "@/Components/Disease/DiseasesListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

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
  const data = await getPublicData<DiseasesListPageProps>(
    `disease?${params.toString()}`,
  );
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/disease");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <DiseasesListPage {...data} />
    </>
  );
};

export default DiseasesList;
