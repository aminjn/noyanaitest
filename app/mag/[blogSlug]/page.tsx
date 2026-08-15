import BlogPage, { BlogPageProps } from "@/Components/Blog/BlogPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = ({
  params: { blogSlug },
}: {
  params: { blogSlug: string };
}) => getNodePageMetadata("/mag/[blogSlug]", blogSlug);

const Blog = async ({
  params: { blogSlug },
}: {
  params: { blogSlug: string };
}) => {
  const data = await getPublicData<BlogPageProps>(`blog/${blogSlug}`);

  if (!data?.blog) return notFound();

  const webSchema = await getNodePageWebSchema("/mag/[blogSlug]", blogSlug);

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <BlogPage {...data} />
    </>
  );
};

export default Blog;
