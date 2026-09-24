import AdminManageParaClinicCategoryPage from "@/Components/Admin/ParaClinicCategory/AdminManageParaClinicCategoryPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageParaClinicCategory = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageParaClinicCategoryPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageParaClinicCategory;
