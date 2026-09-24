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

const NS: ContentNamespace[] = ["common", "policyPage"];

export const generateMetadata = () => getListPageMetadata("/policy");

const Policy = async () => {
  const [data, textContent] = await Promise.all([
    getPublicData<PolicyPageProps>(`/policy`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/policy");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <PolicyPage
          {...data}
          title="policyPageTitle"
          legend="policyPageLegend"
          path="/policy"
        />
      </LocaleScopeProvider>
    </>
  );
};

export default Policy;
