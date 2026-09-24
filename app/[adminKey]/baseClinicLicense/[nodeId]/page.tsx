import AdminManageBaseClinicLicensePage from "@/Components/Admin/BaseClinicLicense/AdminManageBaseClinicLicensePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBaseClinicLicense = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBaseClinicLicensePage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBaseClinicLicense;
