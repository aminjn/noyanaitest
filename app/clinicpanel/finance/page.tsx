import { Suspense } from "react";
import FinanceOverview from "@/Components/_Common/Business/Finance/FinanceOverview";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Finance
const Page = () => (
  <Suspense>
    <FinanceOverview node="clinic" panel="/clinicpanel" />
  </Suspense>
);

export default Page;
