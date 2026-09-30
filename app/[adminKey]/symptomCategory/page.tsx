import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "علائم" page as a tab (2026-09 admin audit)
const LegacySymptomCategoryAdmin = () => redirect(`/${adminKey}/symptom?tab=categories`);

export default LegacySymptomCategoryAdmin;
