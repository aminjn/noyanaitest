import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "داروها" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyDrugTagNodeAdmin = () => redirect(`/${adminKey}/drug?tab=tags`);

export default LegacyDrugTagNodeAdmin;
