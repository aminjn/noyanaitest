"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageBlogCategoriesPage from "@/Components/Admin/Blog/AdminManageBlogCategoriesPage";
import AdminManageBlogMediasPage from "@/Components/BlogMedia/AdminManageBlogMediasPage";
import AdminManageBlogRRSsPage from "@/Components/Admin/BlogRRS/AdminManageBlogRRSsPage";
import AdminManageBlogTagsPage from "@/Components/Admin/BlogTag/AdminManageBlogTgasPage";
import AdminManageBlogsPage from "@/Components/Admin/Blog/AdminManageBlogsPage";

// مجله: one admin page, its parts as tabs (2026-09 admin audit).
const BlogHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("مجله")}
      intro={ta("مقاله‌ها و همه‌ی چیزهایی که به آن‌ها وصل است، در یک صفحه. دسته و تگ را می‌توانید همان‌جا در فرم مقاله هم بسازید.")}
      tabs={[
        {
          id: "posts",
          title: ta("مقاله‌ها"),
          exclude: !canOpen("Blog"),
          content: <AdminManageBlogsPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("BlogCategory"),
          content: <AdminManageBlogCategoriesPage />,
        },
        {
          id: "tags",
          title: ta("تگ‌ها"),
          exclude: !canOpen("Blog"),
          content: <AdminManageBlogTagsPage />,
        },
        {
          id: "media",
          title: ta("رسانه"),
          exclude: !canOpen("BlogMedia"),
          content: <AdminManageBlogMediasPage />,
        },
        {
          id: "newsletter",
          title: ta("خبرنامه"),
          exclude: !canOpen("admin"),
          content: <AdminManageBlogRRSsPage />,
        },
      ]}
    />
  );
};

export default BlogHub;
