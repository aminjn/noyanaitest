import AdminManageHospitalTagsPage from "@/Components/Admin/HospitalTag/AdminManageHospitalTagsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageHospitalTags = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageHospitalTagsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageHospitalTags;
