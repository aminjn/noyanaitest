import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "زبان و ترجمه" page as a tab (2026-09 admin audit)
const LegacyTranslationsAdmin = () => redirect(`/${adminKey}/localization?tab=content`);

export default LegacyTranslationsAdmin;
