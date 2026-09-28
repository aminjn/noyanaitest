import ActingAsBanner from "./ActingAsBanner";
import { ReactNode } from "react";
import PanelLayout from "./PanelLayout";
import ClinicPanelSidebar from "./ClinicPabelSidebar";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomeClinicPage from "../ClinicPanel/BecomeClinicPage";
import ClinicLicenseGate from "../ClinicPanel/ClinicLicenseGate";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";

const ClinicPanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { data, isLoading } = useSWR(`${API}/clinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );
  return (
    <HandleLoading data={!isUserLoading && !isLoading}>
      {!user ? (
        <LoginRequired />
      ) : data ? (
        <PanelLayout sidebar={<ClinicPanelSidebar />}>
          <ActingAsBanner kind="clinic" ownerName={(data as { name?: string } | undefined)?.name} />
          <ClinicLicenseGate>{children}</ClinicLicenseGate>
        </PanelLayout>
      ) : (
        <BecomeClinicPage />
      )}
    </HandleLoading>
  );
};

export default ClinicPanelLayout;
