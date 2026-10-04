import { Suspense } from "react";
import FinanceClaims from "@/Components/_Common/Business/Finance/FinanceClaims";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Finance
const Page = () => (
  <Suspense>
    <FinanceClaims node="pharmacy" panel="/pharmacypanel" />
  </Suspense>
);

export default Page;
