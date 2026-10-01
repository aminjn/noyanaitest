"use client";

import CurrentLicenseWidget from "./CurrentLicenseWidget";
import ProviderHome from "@/Components/_Common/ProviderHome/ProviderHome";

// the wallet and withdrawals live on the finance page (/paraClinicPanel/finance)
const ParaClinicDashboardHomePage = () => (
  <ProviderHome kind="paraClinic">
    <CurrentLicenseWidget />
  </ProviderHome>
);

export default ParaClinicDashboardHomePage;
