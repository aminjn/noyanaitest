"use client";
import { ReactNode } from "react";
import { usePathname } from "@/Components/i18n/navigation";
import useInsuranceLicenseModules from "../Hooks/useInsuranceLicenseModules";
import LicenseNotCoveredNotice from "./LicenseNotCoveredNotice";
import { InsuranceDashboardModule } from "../Admin/BaseInsuranceLicense/AdminManageBaseInsuranceLicensesPage";

// Maps the first path segment under /insurancepanel/* to the
// InsuranceDashboardModule that noyanai-back's insuranceRouter actually
// gates with requireLicenseModule(...) for that section - kept in sync by
// hand with Routers/insuranceRouter.ts on noyanai-back. A segment that the
// backend never gates (secretary, article, plus the dashboard root and
// license itself) is intentionally left out so this frontend notice never
// blocks a page the backend would still allow. Mirrors
// Components/HospitalPanel/HospitalLicenseGate.tsx /
// Components/PharmacyPanel/PharmacyLicenseGate.tsx /
// Components/DoctorPanel/DoctorLicenseGate.tsx's own pathModuleMap.
const pathModuleMap: Record<string, InsuranceDashboardModule> = {
  profile: "profile",
};

// Wraps every /insurancepanel/* page (from InsurancePanelLayout). If the
// current path maps to a license-gated module and the insurance's resolved
// license modules don't include it, shows LicenseNotCoveredNotice instead
// of the page. Fails open (renders children) while modules are still
// loading, on fetch error, or when the path doesn't map to any gated
// module.
const InsuranceLicenseGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const segment = (pathname || "").split("/").filter(Boolean)[1];
  const mod = segment ? pathModuleMap[segment] : undefined;
  const { modules, error } = useInsuranceLicenseModules();

  if (!mod) return <>{children}</>;
  if (!modules || error) return <>{children}</>;
  if (modules.includes(mod)) return <>{children}</>;
  return <LicenseNotCoveredNotice mod={mod} />;
};

export default InsuranceLicenseGate;
