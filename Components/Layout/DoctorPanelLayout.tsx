import { ReactNode, useEffect, useMemo, useState } from "react";
import classes from "./DoctorPanelLayout.module.css";
import useSWR from "swr";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomeADoctorPage from "../DoctorPanel/BecomeADoctorPage";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import Loading from "../Admin/UI/Loading";
import PublicHeader from "./PublicHeader";
import RemoteBreadCrump from "../UI/RemoteBreadCrump";
import DoctorSidebar from "./DoctorSidebar";
import { LicenseManager } from "ag-grid-enterprise";
import PanelLayout from "./PanelLayout";

const DoctorPanelLayout = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useSWR<IDoctorProfile | null>(
    `${API}/doctor`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!isLoading}>
      {data ? (
        <PanelLayout sidebar={<DoctorSidebar />}>{children}</PanelLayout>
      ) : (
        <BecomeADoctorPage />
      )}
    </HandleLoading>
  );
};

export default DoctorPanelLayout;
