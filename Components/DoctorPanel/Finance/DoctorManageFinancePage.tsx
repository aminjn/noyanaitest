"use client";

import PanelFinancePage from "@/Components/_Common/Finance/PanelFinancePage";

const DoctorManageFinancePage = () => (
  <PanelFinancePage
    namespaces={["common", "doctorPanelFinance"]}
    panel="/doctorpanel"
    api="/doctor/finance"
    noteKey="dpfNote"
    upcomingKey="dpfUpcoming"
    upcomingNoteKey="dpfUpcomingNote"
  />
);

export default DoctorManageFinancePage;
