import DoctorManageServicesPage from "@/Components/DoctorPanel/Service/DoctorManageServicesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageServices = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelService"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelService"]}
      initialTextContent={textContent}
    >
      <DoctorManageServicesPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageServices;
