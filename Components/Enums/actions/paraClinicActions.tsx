import { ContentKey } from "../contentKeys";

// Sidebar-gating actions (2026-08), one per ParaClinicSidebar nav item that
// isn't a baseline (always-visible) page or the secretary-management item
// itself (owner-only by design). Kept in sync with Models/ParaClinicAcl.ts
// on noyanai-back.
export const paraClinicActions = [
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
  "mutateProfile",
  "readTests",
  "readPrescriptions",
  "readArticles",
  "readTamin",
  // Incoming-orders page (2026-08) — paraClinicPanel/order. Kept in sync
  // with Models/ParaClinicAcl.ts on noyanai-back.
  "readOrders",
  // Incoming-order detail page (2026-08) — paraClinicPanel/order/[nodeId],
  // fulfilling/cancelling this paraClinic's own line items. Kept in sync
  // with Models/ParaClinicAcl.ts on noyanai-back.
  "mutateOrders",
  // Licenses page (2026-09) — paraClinicPanel/license. Kept in sync with
  // Models/ParaClinicAcl.ts on noyanai-back.
  "readLicenses",
] as const;

// Access-level popup tab groupings (2026-08). Each category is the sidebar
// nav item's own title key, reused as the tab label.
export const paraClinicActionCategories = [
  "orgReviewsTitle",
  "financialMangement",
  "profile",
  "tests",
  "prescriptions",
  "articles",
  "tamin",
  "incomingOrders",
  "licenses",
  "invMenu",
  "payMenu",
  "crmMenu",
  "moadianMenu",
] as const satisfies readonly ContentKey[];

export const categorizedParaClinicActions: Readonly<
  Record<(typeof paraClinicActionCategories)[number], readonly ContentKey[]>
> = {
  orgReviewsTitle: ["readReviews"],
  financialMangement: ["readFinance", "manageAccounting", "approveVouchers" as ContentKey],
  payMenu: ["readPayroll", "managePayroll"],
  crmMenu: ["readCrm", "manageCrm", "sendCampaigns"],
  moadianMenu: ["readMoadian", "manageMoadian"],
  invMenu: ["readInventory", "manageInventory"],
  profile: ["mutateProfile"],
  tests: ["readTests"],
  prescriptions: ["readPrescriptions"],
  articles: ["readArticles"],
  tamin: ["readTamin"],
  incomingOrders: ["readOrders", "mutateOrders"],
  licenses: ["readLicenses"],
} as const;
