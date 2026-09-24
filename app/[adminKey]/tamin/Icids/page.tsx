import AdminManageTaminIcidsPage from "@/Components/Admin/Tamin/Icid/AdminManageTaminIcidsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageTaminIcids = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminIcidsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminIcids;
