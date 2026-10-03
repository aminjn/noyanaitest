"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminFinanceTransactionsPage from "@/Components/Admin/Finance/AdminFinanceTransactionsPage";
import AdminFinanceInvoicesPage from "@/Components/Admin/Finance/AdminFinanceInvoicesPage";

// تراکنش‌ها (2026-10 audit): the old invoices collection is no longer
// written (bookings and orders pay through the wallet, and the electronic
// invoices are under «صورتحساب‌های مودیان نویان»), so it was a second
// "invoices" menu item listing history only. It stays readable here as an
// archive tab.
const TransactionsHub = () => (
  <AdminSectionHub
    title={ta("تراکنش‌ها")}
    tabs={[
      {
        id: "wallet",
        title: ta("تراکنش‌های کیف پول"),
        content: <AdminFinanceTransactionsPage />,
      },
      {
        id: "archive",
        title: ta("بایگانی فاکتورهای قدیمی"),
        hint: ta("فاکتورهای پیش از کیف پول و مودیان؛ دیگر فاکتوری به این فهرست اضافه نمی‌شود."),
        content: <AdminFinanceInvoicesPage />,
      },
    ]}
  />
);

export default TransactionsHub;
