import AdminManageBaseDoctorLicensesPage from "@/Components/Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBaseDoctorLicenses = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBaseDoctorLicensesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBaseDoctorLicenses;
