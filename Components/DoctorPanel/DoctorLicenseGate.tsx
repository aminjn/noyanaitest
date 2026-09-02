"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import useDoctorLicenseModules from "../Hooks/useDoctorLicenseModules";
import LicenseNotCoveredNotice from "./LicenseNotCoveredNotice";
import { DoctorDashboardModule } from "../Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";

// Maps the first path segment under /doctorpanel/* to the
// DoctorDashboardModule that noyanai-back's doctorRouter actually gates with
// requireLicenseModule(...) for that section - kept in sync by hand with
// Routers/doctorRouter.ts on noyanai-back. A segment that the backend never
// gates (finance, secretary, offer, discount, article, chat, document, plus
// dashboard/license themselves) is intentionally left out so this frontend
// notice never blocks a page the backend would still allow.
const pathModuleMap: Record<string, DoctorDashboardModule> = {
  profile: "profile",
  office: "office",
  service: "services",
  servicepackage: "servicePackages",
  order: "incomingOrders",
  shift: "shifts",
  calendar: "shifts",
  booking: "shifts",
  schedule: "schedule",
  patient: "patients",
  clinic: "clinics",
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
  const mod = segment ? pathModuleMap[segment] : undefined;
  const { modules, error } = useDoctorLicenseModules();

  if (!mod) return <>{children}</>;
  if (!modules || error) return <>{children}</>;
  if (modules.includes(mod)) return <>{children}</>;
  return <LicenseNotCoveredNotice mod={mod} />;
};

export default DoctorLicenseGate;
