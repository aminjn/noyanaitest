import { IBlog } from "@/Components/Admin/Blog/AdminManageBlogsPage";
import BlogsPage, { BlogsPageProps } from "@/Components/Blog/BlogsPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/mag");

const Blogs = async ({
  searchParams: { sort },
}: {
  searchParams: { sort?: string };
}) => {
  const data = await getPublicData<BlogsPageProps>(
    `blog?${sort ? `sort=${sort}` : ""}`
  );

  const webSchema = await getListPageWebSchema("/mag");

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <BlogsPage {...data} />
    </>
  );
};

export default Blogs;
