import DoctorManageServicesPage from "@/Components/DoctorPanel/Service/DoctorManageServicesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageServices = async () => {
  const textContent = await getScopedTextContent(["doctorPanelService"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelService"]}
      initialTextContent={textContent}
    >
      <DoctorManageServicesPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageServices;
