import BlogsPage, { BlogsPageProps } from "@/Components/Blog/BlogsPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import { notFound } from "next/navigation";

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
  const data = await getPublicData<BlogsPageProps>(`blog?${params.toString()}`);

  if (!data) return notFound();

  const webSchema = await getListPageWebSchema("/mag");

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <BlogsPage {...data} />
    </>
  );
};

export default Blogs;
