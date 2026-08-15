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

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/insurance/[slug]", ctx.params.slug);

const Insurance = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<InsurancePageProps>(
    `/insurance/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/insurance/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <InsurancePage {...data} />
    </>
  );
};

export default Insurance;
