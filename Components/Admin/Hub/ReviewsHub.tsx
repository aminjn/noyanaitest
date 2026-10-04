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
      intro={ta("امتیاز پزشک، مرکز، محصول و خدمت فقط از نظرهای تأییدشده با ویزیت انجام‌شده یا سفارش تحویل‌شده حساب می‌شود؛ صفحات محتوایی (مجله، بیماری، دارو) پرسش و پاسخ بدون امتیازند.")}
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
