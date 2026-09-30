import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "سوالات متداول" page as a tab (2026-09 admin audit)
const LegacyFaqCategoryAdmin = () => redirect(`/${adminKey}/faq?tab=categories`);

export default LegacyFaqCategoryAdmin;
