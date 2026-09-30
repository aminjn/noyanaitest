import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "پلن‌ها و مجوزها" page as a tab (2026-09 admin audit)
const LegacyBasePharmacyLicenseAdmin = () => redirect(`/${adminKey}/licensePlans?tab=pharmacy`);

export default LegacyBasePharmacyLicenseAdmin;
