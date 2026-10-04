import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// disease tags were retired (2026-10): folded into the categories
// (backend Lib/migrateMedicalDirectory), which this lands on
const LegacyDiseaseTagAdmin = () => redirect(`/${adminKey}/disease?tab=categories`);

export default LegacyDiseaseTagAdmin;
