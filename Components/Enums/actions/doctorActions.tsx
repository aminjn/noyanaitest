import { ContentKey } from "../contentKeys";

export const doctorActions = [
  "readClinics",
  "leaveClinics",
  "joinClinic",
  "mutateJoinClinic",
  "clinicAddition",
  // Hospital counterpart of the clinic actions above (2026-09). Kept in
  // sync with Models/DoctorAcl.ts on noyanai-back.
  "readHospitals",
  "leaveHospitals",
  "joinHospital",
  "mutateJoinHospital",
  "hospitalAddition",
  "readCalendar",
  "mutateCalendar",
  "readSettings",
  "mutateSettings",
  "readInsurance",
  "mutateInsurance",
  "insuranceAddition",
  "readPharmacy",
  "mutatePharmacy",
  "pharmacyAddition",
  // Profile / office / services / patients (2026-09) - these existed on the
  // backend (Models/DoctorAcl.ts) and gate real routes, but were missing
  // here, so they could never be granted: a secretary saw the menu items
  // and got 403s.
  "mutateProfile",
  "readPatient",
  "mutatePatient",
  "readGallery",
  "mutateGallery",
  "readOffices",
  "mutateOffices",
  "readSocial",
  "mutateSocial",
  "readFaq",
  "mutateFaq",
  "readServices",
  "mutateServices",
  "readServicePackages",
  "mutateServicePackages",
  // Sidebar-gating actions (2026-08) — one per DoctorSidebar nav item that
  // isn't a baseline (always-visible) page or the secretary-management item
  // itself (owner-only by design). Kept in sync with
  // Models/DoctorAcl.ts on noyanai-back.
  "readFinance",
  // «حسابداری» (2026-10): vouchers, accounts and quick entries
  "manageAccounting",
  // «حقوق و دستمزد» (2026-10): employees, payslips and their payments
  "readPayroll",
  "managePayroll",
  "readShifts",
  "readSchedule",
  "readPatients",
  "readLicenses",
  "readArticles",
  "readChat",
  "readDrugs",
  // Incoming-orders page (2026-08) — doctorpanel/order. Kept in sync with
  // Models/DoctorAcl.ts on noyanai-back.
  "readOrders",
  // Incoming-order detail page (2026-08) — doctorpanel/order/[nodeId],
  // fulfilling/cancelling this doctor's own line items. Kept in sync with
  // Models/DoctorAcl.ts on noyanai-back.
  "mutateOrders",
] as const;

// Access-level popup tab groupings (2026-08). Each category is a
// DoctorSidebar nav item's own title key, reused as the tab label; every
// gated nav item maps to exactly one action here. Used by
// MutateSecretaryAccessLevelPopup / PreviewSecretaryAccessLevelPopup to
// render the owner-facing ACL editor for the "doctor" node.
export const doctorActionCategories = [
  "profile",
  "office",
  "services",
  "servicePackages",
  "clinic",
  "hospital",
  "calendar",
  "settings",
  "financialMangement",
  "shifts",
  "schedule",
  "patients",
  "licenses",
  "phrmaciesAndLabs",
  "insurances",
  "articles",
  "chatWithPatients",
  "drugsAndPrescriptions",
  "incomingOrders",
  "payMenu",
] as const satisfies readonly ContentKey[];

export const categorizedDoctorActions: Readonly<
  Record<(typeof doctorActionCategories)[number], readonly ContentKey[]>
> = {
  profile: [
    "mutateProfile",
    "readGallery",
    "mutateGallery",
    "readSocial",
    "mutateSocial",
    "readFaq",
    "mutateFaq",
  ],
  office: ["readOffices", "mutateOffices"],
  services: ["readServices", "mutateServices"],
  servicePackages: ["readServicePackages", "mutateServicePackages"],
  clinic: [
    "clinicAddition",
    "joinClinic",
    "leaveClinics",
    "mutateJoinClinic",
    "readClinics",
  ],
  hospital: [
    "hospitalAddition",
    "joinHospital",
    "leaveHospitals",
    "mutateJoinHospital",
    "readHospitals",
  ],
  calendar: ["readCalendar", "mutateCalendar"],
  settings: ["readSettings", "mutateSettings"],
  financialMangement: ["readFinance", "manageAccounting"],
  payMenu: ["readPayroll", "managePayroll"],
  shifts: ["readShifts"],
  schedule: ["readSchedule"],
  patients: ["readPatients", "readPatient", "mutatePatient"],
  licenses: ["readLicenses"],
  phrmaciesAndLabs: ["readPharmacy", "mutatePharmacy", "pharmacyAddition"],
  insurances: ["readInsurance", "mutateInsurance", "insuranceAddition"],
  articles: ["readArticles"],
  chatWithPatients: ["readChat"],
  drugsAndPrescriptions: ["readDrugs"],
  incomingOrders: ["readOrders", "mutateOrders"],
} as const;

type DoctorActionName = (typeof doctorActions)[number];

// Ready-made roles for the invite flow (2026-09): picking one creates (or
// reuses) an access level with exactly these actions, so the owner never
// has to wade through the full toggle list. "full" is every action.
export const doctorRolePresets: Record<"appointments" | "reception" | "finance", readonly DoctorActionName[]> = {
  appointments: [
    "readCalendar",
    "mutateCalendar",
    "readSchedule",
    "readShifts",
    "readPatients",
    "readPatient",
  ],
  reception: [
    "readCalendar",
    "mutateCalendar",
    "readSchedule",
    "readShifts",
    "readPatients",
    "readPatient",
    "mutatePatient",
    "readOrders",
    "mutateOrders",
    "readServices",
    "readServicePackages",
    "readOffices",
    "readChat",
  ],
  finance: ["readFinance", "readOrders", "readLicenses"],
};
