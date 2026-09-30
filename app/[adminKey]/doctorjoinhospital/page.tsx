import { Suspense } from "react";
import AdminManageDoctorJoinHospitalsPage from "@/Components/Admin/DoctorJoinHospital/AdminManageDoctorJoinHospitalsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageDoctorJoinHospitals = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminManageDoctorJoinHospitalsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminManageDoctorJoinHospitals;
