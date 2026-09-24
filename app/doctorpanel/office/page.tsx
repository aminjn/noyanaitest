import DoctorManageOfficesPage from "@/Components/DoctorPanel/Office/DoctorManageOfficesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageOffices = async () => {
  const textContent = await getScopedTextContent(["doctorPanelOffice"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelOffice"]}
      initialTextContent={textContent}
    >
      <DoctorManageOfficesPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageOffices;
