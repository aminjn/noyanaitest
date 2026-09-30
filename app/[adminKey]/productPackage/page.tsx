import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "محصولات" page as a tab (2026-09 admin audit)
const LegacyProductPackageAdmin = () => redirect(`/${adminKey}/product?tab=packages`);

export default LegacyProductPackageAdmin;
