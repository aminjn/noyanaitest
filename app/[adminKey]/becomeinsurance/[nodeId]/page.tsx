import AdminManageBecomeInsurancePage from "@/Components/Admin/BecomeInsurance/AdminManageBecomeInsurancePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBecomeInsurance = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBecomeInsurancePage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBecomeInsurance;
