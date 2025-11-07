import { getPublicData } from "@/Components/helpers/getPublicData";
import SymptomsListPage, {
  SymptomsListPageProps,
} from "@/Components/Symptom/SymptomsListPage";
import { notFound } from "next/navigation";

const SymptomsList = async ({
  params: { page: _page },
}: {
  params: { page: string };
}) => {
  const page = Number(_page);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const data = await getPublicData<SymptomsListPageProps>(
    `symptom?page=${page}`
  );
  if (!data) return notFound();
  return <SymptomsListPage {...data} />;
};

export default SymptomsList;
