import AdminPharmacyTaminTestPage from "@/Components/Admin/Tamin/AdminPharmacyTaminTestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminPharmacyTaminTest = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminPharmacyTaminTestPage />
    </LocaleScopeProvider>
  );
};

export default AdminPharmacyTaminTest;
