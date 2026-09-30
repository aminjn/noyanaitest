"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageHospitalCategoriesPage from "@/Components/Admin/HospitalCategory/AdminManageHospitalCategoriesPage";
import AdminManageHospitalTagsPage from "@/Components/Admin/HospitalTag/AdminManageHospitalTagsPage";
import AdminManageHospitalsPage from "@/Components/Admin/Hospital/AdminManageHospitalsPage";

// بیمارستان‌ها: one admin page, its parts as tabs (2026-09 admin audit).
const HospitalHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("بیمارستان‌ها")}
      tabs={[
        {
          id: "hospitals",
          title: ta("بیمارستان‌ها"),
          exclude: !canOpen("Hospital"),
          content: <AdminManageHospitalsPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("Hospital"),
          content: <AdminManageHospitalCategoriesPage />,
        },
        {
          id: "tags",
          title: ta("ویژگی‌ها (تگ)"),
          exclude: !canOpen("Hospital"),
          content: <AdminManageHospitalTagsPage />,
        },
      ]}
    />
  );
};

export default HospitalHub;
