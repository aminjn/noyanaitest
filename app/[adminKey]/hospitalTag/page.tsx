import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "بیمارستان‌ها" page as a tab (2026-09 admin audit)
const LegacyHospitalTagAdmin = () => redirect(`/${adminKey}/hospital?tab=tags`);

export default LegacyHospitalTagAdmin;
