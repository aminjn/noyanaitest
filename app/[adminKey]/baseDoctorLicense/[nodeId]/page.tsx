import AdminManageBaseDoctorLicensePage from "@/Components/Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBaseDoctorLicense = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBaseDoctorLicensePage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBaseDoctorLicense;
