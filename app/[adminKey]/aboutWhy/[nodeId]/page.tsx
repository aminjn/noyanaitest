import AdminManageAboutWhyPage from "@/Components/Admin/AboutWhy/AdminManageAboutWhyPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageAboutWhy = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageAboutWhyPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageAboutWhy;
