import { ContentKey } from "../contentKeys";

// Sidebar-gating actions (2026-08), one per ClinicPabelSidebar nav item that
// isn't a baseline (always-visible) page or the secretary-management item
// itself (owner-only by design). Kept in sync with Models/clinicAcl.ts on
// noyanai-back.
export const clinicActions = ["readPrescriptions", "readArticles"] as const;

// Access-level popup tab groupings (2026-08). Each category is the sidebar
// nav item's own title key, reused as the tab label.
export const clinicActionCategories = [
  "prescriptions",
  "articles",
] as const satisfies readonly ContentKey[];

export const categorizedClinicActions: Readonly<
  Record<(typeof clinicActionCategories)[number], readonly ContentKey[]>
> = {
  prescriptions: ["readPrescriptions"],
  articles: ["readArticles"],
} as const;
