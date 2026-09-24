import AdminManageUserAccessLevelsPage from "@/Components/Admin/AccessLevel/AdminManageUserAccessLevelsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageUserAccessLevels = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageUserAccessLevelsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageUserAccessLevels;
