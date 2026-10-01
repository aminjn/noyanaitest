import { ContentKey } from "../contentKeys";

// Sidebar-gating actions (2026-08), one per HospitalPabelSidebar nav item that
// isn't a baseline (always-visible) page or the secretary-management item
// itself (owner-only by design). Kept in sync with Models/hospitalAcl.ts on
// noyanai-back.
export const hospitalActions = [
  "readReservations",
  "mutateProfile",
  "readArticles",
  // Licenses page (2026-09) — hospitalpanel/license. Kept in sync with
  // Models/hospitalAcl.ts on noyanai-back.
  "readLicenses",
] as const;

// Access-level popup tab groupings (2026-08). Each category is the sidebar
// nav item's own title key, reused as the tab label.
export const hospitalActionCategories = [
  "schedule",
  "profile",
  "articles",
  "licenses",
] as const satisfies readonly ContentKey[];

export const categorizedHospitalActions: Readonly<
  Record<(typeof hospitalActionCategories)[number], readonly ContentKey[]>
> = {
  schedule: ["readReservations"],
  profile: ["mutateProfile"],
  articles: ["readArticles"],
  licenses: ["readLicenses"],
} as const;
