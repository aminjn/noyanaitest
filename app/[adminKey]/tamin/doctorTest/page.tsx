import AdminDoctorTaminTestPage from "@/Components/Admin/Tamin/AdminDoctorTaminTestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminDoctorTaminTest = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminDoctorTaminTestPage />
    </LocaleScopeProvider>
  );
};

export default AdminDoctorTaminTest;
