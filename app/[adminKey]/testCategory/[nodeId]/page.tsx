import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "آزمایش‌ها" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyTestCategoryNodeAdmin = () => redirect(`/${adminKey}/test?tab=categories`);

export default LegacyTestCategoryNodeAdmin;
