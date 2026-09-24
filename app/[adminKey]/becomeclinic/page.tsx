import AdminManageBecomeClinicsPage from "@/Components/Admin/BecomeClinic/AdminManageBecomeClinicsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBecomeClinics = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBecomeClinicsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBecomeClinics;
