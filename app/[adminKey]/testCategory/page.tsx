import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "آزمایش‌ها" page as a tab (2026-09 admin audit)
const LegacyTestCategoryAdmin = () => redirect(`/${adminKey}/test?tab=categories`);

export default LegacyTestCategoryAdmin;
