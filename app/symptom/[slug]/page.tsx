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
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "symptomPage"];

export const generateMetadata = ({
  params: { slug },
}: {
  params: { slug: string };
}) => getNodePageMetadata("/symptom/[slug]", slug);

const Symptom = async ({ params: { slug } }: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<SymptomPageProps>(`symptom/${slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema("/symptom/[slug]", slug);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <SymptomPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Symptom;
