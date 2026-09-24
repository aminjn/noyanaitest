import AdminManageSpecialityCategoryPage from "@/Components/Admin/SpecialityCategory/AdminManageSpecialityCategoryPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageSpecialityCategory = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageSpecialityCategoryPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageSpecialityCategory;
