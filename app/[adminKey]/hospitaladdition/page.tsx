import AdminManageHospitalAdditionsPage from "@/Components/Admin/HospitalAddition/AdminManageHospitalAdditionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageHospitalAdditions = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageHospitalAdditionsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageHospitalAdditions;
