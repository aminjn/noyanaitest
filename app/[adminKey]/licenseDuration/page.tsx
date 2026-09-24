import AdminManageLicenseDurationsPage from "@/Components/Admin/LicenseDuration/AdminManageLicenseDurationsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageLicenseDurations = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageLicenseDurationsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageLicenseDurations;
