import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "تنظیمات مالی" page as a tab (2026-09 admin audit)
const LegacyDeliverySettingsAdmin = () => redirect(`/${adminKey}/financeSettings?tab=delivery`);

export default LegacyDeliverySettingsAdmin;
