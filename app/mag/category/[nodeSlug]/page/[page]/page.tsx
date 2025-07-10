import classes from "./BlogCategoryPagination.module.css";
import BlogsPage, { BlogsPageProps } from "@/Components/Blog/BlogsPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { isPositiveInt } from "@/Components/helpers/Validators";
import { notFound } from "next/navigation";

const BlogCategoryPagination = async ({
  searchParams: { sort },
  params: { nodeSlug, page },
}: {
  searchParams: { sort?: string };
  params: { nodeSlug: string; page: string };
}) => {
  if (!isPositiveInt(page)) return notFound();
  const data = await getPublicData<BlogsPageProps>(
    `blog?category=${nodeSlug}&page=${page}${sort ? `&sort=${sort}` : ""}`
  );
  if (!data?.blogs?.length) return notFound();
  return <BlogsPage {...data} />;
};

export default BlogCategoryPagination;
