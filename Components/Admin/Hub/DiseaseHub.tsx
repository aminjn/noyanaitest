"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageDiseaseCategoriesPage from "@/Components/Admin/DiseaseCategory/AdminManageDiseaseCategoriesPage";
import AdminManageDiseaseTagsPage from "@/Components/Admin/DiseaseTag/AdminManageDiseaseTagsPage";
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
          exclude: !canOpen("Disease"),
          content: <AdminManageDiseaseCategoriesPage />,
        },
        {
          id: "tags",
          title: ta("تگ‌ها"),
          exclude: !canOpen("Disease"),
          content: <AdminManageDiseaseTagsPage />,
        },
      ]}
    />
  );
};

export default DiseaseHub;
