import { ContentKey } from "../contentKeys";

// Sidebar-gating actions (2026-08), one per PharmacyPanelSidebar nav item
// that isn't a baseline (always-visible) page or the secretary-management
// item itself (owner-only by design). Kept in sync with
// Models/pharmacyAcl.ts on noyanai-back.
export const pharmacyActions = [
  "mutateProfile",
  "readProducts",
  "readProductPackages",
  "readPrescriptions",
  "readArticles",
  "readTamin",
  // Incoming-orders page (2026-08) — pharmacypanel/order. Kept in sync with
  // Models/pharmacyAcl.ts on noyanai-back.
  "readOrders",
  // Incoming-order detail page (2026-08) — pharmacypanel/order/[nodeId],
  // fulfilling/cancelling this pharmacy's own line items. Kept in sync with
  // Models/pharmacyAcl.ts on noyanai-back.
  "mutateOrders",
  // Licenses page (2026-09) — pharmacypanel/license. Kept in sync with
  // Models/pharmacyAcl.ts on noyanai-back.
  "readLicenses",
  // Finance page (2026-09) — pharmacypanel/finance. Kept in sync with
  // Models/pharmacyAcl.ts on noyanai-back.
  "readFinance",
  // «حسابداری» (2026-10): vouchers, accounts and quick entries
  "manageAccounting",
  // «حقوق و دستمزد» (2026-10): employees, payslips and their payments
  "readPayroll",
  "managePayroll",
  // «انبار و خرید» (2026-10): stock, suppliers and purchases
  "readInventory",
  "manageInventory",
] as const;

// Access-level popup tab groupings (2026-08). Each category is the sidebar
// nav item's own title key, reused as the tab label.
export const pharmacyActionCategories = [
  "profile",
  "products",
  "productPackages",
  "prescriptions",
  "articles",
  "tamin",
  "incomingOrders",
  "licenses",
  "financialMangement",
  "invMenu",
  "payMenu",
] as const satisfies readonly ContentKey[];

export const categorizedPharmacyActions: Readonly<
  Record<(typeof pharmacyActionCategories)[number], readonly ContentKey[]>
> = {
  profile: ["mutateProfile"],
  products: ["readProducts"],
  productPackages: ["readProductPackages"],
  prescriptions: ["readPrescriptions"],
  articles: ["readArticles"],
  tamin: ["readTamin"],
  incomingOrders: ["readOrders", "mutateOrders"],
  licenses: ["readLicenses"],
  financialMangement: ["readFinance", "manageAccounting"],
  payMenu: ["readPayroll", "managePayroll"],
  invMenu: ["readInventory", "manageInventory"],
} as const;
