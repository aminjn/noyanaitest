"use client";
import { ReactNode } from "react";
import PanelLayout from "./PanelLayout";
import HospitalPanelSidebar from "./HospitalPanelSidebar";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomeHospitalPage from "../HospitalPanel/BecomeHospitalPage";
import HospitalLicenseGate from "../HospitalPanel/HospitalLicenseGate";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";

const HospitalPanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { data, isLoading } = useSWR(`${API}/hospital`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  return (
    <HandleLoading data={!isUserLoading && !isLoading}>
      {!user ? (
        <LoginRequired />
      ) : data ? (
        <PanelLayout sidebar={<HospitalPanelSidebar />}>
          <HospitalLicenseGate>{children}</HospitalLicenseGate>
        </PanelLayout>
      ) : (
        <BecomeHospitalPage />
      )}
    </HandleLoading>
  );
};

export default HospitalPanelLayout;
