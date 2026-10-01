import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "تبلیغات" page as a tab (2026-09 admin audit)
const LegacyInlineAdAdmin = () => redirect(`/${adminKey}/ads?tab=inline`);

export default LegacyInlineAdAdmin;
