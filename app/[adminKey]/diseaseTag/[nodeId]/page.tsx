import AdminManageDiseaseTagPage from "@/Components/Admin/DiseaseTag/AdminManageDiseaseTagPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageDiseaseTag = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageDiseaseTagPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageDiseaseTag;
