import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// Nothing on the public site shows this any more (the home page dropped the
// section), so it left the admin menu (2026-09 audit).
const LegacyAdminHomeIntroduction = () => redirect(`/${adminKey}`);

export default LegacyAdminHomeIntroduction;
