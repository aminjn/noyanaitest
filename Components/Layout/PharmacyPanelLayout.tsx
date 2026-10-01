"use client";
import SuspendedProviderBanner, { SuspendableProvider } from "./SuspendedProviderBanner";
import ActingAsBanner from "./ActingAsBanner";
import { ReactNode } from "react";
import PanelLayout from "./PanelLayout";
import PharmacyPanelSidebar from "./PharmacyPanelSidebar";
import { fetcher } from "../helpers/fetcher";
import useSWR from "swr";
import { API } from "../config";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomePharmacyPage from "../PharmacyPanel/BecomePharmacyPage";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import PharmacyLicenseGate from "../PharmacyPanel/PharmacyLicenseGate";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";

const PharmacyPanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { data, isLoading } = useSWR<IPharmacy | null>(
    `${API}/pharmacy`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!isUserLoading && !isLoading}>
      {!user ? (
        <LoginRequired />
      ) : data ? (
        <PanelLayout sidebar={<PharmacyPanelSidebar />}>
          <ActingAsBanner kind="pharmacy" ownerName={data?.name} />
          <SuspendedProviderBanner node={data as SuspendableProvider} />
          <PharmacyLicenseGate>{children}</PharmacyLicenseGate>
        </PanelLayout>
      ) : (
        <BecomePharmacyPage />
      )}
    </HandleLoading>
  );
};

export default PharmacyPanelLayout;
