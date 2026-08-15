import FaqPage, { FaqPageProps } from "@/Components/Faq/FaqPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const Faq = async () => {
  const data = await getPublicData<FaqPageProps>(`faq`);
  if (!data) return notFound();
  return <FaqPage {...data} />;
};

export default Faq;
