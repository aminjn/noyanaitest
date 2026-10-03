"use client";
import { ReactNode } from "react";
import { usePathname } from "@/Components/i18n/navigation";
import useHospitalLicenseModules from "../Hooks/useHospitalLicenseModules";
import LicenseNotCoveredNotice from "./LicenseNotCoveredNotice";
import { HospitalDashboardModule } from "../Admin/BaseHospitalLicense/AdminManageBaseHospitalLicensesPage";

// Maps the first path segment under /hospitalpanel/* to the
// HospitalDashboardModule that noyanai-back's hospitalRouter actually gates with
// requireLicenseModule(...) for that section - kept in sync by hand with
// Routers/hospitalRouter.ts on noyanai-back. A segment that the backend never
// gates (secretary, article, plus the dashboard root and license itself) is
// intentionally left out so this frontend notice never blocks a page the
// backend would still allow. Mirrors
// Components/PharmacyPanel/PharmacyLicenseGate.tsx /
// Components/DoctorPanel/DoctorLicenseGate.tsx's own pathModuleMap.
const pathModuleMap: Record<string, HospitalDashboardModule> = {
  // Noyan Business (2026-10): /<panel>/accounting
  accounting: "accounting",
  // phase 3: /<panel>/payroll (employees, payslips, insurance and tax)
  payroll: "payroll",
  // phase 4: /<panel>/crm (patients and customers, follow-ups, SMS campaigns)
  crm: "crm",
  // phase 5: /<panel>/moadian (electronic invoices to the Moadian system)
  moadian: "moadian",
  // phase 2: /<panel>/inventory (stock, batches, suppliers, purchases)
  inventory: "inventory",
  profile: "profile",
};

// Wraps every /hospitalpanel/* page (from HospitalPanelLayout). If the current
// path maps to a license-gated module and the hospital's resolved license
// modules don't include it, shows LicenseNotCoveredNotice instead of the
// page. Fails open (renders children) while modules are still loading, on
// fetch error, or when the path doesn't map to any gated module.
const HospitalLicenseGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const segment = (pathname || "").split("/").filter(Boolean)[1];
  const mod = segment ? pathModuleMap[segment] : undefined;
  const { modules, error } = useHospitalLicenseModules();

  if (!mod) return <>{children}</>;
  if (!modules || error) return <>{children}</>;
  if (modules.includes(mod)) return <>{children}</>;
  return <LicenseNotCoveredNotice mod={mod} />;
};

export default HospitalLicenseGate;
