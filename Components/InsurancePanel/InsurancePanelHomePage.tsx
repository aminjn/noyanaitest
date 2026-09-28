"use client";

import CurrentLicenseWidget from "./CurrentLicenseWidget";
import ProviderHome from "@/Components/_Common/ProviderHome/ProviderHome";

const InsurancePanelHomePage = () => (
  <ProviderHome kind="insurance">
    <CurrentLicenseWidget />
  </ProviderHome>
);

export default InsurancePanelHomePage;
