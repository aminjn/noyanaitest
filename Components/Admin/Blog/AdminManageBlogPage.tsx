"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

import { useParams } from "next/navigation";
import { IBlog, IBlogCategory } from "./AdminManageBlogsPage";
import { API } from "@/Components/config";
import InfoIcon from "@/Components/Icons/InfoIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import useProgress from "@/Components/Hooks/useProgress";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteBlogPopup from "./DeleteBlogPopup";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { IBlogTag } from "../BlogTag/AdminManageBlogTgasPage";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminRecordEditor from "../UI/AdminRecordEditor";

// one form for an article, new (`/blog/new`) or existing
// (Components/Admin/UI/AdminRecordEditor): its details and its content are
// sections of that form, saved together
const AdminManageBlogPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const hasAccess = useAccessLevel();
  const push = useProgress();
  const { setPopup } = usePopup();
  const details = ta("جزئیات");
  const display = ta("نمایش در سایت");
  const content = ta("محتوا");

  return (
    <AdminRecordEditor<IBlog>
      segment="blog"
      path="/blog"
      nodeId={nodeId}
      newTitle={ta("مقاله‌ی جدید")}
      titleOf={(node) => node.title || ""}
      readOnly={nodeId !== "new" && !hasAccess("Blog", "update")}
      actions={(node) =>
        hasAccess("Blog", "delete")
          ? [
              {
                title: ta("حذف"),
                danger: true,
                action: () =>
                  setPopup(
                    "DeleteBlog",
                    <DeleteBlogPopup
                      mutate={() => push(adminPath("/blog"))}
                      node={node}
                    />,
                  ),
              },
            ]
          : []
      }
      renderer={{
        title: {
          title: ta("عنوان"),
          type: "text",
          required: true,
          section: details,
        },
        summary: { title: ta("خلاصه"), type: "text", section: details },
        author: { title: ta("نویسنده"), type: "text", section: details },
        publishedAt: {
          title: ta("تاریخ انتشار"),
          type: "date",
          section: details,
        },
        slug: { title: ta("اسلاگ"), type: "text", section: details },
        order: { title: ta("رتبه"), type: "number", section: details },
        category: {
          title: ta("دسته بندی"),
          type: "nodes",
          multi: false,
          getOptionLabel: (node) =>
            (node as IBlogCategory).title || ta("بدون نام"),
          getOptionValue: (node) => (node as IBlogCategory)._id,
          getDefaultValue: (node) => node.category,
          path: `${API}/auto/blogcategory`,
          creatable: { path: `${API}/auto/blogcategory`, field: "title" },
          section: details,
        },
        tags: {
          title: ta("تگ ها"),
          type: "nodes",
          getOptionLabel: (node) => (node as IBlogTag).name || ta("بدون نام"),
          getOptionValue: (node) => (node as IBlogTag)._id,
          getDefaultValue: (inp) => inp.tags,
          path: `${API}/auto/blogtag`,
          creatable: { path: `${API}/auto/blogtag` },
          multi: true,
          section: details,
        },
        related: {
          title: ta("مقالات مرتبط"),
          type: "nodes",
          multi: true,
          path: `${API}/auto/blog`,
          getOptionLabel: (node) => (node as IBlog).title || ta("بدون نام"),
          getOptionValue: (node) => (node as IBlog)._id,
          getDefaultValue: (node) => node.related,
          section: details,
        },
        image: { title: ta("تصویر"), type: "image", section: details },
        content: { type: "rtf", title: ta("محتوا"), section: content },
        published: { title: ta("منتشر شده"), type: "bool", section: display },
        home: { title: ta("نمایش در خانه"), type: "bool", section: display },
        thisWeekSpecial: {
          title: ta("مطالب ویژه این هفته"),
          type: "bool",
          section: display,
        },
        recommended: {
          title: ta("پیشنهاد شده"),
          type: "bool",
          section: display,
        },
        chosen: { title: ta("منتخب"), type: "bool", section: display },
      }}
      extraTabs={(node) => [
        {
          icon: <InfoIcon />,
          id: "Meta",
          title: ta("سئو"),
          content: (
            <PageMetaEditor resourceType="/mag/[blogSlug]" slug={node.slug} />
          ),
        },
        {
          id: "translations",
          title: ta("ترجمه‌ها"),
          content: <AdminContentTranslationPage segment="blog" />,
        },
      ]}
    />
  );
};

export default AdminManageBlogPage;
