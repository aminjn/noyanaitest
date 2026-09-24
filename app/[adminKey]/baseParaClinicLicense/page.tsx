import AdminManageBaseParaClinicLicensesPage from "@/Components/Admin/BaseParaClinicLicense/AdminManageBaseParaClinicLicensesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageBaseParaClinicLicenses = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBaseParaClinicLicensesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBaseParaClinicLicenses;
