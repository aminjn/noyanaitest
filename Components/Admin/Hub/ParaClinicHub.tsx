"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageParaClinicCategoriesPage from "@/Components/Admin/ParaClinicCategory/AdminManageParaClinicCategoriesPage";
import AdminManageParaClinicTagsPage from "@/Components/Admin/ParaClinicTag/AdminManageParaClinicTagsPage";
import AdminManageParaClinicsPage from "@/Components/Admin/ParaClinic/AdminManageParaClinicsPage";

// پاراکلینیک‌ها: one admin page, its parts as tabs (2026-09 admin audit).
const ParaClinicHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("پاراکلینیک‌ها")}
      tabs={[
        {
          id: "centres",
          title: ta("مراکز"),
          exclude: !canOpen("ParaClinic"),
          content: <AdminManageParaClinicsPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("ParaClinic"),
          content: <AdminManageParaClinicCategoriesPage />,
        },
        {
          id: "tags",
          title: ta("ویژگی‌ها (تگ)"),
          exclude: !canOpen("ParaClinic"),
          content: <AdminManageParaClinicTagsPage />,
        },
      ]}
    />
  );
};

export default ParaClinicHub;
