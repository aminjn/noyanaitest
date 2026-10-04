import { Suspense } from "react";
import FinanceOverview from "@/Components/_Common/Business/Finance/FinanceOverview";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Finance
const Page = () => (
  <Suspense>
    <FinanceOverview node="paraClinic" panel="/paraClinicPanel" />
  </Suspense>
);

export default Page;
