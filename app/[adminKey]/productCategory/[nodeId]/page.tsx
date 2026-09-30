import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "محصولات" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyProductCategoryNodeAdmin = () => redirect(`/${adminKey}/product?tab=categories`);

export default LegacyProductCategoryNodeAdmin;
