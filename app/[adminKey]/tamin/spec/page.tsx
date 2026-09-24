import AdminManageTaminSpecsPage from "@/Components/Admin/Tamin/Spec/AdminManageTaminSpecsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageTaminSpecs = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminSpecsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminSpecs;
