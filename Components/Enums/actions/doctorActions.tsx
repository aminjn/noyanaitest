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
  // Sidebar-gating actions (2026-08) — one per DoctorSidebar nav item that
  // isn't a baseline (always-visible) page or the secretary-management item
  // itself (owner-only by design). Kept in sync with
  // Models/DoctorAcl.ts on noyanai-back.
  "readFinance",
  "readShifts",
  "readSchedule",
  "readPatients",
  "readLicenses",
  "readOffers",
  "readDiscounts",
  "readArticles",
  "readChat",
  "readDrugs",
  "readDocuments",
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
  "offers",
  "discounts",
  "articles",
  "chatWithPatients",
  "drugsAndPrescriptions",
  "patientDocuments",
  "incomingOrders",
] as const satisfies readonly ContentKey[];

export const categorizedDoctorActions: Readonly<
  Record<(typeof doctorActionCategories)[number], readonly ContentKey[]>
> = {
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
  financialMangement: ["readFinance"],
  shifts: ["readShifts"],
  schedule: ["readSchedule"],
  patients: ["readPatients"],
  licenses: ["readLicenses"],
  phrmaciesAndLabs: ["readPharmacy"],
  insurances: ["readInsurance"],
  offers: ["readOffers"],
  discounts: ["readDiscounts"],
  articles: ["readArticles"],
  chatWithPatients: ["readChat"],
  drugsAndPrescriptions: ["readDrugs"],
  patientDocuments: ["readDocuments"],
  incomingOrders: ["readOrders", "mutateOrders"],
} as const;
