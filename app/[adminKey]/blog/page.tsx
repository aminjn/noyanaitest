import AdminManageBlogsPage from "@/Components/Admin/Blog/AdminManageBlogsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

// adminKey enforcement now lives in app/[adminKey]/layout.tsx — see F-05.
const AdminManageBlogs = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBlogsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBlogs;
