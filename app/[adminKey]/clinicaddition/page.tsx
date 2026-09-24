import AdminManageClinicAdditionsPage from "@/Components/Admin/ClinicAddition/AdminManageClinicAdditionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageClinicAdditions = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageClinicAdditionsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageClinicAdditions;
