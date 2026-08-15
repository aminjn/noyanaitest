import DiseasePage, {
  DiseasePageProps,
} from "@/Components/Disease/DiseasePage";
import { getPublicData } from "@/Components/helpers/getPublicData";
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
}) => getNodePageMetadata("/disease/[slug]", slug);

const Disease = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<DiseasePageProps>(`disease/${slug}`);
  if (!data) return notFound();

  const webSchema = await getNodePageWebSchema("/disease/[slug]", slug);

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <DiseasePage {...data} />
    </>
  );
};

export default Disease;
