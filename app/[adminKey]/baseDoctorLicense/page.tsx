import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "پلن‌ها و مجوزها" page as a tab (2026-09 admin audit)
const LegacyBaseDoctorLicenseAdmin = () => redirect(`/${adminKey}/licensePlans?tab=doctor`);

export default LegacyBaseDoctorLicenseAdmin;
