import DoctorManageServicePage from "@/Components/DoctorPanel/Service/DoctorManageServicePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageServiceById = async () => {
  const textContent = await getScopedTextContent(["doctorPanelService"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelService"]}
      initialTextContent={textContent}
    >
      <DoctorManageServicePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageServiceById;
