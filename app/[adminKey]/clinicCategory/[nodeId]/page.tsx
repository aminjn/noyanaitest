import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "کلینیک‌ها" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyClinicCategoryNodeAdmin = () => redirect(`/${adminKey}/clinic?tab=categories`);

export default LegacyClinicCategoryNodeAdmin;
