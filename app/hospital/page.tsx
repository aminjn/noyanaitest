import { getPublicData } from "@/Components/helpers/getPublicData";
import HospitalsPage, {
  HospitalsPageProps,
} from "@/Components/Hospital/HospitalsPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["hospitalsList", "hospitalCard"];

export const generateMetadata = () => getListPageMetadata("/hospital");

const HospitalsList = async (ctx: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    province?: string;
    page?: string;
    tag?: string;
    insurance?: string;
    // «الان باز است» (2026-10): open at this minute, Tehran time
    openNow?: string;
  }>;
}) => {
  const {
    page: _page,
    search,
    category,
    province,
    tag,
    insurance,
    openNow,
  } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (tag) params.append("tag", tag);
  if (insurance) params.append("insurance", insurance);
  if (openNow === "1") params.append("openNow", "1");
  if (category) params.append("category", category);
  if (province) params.append("province", province);
  const [data, textContent] = await Promise.all([
    getPublicData<HospitalsPageProps>(`hospital?${params.toString()}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/hospital");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <HospitalsPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default HospitalsList;
