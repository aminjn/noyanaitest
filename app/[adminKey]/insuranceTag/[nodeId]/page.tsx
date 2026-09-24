import AdminManageInsuranceTagPage from "@/Components/Admin/InsuranceTag/AdminManageInsuranceTagPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageInsuranceTag = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageInsuranceTagPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageInsuranceTag;
