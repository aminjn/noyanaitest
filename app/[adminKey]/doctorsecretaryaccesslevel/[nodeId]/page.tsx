import AdminManageDoctorSecretaryAccessLevelPage from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageDoctorSecretaryAccessLevel = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageDoctorSecretaryAccessLevelPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageDoctorSecretaryAccessLevel;
