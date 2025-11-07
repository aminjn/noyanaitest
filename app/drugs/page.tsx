import DrugsListPage, {
  DrugsListPageProps,
} from "@/Components/Drug/DrugsListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const DrugsList = async () => {
  const data = await getPublicData<DrugsListPageProps>("drug?page=1");
  if (!data) return notFound();
  return <DrugsListPage {...data} />;
};

export default DrugsList;
