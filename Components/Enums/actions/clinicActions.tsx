import { ContentKey } from "../contentKeys";

// Sidebar-gating actions (2026-08), one per ClinicPabelSidebar nav item that
// isn't a baseline (always-visible) page or the secretary-management item
// itself (owner-only by design). Kept in sync with Models/clinicAcl.ts on
// noyanai-back.
export const clinicActions = [
  "readReviews",
  "readFinance",
  // «حسابداری» (2026-10): vouchers, accounts and quick entries
  "manageAccounting",
  // finalizing / reverting / deleting final vouchers, deciding finance requests (2026-10)
  "approveVouchers",
  // «حقوق و دستمزد» (2026-10): employees, payslips and their payments
  "readPayroll",
  "managePayroll",
  // «ارتباط با بیماران» (2026-10): contacts, follow-ups; submitting a paid SMS campaign
  "readCrm",
  "manageCrm",
  "sendCampaigns",
  "readMoadian",
  "manageMoadian",
  // «انبار و خرید» (2026-10): stock, suppliers and purchases
  "readInventory",
  "manageInventory",
  "readReservations",
  "mutateProfile",
  "readPrescriptions",
  "readArticles",
  // Licenses page (2026-09) — clinicpanel/license. Kept in sync with
  // Models/clinicAcl.ts on noyanai-back.
  "readLicenses",
] as const;

// Access-level popup tab groupings (2026-08). Each category is the sidebar
// nav item's own title key, reused as the tab label.
export const clinicActionCategories = [
  "orgReviewsTitle",
  "financialMangement",
  "schedule",
  "profile",
  "prescriptions",
  "articles",
  "licenses",
  "invMenu",
  "payMenu",
  "crmMenu",
  "moadianMenu",
] as const satisfies readonly ContentKey[];

export const categorizedClinicActions: Readonly<
  Record<(typeof clinicActionCategories)[number], readonly ContentKey[]>
> = {
  orgReviewsTitle: ["readReviews"],
  financialMangement: ["readFinance", "manageAccounting", "approveVouchers" as ContentKey],
  payMenu: ["readPayroll", "managePayroll"],
  crmMenu: ["readCrm", "manageCrm", "sendCampaigns"],
  moadianMenu: ["readMoadian", "manageMoadian"],
  invMenu: ["readInventory", "manageInventory"],
  schedule: ["readReservations"],
  profile: ["mutateProfile"],
  prescriptions: ["readPrescriptions"],
  articles: ["readArticles"],
  licenses: ["readLicenses"],
} as const;
