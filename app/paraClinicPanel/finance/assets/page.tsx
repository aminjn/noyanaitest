import { Suspense } from "react";
import AccAssets from "@/Components/_Common/Business/Acc/AccAssets";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Acc
const Page = () => (
  <Suspense>
    <AccAssets node="paraClinic" panel="/paraClinicPanel" />
  </Suspense>
);

export default Page;
