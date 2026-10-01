import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "سئو و لینک‌ها" page as a tab (2026-09 admin audit)
const LegacyShortLinkAdmin = () => redirect(`/${adminKey}/seo?tab=shortlinks`);

export default LegacyShortLinkAdmin;
