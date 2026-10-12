import ClinicPage, { ClinicPageProps } from "@/Components/Clinic/ClinicPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
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

const NS: ContentNamespace[] = ["clinicPage", "medicalCenter", "medicalCenterNav", "medicalCenterLocation", "commentSection"];

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/clinic/[slug]", ctx.params.slug);

const Clinic = async (ctx: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<ClinicPageProps>(`clinic/${ctx.params.slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const [webSchema, faqOn, faqCtx] = await Promise.all([
    getNodePageWebSchema("/clinic/[slug]", ctx.params.slug),
    getNodeAutoFaqEnabled("/clinic/[slug]", ctx.params.slug),
    getServerFaqContext(),
  ]);
  // the automatic FAQ from the clinic's own data: the visible block and the
  // FAQPage data are one list (Components/Seo/autoFaq.ts)
  const faqItems = faqOn ? centrePageFaq("clinic", data.data, faqCtx) : [];
  return (
    <>
      <JsonLdSchema schema={withFaqPage(webSchema, faqItems)} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ClinicPage {...data} faqItems={faqItems} />
      </LocaleScopeProvider>
    </>
  );
};

export default Clinic;
