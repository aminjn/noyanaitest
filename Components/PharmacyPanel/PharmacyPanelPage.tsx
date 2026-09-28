"use client";

import CurrentLicenseWidget from "./CurrentLicenseWidget";
import ProviderHome from "@/Components/_Common/ProviderHome/ProviderHome";

const PharmacyPanelPage = () => (
  <ProviderHome kind="pharmacy">
    <CurrentLicenseWidget />
  </ProviderHome>
);

export default PharmacyPanelPage;
