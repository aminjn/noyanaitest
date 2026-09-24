import BlogsPage, { BlogsPageProps } from "@/Components/Blog/BlogsPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import { notFound } from "next/navigation";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["mag", "blogMainCard"];

export const generateMetadata = () => getListPageMetadata("/mag");

const Blogs = async ({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    search?: string;
    page?: string;
    tag?: string;
    category?: string;
  }>;
}) => {
  const { category, page: _page, search, sort, tag } = await searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (sort) params.append("sort", sort);
  if (category) params.append("category", category);
  if (search) params.append("query", search);
  if (tag) params.append("tag", tag);
  const [data, textContent] = await Promise.all([
    getPublicData<BlogsPageProps>(`blog?${params.toString()}`),
    getScopedTextContent(NS),
  ]);

  if (!data) return notFound();

  const webSchema = await getListPageWebSchema("/mag");

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <BlogsPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Blogs;
