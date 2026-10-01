"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageTextContentPage from "@/Components/Admin/TextContent/AdminManageTextContentPage";
import AdminContentTranslationsPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationsPage";
import AdminSiteLanguagesPage from "@/Components/Admin/Languages/AdminSiteLanguagesPage";

// زبان و ترجمه (2026-09 audit): UI texts, content translations and the site
// languages were three menu items in two groups. Site languages (which
// languages are on, and the default) stays super-admin only.
const LocalizationHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("زبان و ترجمه")}
      intro={ta("متن‌های رابط کاربری، ترجمه‌ی محتوای ذخیره‌شده و زبان‌های فعال سایت در یک صفحه.")}
      tabs={[
        {
          id: "texts",
          title: ta("متن‌های رابط کاربری"),
          exclude: !canOpen("TextContent"),
          content: <AdminManageTextContentPage />,
        },
        {
          id: "content",
          title: ta("ترجمه محتوا"),
          exclude: !canOpen("admin"),
          content: <AdminContentTranslationsPage />,
        },
        {
          id: "languages",
          title: ta("زبان‌های سایت"),
          exclude: !canOpen("admin"),
          content: <AdminSiteLanguagesPage />,
        },
      ]}
    />
  );
};

export default LocalizationHub;
