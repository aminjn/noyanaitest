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

const DoctorPanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { data, error, isLoading } = useSWR<IDoctorProfile | null>(
    `${API}/doctor`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  if (isUserLoading) return <Loading />;
  if (!user) return <LoginRequired />;
  return (
    <HandleLoading data={!isLoading} error={error}>
      {data ? children : <BecomeADoctorPage />}
    </HandleLoading>
  );
};

export default DoctorPanelLayout;
