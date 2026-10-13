"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageSpecialitiesPage from "@/Components/Admin/Speciality/AdminManageSpecialitiesPage";
import AdminCatalogCleanupTab from "@/Components/Admin/Catalog/AdminCatalogCleanupTab";

// تخصص‌ها: the list, and its clean-up (2026-10: a partner import had
// created thousands of free-text specialities) as a tab of the same page
const SpecialityHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("تخصص ها")}
      tabs={[
        { id: "list", title: ta("تخصص ها"), exclude: !canOpen("Sepciality"), content: <AdminManageSpecialitiesPage /> },
        {
          id: "cleanup",
          title: ta("ادغام و پاک‌سازی"),
          exclude: !canOpen("Sepciality"),
          content: <AdminCatalogCleanupTab kind="speciality" />,
        },
      ]}
    />
  );
};

export default SpecialityHub;
