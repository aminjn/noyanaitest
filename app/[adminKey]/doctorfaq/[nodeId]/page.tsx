import AdminManageDoctorFaqPage from "@/Components/Admin/DoctorFaq/AdminManageDoctorFaqPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageDoctorFaq = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageDoctorFaqPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageDoctorFaq;
