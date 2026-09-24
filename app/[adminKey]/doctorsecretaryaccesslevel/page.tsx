import AdminManageDoctorSecretaryAccessLevelsPage from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageDoctorSecretaryAccessLevels = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageDoctorSecretaryAccessLevelsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageDoctorSecretaryAccessLevels;
