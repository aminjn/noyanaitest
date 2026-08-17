import DoctorManagepatientVitalsPage from "@/Components/DoctorPanel/Patient/DoctorManagePatientVitalsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManagepatientVitals = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelPatient"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelPatient"]}
      initialTextContent={textContent}
    >
      <DoctorManagepatientVitalsPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManagepatientVitals;
