import ClinicPage, { ClinicPageProps } from "@/Components/Clinic/ClinicPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/clinic/[slug]", ctx.params.slug);

const Clinic = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ClinicPageProps>(
    `clinic/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/clinic/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <ClinicPage {...data} />
    </>
  );
};

export default Clinic;
