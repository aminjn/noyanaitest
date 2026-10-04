"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageDiseaseCategoriesPage from "@/Components/Admin/DiseaseCategory/AdminManageDiseaseCategoriesPage";
import AdminManageDiseasesPage from "@/Components/Admin/Disease/AdminManageDiseasesPage";

// بیماری‌ها: one admin page, its parts as tabs (2026-09 admin audit).
const DiseaseHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("بیماری‌ها")}
      tabs={[
        {
          id: "diseases",
          title: ta("بیماری‌ها"),
          exclude: !canOpen("Disease"),
          content: <AdminManageDiseasesPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          // disease tags (2026-10) were a coloured chip that filtered
          // nothing; they were folded into these categories, which are a
          // browsable page of the public directory (/disease/category/…)
          hint: ta("هر دسته‌ی فعال یک صفحه در فهرست بیماری‌های سایت دارد. برچسب‌های قدیمی بیماری در این دسته‌ها ادغام شده‌اند."),
          exclude: !canOpen("Disease"),
          content: <AdminManageDiseaseCategoriesPage />,
        },
      ]}
    />
  );
};

export default DiseaseHub;
