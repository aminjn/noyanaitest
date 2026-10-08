import { getPublicData } from "@/Components/helpers/getPublicData";
import TestPage, { TestPageProps } from "@/Components/Test/TestPage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["testPage", "testCard", "paraClinicCard"];

type Ctx = {
  params: { slug: string };
  searchParams: Promise<{ city?: string; sort?: string }>;
};

// the test's own SEO (template + record, Lib/seo/seoResolver.ts): the
// canonical is the plain /test/<slug>, so a city / sort view is not a
// second page in the index
export const generateMetadata = (ctx: Ctx) =>
  getNodePageMetadata("/test/[slug]", ctx.params.slug);

const Test = async (ctx: Ctx) => {
  const { city, sort } = await ctx.searchParams;
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  if (sort === "rating") params.append("sort", sort);
  const query = params.toString();
  const [data, textContent] = await Promise.all([
    getPublicData<TestPageProps>(
      `test/${ctx.params.slug}${query ? `?${query}` : ""}`,
    ),
    getScopedTextContent(NS),
  ]);
  if (!data?.data) return notFound();
  const webSchema = await getNodePageWebSchema("/test/[slug]", ctx.params.slug);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <TestPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Test;
