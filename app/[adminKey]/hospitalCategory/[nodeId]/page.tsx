import AdminManageHospitalCategoryPage from "@/Components/Admin/HospitalCategory/AdminManageHospitalCategoryPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageHospitalCategory = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageHospitalCategoryPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageHospitalCategory;
