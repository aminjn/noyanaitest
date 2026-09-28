"use client";

import CurrentLicenseWidget from "./CurrentLicenseWidget";
import ProviderHome from "@/Components/_Common/ProviderHome/ProviderHome";

const ClinicPanelHomePage = () => (
  <ProviderHome kind="clinic">
    <CurrentLicenseWidget />
  </ProviderHome>
);

export default ClinicPanelHomePage;
