import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "داروها" page as a tab (2026-09 admin audit)
const LegacyDrugTagAdmin = () => redirect(`/${adminKey}/drug?tab=tags`);

export default LegacyDrugTagAdmin;
