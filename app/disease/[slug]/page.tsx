import DiseasePage, {
  DiseasePageProps,
} from "@/Components/Disease/DiseasePage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const Disease = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<DiseasePageProps["data"]>(`disease/${slug}`);
  if (!data) return notFound();

  return <DiseasePage data={data} />;
};

export default Disease;
