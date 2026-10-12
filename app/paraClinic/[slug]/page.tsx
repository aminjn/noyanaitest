import { getPublicData } from "@/Components/helpers/getPublicData";
import ParaClinicPage, {
  ParaClinicPageProps,
} from "@/Components/ParaClinic/ParaClinicPage";
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

const NS: ContentNamespace[] = ["paraClinicPage", "medicalCenterNav", "medicalCenterLocation", "commentSection"];

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/paraClinic/[slug]", ctx.params.slug);

const ParaClinic = async (ctx: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<ParaClinicPageProps>(`/paraClinic/${ctx.params.slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const [webSchema, faqOn, faqCtx] = await Promise.all([
    getNodePageWebSchema("/paraClinic/[slug]", ctx.params.slug),
    getNodeAutoFaqEnabled("/paraClinic/[slug]", ctx.params.slug),
    getServerFaqContext(),
  ]);
  // the automatic FAQ from the lab's own data (Components/Seo/autoFaq.ts)
  const faqItems = faqOn
    ? centrePageFaq("paraClinic", { ...data.data, takesOrders: data.takesOrders }, faqCtx)
    : [];
  return (
    <>
      <JsonLdSchema
        schema={withFaqPage(
          webSchema,
          faqItems,
          `${DOMAIN.replace(/\/$/, "")}/paraClinic/${data.data.slug || data.data._id}`,
        )}
      />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ParaClinicPage {...data} faqItems={faqItems} />
      </LocaleScopeProvider>
    </>
  );
};

export default ParaClinic;
