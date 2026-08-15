import DrugPage, { DrugPageProps } from "@/Components/Drug/DrugPage";
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
}) => getNodePageMetadata("/drug/[slug]", slug);

const Drug = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<DrugPageProps>(`drug/${slug}`);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema("/drug/[slug]", slug);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <DrugPage {...data} />
    </>
  );
};

export default Drug;
