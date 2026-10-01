"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageStaticImagesPage from "@/Components/Admin/StaticImages/AdminManageStaticImagesPage";
import AdminManageTestifiesPage from "@/Components/Admin/Testify/AdminManageTestifiesPage";

// صفحه‌ی همکاری پزشکان: one admin page, its parts as tabs (2026-09 admin audit).
const DoctorsPageHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("صفحه‌ی همکاری پزشکان")}
      intro={ta("صفحه‌ی معرفی نویان به پزشکان و مراکز (/onboarding).")}
      tabs={[
        {
          id: "images",
          title: ta("تصاویر"),
          exclude: !canOpen("admin"),
          content: <AdminManageStaticImagesPage only={["onboadingProfile", "onboadingClinic", "onboadrdinConsult"]} title={ta("تصاویر صفحه")} />,
        },
        {
          id: "testify",
          title: ta("توصیه‌نامه‌ی پزشکان"),
          exclude: !canOpen("admin"),
          content: <AdminManageTestifiesPage />,
        },
      ]}
    />
  );
};

export default DoctorsPageHub;
