"use client";

import CurrentLicenseWidget from "./CurrentLicenseWidget";
import ProviderHome from "@/Components/_Common/ProviderHome/ProviderHome";
import WalletWithdrawal from "@/Components/_Common/Finance/WalletWithdrawal";
import useAcl from "@/Components/Hooks/useAcl";

const ParaClinicDashboardHomePage = () => {
  // test sales are paid into the owner's wallet; only the owner (not a
  // secretary) moves it to the bank
  const isOwner = useAcl("paraClinic")();
  return (
    <ProviderHome kind="paraClinic">
      <CurrentLicenseWidget />
      {isOwner && <WalletWithdrawal />}
    </ProviderHome>
  );
};

export default ParaClinicDashboardHomePage;
