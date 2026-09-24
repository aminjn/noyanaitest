import { getPublicData } from "@/Components/helpers/getPublicData";
import InsurancePage, {
  InsurancePageProps,
} from "@/Components/Insurance/InsurancePage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "insurancePage", "medicalCenterNav", "medicalCenterLocation", "commentSection"];

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/insurance/[slug]", ctx.params.slug);

const Insurance = async (ctx: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<InsurancePageProps>(`/insurance/${ctx.params.slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/insurance/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <InsurancePage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Insurance;
