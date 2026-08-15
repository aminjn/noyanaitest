import { getPublicData } from "@/Components/helpers/getPublicData";
import HospitalPage, {
  HospitalPageProps,
} from "@/Components/Hospital/HospitalPage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/hospital/[slug]", ctx.params.slug);

const Hospital = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<HospitalPageProps>(
    `/hospital/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/hospital/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <HospitalPage {...data} />
    </>
  );
};

export default Hospital;
