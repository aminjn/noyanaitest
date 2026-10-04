"use client";
import { ReactNode } from "react";
import { usePathname } from "@/Components/i18n/navigation";
import { FINANCE_GATES, panelGateKey } from "@/Components/Layout/legacyPanelPages";
import useParaClinicLicenseModules from "@/Components/Hooks/useParaClinicLicenseModules";
import LicenseNotCoveredNotice from "./LicenseNotCoveredNotice";
import TemporarilyDisabledNotice from "@/Components/UI/TemporarilyDisabledNotice";
import { ParaClinicDashboardModule } from "@/Components/Admin/BaseParaClinicLicense/AdminManageBaseParaClinicLicensesPage";

// Tamin end-user lockout (2026-09) - mirrors DoctorLicenseGate.tsx's own
// lockedSegments; see its comment for the full rationale. "prescription" is
// included even though app/paraClinicPanel/prescription/page.tsx doesn't
// exist yet (orphan sidebar link, per useParaClinicAcl "readPrescriptions"),
// so it stays locked if that page is ever added before Tamin goes live.
const lockedSegments = new Set(["tamin", "prescription"]);

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
  // «مالی و حسابداری» (2026-10): the pages moved under /<panel>/finance
  ...FINANCE_GATES,
  "finance/inventory": "inventory",
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
  // inside «مالی و حسابداری» (2026-10) the page under /finance decides
  const key = panelGateKey(pathname || "");
  const mod = key ? pathModuleMap[key] : undefined;
  const { modules, error } = useParaClinicLicenseModules();

  if (segment && lockedSegments.has(segment)) return <TemporarilyDisabledNotice />;
  if (!mod) return <>{children}</>;
  if (!modules || error) return <>{children}</>;
  if (modules.includes(mod)) return <>{children}</>;
  return <LicenseNotCoveredNotice mod={mod} />;
};

export default ParaClinicLicenseGate;
