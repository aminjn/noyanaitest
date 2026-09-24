import DrugPage, { DrugPageProps } from "@/Components/Drug/DrugPage";
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

const NS: ContentNamespace[] = ["drugPage"];

export const generateMetadata = ({
  params: { slug },
}: {
  params: { slug: string };
}) => getNodePageMetadata("/drug/[slug]", slug);

const Drug = async ({ params: { slug } }: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<DrugPageProps>(`drug/${slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema("/drug/[slug]", slug);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <DrugPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Drug;
