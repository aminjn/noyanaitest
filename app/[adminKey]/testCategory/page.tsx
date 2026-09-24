import AdminManageTestCategoriesPage from "@/Components/Admin/TestCategory/AdminManageTestCategoriesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];



const AdminManagetestCategories = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTestCategoriesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManagetestCategories;
