import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// The "become a provider" lists were merged into one verification queue
// (2026-09); a request's own page ([nodeId]) stays.
const LegacyAdminBecomeInsurances = () =>
  redirect(`/${adminKey}/requests?group=become&kind=insurance`);

export default LegacyAdminBecomeInsurances;
