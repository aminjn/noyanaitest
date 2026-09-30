import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "خدمات" page as a tab (2026-09 admin audit)
const LegacyServiceCategoryAdmin = () => redirect(`/${adminKey}/service?tab=categories`);

export default LegacyServiceCategoryAdmin;
