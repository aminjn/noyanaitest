import ClinicPanelHomePage from "@/Components/ClinicPanel/ClinicPanelHomePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicPanel = async () => {
  const textContent = await getScopedTextContent(["clinicPanelHome"]);
  return (
    <LocaleScopeProvider
      namespaces={["clinicPanelHome"]}
      initialTextContent={textContent}
    >
      <ClinicPanelHomePage />
    </LocaleScopeProvider>
  );
};

export default ClinicPanel;
