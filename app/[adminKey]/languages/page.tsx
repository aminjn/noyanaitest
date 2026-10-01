import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "زبان و ترجمه" page as a tab (2026-09 admin audit)
const LegacyLanguagesAdmin = () => redirect(`/${adminKey}/localization?tab=languages`);

export default LegacyLanguagesAdmin;
