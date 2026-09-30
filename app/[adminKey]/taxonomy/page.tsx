import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// The taxonomy hub (2026-09 audit): every category and tag is now a tab of
// the page that uses it (blog, clinics, diseases, ...), and places have
// their own page.
const LegacyAdminTaxonomy = () => redirect(`/${adminKey}/province`);

export default LegacyAdminTaxonomy;
