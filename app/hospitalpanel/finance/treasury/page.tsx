import { Suspense } from "react";
import AccTreasury from "@/Components/_Common/Business/Acc/AccTreasury";

// «مالی و حسابداری» (2026-10): see Components/_Common/Business/Acc
const Page = () => (
  <Suspense>
    <AccTreasury node="hospital" panel="/hospitalpanel" />
  </Suspense>
);

export default Page;
