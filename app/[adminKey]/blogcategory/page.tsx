import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "مجله" page as a tab (2026-09 admin audit)
const LegacyBlogcategoryAdmin = () => redirect(`/${adminKey}/blog?tab=categories`);

export default LegacyBlogcategoryAdmin;
