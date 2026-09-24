import SecretaryPanelPage from "@/Components/SecretaryPanel/SecretaryPanelPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const SecretaryPanel = async () => {
  const textContent = await getScopedTextContent([
    "secretaryPanelHome",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["secretaryPanelHome"]}
      initialTextContent={textContent}
    >
      <SecretaryPanelPage />
    </LocaleScopeProvider>
  );
};

export default SecretaryPanel;
