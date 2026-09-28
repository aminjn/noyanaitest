"use client";

import CurrentLicenseWidget from "./CurrentLicenseWidget";
import ProviderHome from "@/Components/_Common/ProviderHome/ProviderHome";

const ParaClinicDashboardHomePage = () => (
  <ProviderHome kind="paraClinic">
    <CurrentLicenseWidget />
  </ProviderHome>
);

export default ParaClinicDashboardHomePage;
