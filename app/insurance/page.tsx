import { getPublicData } from "@/Components/helpers/getPublicData";
import InsurancesPage, {
  InsurancesPageProps,
} from "@/Components/Insurance/InsurancesPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/insurance");

const Insurances = async (ctx: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}) => {
  const { page: _page, search, category } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (category) params.append("category", category);
  const data = await getPublicData<InsurancesPageProps>(
    `insurance?${params.toString()}`,
  );
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/insurance");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <InsurancesPage {...data} />
    </>
  );
};

export default Insurances;
