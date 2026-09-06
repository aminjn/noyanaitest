"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import useParaClinicLicenseModules from "@/Components/Hooks/useParaClinicLicenseModules";
import LicenseNotCoveredNotice from "./LicenseNotCoveredNotice";
import { ParaClinicDashboardModule } from "@/Components/Admin/BaseParaClinicLicense/AdminManageBaseParaClinicLicensesPage";

// Maps the first path segment under /paraClinicPanel/* to the
// ParaClinicDashboardModule that noyanai-back's paraClinicRouter actually
// gates with requireLicenseModule(...) for that section - kept in sync by
// hand with Routers/paraClinicRouter.ts on noyanai-back. A segment the
// backend never gates (secretary, article, license itself, plus the
// dashboard root) is intentionally left out so this frontend notice never
// blocks a page the backend would still allow. Mirrors
// Components/PharmacyPanel/PharmacyLicenseGate.tsx /
// Components/ClinicPanel/ClinicLicenseGate.tsx's own pathModuleMap.
const pathModuleMap: Record<string, ParaClinicDashboardModule> = {
  profile: "profile",
  tamin: "tamin",
  test: "tests",
  order: "incomingOrders",
};

// Wraps every /paraClinicPanel/* page (from ParaClinicPanelLayout). If the
// current path maps to a license-gated module and the paraClinic's resolved
// license modules don't include it, shows LicenseNotCoveredNotice instead
// of the page. Fails open (renders children) while modules are still
// loading, on fetch error, or when the path doesn't map to any gated
// module.
const ParaClinicLicenseGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const segment = (pathname || "").split("/").filter(Boolean)[1];
  const mod = segment ? pathModuleMap[segment] : undefined;
  const { modules, error } = useParaClinicLicenseModules();

  if (!mod) return <>{children}</>;
  if (!modules || error) return <>{children}</>;
  if (modules.includes(mod)) return <>{children}</>;
  return <LicenseNotCoveredNotice mod={mod} />;
};

export default ParaClinicLicenseGate;
