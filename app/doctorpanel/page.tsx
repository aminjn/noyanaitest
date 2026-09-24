import DoctorPanelPage from "@/Components/DoctorPanel/DoctorPanelPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorPanel = async () => {
  const textContent = await getScopedTextContent(["doctorPanelHome"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelHome"]}
      initialTextContent={textContent}
    >
      <DoctorPanelPage />
    </LocaleScopeProvider>
  );
};

export default DoctorPanel;
