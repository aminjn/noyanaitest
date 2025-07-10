import {
  IBlog,
  IBlogCategory,
} from "@/Components/Admin/Blog/AdminManageBlogsPage";
import BlogsPage, { BlogsPageProps } from "@/Components/Blog/BlogsPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { isPositiveInt } from "@/Components/helpers/Validators";
import { notFound } from "next/navigation";

const BlogsPagination = async ({
  params: { page },
  searchParams: { sort },
}: {
  params: { page: string };
  searchParams: { sort?: string };
}) => {
  if (!isPositiveInt(page)) return notFound();
  const data = await getPublicData<BlogsPageProps>(
    `blog?page=${page}${sort ? `&sort=${sort}` : ""}`
  );
  if (!data?.blogs?.length) return notFound();
  return <BlogsPage {...data} />;
};

export default BlogsPagination;
