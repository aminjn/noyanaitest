import { getPublicData } from "@/Components/helpers/getPublicData";
import PharmaciesListPage, {
  PharmaciesListPageProps,
} from "@/Components/Pharmacy/PharmaciesListPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["pharmaciesList", "paraClinicCard"];

export const generateMetadata = () => getListPageMetadata("/pharmacy");

const Pharmacies = async (ctx: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    city?: string;
    insurance?: string;
    roundTheClock?: string;
  }>;
}) => {
  const { page: _page, search, city, insurance, roundTheClock } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (city) params.append("city", city);
  if (insurance) params.append("insurance", insurance);
  if (roundTheClock === "1") params.append("roundTheClock", "1");
  const [data, textContent] = await Promise.all([
    getPublicData<PharmaciesListPageProps>(`pharmacy?${params.toString()}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/pharmacy");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <PharmaciesListPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Pharmacies;
