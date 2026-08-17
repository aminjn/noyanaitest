import DoctorManageLicenceClient from "@/Components/DoctorPanel/_Stub/DoctorManageLicencePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageLicence = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelStub"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelStub"]}
      initialTextContent={textContent}
    >
      <DoctorManageLicenceClient />
    </LocaleScopeProvider>
  );
};

export default DoctorManageLicence;
