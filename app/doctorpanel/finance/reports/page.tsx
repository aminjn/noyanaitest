import { Suspense } from "react";
import FinanceReports from "@/Components/_Common/Business/Finance/FinanceReports";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Finance
const Page = () => (
  <Suspense>
    <FinanceReports node="doctor" panel="/doctorpanel" />
  </Suspense>
);

export default Page;
