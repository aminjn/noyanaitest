import AdminManageDoctorProfilesPage from "@/Components/Admin/DoctorProfile/AdminManageDoctorProfilesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageDoctorProfiles = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageDoctorProfilesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageDoctorProfiles;
