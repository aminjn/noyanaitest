import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "علائم" page as a tab (2026-09 admin audit)
const LegacyPartAdmin = () => redirect(`/${adminKey}/symptom?tab=parts`);

export default LegacyPartAdmin;
