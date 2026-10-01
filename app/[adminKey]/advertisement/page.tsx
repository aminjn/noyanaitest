import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "تبلیغات" page as a tab (2026-09 admin audit)
const LegacyAdvertisementAdmin = () => redirect(`/${adminKey}/ads?tab=banners`);

export default LegacyAdvertisementAdmin;
