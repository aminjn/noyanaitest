import AdminManageDoctorProfilePage from "@/Components/Admin/DoctorProfile/AdminManageDoctorProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageDoctorProfile = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageDoctorProfilePage />
    </LocaleScopeProvider>
  );
};

export default AdminManageDoctorProfile;
