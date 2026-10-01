import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "سئو و لینک‌ها" page as a tab (2026-09 admin audit)
const LegacyRedirectionAdmin = () => redirect(`/${adminKey}/seo?tab=redirects`);

export default LegacyRedirectionAdmin;
