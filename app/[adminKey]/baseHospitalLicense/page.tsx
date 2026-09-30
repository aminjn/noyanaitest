import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "پلن‌ها و مجوزها" page as a tab (2026-09 admin audit)
const LegacyBaseHospitalLicenseAdmin = () => redirect(`/${adminKey}/licensePlans?tab=hospital`);

export default LegacyBaseHospitalLicenseAdmin;
