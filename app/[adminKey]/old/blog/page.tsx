import AdminManageOldBlogsPage from "@/Components/Admin/Old/Blog/AdminManageOldBlogsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageOldBlogs = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageOldBlogsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageOldBlogs;
