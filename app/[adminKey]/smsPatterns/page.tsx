import AdminManageSmsPatternsPage from "@/Components/Admin/SmsPatterns/AdminManageSmsPatternsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageSmsPatterns = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageSmsPatternsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageSmsPatterns;
