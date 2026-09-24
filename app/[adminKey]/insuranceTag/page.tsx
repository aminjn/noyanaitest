import AdminManageInsuranceTagsPage from "@/Components/Admin/InsuranceTag/AdminManageInsuranceTagsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageInsuranceTags = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageInsuranceTagsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageInsuranceTags;
