import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "بیمه‌ها" page as a tab (2026-09 admin audit)
const LegacyInsuranceCategoryAdmin = () => redirect(`/${adminKey}/insurance?tab=categories`);

export default LegacyInsuranceCategoryAdmin;
