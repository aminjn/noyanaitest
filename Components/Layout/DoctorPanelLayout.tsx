import ActingAsBanner from "./ActingAsBanner";
import { ReactNode } from "react";
import HandleLoading from "../Admin/UI/HandleLoading";
import ErrorMessage from "../Admin/UI/ErrorMessage";
import BecomeADoctorPage from "../DoctorPanel/BecomeADoctorPage";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import DoctorSidebar from "./DoctorSidebar";
import PanelLayout from "./PanelLayout";
import useDoctor from "../Hooks/useDoctor";
import DoctorLicenseGate from "../DoctorPanel/DoctorLicenseGate";

const DoctorPanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { doctor, isLoading, error } = useDoctor();

  // Only a 403 from GET /doctor means "this user has no doctor profile";
  // other failures show an error instead of the become-a-doctor flow.
  const notADoctor = !doctor && (!error || error.status === 403);

  return (
    <HandleLoading data={!isUserLoading && !isLoading}>
      {!user ? (
        <LoginRequired />
      ) : doctor ? (
        <PanelLayout sidebar={<DoctorSidebar />}>
          <ActingAsBanner kind="doctor" ownerName={[doctor.firstName, doctor.lastName].filter(Boolean).join(" ")} />
          <DoctorLicenseGate>{children}</DoctorLicenseGate>
        </PanelLayout>
      ) : notADoctor ? (
        <BecomeADoctorPage />
      ) : (
        <ErrorMessage message={error?.message} />
      )}
    </HandleLoading>
  );
};

export default DoctorPanelLayout;
