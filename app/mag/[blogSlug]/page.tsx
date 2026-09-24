import BlogPage, { BlogPageProps } from "@/Components/Blog/BlogPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "magPost", "commentSection"];

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
  const [data, textContent] = await Promise.all([
    getPublicData<BlogPageProps>(`blog/${blogSlug}`),
    getScopedTextContent(NS),
  ]);

  if (!data?.blog) return notFound();

  const webSchema = await getNodePageWebSchema("/mag/[blogSlug]", blogSlug);

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <BlogPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Blog;
