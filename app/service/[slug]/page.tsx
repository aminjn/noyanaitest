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

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/service/[slug]", ctx.params.slug);

const Service = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ServicePageProps>(
    `/service/${ctx.params.slug}`,
  );

  if (!data) return notFound();

  const webSchema = await getNodePageWebSchema(
    "/service/[slug]",
    ctx.params.slug,
  );

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <ServicePage {...data} />
    </>
  );
};

export default Service;
