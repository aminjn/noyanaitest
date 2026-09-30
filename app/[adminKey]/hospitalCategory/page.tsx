import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "بیمارستان‌ها" page as a tab (2026-09 admin audit)
const LegacyHospitalCategoryAdmin = () => redirect(`/${adminKey}/hospital?tab=categories`);

export default LegacyHospitalCategoryAdmin;
