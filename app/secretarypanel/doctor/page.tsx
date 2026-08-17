import SecretaryManageBossesPage from "@/Components/SecretaryPanel/SecretaryManageBossesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const SecretaryManageDoctors = async () => {
  const textContent = await getScopedTextContent(["common", "secretaryPanelHome"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "secretaryPanelHome"]}
      initialTextContent={textContent}
    >
      <SecretaryManageBossesPage name="doctor" />
    </LocaleScopeProvider>
  );
};

export default SecretaryManageDoctors;
