"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

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
import { IBlogTag } from "../BlogTag/AdminManageBlogTgasPage";
import { ta } from "@/Components/Admin/i18n/adminText";

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
                title: ta("جزئیات"),
                content: (
                  <CreateForm
                    readOnly={!hasAccess("Blog", "update")}
                    defaultValue={data}
                    renderer={{
                      title: { title: ta("عنوان"), type: "text" },
                      image: { title: ta("تصویر"), type: "image" },
                      summary: { title: ta("خلاصه"), type: "text" },
                      publishedAt: { title: ta("تاریخ انتشار"), type: "date" },
                      order: { title: ta("رتبه"), type: "number" },
                      slug: { title: ta("اسلاگ"), type: "text" },
                      author: { title: ta("نویسنده"), type: "text" },
                      readTime: { title: ta("مدت زمان مطالعه"), type: "text" },
                      thisWeekSpecial: {
                        title: ta("مطالب ویژه این هفته"),
                        type: "bool",
                      },
                      home: { title: ta("نمایش در خانه"), type: "bool" },
                      recommended: { title: ta("پیشنهاد شده"), type: "bool" },
                      chosen: { title: ta("منتخب"), type: "bool" },
                      published: { title: ta("منتشر شده"), type: "bool" },
                      category: {
                        title: ta("دسته بندی"),
                        type: "nodes",
                        multi: false,
                        getOptionLabel: (node) =>
                          (node as IBlogCategory).title ||
                          (node as IBlogCategory)._id,
                        getOptionValue: (node) => (node as IBlogCategory)._id,
                        getDefaultValue: (node) => node.category,
                        path: `${API}/auto/blogcategory`,
                        creatable: { path: `${API}/auto/blogcategory`, field: "title" },
                      },
                      related: {
                        title: ta("مقالات مرتبط"),
                        type: "nodes",
                        multi: true,
                        path: `${API}/auto/blog`,
                        getOptionLabel: (node) =>
                          (node as IBlog).title || (node as IBlog)._id,
                        getOptionValue: (node) => (node as IBlog)._id,
                        getDefaultValue: (node) => node.related,
                      },
                      tags: {
                        title: ta("تگ ها"),
                        type: "nodes",
                        getOptionLabel: (node) =>
                          (node as IBlogTag).name || (node as IBlogTag)._id,
                        getOptionValue: (node) => (node as IBlogTag)._id,
                        getDefaultValue: (inp) => inp.tags,
                        path: `${API}/auto/blogtag`,
                        creatable: { path: `${API}/auto/blogtag` },
                        multi: true,
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
                    renderer={{ content: { type: "rtf", title: ta("محتوا") } }}
                  />
                ),
                title: ta("محتوا"),
              },
              {
                icon: <InfoIcon />,
                id: "Meta",
                title: ta("متادیتا"),
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
                        {ta("حذف این مقاله")}
                      </Button>
                    )}
                  </List>
                ),
                title: ta("عملیات"),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="blog" />,
              },
            ]}
          />
        </Box>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogPage;
