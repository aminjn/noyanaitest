import AdminManageSpecialityCategoriesPage from "@/Components/Admin/SpecialityCategory/AdminManageSpecialityCategoriesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageSpecialityCategories = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageSpecialityCategoriesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageSpecialityCategories;
