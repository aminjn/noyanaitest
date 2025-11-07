import DiseasesListPage, {
  DiseasesListPageProps,
} from "@/Components/Disease/DiseasesListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const DiseasesList = async () => {
  const data = await getPublicData<DiseasesListPageProps>("disease?page=1");
  if (!data) return notFound();
  return <DiseasesListPage {...data} />;
};

export default DiseasesList;
