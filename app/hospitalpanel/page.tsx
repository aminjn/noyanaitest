import HospitalPanelHomePage from "@/Components/HospitalPanel/HospitalPanelHomePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalPanel = async () => {
  const textContent = await getScopedTextContent(["common", "hospitalPanelHome"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "hospitalPanelHome"]}
      initialTextContent={textContent}
    >
      <HospitalPanelHomePage />
    </LocaleScopeProvider>
  );
};

export default HospitalPanel;
