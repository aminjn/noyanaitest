import DoctorManagePatientPage from "@/Components/DoctorPanel/Patient/DoctorManagePatientPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManagePatient = async () => {
  const textContent = await getScopedTextContent(["doctorPanelPatient", "dashboardUserIdentity", "dashboardEditUserDetailsPopup", "dashboardUserVitals", "dashboardUserMedicalDetails", "dashboardMutateUserMedicalPopup"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelPatient", "dashboardUserIdentity", "dashboardEditUserDetailsPopup", "dashboardUserVitals", "dashboardUserMedicalDetails", "dashboardMutateUserMedicalPopup"]}
      initialTextContent={textContent}
    >
      <DoctorManagePatientPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManagePatient;
