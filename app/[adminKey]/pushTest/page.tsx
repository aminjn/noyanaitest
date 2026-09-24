import AdminTestPushPage from "@/Components/Admin/Notification/AdminTestPushPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon", "adminPushTest"];

const AdminPushTest = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminTestPushPage />
    </LocaleScopeProvider>
  );
};

export default AdminPushTest;
