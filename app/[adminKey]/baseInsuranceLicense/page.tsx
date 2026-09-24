import AdminManageBaseInsuranceLicensesPage from "@/Components/Admin/BaseInsuranceLicense/AdminManageBaseInsuranceLicensesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBaseInsuranceLicenses = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBaseInsuranceLicensesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBaseInsuranceLicenses;
