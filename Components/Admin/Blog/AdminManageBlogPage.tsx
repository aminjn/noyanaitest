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

const AdminManageBlogPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IBlog>(
    params ? `${API}/auto/blog/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

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
            ]}
          />
        </Box>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogPage;
