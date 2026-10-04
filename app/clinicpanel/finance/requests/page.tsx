import { Suspense } from "react";
import AccRequests from "@/Components/_Common/Business/Acc/AccRequests";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Acc
const Page = () => (
  <Suspense>
    <AccRequests node="clinic" panel="/clinicpanel" />
  </Suspense>
);

export default Page;
