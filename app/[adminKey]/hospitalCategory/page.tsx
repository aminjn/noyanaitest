import AdminManageHospitalCategoriesPage from "@/Components/Admin/HospitalCategory/AdminManageHospitalCategoriesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManagehospitalCategories = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageHospitalCategoriesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManagehospitalCategories;
