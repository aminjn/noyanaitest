import { Suspense } from "react";
import InsurerClaims from "@/Components/_Common/Business/Finance/InsurerClaims";

// «مالی و حسابداری» → مطالبات دریافتی از مراکز (2026-10): see
// Components/_Common/Business/Finance/InsurerClaims.tsx
const Page = () => (
  <Suspense>
    <InsurerClaims node="insurance" panel="/insurancepanel" />
  </Suspense>
);

export default Page;
