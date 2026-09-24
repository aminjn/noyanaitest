import { getPublicData } from "@/Components/helpers/getPublicData";
import ServicePage, {
  ServicePageProps,
} from "@/Components/Service/ServicePage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["services", "productCartable", "commentSection"];

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/service/[slug]", ctx.params.slug);

const Service = async (ctx: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<ServicePageProps>(`/service/${ctx.params.slug}`),
    getScopedTextContent(NS),
  ]);

  if (!data) return notFound();

  const webSchema = await getNodePageWebSchema(
    "/service/[slug]",
    ctx.params.slug,
  );

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ServicePage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Service;
