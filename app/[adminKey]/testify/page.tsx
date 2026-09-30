import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "صفحه‌ی همکاری پزشکان" page as a tab (2026-09 admin audit)
const LegacyTestifyAdmin = () => redirect(`/${adminKey}/doctorsPage?tab=testify`);

export default LegacyTestifyAdmin;
