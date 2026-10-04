import { Suspense } from "react";
import FinanceAiPage from "@/Components/_Common/Business/Finance/Ai/FinanceAiPage";

// «مالی و حسابداری» → دستیار هوش مصنوعی (2026-10): see Components/_Common/Business/Finance/Ai
const Page = () => (
  <Suspense>
    <FinanceAiPage node="insurance" panel="/insurancepanel" />
  </Suspense>
);

export default Page;
