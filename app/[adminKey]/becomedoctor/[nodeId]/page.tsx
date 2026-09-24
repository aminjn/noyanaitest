import AdminManageBecomeDoctorPage from "@/Components/Admin/BecomeDoctor/AdminManageBecomeDoctorPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageBecomeDoctor = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBecomeDoctorPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBecomeDoctor;
