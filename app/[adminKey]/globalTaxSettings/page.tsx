import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "تنظیمات مالی" page as a tab (2026-09 admin audit)
const LegacyGlobalTaxSettingsAdmin = () => redirect(`/${adminKey}/financeSettings?tab=tax`);

export default LegacyGlobalTaxSettingsAdmin;
