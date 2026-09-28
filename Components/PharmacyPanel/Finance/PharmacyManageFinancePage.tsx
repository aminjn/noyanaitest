"use client";

import PanelFinancePage from "@/Components/_Common/Finance/PanelFinancePage";

const PharmacyManageFinancePage = () => (
  <PanelFinancePage
    namespaces={["common", "pharmacyPanelFinance"]}
    panel="/pharmacypanel"
    api="/pharmacy/finance"
    noteKey="pfNote"
    upcomingKey="pfUpcoming"
    upcomingNoteKey="pfUpcomingNote"
  />
);

export default PharmacyManageFinancePage;
