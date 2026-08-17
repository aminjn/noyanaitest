import DoctorManagePatientDocumentsClient from "@/Components/DoctorPanel/_Stub/DoctorManagePatientDocumentsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManagePatientDocuments = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelStub"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelStub"]}
      initialTextContent={textContent}
    >
      <DoctorManagePatientDocumentsClient />
    </LocaleScopeProvider>
  );
};

export default DoctorManagePatientDocuments;
