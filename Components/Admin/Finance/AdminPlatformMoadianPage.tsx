"use client";

import WithTitle from "../UI/WithTitle";
import { ta } from "@/Components/Admin/i18n/adminText";
import useUser from "@/Components/Hooks/useUser";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import MoadianPage from "@/Components/_Common/Business/Moadian/MoadianPage";

// Noyan's own electronic invoices (2026-10, Lib/moadian on noyanai-back):
// the platform's Moadian link and the invoices it issues to providers - a
// plan bought, a finished SMS campaign, and each month's commission. The
// same page the provider panels use for their own sales.
const AdminPlatformMoadianPage = () => {
  const { user } = useUser();
  const hasAccess = useAccessLevel();
  const canWrite = user?.role === "admin" || hasAccess("Finance", "update");
  return (
    <WithTitle title={ta("صورتحساب‌های مودیان نویان")}>
      <MoadianPage api="/admin/finance/moadian" canWrite={canWrite} platform hideHeader />
    </WithTitle>
  );
};

export default AdminPlatformMoadianPage;
