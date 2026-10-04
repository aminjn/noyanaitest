// Provider-panel pages that moved under «مالی و حسابداری» (2026-10): the
// accounting, payroll, Moadian and inventory pages left the top level of
// every panel for /<panel>/finance/<page>. The middleware sends old links
// (bookmarks, notifications, the docs) on before anything renders - the
// same approach as Components/Admin/legacyAdminPages.ts, since a
// redirect() inside a page under a panel layout is not safe in production.
export const PANEL_ROOTS = ["doctorpanel", "clinicpanel", "hospitalpanel", "pharmacypanel", "paraClinicPanel", "insurancepanel"];

const MOVED_TO_FINANCE = ["accounting", "payroll", "moadian", "inventory"];

// "/clinicpanel/inventory" -> "/clinicpanel/finance/inventory", or null
export const legacyPanelTarget = (pathname: string): string | null => {
  const [panel, page, ...rest] = pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (!panel || !PANEL_ROOTS.includes(panel) || !page || !MOVED_TO_FINANCE.includes(page)) return null;
  return `/${panel}/finance/${[page, ...rest].join("/")}`;
};

// The key a panel's licence gate looks a page up by: the first segment
// under /<panel>, or "finance/<page>" inside «مالی و حسابداری» (whose pages
// are gated by the module each belongs to: the suite's own pages by
// "accounting", payroll by "payroll"... and the wallet by none).
export const panelGateKey = (pathname: string) => {
  const parts = (pathname || "").split("?")[0].split("/").filter(Boolean);
  if (parts[1] !== "finance") return parts[1];
  return `finance/${parts[2] || ""}`;
};

// the «مالی و حسابداری» pages each licence module opens
export const FINANCE_GATES = {
  "finance/": "accounting",
  "finance/invoices": "accounting",
  "finance/payments": "accounting",
  "finance/expenses": "accounting",
  "finance/insurance": "accounting",
  "finance/reports": "accounting",
  "finance/accounting": "accounting",
  "finance/payroll": "payroll",
  "finance/moadian": "moadian",
} as const;
