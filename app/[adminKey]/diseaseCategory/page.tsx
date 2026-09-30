import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "بیماری‌ها" page as a tab (2026-09 admin audit)
const LegacyDiseaseCategoryAdmin = () => redirect(`/${adminKey}/disease?tab=categories`);

export default LegacyDiseaseCategoryAdmin;
