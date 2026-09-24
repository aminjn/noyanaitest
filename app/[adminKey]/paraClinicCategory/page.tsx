import AdminManageParaClinicCategoriesPage from "@/Components/Admin/ParaClinicCategory/AdminManageParaClinicCategoriesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageParaClinicCategories = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageParaClinicCategoriesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageParaClinicCategories;
