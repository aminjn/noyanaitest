import AdminParaClinicTaminTestPage from "@/Components/Admin/Tamin/AdminParaClinicTaminTestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminParaClinicTaminTest = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminParaClinicTaminTestPage />
    </LocaleScopeProvider>
  );
};

export default AdminParaClinicTaminTest;
