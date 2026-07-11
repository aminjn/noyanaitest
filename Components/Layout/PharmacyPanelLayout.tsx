"use client";
import { ReactNode } from "react";
import PanelLayout from "./PanelLayout";
import PharmacyPanelSidebar from "./PharmacyPanelSidebar";
import { fetcher } from "../helpers/fetcher";
import useSWR from "swr";
import { API } from "../config";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomePharmacyPage from "../PharmacyPanel/BecomePharmacyPage";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";

const PharmacyPanelLayout = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useSWR<IPharmacy | null>(
    `${API}/pharmacy`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!isLoading}>
      {data ? (
        <PanelLayout sidebar={<PharmacyPanelSidebar />}>{children}</PanelLayout>
      ) : (
        <BecomePharmacyPage />
      )}
    </HandleLoading>
  );
};

export default PharmacyPanelLayout;
