"use client";
import { ReactNode } from "react";
import { usePathname } from "@/Components/i18n/navigation";
import { FINANCE_GATES, panelGateKey } from "@/Components/Layout/legacyPanelPages";
import useDoctorLicenseModules from "../Hooks/useDoctorLicenseModules";
import LicenseNotCoveredNotice from "./LicenseNotCoveredNotice";
import TemporarilyDisabledNotice from "../UI/TemporarilyDisabledNotice";
import { DoctorDashboardModule } from "../Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";

// Tamin end-user lockout (2026-09) - segments under /doctorpanel/* whose
// entire feature is disabled for real doctors while Tamin only talks to its
// sandbox API (see Controllers/featureGateController.ts on noyanai-back,
// which 403s the underlying routes regardless of this list). Checked before
// the license-modules lookup below so it also applies to a doctor whose
// license *does* include "drugsAndPrescriptions". Remove this list (and the
// check that uses it) together with the backend gate once Tamin goes live.
const lockedSegments = new Set(["drug", "prescription", "tamin"]);

// Maps the first path segment under /doctorpanel/* to the
// DoctorDashboardModule that noyanai-back's doctorRouter actually gates with
// requireLicenseModule(...) for that section - kept in sync by hand with
// Routers/doctorRouter.ts on noyanai-back. A segment that the backend never
// gates (finance, secretary, offer, discount, article, chat, document, plus
// dashboard/license themselves) is intentionally left out so this frontend
// notice never blocks a page the backend would still allow.
const pathModuleMap: Record<string, DoctorDashboardModule> = {
  // «مالی و حسابداری» (2026-10): the pages moved under /<panel>/finance
  ...FINANCE_GATES,
  // Noyan Business (2026-10): /<panel>/accounting
  accounting: "accounting",
  // phase 3: /<panel>/payroll (employees, payslips, insurance and tax)
  payroll: "payroll",
  // phase 4: /<panel>/crm (patients and customers, follow-ups, SMS campaigns)
  crm: "crm",
  // phase 5: /<panel>/moadian (electronic invoices to the Moadian system)
  moadian: "moadian",
  profile: "profile",
  office: "office",
  service: "services",
  servicepackage: "servicePackages",
  order: "incomingOrders",
  shift: "shifts",
  calendar: "shifts",
  booking: "schedule",
  schedule: "schedule",
  patient: "patients",
  // clinic / hospital (2026-10) are not gated as a page: any doctor sees
  // their centres, answers invites and leaves; the doctor's own join
  // requests and suggestions are gated inside the page
  pharmacy: "phrmaciesAndLabs",
  insurance: "insurances",
  drug: "drugsAndPrescriptions",
  tamin: "drugsAndPrescriptions",
  prescription: "drugsAndPrescriptions",
  settings: "settings",
};

// Wraps every /doctorpanel/* page (from DoctorPanelLayout). If the current
// path maps to a license-gated module and the doctor's resolved license
// modules don't include it, shows LicenseNotCoveredNotice instead of the
// page. Fails open (renders children) while modules are still loading, on
// fetch error, or when the path doesn't map to any gated module.
const DoctorLicenseGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const segment = (pathname || "").split("/").filter(Boolean)[1];
  // inside «مالی و حسابداری» (2026-10) the page under /finance decides
  const key = panelGateKey(pathname || "");
  const mod = key ? pathModuleMap[key] : undefined;
  const { modules, error } = useDoctorLicenseModules();

  if (segment && lockedSegments.has(segment)) return <TemporarilyDisabledNotice />;
  if (!mod) return <>{children}</>;
  if (!modules || error) return <>{children}</>;
  if (modules.includes(mod)) return <>{children}</>;
  return <LicenseNotCoveredNotice mod={mod} />;
};

export default DoctorLicenseGate;
