import DrugsListPage, {
  DrugsListPageProps,
} from "@/Components/Drug/DrugsListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const DrugsList = async ({
  params: { page: _page },
}: {
  params: { page: string };
}) => {
  const page = Number(_page);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const data = await getPublicData<DrugsListPageProps>(`drug?page=${page}`);
  if (!data) return notFound();
  return <DrugsListPage {...data} />;
};

export default DrugsList;
