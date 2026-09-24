import AdminManageBaseHospitalLicensesPage from "@/Components/Admin/BaseHospitalLicense/AdminManageBaseHospitalLicensesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBaseHospitalLicenses = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBaseHospitalLicensesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBaseHospitalLicenses;
