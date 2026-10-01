"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageNotificationsPage from "@/Components/Admin/Notification/AdminManageNotificationsPage";
import AdminManageSmsPatternsPage from "@/Components/Admin/SmsPatterns/AdminManageSmsPatternsPage";
import AdminSmsSettingsPage from "@/Components/Admin/Sms/AdminSmsSettingsPage";
import AdminSmsLogTab from "@/Components/Admin/Messaging/AdminSmsLogTab";

// پیامک و اعلان‌ها: one admin page, its parts as tabs (2026-09 admin audit).
const MessagingHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("پیامک و اعلان‌ها")}
      intro={ta("درگاه پیامک، پترن‌ها، اعلان همگانی و گزارش ارسال پیامک‌ها در یک صفحه.")}
      tabs={[
        {
          id: "gateway",
          title: ta("درگاه پیامک"),
          exclude: !canOpen("admin"),
          content: <AdminSmsSettingsPage />,
        },
        {
          id: "patterns",
          title: ta("پترن‌های پیامک"),
          exclude: !canOpen("admin"),
          content: <AdminManageSmsPatternsPage />,
        },
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
