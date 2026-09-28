"use client";

import CurrentLicenseWidget from "./CurrentLicenseWidget";
import ProviderHome from "@/Components/_Common/ProviderHome/ProviderHome";

const HospitalPanelHomePage = () => (
  <ProviderHome kind="hospital">
    <CurrentLicenseWidget />
  </ProviderHome>
);

export default HospitalPanelHomePage;
