import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "تیم و دسترسی‌ها" page as a tab (2026-09 admin audit)
const LegacyAccesslevelAdmin = () => redirect(`/${adminKey}/team?tab=roles`);

export default LegacyAccesslevelAdmin;
