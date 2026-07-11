import DrugsListPage, {
  DrugsListPageProps,
} from "@/Components/Drug/DrugsListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const DrugsList = async (ctx: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) => {
  const { page: _page, search } = await ctx.searchParams;

  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);

  const data = await getPublicData<DrugsListPageProps>(
    `drug?${params.toString()}`,
  );

  if (!data) return notFound();
  return <DrugsListPage {...data} />;
};

export default DrugsList;
