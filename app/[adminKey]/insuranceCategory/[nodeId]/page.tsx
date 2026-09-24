import AdminManageInsuranceCategoryPage from "@/Components/Admin/InsuranceCategory/AdminManageInsuranceCategoryPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageInsuranceCategory = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageInsuranceCategoryPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageInsuranceCategory;
