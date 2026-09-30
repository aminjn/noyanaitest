import { Suspense } from "react";
import AdminManageDoctorJoinClinicsPage from "@/Components/Admin/DoctorJoinClinic/AdminManageDoctorJoinClinicsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageDoctorJoinClinics = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminManageDoctorJoinClinicsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminManageDoctorJoinClinics;
