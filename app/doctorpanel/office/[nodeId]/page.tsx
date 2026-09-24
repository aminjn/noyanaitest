import DoctorManageOfficePage from "@/Components/DoctorPanel/Office/DoctorManageOfficePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageOffice = async () => {
  const textContent = await getScopedTextContent(["doctorPanelOffice"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelOffice"]}
      initialTextContent={textContent}
    >
      <DoctorManageOfficePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageOffice;
