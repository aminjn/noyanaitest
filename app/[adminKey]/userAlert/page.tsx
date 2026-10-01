import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "تیم و دسترسی‌ها" page as a tab (2026-09 admin audit)
const LegacyUserAlertAdmin = () => redirect(`/${adminKey}/team?tab=alerts`);

export default LegacyUserAlertAdmin;
