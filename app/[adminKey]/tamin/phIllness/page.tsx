import AdminManageTaminPhIllnessesPage from "@/Components/Admin/Tamin/PhIllness/AdminManageTaminPhIllnessesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageTaminPhIllnesses = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminPhIllnessesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminPhIllnesses;
