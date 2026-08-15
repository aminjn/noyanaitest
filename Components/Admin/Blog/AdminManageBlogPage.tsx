"use client";

import { useParams } from "next/navigation";
import classes from "./AdminManageBlogPage.module.css";
import useSWR from "swr";
import { IBlog, IBlogCategory } from "./AdminManageBlogsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import useProgress from "@/Components/Hooks/useProgress";
import List from "../UI/List";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteBlogPopup from "./DeleteBlogPopup";
import PageMetaEditor from "../PageMeta/PageMetaEditor";

const AdminManageBlogPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IBlog>(
    params ? `${API}/auto/blog/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const hasAccess = useAccessLevel();

  const push = useProgress();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Box>
          <TabSystem
            name="AdminManageBlog"
            items={[
              {
                icon: <InfoIcon />,
                id: "details",
                title: "جزئیات",
                content: (
                  <CreateForm
                    readOnly={!hasAccess("Blog", "update")}
                    defaultValue={data}
                    renderer={{
                      title: { title: "عنوان", type: "text" },
                      image: { title: "تصویر", type: "image" },
                      summary: { title: "خلاصه", type: "text" },
                      publishedAt: { title: "تاریخ انتشار", type: "date" },
                      order: { title: "رتبه", type: "number" },
                      slug: { title: "اسلاگ", type: "text" },
                      author: { title: "نویسنده", type: "text" },
                      readTime: { title: "مدت زمان مطالعه", type: "text" },
                      thisWeekSpecial: {
                        title: "مطالب ویژه این هفته",
                        type: "bool",
                      },
                      home: { title: "نمایش در خانه", type: "bool" },
                      published: { title: "منتشر شده", type: "bool" },
                      category: {
                        title: "دسته بندی",
                        type: "nodes",
                        multi: false,
                        getOptionLabel: (node) =>
                          (node as IBlogCategory).title ||
                          (node as IBlogCategory)._id,
                        getOptionValue: (node) => (node as IBlogCategory)._id,
                        getDefaultValue: (node) => node.category,
                        path: `${API}/auto/blogcategory`,
                      },
                      related: {
                        title: "مقالات مرتبط",
                        type: "nodes",
                        multi: true,
                        path: `${API}/auto/blog`,
                        getOptionLabel: (node) =>
                          (node as IBlog).title || (node as IBlog)._id,
                        getOptionValue: (node) => (node as IBlog)._id,
                        getDefaultValue: (node) => node.related,
                      },
                    }}
                    hookProps={{
                      path: `${API}/auto/blog/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                  />
                ),
              },
              {
                icon: <InfoIcon />,
                id: "content",
                content: (
                  <CreateForm
                    readOnly={!hasAccess("Blog", "update")}
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/blog/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                    renderer={{ content: { type: "rtf", title: "محتوا" } }}
                  />
                ),
                title: "محتوا",
              },
              {
                icon: <InfoIcon />,
                id: "Meta",
                title: "متادیتا",
                content: (
                  <PageMetaEditor
                    resourceType="/mag/[blogSlug]"
                    slug={data.slug}
                  />
                ),
              },
              {
                icon: <InfoIcon />,
                id: "Actions",
                content: (
                  <List>
                    {hasAccess("Blog", "delete") && (
                      <Button
                        variant="Error"
                        onClick={() =>
                          setPopup(
                            "DeleteBlog",
                            <DeleteBlogPopup mutate={mutate} node={data} />,
                          )
                        }
                      >
                        حذف این مقاله
                      </Button>
                    )}
                  </List>
                ),
                title: "عملیات",
              },
            ]}
          />
        </Box>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogPage;
