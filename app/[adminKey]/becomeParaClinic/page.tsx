import AdminManageBecomeParaClinicsPage from "@/Components/Admin/BecomeParaCliinc/AdminManageBecomeParaClinicsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBecomeParaClinics = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBecomeParaClinicsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBecomeParaClinics;
