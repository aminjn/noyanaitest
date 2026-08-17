import DoctorPanelPage from "@/Components/DoctorPanel/DoctorPanelPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorPanel = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelHome"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelHome"]}
      initialTextContent={textContent}
    >
      <DoctorPanelPage />
    </LocaleScopeProvider>
  );
};

export default DoctorPanel;
