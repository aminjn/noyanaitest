import FaqPage, { FaqPageProps } from "@/Components/Faq/FaqPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "faqPage", "homeFaqs"];

export const generateMetadata = () => getListPageMetadata("/faq");

const Faq = async () => {
  const [data, textContent] = await Promise.all([
    getPublicData<FaqPageProps>(`faq`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/faq");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <FaqPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Faq;
