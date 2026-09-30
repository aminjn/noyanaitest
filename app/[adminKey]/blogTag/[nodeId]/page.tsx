import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "مجله" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyBlogTagNodeAdmin = () => redirect(`/${adminKey}/blog?tab=tags`);

export default LegacyBlogTagNodeAdmin;
