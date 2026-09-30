import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "بیماری‌ها" page as a tab (2026-09 admin audit)
const LegacyDiseaseTagAdmin = () => redirect(`/${adminKey}/disease?tab=tags`);

export default LegacyDiseaseTagAdmin;
