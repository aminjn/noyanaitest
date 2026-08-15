import { getPublicData } from "@/Components/helpers/getPublicData";
import ParaClinicPage, {
  ParaClinicPageProps,
} from "@/Components/ParaClinic/ParaClinicPage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/paraClinic/[slug]", ctx.params.slug);

const ParaClinic = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ParaClinicPageProps>(
    `/paraClinic/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/paraClinic/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <ParaClinicPage {...data} />
    </>
  );
};

export default ParaClinic;
