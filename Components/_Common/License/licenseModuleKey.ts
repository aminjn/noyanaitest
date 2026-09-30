import { ContentKey } from "@/Components/Enums/contentKeys";

// Panel-side label of a license module ("servicePackages" ->
// "licenseModuleServicePackages", namespace "common"). The admin panel keeps
// its own ta() labels (Admin/Base*License/*DashboardModuleLabels).
export const licenseModuleKey = (mod: string) =>
  `licenseModule${mod.charAt(0).toUpperCase()}${mod.slice(1)}` as ContentKey;
