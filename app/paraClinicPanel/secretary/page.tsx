import SecretaryManager from "@/Components/_Common/SecretaryManager/SecretaryManager";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicManageSecretaries = async () => {
  const textContent = await getScopedTextContent(["common", "secretaryManager"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "secretaryManager"]}
      initialTextContent={textContent}
    >
      <SecretaryManager name="paraClinic" />
    </LocaleScopeProvider>
  );
};

export default ParaClinicManageSecretaries;
