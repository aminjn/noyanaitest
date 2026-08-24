import { ContentKey } from "../contentKeys";

// Sidebar-gating actions (2026-08), one per PharmacyPanelSidebar nav item
// that isn't a baseline (always-visible) page or the secretary-management
// item itself (owner-only by design). Kept in sync with
// Models/pharmacyAcl.ts on noyanai-back.
export const pharmacyActions = [
  "readProducts",
  "readProductPackages",
  "readPrescriptions",
  "readArticles",
  "readTamin",
  // Incoming-orders page (2026-08) — pharmacypanel/order. Kept in sync with
  // Models/pharmacyAcl.ts on noyanai-back.
  "readOrders",
] as const;

// Access-level popup tab groupings (2026-08). Each category is the sidebar
// nav item's own title key, reused as the tab label.
export const pharmacyActionCategories = [
  "products",
  "productPackages",
  "prescriptions",
  "articles",
  "tamin",
  "incomingOrders",
] as const satisfies readonly ContentKey[];

export const categorizedPharmacyActions: Readonly<
  Record<(typeof pharmacyActionCategories)[number], readonly ContentKey[]>
> = {
  products: ["readProducts"],
  productPackages: ["readProductPackages"],
  prescriptions: ["readPrescriptions"],
  articles: ["readArticles"],
  tamin: ["readTamin"],
  incomingOrders: ["readOrders"],
} as const;
