import { ContentKey } from "../contentKeys";

// Sidebar-gating actions (2026-08), one per InsurancePanelSidebar nav item
// that isn't a baseline (always-visible) page or the secretary-management
// item itself (owner-only by design). Kept in sync with
// Models/InsuranceAcl.ts on noyanai-back.
export const insuranceActions = [
  "managePlans",
  "readNetwork",
  "readFinance",
  "mutateProfile",
  "readArticles",
  // Licenses page (2026-09) — insurancepanel/license. Kept in sync with
  // Models/InsuranceAcl.ts on noyanai-back.
  "readLicenses",
] as const;

// Access-level popup tab groupings (2026-08). Each category is the sidebar
// nav item's own title key, reused as the tab label.
export const insuranceActionCategories = [
  "insPlans",
  "insNetwork",
  "financialMangement",
  "profile",
  "articles",
  "licenses",
] as const satisfies readonly ContentKey[];

export const categorizedInsuranceActions: Readonly<
  Record<(typeof insuranceActionCategories)[number], readonly ContentKey[]>
> = {
  insPlans: ["managePlans"],
  insNetwork: ["readNetwork"],
  financialMangement: ["readFinance"],
  profile: ["mutateProfile"],
  articles: ["readArticles"],
  licenses: ["readLicenses"],
} as const;
