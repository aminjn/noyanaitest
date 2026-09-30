import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "خدمات" page as a tab (2026-09 admin audit)
const LegacyServicePackageAdmin = () => redirect(`/${adminKey}/service?tab=packages`);

export default LegacyServicePackageAdmin;
