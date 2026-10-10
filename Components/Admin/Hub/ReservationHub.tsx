"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageReservationsPage from "@/Components/Admin/Reservation/AdminManageReservationsPage";
import AdminBookingSettingsTab from "@/Components/Admin/AppConfig/AdminBookingSettingsTab";
import AdminPublicHolidaysTab from "@/Components/Admin/AppConfig/AdminPublicHolidaysTab";

// نوبت‌ها: the appointments back office and the booking rules (horizon,
// reminders, no-show nudges, call timings) and Iran's official holidays on
// one page (2026-10 audit).
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
        {
          // Iran's official holidays (2026-10): a closed day for every doctor
          // who doesn't choose to work it
          id: "holidays",
          title: ta("تعطیلات رسمی"),
          exclude: !canOpen("admin"),
          content: <AdminPublicHolidaysTab />,
        },
      ]}
    />
  );
};

export default ReservationHub;
