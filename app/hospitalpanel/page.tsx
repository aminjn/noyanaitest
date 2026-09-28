import HospitalPanelHomePage from "@/Components/HospitalPanel/HospitalPanelHomePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalPanel = async () => {
  const textContent = await getScopedTextContent(["hospitalPanelHome", "providerHome", "centerDoctors"]);
  return (
    <LocaleScopeProvider
      namespaces={["hospitalPanelHome", "providerHome", "centerDoctors"]}
      initialTextContent={textContent}
    >
      <HospitalPanelHomePage />
    </LocaleScopeProvider>
  );
};

export default HospitalPanel;
