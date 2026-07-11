import ClinicsListPage, {
  ClinicsListProps,
} from "@/Components/Clinic/ClinicsListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

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
  const data = await getPublicData<ClinicsListProps>(
    `clinic?${params.toString()}`,
  );
  if (!data) return notFound();
  return <ClinicsListPage {...data} />;
};

export default ClinicsList;
