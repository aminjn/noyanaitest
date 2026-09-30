import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "محصولات" page as a tab (2026-09 admin audit)
const LegacyProductCategoryAdmin = () => redirect(`/${adminKey}/product?tab=categories`);

export default LegacyProductCategoryAdmin;
