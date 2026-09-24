import AdminManageGlobalTaxSettingsPage from "@/Components/Admin/TaxSettings/AdminManageGlobalTaxSettingsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageGlobalTaxSettings = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageGlobalTaxSettingsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageGlobalTaxSettings;
