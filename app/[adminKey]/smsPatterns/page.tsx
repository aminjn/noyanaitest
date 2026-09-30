import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "پیامک و اعلان‌ها" page as a tab (2026-09 admin audit)
const LegacySmsPatternsAdmin = () => redirect(`/${adminKey}/messaging?tab=patterns`);

export default LegacySmsPatternsAdmin;
