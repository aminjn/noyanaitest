import { getPublicData } from "@/Components/helpers/getPublicData";
import ParaClinicsListPage, {
  ParaClinicsListPageProps,
} from "@/Components/ParaClinic/ParaClinicsListPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["paraClinicsList", "paraClinicCard"];

export const generateMetadata = () => getListPageMetadata("/paraClinic");

const ParaClinics = async (ctx: {
  searchParams: Promise<{
    search?: string;
    category?: string[] | string;
    page?: string;
    tag?: string;
    insurance?: string;
    // labs offering one test (a test card links here)
    test?: string;
  }>;
}) => {
  const {
    page: _page,
    search,
    category,
    test,
    tag,
    insurance,
  } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (tag) params.append("tag", tag);
  if (insurance) params.append("insurance", insurance);
  if (test) params.append("test", test);
  if (category)
    for (const cat of Array.isArray(category) ? category : [category])
      params.append("category", cat);
  const [data, textContent] = await Promise.all([
    getPublicData<ParaClinicsListPageProps>(`paraClinic?${params.toString()}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/paraClinic");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ParaClinicsListPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default ParaClinics;
