import { getPublicData } from "@/Components/helpers/getPublicData";
import SymptomPage, {
  SymptomPageProps,
} from "@/Components/Symptom/SymptomPage";
import { notFound } from "next/navigation";

const Symptom = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<SymptomPageProps["data"]>(`symptom/${slug}`);
  if (!data) return notFound();
  return <SymptomPage data={data} />;
};

export default Symptom;
