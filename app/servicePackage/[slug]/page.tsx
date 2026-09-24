import { getPublicData } from "@/Components/helpers/getPublicData";
import ServicePackagePage, {
  ServicepackagePageProps,
} from "@/Components/ServicePackage/ServicePackagePage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "servicePackagePage",
  "productCartable",
  "commentSection",
];

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/servicePackage/[slug]", ctx.params.slug);

const ServicePackage = async (ctx: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<ServicepackagePageProps>(`/servicePackage/${ctx.params.slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/servicePackage/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ServicePackagePage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default ServicePackage;
