import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "مجله" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyBlogcategoryNodeAdmin = () => redirect(`/${adminKey}/blog?tab=categories`);

export default LegacyBlogcategoryNodeAdmin;
