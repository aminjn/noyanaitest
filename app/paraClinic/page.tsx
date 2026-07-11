import { getPublicData } from "@/Components/helpers/getPublicData";
import ParaClinicsListPage, {
  ParaClinicsListPageProps,
} from "@/Components/ParaClinic/ParaClinicsListPage";
import { notFound } from "next/navigation";

const ParaClinics = async (ctx: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) => {
  const { page: _page, search } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  const data = await getPublicData<ParaClinicsListPageProps>(
    `paraClinic?${params.toString()}`,
  );
  if (!data) return notFound();
  return <ParaClinicsListPage {...data} />;
};

export default ParaClinics;
