"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageFaqCategoriesPage from "@/Components/Admin/faqCategory/AdminManageFaqCategoriesPage";
import AdminManageFaqsPage from "@/Components/Admin/Faq/AdminManageFaqsPage";
import AdminManageDoctorFaqsPage from "@/Components/Admin/DoctorFaq/AdminManageDoctorFaqsPage";

// سوالات متداول: one admin page, its parts as tabs (2026-09 admin audit).
// The doctors tab moderates each doctor's own questions; the questions once
// shared by every doctor's page are gone (2026-10, the automatic FAQ).
const FaqHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("سوالات متداول")}
      tabs={[
        {
          id: "questions",
          title: ta("سوال‌ها"),
          exclude: !canOpen("Faq"),
          content: <AdminManageFaqsPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("Faq"),
          content: <AdminManageFaqCategoriesPage />,
        },
        {
          id: "doctors",
          title: ta("سوالات پزشکان"),
          exclude: !canOpen("DoctorFaq"),
          content: <AdminManageDoctorFaqsPage />,
        },
      ]}
    />
  );
};

export default FaqHub;
