import AdminClinicTaminTestPage from "@/Components/Admin/Tamin/AdminClinicTaminTestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminClinicTaminTest = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminClinicTaminTestPage />
    </LocaleScopeProvider>
  );
};

export default AdminClinicTaminTest;
