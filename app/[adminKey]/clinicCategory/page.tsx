import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "کلینیک‌ها" page as a tab (2026-09 admin audit)
const LegacyClinicCategoryAdmin = () => redirect(`/${adminKey}/clinic?tab=categories`);

export default LegacyClinicCategoryAdmin;
