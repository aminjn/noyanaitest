import { getPublicData } from "@/Components/helpers/getPublicData";
import ParaClinicsListPage, {
  ParaClinicsListPageProps,
} from "@/Components/ParaClinic/ParaClinicsListPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/paraClinic");

const ParaClinics = async (ctx: {
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
  const data = await getPublicData<ParaClinicsListPageProps>(
    `paraClinic?${params.toString()}`,
  );
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/paraClinic");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <ParaClinicsListPage {...data} />
    </>
  );
};

export default ParaClinics;
