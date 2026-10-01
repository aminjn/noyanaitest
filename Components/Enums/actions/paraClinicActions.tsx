import { ContentKey } from "../contentKeys";

// Sidebar-gating actions (2026-08), one per ParaClinicSidebar nav item that
// isn't a baseline (always-visible) page or the secretary-management item
// itself (owner-only by design). Kept in sync with Models/ParaClinicAcl.ts
// on noyanai-back.
export const paraClinicActions = [
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
  "profile",
  "tests",
  "prescriptions",
  "articles",
  "tamin",
  "incomingOrders",
  "licenses",
] as const satisfies readonly ContentKey[];

export const categorizedParaClinicActions: Readonly<
  Record<(typeof paraClinicActionCategories)[number], readonly ContentKey[]>
> = {
  profile: ["mutateProfile"],
  tests: ["readTests"],
  prescriptions: ["readPrescriptions"],
  articles: ["readArticles"],
  tamin: ["readTamin"],
  incomingOrders: ["readOrders", "mutateOrders"],
  licenses: ["readLicenses"],
} as const;
