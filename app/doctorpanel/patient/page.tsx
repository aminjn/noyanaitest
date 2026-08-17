import DoctorManagePatientsPage from "@/Components/DoctorPanel/Patient/DoctorManagePatientsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManagePatients = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelPatient"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelPatient"]}
      initialTextContent={textContent}
    >
      <DoctorManagePatientsPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManagePatients;
