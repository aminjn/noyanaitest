import ClinicPage, { ClinicPageProps } from "@/Components/Clinic/ClinicPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "clinicPage", "medicalCenter", "medicalCenterNav", "medicalCenterLocation", "commentSection"];

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/clinic/[slug]", ctx.params.slug);

const Clinic = async (ctx: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<ClinicPageProps>(`clinic/${ctx.params.slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/clinic/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ClinicPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Clinic;
