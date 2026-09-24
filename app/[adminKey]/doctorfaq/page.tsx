import AdminManageDoctorFaqsPage from "@/Components/Admin/DoctorFaq/AdminManageDoctorFaqsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageDoctorFaqs = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageDoctorFaqsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageDoctorFaqs;
