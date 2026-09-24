import AdminManagePageMetaListPage from "@/Components/Admin/PageMeta/AdminManagePageMetaListPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManagePageMeta = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManagePageMetaListPage />
    </LocaleScopeProvider>
  );
};

export default AdminManagePageMeta;
