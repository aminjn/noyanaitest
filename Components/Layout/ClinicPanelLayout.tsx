import { ReactNode } from "react";
import PanelLayout from "./PanelLayout";
import ClinicPanelSidebar from "./ClinicPabelSidebar";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomeClinicPage from "../ClinicPanel/BecomeClinicPage";
import ClinicLicenseGate from "../ClinicPanel/ClinicLicenseGate";

const ClinicPanelLayout = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useSWR(`${API}/clinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );
  return (
    <HandleLoading data={!isLoading}>
      {data ? (
        <PanelLayout sidebar={<ClinicPanelSidebar />}>
          <ClinicLicenseGate>{children}</ClinicLicenseGate>
        </PanelLayout>
      ) : (
        <BecomeClinicPage />
      )}
    </HandleLoading>
  );
};

export default ClinicPanelLayout;
