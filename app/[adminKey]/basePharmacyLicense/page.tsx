import AdminManageBasePharmacyLicensesPage from "@/Components/Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBasePharmacyLicenses = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBasePharmacyLicensesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBasePharmacyLicenses;
