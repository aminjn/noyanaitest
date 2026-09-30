import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// the hero image is a tab of the home page hub (2026-09 admin audit); the
// about / for-doctors images are tabs of those pages
const LegacyAdminStaticImages = () => redirect(`/${adminKey}/homePage?tab=image`);

export default LegacyAdminStaticImages;
