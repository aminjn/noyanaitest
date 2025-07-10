import BlogsPage, { BlogsPageProps } from "@/Components/Blog/BlogsPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { isPositiveInt } from "@/Components/helpers/Validators";
import { notFound } from "next/navigation";

const BlogCategory = async ({
  searchParams: { sort },
  params: { nodeSlug },
}: {
  searchParams: { sort?: string };
  params: { nodeSlug: string };
}) => {
  const data = await getPublicData<BlogsPageProps>(
    `blog?category=${nodeSlug}${sort ? `&sort=${sort}` : ""}`
  );
  if (!data?.blogs) return notFound();

  return <BlogsPage {...data} />;
};

export default BlogCategory;
