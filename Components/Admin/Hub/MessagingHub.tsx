"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageNotificationsPage from "@/Components/Admin/Notification/AdminManageNotificationsPage";
import AdminManageSmsPatternsPage from "@/Components/Admin/SmsPatterns/AdminManageSmsPatternsPage";
import AdminManageUserAlertsPage from "@/Components/Admin/UserAlert/AdminManageUserAlertsPage";
import AdminSmsSettingsPage from "@/Components/Admin/Sms/AdminSmsSettingsPage";

// پیامک و اعلان‌ها: one admin page, its parts as tabs (2026-09 admin audit).
const MessagingHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("پیامک و اعلان‌ها")}
      intro={ta("درگاه پیامک، پترن‌ها، اعلان همگانی و هشدارهای کارکنان در یک صفحه.")}
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
          exclude: !canOpen("admin"),
          content: <AdminManageNotificationsPage />,
        },
        {
          id: "alerts",
          title: ta("هشدارهای کارکنان"),
          exclude: !canOpen("admin"),
          content: <AdminManageUserAlertsPage />,
        },
      ]}
    />
  );
};

export default MessagingHub;
