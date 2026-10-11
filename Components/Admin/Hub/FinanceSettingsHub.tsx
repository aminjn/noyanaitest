"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminDeliverySettingsPage from "@/Components/Admin/Delivery/AdminDeliverySettingsPage";
import AdminManageGlobalFinanceSettingsPage from "@/Components/Admin/FinanceSettings/AdminManageGlobalFinanceSettingsPage";
import AdminManageGlobalTaxSettingsPage from "@/Components/Admin/TaxSettings/AdminManageGlobalTaxSettingsPage";
import AdminPaymentSettingsTab from "@/Components/Admin/FinanceSettings/AdminPaymentSettingsTab";
import AdminPayrollYearsTab from "@/Components/Admin/FinanceSettings/AdminPayrollYearsTab";
import AdminOrderResponseSettingsTab from "@/Components/Admin/FinanceSettings/AdminOrderResponseSettingsTab";
import AdminReturnSettingsTab from "@/Components/Admin/FinanceSettings/AdminReturnSettingsTab";

// تنظیمات مالی: one admin page, its parts as tabs (2026-09 admin audit).
const FinanceSettingsHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("تنظیمات مالی")}
      intro={ta("همه‌ی تنظیمات پول در یک جا: کمیسیون، مالیات، درگاه و کیف پول، ارقام قانونی حقوق و دستمزد، ارسال، مهلت پاسخ به سفارش‌ها و مرجوعی.")}
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
          id: "payroll",
          title: ta("حقوق و دستمزد"),
          exclude: !canOpen("admin"),
          content: <AdminPayrollYearsTab />,
        },
        {
          id: "delivery",
          title: ta("ارسال"),
          exclude: !canOpen("admin"),
          content: <AdminDeliverySettingsPage />,
        },
        // seller response deadlines: unanswered orders are cancelled and
        // refunded automatically (2026-10)
        {
          id: "orders",
          title: ta("سفارش‌ها"),
          exclude: !canOpen("admin"),
          content: <AdminOrderResponseSettingsTab />,
        },
        // returns of delivered goods (2026-10): the window, what comes
        // back only for the seller's error, the seller's deadlines
        {
          id: "returns",
          title: ta("مرجوعی"),
          exclude: !canOpen("admin"),
          content: <AdminReturnSettingsTab />,
        },
      ]}
    />
  );
};

export default FinanceSettingsHub;
