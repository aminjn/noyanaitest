import { getPublicData } from "@/Components/helpers/getPublicData";
import HospitalPage, {
  HospitalPageProps,
} from "@/Components/Hospital/HospitalPage";
import { notFound } from "next/navigation";
import {
  getNodeAutoFaqEnabled,
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import { centrePageFaq, withFaqPage } from "@/Components/Seo/autoFaq";
import { getServerFaqContext } from "@/Components/Seo/serverFaqContext";
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
  const [webSchema, faqOn, faqCtx] = await Promise.all([
    getNodePageWebSchema("/hospital/[slug]", ctx.params.slug),
    getNodeAutoFaqEnabled("/hospital/[slug]", ctx.params.slug),
    getServerFaqContext(),
  ]);
  // the automatic FAQ from the hospital's own data (Components/Seo/autoFaq.ts)
  const faqItems = faqOn ? centrePageFaq("hospital", data.data, faqCtx) : [];
  return (
    <>
      <JsonLdSchema schema={withFaqPage(webSchema, faqItems)} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <HospitalPage {...data} faqItems={faqItems} />
      </LocaleScopeProvider>
    </>
  );
};

export default Hospital;
