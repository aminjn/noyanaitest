"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageAccessLevelsPage from "@/Components/Admin/AccessLevel/AdminManageAccessLevelsPage";
import AdminTeamMembersPage from "@/Components/Admin/AccessLevel/AdminTeamMembersPage";

// تیم و دسترسی‌ها: one admin page, its parts as tabs (2026-09 admin audit).
const TeamHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("تیم و دسترسی‌ها")}
      intro={ta("کارکنان پنل و نقش‌هایشان. نقش هر کارمند را از صفحه‌ی خود کاربر عوض کنید.")}
      tabs={[
        {
          id: "members",
          title: ta("کارکنان"),
          exclude: !canOpen("admin"),
          content: <AdminTeamMembersPage />,
        },
        {
          id: "roles",
          title: ta("نقش‌ها (سطح دسترسی)"),
          exclude: !canOpen("admin"),
          content: <AdminManageAccessLevelsPage />,
        },
      ]}
    />
  );
};

export default TeamHub;
