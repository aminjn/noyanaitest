"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManagePageMetaListPage from "@/Components/Admin/PageMeta/AdminManagePageMetaListPage";
import AdminManageShortLinksPage from "@/Components/Admin/ShortLink/AdminManageShortLinksPage";
import AdminManageRedirectionsPage from "@/Components/Admin/Redirection/AdminManageRedirectionsPage";
import AdminSeoTemplatesPage from "@/Components/Admin/Seo/AdminSeoTemplatesPage";

// سئو و لینک‌ها (2026-09 audit): page metadata, short links and redirects
// were three menu items. «سئوی خودکار» (2026-10): per-type templates that
// describe every page from its own record.
const SeoHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("سئو و لینک‌ها")}
      tabs={[
        {
          id: "auto",
          title: ta("سئوی خودکار"),
          exclude: !canOpen("PageMeta"),
          content: <AdminSeoTemplatesPage />,
        },
        {
          id: "meta",
          title: ta("متادیتای صفحات"),
          exclude: !canOpen("PageMeta"),
          content: <AdminManagePageMetaListPage />,
        },
        {
          id: "shortlinks",
          title: ta("لینک‌های کوتاه"),
          exclude: !canOpen("ShortLink"),
          content: <AdminManageShortLinksPage />,
        },
        {
          id: "redirects",
          title: ta("ریدایرکت‌ها"),
          exclude: !canOpen("Redirection"),
          content: <AdminManageRedirectionsPage />,
        },
      ]}
    />
  );
};

export default SeoHub;
