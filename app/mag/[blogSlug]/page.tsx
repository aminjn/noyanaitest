import BlogPage, { BlogPageProps } from "@/Components/Blog/BlogPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const Blog = async ({
  params: { blogSlug },
}: {
  params: { blogSlug: string };
}) => {
  const data = await getPublicData<BlogPageProps>(`blog/${blogSlug}`);

  if (!data?.blog) return notFound();

  return <BlogPage {...data} />;
};

export default Blog;
