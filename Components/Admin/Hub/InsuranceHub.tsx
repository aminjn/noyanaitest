"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageInsuranceCategoriesPage from "@/Components/Admin/InsuranceCategory/AdminManageInsuranceCategoriesPage";
import AdminManageInsuranceTagsPage from "@/Components/Admin/InsuranceTag/AdminManageInsuranceTagsPage";
import AdminManageInsurancesPage from "@/Components/Admin/Insurance/AdminManageInsurancesPage";

// بیمه‌ها: one admin page, its parts as tabs (2026-09 admin audit).
const InsuranceHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("بیمه‌ها")}
      tabs={[
        {
          id: "insurances",
          title: ta("بیمه‌ها"),
          exclude: !canOpen("Insurance"),
          content: <AdminManageInsurancesPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("Insurance"),
          content: <AdminManageInsuranceCategoriesPage />,
        },
        {
          id: "tags",
          title: ta("ویژگی‌ها (تگ)"),
          exclude: !canOpen("Insurance"),
          content: <AdminManageInsuranceTagsPage />,
        },
      ]}
    />
  );
};

export default InsuranceHub;
