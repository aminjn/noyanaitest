import AdminManageFaqCategoriesPage from "@/Components/Admin/faqCategory/AdminManageFaqCategoriesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageFaqCategories = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageFaqCategoriesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageFaqCategories;
