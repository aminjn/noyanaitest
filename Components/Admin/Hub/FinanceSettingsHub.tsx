"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminDeliverySettingsPage from "@/Components/Admin/Delivery/AdminDeliverySettingsPage";
import AdminManageGlobalFinanceSettingsPage from "@/Components/Admin/FinanceSettings/AdminManageGlobalFinanceSettingsPage";
import AdminManageGlobalTaxSettingsPage from "@/Components/Admin/TaxSettings/AdminManageGlobalTaxSettingsPage";
import AdminPaymentSettingsTab from "@/Components/Admin/FinanceSettings/AdminPaymentSettingsTab";

// تنظیمات مالی: one admin page, its parts as tabs (2026-09 admin audit).
const FinanceSettingsHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("تنظیمات مالی")}
      intro={ta("همه‌ی تنظیمات پول در یک جا: کمیسیون، مالیات، درگاه و کیف پول، و ارسال.")}
      tabs={[
        {
          id: "commission",
          title: ta("کمیسیون"),
          exclude: !canOpen("admin"),
          content: <AdminManageGlobalFinanceSettingsPage />,
        },
        {
          id: "tax",
          title: ta("مالیات"),
          exclude: !canOpen("admin"),
          content: <AdminManageGlobalTaxSettingsPage />,
        },
        {
          id: "payments",
          title: ta("درگاه و کیف پول"),
          exclude: !canOpen("admin"),
          content: <AdminPaymentSettingsTab />,
        },
        {
          id: "delivery",
          title: ta("ارسال"),
          exclude: !canOpen("admin"),
          content: <AdminDeliverySettingsPage />,
        },
      ]}
    />
  );
};

export default FinanceSettingsHub;
