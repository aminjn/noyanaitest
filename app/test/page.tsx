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
  const data = await getPublicData<TestsListPageProps>(
    `test?${params.toString()}`,
  );
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/test");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <TestsListPage {...data} />
    </>
  );
};

export default TestsList;
