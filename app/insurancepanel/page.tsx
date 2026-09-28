import InsurancePanelHomePage from "@/Components/InsurancePanel/InsurancePanelHomePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsurancePanel = async () => {
  const textContent = await getScopedTextContent(["insurancePanelHome", "providerHome"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelHome", "providerHome"]}
      initialTextContent={textContent}
    >
      <InsurancePanelHomePage />
    </LocaleScopeProvider>
  );
};

export default InsurancePanel;
