import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "پلن‌ها و مجوزها" page as a tab (2026-09 admin audit)
const LegacyBaseInsuranceLicenseAdmin = () => redirect(`/${adminKey}/licensePlans?tab=insurance`);

export default LegacyBaseInsuranceLicenseAdmin;
