import AdminManagePrivacySectionsPage from "@/Components/Admin/PrivacySection/AdminManagePrivacySectionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManagePrivacySections = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManagePrivacySectionsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManagePrivacySections;
