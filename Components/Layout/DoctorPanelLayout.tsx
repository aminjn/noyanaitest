import { ReactNode, useEffect, useState } from "react";
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

const DoctorPanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { data, error, isLoading } = useSWR<IDoctorProfile | null>(
    `${API}/doctor`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const [keySat, setKeySat] = useState<boolean>(false);

  useEffect(() => {
    LicenseManager.setLicenseKey(
      "[v3][0102]_MTc2NzEzOTIwMDAwMA==e688a08fb8acde46d9bb3b15eaac16ff"
    );
    setKeySat(true);
  }, []);

  if (!keySat) return <Loading />;
  if (isUserLoading) return <Loading />;
  if (!user) return <LoginRequired />;
  return (
    <HandleLoading data={!isLoading} error={error}>
      {data ? (
        <div className={classes.main}>
          <PublicHeader />
          <RemoteBreadCrump />
          <div className={classes.content}>
            <DoctorSidebar />
            <div className={classes.children}>{children}</div>
          </div>
        </div>
      ) : (
        <BecomeADoctorPage />
      )}
    </HandleLoading>
  );
};

export default DoctorPanelLayout;
