import { Suspense } from "react";
import AccAssets from "@/Components/_Common/Business/Acc/AccAssets";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Acc
const Page = () => (
  <Suspense>
    <AccAssets node="insurance" panel="/insurancepanel" />
  </Suspense>
);

export default Page;
