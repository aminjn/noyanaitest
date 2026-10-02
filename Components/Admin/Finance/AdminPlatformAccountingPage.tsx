"use client";

import WithTitle from "../UI/WithTitle";
import { ta } from "@/Components/Admin/i18n/adminText";
import useUser from "@/Components/Hooks/useUser";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import AccountingPage from "@/Components/_Common/Business/AccountingPage";

// The platform's own books (2026-10, Lib/business on noyanai-back): what the
// wallets of users hold, what is owed to providers in settlement, the
// commission and subscription income and the VAT collected - all written
// from the same transactions the provider books come from.
const AdminPlatformAccountingPage = () => {
  const { user } = useUser();
  const hasAccess = useAccessLevel();
  const canWrite = user?.role === "admin" || hasAccess("Finance", "update");
  return (
    <WithTitle title={ta("حسابداری پلتفرم")}>
      <AccountingPage api="/admin/finance/biz" canWrite={canWrite} hideHeader />
    </WithTitle>
  );
};

export default AdminPlatformAccountingPage;
