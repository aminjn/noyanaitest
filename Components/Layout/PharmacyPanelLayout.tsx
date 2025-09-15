import { ReactNode } from "react";
import PanelLayout from "./PanelLayout";
import PharmacyPanelSidebar from "./PharmacyPanelSidebar";
import { fetcher } from "../helpers/fetcher";
import useSWR from "swr";
import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import { API } from "../config";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomePharmacyPage from "../PharmacyPanel/BecomePharmacyPage";

const PharmacyPanelLayout = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useSWR<IInsurance | null>(
    `${API}/pharmacy`,
    (url: string) => fetcher({ url }).then((res) => res.data)
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
