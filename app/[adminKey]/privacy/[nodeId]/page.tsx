import AdminManagePrivacySectionPage from "@/Components/Admin/PrivacySection/AdminManagePrivacySectionPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManagePrivacySection = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManagePrivacySectionPage />
    </LocaleScopeProvider>
  );
};

export default AdminManagePrivacySection;
