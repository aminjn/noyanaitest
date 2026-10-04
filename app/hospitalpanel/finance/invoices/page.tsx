import { Suspense } from "react";
import FinanceInvoices from "@/Components/_Common/Business/Finance/FinanceInvoices";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Finance
const Page = () => (
  <Suspense>
    <FinanceInvoices node="hospital" panel="/hospitalpanel" />
  </Suspense>
);

export default Page;
