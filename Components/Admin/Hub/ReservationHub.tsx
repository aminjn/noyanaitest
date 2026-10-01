"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageReservationsPage from "@/Components/Admin/Reservation/AdminManageReservationsPage";
import AdminBookingSettingsTab from "@/Components/Admin/AppConfig/AdminBookingSettingsTab";

// نوبت‌ها: the appointments back office and the booking rules (horizon,
// reminders, no-show nudges, call timings) on one page (2026-10 audit).
// The settings are AppConfig, so that tab is super admin only.
const ReservationHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("نوبت‌ها")}
      tabs={[
        {
          id: "list",
          title: ta("نوبت‌ها"),
          exclude: !canOpen("Reservation"),
          content: <AdminManageReservationsPage />,
        },
        {
          id: "settings",
          title: ta("تنظیمات نوبت‌دهی"),
          exclude: !canOpen("admin"),
          content: <AdminBookingSettingsTab />,
        },
      ]}
    />
  );
};

export default ReservationHub;
