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
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["diseasePage"];

export const generateMetadata = ({
  params: { slug },
}: {
  params: { slug: string };
}) => getNodePageMetadata("/disease/[slug]", slug);

const Disease = async ({ params: { slug } }: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<DiseasePageProps>(`disease/${slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();

  const webSchema = await getNodePageWebSchema("/disease/[slug]", slug);

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <DiseasePage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Disease;
