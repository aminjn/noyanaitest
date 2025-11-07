import DrugPage, { DrugPageProps } from "@/Components/Drug/DrugPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const Drug = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<DrugPageProps["data"]>(`drug/${slug}`);
  if (!data) return notFound();
  return <DrugPage data={data} />;
};

export default Drug;
