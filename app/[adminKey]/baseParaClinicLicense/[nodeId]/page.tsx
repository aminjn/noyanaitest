import AdminManageBaseParaClinicLicensePage from "@/Components/Admin/BaseParaClinicLicense/AdminManageBaseParaClinicLicensePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBaseParaClinicLicense = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBaseParaClinicLicensePage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBaseParaClinicLicense;
