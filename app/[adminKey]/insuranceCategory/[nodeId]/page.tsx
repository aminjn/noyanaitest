import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "بیمه‌ها" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyInsuranceCategoryNodeAdmin = () => redirect(`/${adminKey}/insurance?tab=categories`);

export default LegacyInsuranceCategoryNodeAdmin;
