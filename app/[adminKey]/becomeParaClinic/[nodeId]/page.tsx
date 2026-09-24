import AdminManageBecomeParaClinicPage from "@/Components/Admin/BecomeParaCliinc/AdminManageBecomeParaClinicPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageBecomeParaClinic = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBecomeParaClinicPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBecomeParaClinic;
