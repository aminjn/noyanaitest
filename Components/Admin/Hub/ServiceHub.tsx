"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageServiceCategoriesPage from "@/Components/Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import AdminManageServicePackagesPage from "@/Components/Admin/ServicePackage/AdminManageServicePackagesPage";
import AdminManageServicesPage from "@/Components/Admin/Service/AdminManageServicesPage";

// خدمات: one admin page, its parts as tabs (2026-09 admin audit).
const ServiceHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("خدمات")}
      tabs={[
        {
          id: "services",
          title: ta("خدمات"),
          exclude: !canOpen("Service"),
          content: <AdminManageServicesPage />,
        },
        {
          id: "packages",
          title: ta("پکیج‌های خدمات"),
          exclude: !canOpen("Service"),
          content: <AdminManageServicePackagesPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("Service"),
          content: <AdminManageServiceCategoriesPage />,
        },
      ]}
    />
  );
};

export default ServiceHub;
