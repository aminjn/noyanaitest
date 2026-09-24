import AdminManageDiseaseTagsPage from "@/Components/Admin/DiseaseTag/AdminManageDiseaseTagsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageDiseaseTags = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageDiseaseTagsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageDiseaseTags;
