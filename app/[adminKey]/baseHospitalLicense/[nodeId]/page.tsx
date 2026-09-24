import AdminManageBaseHospitalLicensePage from "@/Components/Admin/BaseHospitalLicense/AdminManageBaseHospitalLicensePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBaseHospitalLicense = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBaseHospitalLicensePage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBaseHospitalLicense;
