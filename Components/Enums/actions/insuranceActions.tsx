import { ContentKey } from "../contentKeys";

// Sidebar-gating actions (2026-08), one per InsurancePanelSidebar nav item
// that isn't a baseline (always-visible) page or the secretary-management
// item itself (owner-only by design). Kept in sync with
// Models/InsuranceAcl.ts on noyanai-back.
export const insuranceActions = [
  "readReviews",
  "managePlans",
  "readNetwork",
  "readFinance",
  // «حسابداری» (2026-10): vouchers, accounts and quick entries
  "manageAccounting",
  // «حقوق و دستمزد» (2026-10): employees, payslips and their payments
  "readPayroll",
  "managePayroll",
  // «ارتباط با بیماران» (2026-10): contacts, follow-ups; submitting a paid SMS campaign
  "readCrm",
  "manageCrm",
  "sendCampaigns",
  "readMoadian",
  "manageMoadian",
  "mutateProfile",
  "readArticles",
  // Licenses page (2026-09) — insurancepanel/license. Kept in sync with
  // Models/InsuranceAcl.ts on noyanai-back.
  "readLicenses",
] as const;

// Access-level popup tab groupings (2026-08). Each category is the sidebar
// nav item's own title key, reused as the tab label.
export const insuranceActionCategories = [
  "orgReviewsTitle",
  "insPlans",
  "insNetwork",
  "financialMangement",
  "profile",
  "articles",
  "licenses",
  "payMenu",
  "crmMenu",
  "moadianMenu",
] as const satisfies readonly ContentKey[];

export const categorizedInsuranceActions: Readonly<
  Record<(typeof insuranceActionCategories)[number], readonly ContentKey[]>
> = {
  orgReviewsTitle: ["readReviews"],
  insPlans: ["managePlans"],
  insNetwork: ["readNetwork"],
  financialMangement: ["readFinance", "manageAccounting"],
  payMenu: ["readPayroll", "managePayroll"],
  crmMenu: ["readCrm", "manageCrm", "sendCampaigns"],
  moadianMenu: ["readMoadian", "manageMoadian"],
  profile: ["mutateProfile"],
  articles: ["readArticles"],
  licenses: ["readLicenses"],
} as const;
