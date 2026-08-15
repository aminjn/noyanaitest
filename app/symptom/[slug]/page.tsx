import { getPublicData } from "@/Components/helpers/getPublicData";
import SymptomPage, {
  SymptomPageProps,
} from "@/Components/Symptom/SymptomPage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = ({
  params: { slug },
}: {
  params: { slug: string };
}) => getNodePageMetadata("/symptom/[slug]", slug);

const Symptom = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<SymptomPageProps>(`symptom/${slug}`);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema("/symptom/[slug]", slug);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <SymptomPage {...data} />
    </>
  );
};

export default Symptom;
