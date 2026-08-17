import SecretaryManager from "@/Components/_Common/SecretaryManager/SecretaryManager";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageSecretaries = async () => {
  const textContent = await getScopedTextContent(["common", "secretaryManager"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "secretaryManager"]}
      initialTextContent={textContent}
    >
      <SecretaryManager name="doctor" />
    </LocaleScopeProvider>
  );
};

export default DoctorManageSecretaries;
