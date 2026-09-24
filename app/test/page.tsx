import { getPublicData } from "@/Components/helpers/getPublicData";
import TestsListPage, {
  TestsListPageProps,
} from "@/Components/Test/TestsListPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["testsList", "testCard"];

export const generateMetadata = () => getListPageMetadata("/test");

const TestsList = async (ctx: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) => {
  const { page: _page, search } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  const [data, textContent] = await Promise.all([
    getPublicData<TestsListPageProps>(
      `test?${params.toString()}`,
    ),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/test");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <TestsListPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default TestsList;
