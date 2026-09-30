import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "پاراکلینیک‌ها" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyParaClinicTagNodeAdmin = () => redirect(`/${adminKey}/paraClinic?tab=tags`);

export default LegacyParaClinicTagNodeAdmin;
