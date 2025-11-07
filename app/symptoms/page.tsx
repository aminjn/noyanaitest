import { getPublicData } from "@/Components/helpers/getPublicData";
import SymptomsListPage, {
  SymptomsListPageProps,
} from "@/Components/Symptom/SymptomsListPage";
import { notFound } from "next/navigation";

const SymptomsList = async () => {
  const data = await getPublicData<SymptomsListPageProps>("symptom?page=1");
  if (!data) return notFound();

  return <SymptomsListPage {...data} />;
};

export default SymptomsList;
