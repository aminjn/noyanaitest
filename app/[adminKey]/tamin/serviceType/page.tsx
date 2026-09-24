import AdminManageTaminServiceTypesPage from "@/Components/Admin/Tamin/ServiceType/AdminManageTaminServiceTypesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageTaminServiceTypes = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminServiceTypesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminServiceTypes;
