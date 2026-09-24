import DoctorManagePatientProfilePage from "@/Components/DoctorPanel/Patient/DoctorManagePatientProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManagePatientProfile = async () => {
  const textContent = await getScopedTextContent(["doctorPanelPatient", "dashboardUserIdentity", "dashboardEditUserDetailsPopup"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelPatient", "dashboardUserIdentity", "dashboardEditUserDetailsPopup"]}
      initialTextContent={textContent}
    >
      <DoctorManagePatientProfilePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManagePatientProfile;
