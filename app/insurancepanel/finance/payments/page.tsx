import { Suspense } from "react";
import FinancePayments from "@/Components/_Common/Business/Finance/FinancePayments";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Finance
const Page = () => (
  <Suspense>
    <FinancePayments node="insurance" panel="/insurancepanel" />
  </Suspense>
);

export default Page;
