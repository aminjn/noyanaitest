import AdminManageBecomeInsurancesPage from "@/Components/Admin/BecomeInsurance/AdminManageBecomeInsurancesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageBecomeInsurances = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBecomeInsurancesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBecomeInsurances;
