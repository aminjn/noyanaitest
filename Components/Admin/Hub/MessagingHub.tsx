"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageNotificationsPage from "@/Components/Admin/Notification/AdminManageNotificationsPage";
import AdminSmsLogTab from "@/Components/Admin/Messaging/AdminSmsLogTab";

// پیامک و اعلان‌ها: one admin page, its parts as tabs (2026-09 admin audit).
// The gateway and the patterns moved to the system settings (2026-10).
const MessagingHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("پیامک و اعلان‌ها")}
      intro={ta("اعلان همگانی و گزارش ارسال پیامک‌ها. درگاه و پترن‌های پیامک در «تنظیمات سیستم ← پیامک» است.")}
      tabs={[
        {
          id: "broadcast",
          title: ta("اعلان همگانی"),
          exclude: !canOpen("Notification"),
          content: <AdminManageNotificationsPage />,
        },
        {
          // sent messages and OTP failures ("why didn't my code arrive?")
          id: "smsLog",
          title: ta("گزارش پیامک‌ها"),
          exclude: !canOpen("admin"),
          content: <AdminSmsLogTab />,
        },
      ]}
    />
  );
};

export default MessagingHub;
