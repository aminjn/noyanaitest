import { getPublicData } from "@/Components/helpers/getPublicData";
import SpecialitiesPage, {
  SpecialitiesPageProps,
} from "@/Components/Speciality/SpecialitiesPage";
import { notFound } from "next/navigation";

const SepecailitiesList = async (ctx: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string[] | string;
  }>;
}) => {
  const { page: _page, search, category } = await ctx.searchParams;

  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (category)
    for (const cate of Array.isArray(category) ? category : [category])
      params.append("category", cate);
  const data = await getPublicData<SpecialitiesPageProps>(
    `speciality?${params.toString()}`,
  );
  if (!data) return notFound();
  return <SpecialitiesPage {...data} />;
};

export default SepecailitiesList;
