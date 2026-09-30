import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "بیماری‌ها" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyDiseaseTagNodeAdmin = () => redirect(`/${adminKey}/disease?tab=tags`);

export default LegacyDiseaseTagNodeAdmin;
