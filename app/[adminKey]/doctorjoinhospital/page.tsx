import AdminManageDoctorJoinHospitalsPage from "@/Components/Admin/DoctorJoinHospital/AdminManageDoctorJoinHospitalsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageDoctorJoinHospitals = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageDoctorJoinHospitalsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageDoctorJoinHospitals;
