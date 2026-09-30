import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "بیمارستان‌ها" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyHospitalTagNodeAdmin = () => redirect(`/${adminKey}/hospital?tab=tags`);

export default LegacyHospitalTagNodeAdmin;
