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
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "insurancesList", "insuranceCard"];

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
  const [data, textContent] = await Promise.all([
    getPublicData<InsurancesPageProps>(`insurance?${params.toString()}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/insurance");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <InsurancesPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Insurances;
