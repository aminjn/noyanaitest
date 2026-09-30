import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "صفحه‌ی درباره ما" page as a tab (2026-09 admin audit)
const LegacyAboutWhyAdmin = () => redirect(`/${adminKey}/aboutPage?tab=why`);

export default LegacyAboutWhyAdmin;
