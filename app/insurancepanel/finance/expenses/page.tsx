import { Suspense } from "react";
import FinanceExpenses from "@/Components/_Common/Business/Finance/FinanceExpenses";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Finance
const Page = () => (
  <Suspense>
    <FinanceExpenses node="insurance" panel="/insurancepanel" />
  </Suspense>
);

export default Page;
