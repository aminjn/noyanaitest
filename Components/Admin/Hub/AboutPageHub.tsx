"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageAboutPartnersPage from "@/Components/Admin/AboutPartner/AdminManageAboutPartnersPage";
import AdminManageAboutTeamsPage from "@/Components/Admin/AboutTeam/AdminManageAboutTeamsPage";
import AdminManageAboutWhysPage from "@/Components/Admin/AboutWhy/AdminManageAboutWhysPage";
import AdminManageStaticImagesPage from "@/Components/Admin/StaticImages/AdminManageStaticImagesPage";

// صفحه‌ی درباره ما: one admin page, its parts as tabs (2026-09 admin audit).
const AboutPageHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("صفحه‌ی درباره ما")}
      intro={ta("هر چیزی که در صفحه‌ی «درباره ما» دیده می‌شود.")}
      tabs={[
        {
          id: "images",
          title: ta("تصاویر"),
          exclude: !canOpen("admin"),
          content: <AdminManageStaticImagesPage only={["aboutMain", "aboutSecurity", "aboutCta"]} title={ta("تصاویر صفحه")} />,
        },
        {
          id: "why",
          title: ta("چرا ما و اصول"),
          exclude: !canOpen("admin"),
          content: <AdminManageAboutWhysPage />,
        },
        {
          id: "team",
          title: ta("تیم"),
          exclude: !canOpen("admin"),
          content: <AdminManageAboutTeamsPage />,
        },
        {
          id: "partners",
          title: ta("همکاران"),
          exclude: !canOpen("admin"),
          content: <AdminManageAboutPartnersPage />,
        },
      ]}
    />
  );
};

export default AboutPageHub;
