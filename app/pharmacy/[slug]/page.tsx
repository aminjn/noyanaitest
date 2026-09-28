import { getPublicData } from "@/Components/helpers/getPublicData";
import PharmacyPage, { PharmacyPageProps } from "@/Components/Pharmacy/PharmacyPage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["pharmacyPage", "medicalCenterLocation", "productServiceCard"];

export const generateMetadata = async (ctx: { params: { slug: string } }) => {
  const meta = await getNodePageMetadata("/pharmacy/[slug]", ctx.params.slug);
  if (meta.title) return meta;
  // no SEO entry yet: at least name the page after the pharmacy
  const data = await getPublicData<PharmacyPageProps>(`/pharmacy/${ctx.params.slug}`);
  return data?.data?.name ? { ...meta, title: data.data.name, description: data.data.summary } : meta;
};

const Pharmacy = async (ctx: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<PharmacyPageProps>(`/pharmacy/${ctx.params.slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data?.data) return notFound();
  const webSchema = await getNodePageWebSchema("/pharmacy/[slug]", ctx.params.slug);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <PharmacyPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Pharmacy;
