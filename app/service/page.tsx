import { getPublicData } from "@/Components/helpers/getPublicData";
import ServiceListPage, {
  ServiceListPageProps,
} from "@/Components/Service/ServiceListPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/service");

const ServiceList = async (ctx: {
  searchParams: Promise<{
    category?: string;
    page?: string;
    search?: string;
    packageOnly?: string;
  }>;
}) => {
  const { page: _page, search, category, packageOnly } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (category) params.append("category", category);
  if (packageOnly) params.append("packageOnly", "1");
  const data = await getPublicData<ServiceListPageProps>(
    `service?${params.toString()}`,
  );
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/service");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <ServiceListPage {...data} />
    </>
  );
};

export default ServiceList;
