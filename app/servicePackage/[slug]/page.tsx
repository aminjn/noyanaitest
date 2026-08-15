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

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/servicePackage/[slug]", ctx.params.slug);

const ServicePackage = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ServicepackagePageProps>(
    `/servicePackage/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/servicePackage/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <ServicePackagePage {...data} />
    </>
  );
};

export default ServicePackage;
