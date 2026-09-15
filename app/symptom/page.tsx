import { getPublicData } from "@/Components/helpers/getPublicData";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import SymptomsListPage, {
  SymptomsListPageProps,
} from "@/Components/Symptom/SymptomsListPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";

export const generateMetadata = () => getListPageMetadata("/symptom");

const SymptomsList = async (ctx: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) => {
  const { page: _page, search } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  const [data, textContent] = await Promise.all([
    getPublicData<SymptomsListPageProps>(`symptom?${params.toString()}`),
    getScopedTextContent(["common", "symptomsList"]),
  ]);

  if (!data) return notFound();

  const webSchema = await getListPageWebSchema("/symptom");

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["common", "symptomsList"]}
        initialTextContent={textContent}
      >
        <SymptomsListPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default SymptomsList;
