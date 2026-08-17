import DoctorManagePatientPage from "@/Components/DoctorPanel/Patient/DoctorManagePatientPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManagePatient = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelPatient"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelPatient"]}
      initialTextContent={textContent}
    >
      <DoctorManagePatientPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManagePatient;
