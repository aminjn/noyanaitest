import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "زبان و ترجمه" page as a tab (2026-09 admin audit)
const LegacyTextContentAdmin = () => redirect(`/${adminKey}/localization?tab=texts`);

export default LegacyTextContentAdmin;
