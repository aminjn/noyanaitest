"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageTestCategoriesPage from "@/Components/Admin/TestCategory/AdminManageTestCategoriesPage";
import AdminManageTestsPage from "@/Components/Admin/Test/AdminManageTestsPage";

// آزمایش‌ها: one admin page, its parts as tabs (2026-09 admin audit).
const TestHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("آزمایش‌ها")}
      tabs={[
        {
          id: "tests",
          title: ta("آزمایش‌ها"),
          exclude: !canOpen("Test"),
          content: <AdminManageTestsPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("Test"),
          content: <AdminManageTestCategoriesPage />,
        },
      ]}
    />
  );
};

export default TestHub;
