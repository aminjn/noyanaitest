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
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["hospitalPage", "medicalCenter", "medicalCenterNav", "medicalCenterLocation", "commentSection"];

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/hospital/[slug]", ctx.params.slug);

const Hospital = async (ctx: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<HospitalPageProps>(`/hospital/${ctx.params.slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/hospital/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <HospitalPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Hospital;
