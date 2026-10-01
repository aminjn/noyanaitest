"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageDoctorFeedbacksPage from "@/Components/Admin/DoctorFeedback/AdminManageDoctorFeedbacksPage";
import AdminManageCommentsPage from "@/Components/Admin/Comment/AdminManageCommentsPage";

// نظرات و امتیازها (2026-09 audit): verified post-visit doctor reviews and
// comments on content and centres were two menu items; one page, two tabs.
// Like Doctolib / Zocdoc, only a patient who had the visit rates the doctor.
const ReviewsHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("نظرات و امتیازها")}
      intro={ta("نظرات تاییدشده‌ی ویزیت فقط از بیمارانی است که نوبتشان انجام شده؛ نظرات صفحات و مراکز از همه‌ی کاربران.")}
      tabs={[
        {
          id: "visits",
          title: ta("نظرات تاییدشده‌ی ویزیت"),
          exclude: !canOpen("DoctorFeedback"),
          content: <AdminManageDoctorFeedbacksPage />,
        },
        {
          id: "pages",
          title: ta("نظرات صفحات و مراکز"),
          exclude: !canOpen("Comment"),
          content: <AdminManageCommentsPage />,
        },
      ]}
    />
  );
};

export default ReviewsHub;
