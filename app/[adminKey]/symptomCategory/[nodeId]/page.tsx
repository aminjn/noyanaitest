import AdminManageSymptomCategoryPage from "@/Components/Admin/SymptomCategory/AdminManageSymptomCategoryPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageSymptomCategory = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageSymptomCategoryPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageSymptomCategory;
