"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageClinicCategoriesPage from "@/Components/Admin/ClinicCategory/AdminManageClinicCategoriesPage";
import AdminManageClinicTagsPage from "@/Components/Admin/ClinicTag/AdminManageClinicTagsPage";
import AdminManageClinicsPage from "@/Components/Admin/Clinic/AdminManageClinicsPage";

// کلینیک‌ها: one admin page, its parts as tabs (2026-09 admin audit).
const ClinicHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("کلینیک‌ها")}
      tabs={[
        {
          id: "clinics",
          title: ta("کلینیک‌ها"),
          exclude: !canOpen("Clinic"),
          content: <AdminManageClinicsPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("Clinic"),
          content: <AdminManageClinicCategoriesPage />,
        },
        {
          id: "tags",
          title: ta("ویژگی‌ها (تگ)"),
          exclude: !canOpen("Clinic"),
          content: <AdminManageClinicTagsPage />,
        },
      ]}
    />
  );
};

export default ClinicHub;
