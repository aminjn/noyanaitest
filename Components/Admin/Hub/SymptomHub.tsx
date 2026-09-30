"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManagePartsPage from "@/Components/Admin/Part/AdminManagePartsPage";
import AdminManageSymptomCategoriesPage from "@/Components/Admin/SymptomCategory/AdminManageSymptomCategoriesPage";
import AdminManageSymptomsPage from "@/Components/Admin/Symptom/AdminManageSymptomsPage";

// علائم: one admin page, its parts as tabs (2026-09 admin audit).
const SymptomHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("علائم")}
      tabs={[
        {
          id: "symptoms",
          title: ta("علائم"),
          exclude: !canOpen("Symptom"),
          content: <AdminManageSymptomsPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("Symptom"),
          content: <AdminManageSymptomCategoriesPage />,
        },
        {
          id: "parts",
          title: ta("اعضای بدن"),
          exclude: !canOpen("Part"),
          content: <AdminManagePartsPage />,
        },
      ]}
    />
  );
};

export default SymptomHub;
