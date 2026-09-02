"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import usePharmacyLicenseModules from "../Hooks/usePharmacyLicenseModules";
import LicenseNotCoveredNotice from "./LicenseNotCoveredNotice";
import { PharmacyDashboardModule } from "../Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";

// Maps the first path segment under /pharmacypanel/* to the
// PharmacyDashboardModule that noyanai-back's pharmacyRouter actually gates
// with requireLicenseModule(...) for that section - kept in sync by hand
// with Routers/pharmacyRouter.ts on noyanai-back. A segment that the
// backend never gates (secretary, article, plus the dashboard root and
// license itself) is intentionally left out so this frontend notice never
// blocks a page the backend would still allow. Mirrors
// Components/DoctorPanel/DoctorLicenseGate.tsx's own pathModuleMap.
const pathModuleMap: Record<string, PharmacyDashboardModule> = {
  profile: "profile",
  prescription: "prescriptions",
  filledPrescription: "prescriptions",
  tamin: "tamin",
  product: "products",
  productPackage: "productPackages",
  order: "incomingOrders",
};

// Wraps every /pharmacypanel/* page (from PharmacyPanelLayout). If the
// current path maps to a license-gated module and the pharmacy's resolved
// license modules don't include it, shows LicenseNotCoveredNotice instead
// of the page. Fails open (renders children) while modules are still
// loading, on fetch error, or when the path doesn't map to any gated
// module.
const PharmacyLicenseGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const segment = (pathname || "").split("/").filter(Boolean)[1];
  const mod = segment ? pathModuleMap[segment] : undefined;
  const { modules, error } = usePharmacyLicenseModules();

  if (!mod) return <>{children}</>;
  if (!modules || error) return <>{children}</>;
  if (modules.includes(mod)) return <>{children}</>;
  return <LicenseNotCoveredNotice mod={mod} />;
};

export default PharmacyLicenseGate;
