import AdminManageSymptomCategoriesPage from "@/Components/Admin/SymptomCategory/AdminManageSymptomCategoriesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageSymptomCategories = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageSymptomCategoriesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageSymptomCategories;
