import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "مجله" page as a tab (2026-09 admin audit)
const LegacyBlogRrsAdmin = () => redirect(`/${adminKey}/blog?tab=newsletter`);

export default LegacyBlogRrsAdmin;
