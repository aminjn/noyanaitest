import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "کلینیک‌ها" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyClinicTagNodeAdmin = () => redirect(`/${adminKey}/clinic?tab=tags`);

export default LegacyClinicTagNodeAdmin;
