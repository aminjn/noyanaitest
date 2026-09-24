import SecretaryManager from "@/Components/_Common/SecretaryManager/SecretaryManager";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyManageSecretaries = async () => {
  const textContent = await getScopedTextContent(["secretaryManager"]);
  return (
    <LocaleScopeProvider
      namespaces={["secretaryManager"]}
      initialTextContent={textContent}
    >
      <SecretaryManager name="pharmacy" />
    </LocaleScopeProvider>
  );
};

export default PharmacyManageSecretaries;
