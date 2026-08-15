import { getPublicData } from "@/Components/helpers/getPublicData";
import HospitalsPage, {
  HospitalsPageProps,
} from "@/Components/Hospital/HospitalsPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/hospital");

const HospitalsList = async (ctx: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    province?: string;
    page?: string;
  }>;
}) => {
  const { page: _page, search, category, province } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (category) params.append("category", category);
  if (province) params.append("province", province);
  const data = await getPublicData<HospitalsPageProps>(
    `hospital?${params.toString()}`,
  );
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/hospital");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <HospitalsPage {...data} />
    </>
  );
};

export default HospitalsList;
