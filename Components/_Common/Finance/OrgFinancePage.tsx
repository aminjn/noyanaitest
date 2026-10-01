"use client";

import PanelFinancePage, { PanelFinanceConfig } from "./PanelFinancePage";

// The finance page of the lab, clinic, hospital and insurer panels
// (2026-10): the pharmacy's page and texts, its own API (Lib/orgFinance.ts).
const OrgFinancePage = (props: Omit<PanelFinanceConfig, "namespaces">) => (
  <PanelFinancePage namespaces={["common", "pharmacyPanelFinance"]} {...props} />
);

export default OrgFinancePage;
