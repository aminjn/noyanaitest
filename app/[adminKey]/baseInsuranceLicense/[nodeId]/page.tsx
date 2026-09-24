import AdminManageBaseInsuranceLicensePage from "@/Components/Admin/BaseInsuranceLicense/AdminManageBaseInsuranceLicensePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBaseInsuranceLicense = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBaseInsuranceLicensePage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBaseInsuranceLicense;
