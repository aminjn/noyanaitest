import AdminManageParaClinicTagPage from "@/Components/Admin/ParaClinicTag/AdminManageParaClinicTagPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageParaClinicTag = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageParaClinicTagPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageParaClinicTag;
