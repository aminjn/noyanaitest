import { IBlog } from "@/Components/Admin/Blog/AdminManageBlogsPage";
import BlogsPage, { BlogsPageProps } from "@/Components/Blog/BlogsPage";
import { getPublicData } from "@/Components/helpers/getPublicData";

const Blogs = async ({
  searchParams: { sort },
}: {
  searchParams: { sort?: string };
}) => {
  const data = await getPublicData<BlogsPageProps>(
    `blog?${sort ? `sort=${sort}` : ""}`
  );


  return <BlogsPage {...data} />;
};

export default Blogs;
