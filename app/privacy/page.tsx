import { getPublicData } from "@/Components/helpers/getPublicData";
import PolicyPage, { PolicyPageProps } from "@/Components/Policy/PolicyPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["policyPage"];

export const generateMetadata = () => getListPageMetadata("/privacy");

const Privacy = async () => {
  const [data, textContent] = await Promise.all([
    getPublicData<PolicyPageProps>("privacy"),
    getScopedTextContent(NS),
  ]);

  if (!data) return notFound();

  const webSchema = await getListPageWebSchema("/privacy");

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <PolicyPage
          {...data}
          title="privacyPageTitle"
          legend="privacyPageLegend"
          path="/privacy"
        />
      </LocaleScopeProvider>
    </>
  );
};

export default Privacy;
