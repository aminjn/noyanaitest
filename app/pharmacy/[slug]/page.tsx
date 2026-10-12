import { getPublicData } from "@/Components/helpers/getPublicData";
import PharmacyPage, { PharmacyPageProps } from "@/Components/Pharmacy/PharmacyPage";
import { notFound } from "next/navigation";
import {
  getNodeAutoFaqEnabled,
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import { centrePageFaq, withFaqPage } from "@/Components/Seo/autoFaq";
import { getServerFaqContext } from "@/Components/Seo/serverFaqContext";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import { DOMAIN } from "@/Components/config";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["pharmacyPage", "medicalCenterLocation", "productServiceCard", "commentSection"];

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
  const [webSchema, faqOn, faqCtx] = await Promise.all([
    getNodePageWebSchema("/pharmacy/[slug]", ctx.params.slug),
    getNodeAutoFaqEnabled("/pharmacy/[slug]", ctx.params.slug),
    getServerFaqContext(),
  ]);
  // the automatic FAQ from the pharmacy's own data (Components/Seo/autoFaq.ts)
  const faqItems = faqOn
    ? centrePageFaq("pharmacy", { ...data.data, takesOrders: data.takesOrders }, faqCtx)
    : [];
  return (
    <>
      <JsonLdSchema
        schema={withFaqPage(
          webSchema,
          faqItems,
          `${DOMAIN.replace(/\/$/, "")}/pharmacy/${data.data.slug || data.data._id}`,
        )}
      />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <PharmacyPage {...data} faqItems={faqItems} />
      </LocaleScopeProvider>
    </>
  );
};

export default Pharmacy;
