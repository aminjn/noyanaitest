import SecretaryManageBossesPage from "@/Components/SecretaryPanel/SecretaryManageBossesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const SecretaryManageInsurances = async () => {
  const textContent = await getScopedTextContent(["secretaryPanelHome"]);
  return (
    <LocaleScopeProvider
      namespaces={["secretaryPanelHome"]}
      initialTextContent={textContent}
    >
      <SecretaryManageBossesPage name="insurance" />
    </LocaleScopeProvider>
  );
};

export default SecretaryManageInsurances;
