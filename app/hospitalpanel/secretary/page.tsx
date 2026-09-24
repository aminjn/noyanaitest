import SecretaryManager from "@/Components/_Common/SecretaryManager/SecretaryManager";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalManageSecretaries = async () => {
  const textContent = await getScopedTextContent(["secretaryManager"]);
  return (
    <LocaleScopeProvider
      namespaces={["secretaryManager"]}
      initialTextContent={textContent}
    >
      <SecretaryManager name="hospital" />
    </LocaleScopeProvider>
  );
};

export default HospitalManageSecretaries;
