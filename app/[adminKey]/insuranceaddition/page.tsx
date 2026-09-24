import AdminManageInsuranceAdditionsPage from "@/Components/Admin/InsuranceAddition/AdminManageInsuranceAdditionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageInsuranceAdditions = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageInsuranceAdditionsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageInsuranceAdditions;
