import FaqPage, { FaqPageProps } from "@/Components/Faq/FaqPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/faq");

const Faq = async () => {
  const data = await getPublicData<FaqPageProps>(`faq`);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/faq");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <FaqPage {...data} />
    </>
  );
};

export default Faq;
