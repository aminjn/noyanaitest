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
  const { data, error, isLoading } = useSWR<IDoctorProfile | null>(
    `${API}/doctor`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const content = useMemo<ReactNode>(() => {
    return (
      <HandleLoading data={!isLoading} error={error}>
        {data ? children : <BecomeADoctorPage />}
      </HandleLoading>
    );
  }, [children, data, error, isLoading]);

  return <PanelLayout sidebar={<DoctorSidebar />}>{content}</PanelLayout>;
};

export default DoctorPanelLayout;
