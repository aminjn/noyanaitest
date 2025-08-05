import { ReactNode } from "react";
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

const DoctorPanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { data, error, isLoading } = useSWR<IDoctorProfile | null>(
    `${API}/doctor`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  console.log(data);

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
