import { Suspense } from "react";
import Kartabl from "@/Components/_Common/Business/Kartabl/Kartabl";

// the panel's one «کارتابل» (2026-10): Components/_Common/Business/Kartabl
const KartablPage = () => (
  <Suspense>
    <Kartabl node="pharmacy" panel="/pharmacypanel" />
  </Suspense>
);

export default KartablPage;
