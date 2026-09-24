import AdminManageBecomePharmacyPage from "@/Components/Admin/BecomePharmacy/AdminManageBecomePharmacyPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageBecomePharmacy = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBecomePharmacyPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBecomePharmacy;
