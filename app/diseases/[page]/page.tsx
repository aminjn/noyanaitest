import DiseasesListPage, {
  DiseasesListPageProps,
} from "@/Components/Disease/DiseasesListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const DiseasesList = async ({
  params: { page: _page },
}: {
  params: { page: string };
}) => {
  const page = Number(_page);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const data = await getPublicData<DiseasesListPageProps>(
    `disease?page=${page}`
  );
  if (!data) return notFound();
  return <DiseasesListPage {...data} />;
};

export default DiseasesList;
