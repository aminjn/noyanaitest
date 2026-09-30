import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "علائم" page as a tab (2026-09 admin audit); a record is edited in a popup on that tab
const LegacyPartNodeAdmin = () => redirect(`/${adminKey}/symptom?tab=parts`);

export default LegacyPartNodeAdmin;
