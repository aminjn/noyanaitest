import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "پاراکلینیک‌ها" page as a tab (2026-09 admin audit)
const LegacyParaClinicCategoryAdmin = () => redirect(`/${adminKey}/paraClinic?tab=categories`);

export default LegacyParaClinicCategoryAdmin;
