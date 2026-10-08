"use client";

import CurrentLicenseWidget from "./CurrentLicenseWidget";
import ProviderHome from "@/Components/_Common/ProviderHome/ProviderHome";
import PharmacyRxCityBanner from "./RxCityBanner/PharmacyRxCityBanner";

const PharmacyPanelPage = () => (
  <ProviderHome kind="pharmacy" notice={<PharmacyRxCityBanner ns="pharmacyPanelHome" />}>
    <CurrentLicenseWidget />
  </ProviderHome>
);

export default PharmacyPanelPage;
