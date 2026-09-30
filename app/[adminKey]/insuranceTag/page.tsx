import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "بیمه‌ها" page as a tab (2026-09 admin audit)
const LegacyInsuranceTagAdmin = () => redirect(`/${adminKey}/insurance?tab=tags`);

export default LegacyInsuranceTagAdmin;
